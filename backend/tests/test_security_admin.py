import os
import sys
import unittest
import uuid

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from api.main import app
from api.core.database import SessionLocal
from api.core.rate_limiter import clear_all_rate_limits
from api.models import User, AuthAuditLog
from api.repositories.user_repository import UserRepository
from api.seed import seed_database


class TestSecurityAndAdmin(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.db = SessionLocal()
        seed_database(cls.db)
        cls.client = TestClient(app)

    @classmethod
    def tearDownClass(cls):
        cls.db.close()

    def setUp(self):
        clear_all_rate_limits()

    def test_01_login_rate_limiting(self):
        """5 consecutive failed logins trigger HTTP 429 Too Many Requests with Retry-After header."""
        test_ip = "192.168.1.100"
        for i in range(5):
            res = self.client.post(
                "/api/v1/auth/login",
                json={"username": "agency", "password": f"WrongPwd{i}"},
                headers={"X-Forwarded-For": test_ip},
            )
            self.assertEqual(res.status_code, 401)

        # 6th attempt should be blocked by rate limiter
        blocked_res = self.client.post(
            "/api/v1/auth/login",
            json={"username": "agency", "password": "Agency@123"},
            headers={"X-Forwarded-For": test_ip},
        )
        self.assertEqual(blocked_res.status_code, 429)
        self.assertIn("Retry-After", blocked_res.headers)
        self.assertIn("Too many failed login attempts", blocked_res.json()["detail"])

    def test_02_registration_restriction_rejects_authority_roles(self):
        """Public registration cannot self-assign authority roles (e.g. ADMIN, COLLECTOR, AGENCY)."""
        res = self.client.post(
            "/api/v1/auth/register",
            json={
                "name": "Malicious User",
                "email": f"hacker_{uuid.uuid4().hex[:6]}@example.com",
                "password": "Password@123",
                "role": "COLLECTOR",
            },
        )
        self.assertEqual(res.status_code, 403)
        self.assertIn("strictly restricted to Citizens/Landowners", res.json()["detail"])

    def test_03_registration_enforces_password_complexity(self):
        """Weak passwords (missing uppercase, number, symbol, or < 8 chars) are rejected with 422."""
        weak_passwords = [
            "short1!",        # < 8 chars
            "nouppercase123!", # no uppercase
            "NOLOWERCASE123!", # no lowercase
            "NoNumbersHere!",  # no digits
            "NoSpecialSymbol1",# no special symbol
        ]
        for weak in weak_passwords:
            res = self.client.post(
                "/api/v1/auth/register",
                json={
                    "name": "Test Citizen",
                    "email": f"citizen_{uuid.uuid4().hex[:6]}@example.com",
                    "password": weak,
                },
            )
            self.assertEqual(res.status_code, 422, f"Expected 422 for weak password '{weak}'")

    def test_04_secure_cookie_set_on_login(self):
        """Login sets HttpOnly SameSite cookie for refresh_token."""
        res = self.client.post(
            "/api/v1/auth/login",
            json={"username": "agency", "password": "Agency@123"},
        )
        self.assertEqual(res.status_code, 200)
        self.assertIn("refresh_token", res.cookies)
        cookie_header = res.headers.get("set-cookie", "")
        self.assertIn("HttpOnly", cookie_header)
        self.assertIn("samesite=lax", cookie_header.lower())

    def test_05_password_change_revokes_other_sessions(self):
        """User can change password; old password fails; other sessions are revoked."""
        username = f"pw_user_{uuid.uuid4().hex[:6]}"
        email = f"{username}@example.com"
        reg_res = self.client.post(
            "/api/v1/auth/register",
            json={"name": "Password Tester", "email": email, "password": "InitialPassword@123"},
        )
        self.assertEqual(reg_res.status_code, 201)
        access_token = reg_res.json()["access_token"]
        old_refresh = reg_res.json()["refresh_token"]

        # Change password
        chg_res = self.client.post(
            "/api/v1/auth/change-password",
            headers={"Authorization": f"Bearer {access_token}"},
            json={
                "old_password": "InitialPassword@123",
                "new_password": "NewSecurePassword@2026",
                "confirm_password": "NewSecurePassword@2026",
            },
        )
        self.assertEqual(chg_res.status_code, 200)

        # Old password should now fail
        old_login = self.client.post(
            "/api/v1/auth/login",
            json={"username": email, "password": "InitialPassword@123"},
        )
        self.assertEqual(old_login.status_code, 401)

        # Old refresh token should be revoked
        ref_fail = self.client.post(
            "/api/v1/auth/refresh",
            json={"refresh_token": old_refresh},
        )
        self.assertEqual(ref_fail.status_code, 401)

        # New password succeeds
        new_login = self.client.post(
            "/api/v1/auth/login",
            json={"username": email, "password": "NewSecurePassword@2026"},
        )
        self.assertEqual(new_login.status_code, 200)

    def test_06_session_management_and_revocation(self):
        """User can list active sessions and revoke a specific session or all sessions."""
        login_res = self.client.post(
            "/api/v1/auth/login",
            json={"username": "collector", "password": "Collector@123"},
        )
        token = login_res.json()["access_token"]

        # List sessions
        sessions_res = self.client.get(
            "/api/v1/auth/sessions",
            headers={"Authorization": f"Bearer {token}"},
        )
        self.assertEqual(sessions_res.status_code, 200)
        sessions = sessions_res.json()
        self.assertGreaterEqual(len(sessions), 1)

        # Revoke all sessions
        revoke_res = self.client.post(
            "/api/v1/auth/revoke-all-sessions",
            headers={"Authorization": f"Bearer {token}"},
        )
        self.assertEqual(revoke_res.status_code, 200)

    def test_07_audit_log_records_events(self):
        """Security events are recorded in auth_audit_logs."""
        # Get admin token
        admin_login = self.client.post(
            "/api/v1/auth/login",
            json={"username": "admin", "password": "Admin@123"},
        )
        admin_token = admin_login.json()["access_token"]

        # Query audit logs
        audit_res = self.client.get(
            "/api/v1/admin/audit-logs",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        self.assertEqual(audit_res.status_code, 200)
        logs = audit_res.json()
        self.assertGreaterEqual(len(logs), 1)
        event_types = [l["event_type"] for l in logs]
        self.assertIn("LOGIN_SUCCESS", event_types)

    def test_08_admin_user_provisioning_and_status_toggle(self):
        """Admin can provision a new officer, toggle active status, and modify roles."""
        admin_login = self.client.post(
            "/api/v1/auth/login",
            json={"username": "admin", "password": "Admin@123"},
        )
        admin_token = admin_login.json()["access_token"]

        # 1. Provision new officer
        new_username = f"officer_{uuid.uuid4().hex[:6]}"
        new_email = f"{new_username}@nhai.gov.in"
        create_res = self.client.post(
            "/api/v1/admin/users",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={
                "username": new_username,
                "email": new_email,
                "password": "OfficerPassword@123",
                "full_name": "Sh. Arun Sharma",
                "role": "AGENCY",
                "department_code": "NHAI",
            },
        )
        self.assertEqual(create_res.status_code, 201)
        officer_id = create_res.json()["id"]

        # 2. Deactivate officer
        deact_res = self.client.patch(
            f"/api/v1/admin/users/{officer_id}/status",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"is_active": False},
        )
        self.assertEqual(deact_res.status_code, 200)
        self.assertFalse(deact_res.json()["is_active"])

        # Deactivated officer cannot login
        blocked_login = self.client.post(
            "/api/v1/auth/login",
            json={"username": new_username, "password": "OfficerPassword@123"},
        )
        self.assertEqual(blocked_login.status_code, 401)

        # 3. Reactivate officer
        react_res = self.client.patch(
            f"/api/v1/admin/users/{officer_id}/status",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"is_active": True},
        )
        self.assertEqual(react_res.status_code, 200)
        self.assertTrue(react_res.json()["is_active"])

        # 4. Modify roles
        role_res = self.client.patch(
            f"/api/v1/admin/users/{officer_id}/roles",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"roles": ["LAO"]},
        )
        self.assertEqual(role_res.status_code, 200)
        self.assertIn("LAO", role_res.json()["roles"])

    def test_09_non_admin_forbidden_from_admin_endpoints(self):
        """Citizen and other non-admin officers receive 403 Forbidden on /api/v1/admin/*."""
        citizen_login = self.client.post(
            "/api/v1/auth/login",
            json={"username": "citizen", "password": "Citizen@123"},
        )
        citizen_token = citizen_login.json()["access_token"]

        res = self.client.get(
            "/api/v1/admin/users",
            headers={"Authorization": f"Bearer {citizen_token}"},
        )
        self.assertEqual(res.status_code, 403)

        res2 = self.client.get(
            "/api/v1/admin/audit-logs",
            headers={"Authorization": f"Bearer {citizen_token}"},
        )
        self.assertEqual(res2.status_code, 403)


if __name__ == "__main__":
    unittest.main()
