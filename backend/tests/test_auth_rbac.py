import os
import sys
import unittest
import uuid
from datetime import datetime, timedelta, timezone

# Ensure project root in sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from api.main import app
from api.core.database import SessionLocal
from api.core.security import hash_password, create_access_token
from api.models import User, Role, Permission, RefreshToken
from api.repositories.user_repository import UserRepository
from api.seed import seed_database


class TestAuthAndRBAC(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        """Seed database and initialize test client."""
        cls.db = SessionLocal()
        seed_database(cls.db)
        cls.client = TestClient(app)

    @classmethod
    def tearDownClass(cls):
        cls.db.close()

    def test_01_users_seeded_successfully(self):
        """1. Verify users can be seeded."""
        users = self.db.query(User).all()
        self.assertGreaterEqual(len(users), 7)
        usernames = [u.username for u in users]
        for expected in ["admin", "agency", "lao", "forest", "collector", "tehsildar", "citizen"]:
            self.assertIn(expected, usernames)

    def test_02_password_stored_as_argon2id_hash(self):
        """2. Verify passwords are never stored in plaintext and start with Argon2id hash identifier."""
        users = self.db.query(User).all()
        for u in users:
            self.assertFalse(u.password_hash.startswith("Pass@"))
            self.assertFalse(u.password_hash.startswith("Agency@"))
            self.assertTrue(
                u.password_hash.startswith("$argon2id$"),
                f"User {u.username} password is not an Argon2id hash!",
            )

    def test_03_login_success_with_correct_credentials(self):
        """3. Correct credentials -> login succeeds (200) with tokens and user info."""
        response = self.client.post(
            "/api/v1/auth/login",
            json={"username": "agency@nhai.gov.in", "password": "Agency@123"},
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("access_token", data)
        self.assertIn("refresh_token", data)
        self.assertEqual(data["token_type"], "bearer")
        self.assertGreater(data["expires_in"], 0)
        self.assertEqual(data["user"]["username"], "agency")
        self.assertIn("AGENCY", data["user"]["roles"])

    def test_04_login_failure_incorrect_password(self):
        """4. Incorrect password -> 401 with generic failure."""
        response = self.client.post(
            "/api/v1/auth/login",
            json={"username": "agency@nhai.gov.in", "password": "WrongPassword!999"},
        )
        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.json()["detail"], "Invalid credentials")

    def test_05_login_failure_unknown_username_same_generic_error(self):
        """5. Unknown username -> same generic authentication failure (no user enumeration)."""
        response = self.client.post(
            "/api/v1/auth/login",
            json={"username": "non_existent_officer_xyz@gov.in", "password": "AnyPassword"},
        )
        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.json()["detail"], "Invalid credentials")

    def test_06_inactive_user_authentication_denied(self):
        """6. Inactive user -> authentication denied."""
        # Create temporary inactive user
        inactive_username = f"inactive_{uuid.uuid4().hex[:6]}"
        u = UserRepository.create_user(
            db=self.db,
            username=inactive_username,
            email=f"{inactive_username}@test.gov.in",
            password_hash=hash_password("Inactive@123"),
            full_name="Inactive Officer",
            is_active=False,
        )

        response = self.client.post(
            "/api/v1/auth/login",
            json={"username": inactive_username, "password": "Inactive@123"},
        )
        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.json()["detail"], "Invalid credentials")

    def test_07_access_token_can_access_protected_endpoint(self):
        """7. Access token can access protected endpoint."""
        login_res = self.client.post(
            "/api/v1/auth/login",
            json={"username": "collector@nagpur@gov.in", "password": "Collector@123"},
        )
        if login_res.status_code != 200:
            login_res = self.client.post(
                "/api/v1/auth/login",
                json={"username": "collector", "password": "Collector@123"},
            )
        token = login_res.json()["access_token"]

        res = self.client.get(
            "/api/v1/protected/test",
            headers={"Authorization": f"Bearer {token}"},
        )
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["status"], "success")

    def test_08_missing_token_returns_401(self):
        """8. Missing token -> 401."""
        res = self.client.get("/api/v1/protected/test")
        self.assertEqual(res.status_code, 401)

    def test_09_invalid_token_returns_401(self):
        """9. Invalid token -> 401."""
        res = self.client.get(
            "/api/v1/protected/test",
            headers={"Authorization": "Bearer invalid_malformed_token_string"},
        )
        self.assertEqual(res.status_code, 401)

    def test_10_expired_token_returns_401(self):
        """10. Expired token -> 401."""
        # Forge an expired token (expired 10 minutes ago)
        user = UserRepository.get_by_username_or_email(self.db, "admin")
        now = datetime.now(timezone.utc)
        expired_payload = {
            "exp": int((now - timedelta(minutes=10)).timestamp()),
            "iat": int((now - timedelta(minutes=40)).timestamp()),
        }
        expired_token, _ = create_access_token(user.id, extra_claims=expired_payload)

        res = self.client.get(
            "/api/v1/protected/test",
            headers={"Authorization": f"Bearer {expired_token}"},
        )
        self.assertEqual(res.status_code, 401)

    def test_11_refresh_token_generates_new_access_token(self):
        """11. Refresh token generates new access token."""
        login_res = self.client.post(
            "/api/v1/auth/login",
            json={"username": "lao", "password": "LAO@123"},
        )
        refresh_token = login_res.json()["refresh_token"]

        res = self.client.post(
            "/api/v1/auth/refresh",
            json={"refresh_token": refresh_token},
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("access_token", data)
        self.assertIn("refresh_token", data)

    def test_12_refresh_token_rotates(self):
        """12. Refresh token rotates (returns new refresh token)."""
        login_res = self.client.post(
            "/api/v1/auth/login",
            json={"username": "forest", "password": "Forest@123"},
        )
        token1 = login_res.json()["refresh_token"]

        refresh_res = self.client.post(
            "/api/v1/auth/refresh",
            json={"refresh_token": token1},
        )
        token2 = refresh_res.json()["refresh_token"]
        self.assertNotEqual(token1, token2)

    def test_13_old_refresh_token_cannot_be_reused(self):
        """13. Old/revoked refresh token cannot be reused."""
        login_res = self.client.post(
            "/api/v1/auth/login",
            json={"username": "tehsildar", "password": "Tehsildar@123"},
        )
        old_token = login_res.json()["refresh_token"]

        # First refresh succeeds
        self.client.post("/api/v1/auth/refresh", json={"refresh_token": old_token})

        # Reusing the old token must fail
        reuse_res = self.client.post("/api/v1/auth/refresh", json={"refresh_token": old_token})
        self.assertEqual(reuse_res.status_code, 401)

    def test_14_logout_revokes_refresh_token(self):
        """14. Logout revokes refresh token."""
        login_res = self.client.post(
            "/api/v1/auth/login",
            json={"username": "citizen", "password": "Citizen@123"},
        )
        refresh_token = login_res.json()["refresh_token"]

        logout_res = self.client.post(
            "/api/v1/auth/logout",
            json={"refresh_token": refresh_token},
        )
        self.assertEqual(logout_res.status_code, 200)

        # Attempt to use revoked token should fail
        refresh_res = self.client.post(
            "/api/v1/auth/refresh",
            json={"refresh_token": refresh_token},
        )
        self.assertEqual(refresh_res.status_code, 401)

    def test_15_auth_me_returns_authenticated_user(self):
        """15. /auth/me returns authenticated user with roles and permissions."""
        login_res = self.client.post(
            "/api/v1/auth/login",
            json={"username": "agency", "password": "Agency@123"},
        )
        token = login_res.json()["access_token"]

        res = self.client.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {token}"},
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["username"], "agency")
        self.assertIn("AGENCY", data["roles"])
        self.assertIn("PROJECT_VIEW", data["permissions"])

    def test_16_agency_can_access_project_create(self):
        """16. Agency can access PROJECT_CREATE."""
        login_res = self.client.post(
            "/api/v1/auth/login",
            json={"username": "agency", "password": "Agency@123"},
        )
        token = login_res.json()["access_token"]

        res = self.client.post(
            "/api/v1/protected/project-create",
            headers={"Authorization": f"Bearer {token}"},
        )
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["status"], "success")

    def test_17_citizen_cannot_access_project_create(self):
        """17. Citizen cannot access PROJECT_CREATE (403 Forbidden)."""
        login_res = self.client.post(
            "/api/v1/auth/login",
            json={"username": "citizen", "password": "Citizen@123"},
        )
        token = login_res.json()["access_token"]

        res = self.client.post(
            "/api/v1/protected/project-create",
            headers={"Authorization": f"Bearer {token}"},
        )
        self.assertEqual(res.status_code, 403)

    def test_18_collector_can_access_project_approve(self):
        """18. Collector can access PROJECT_APPROVE."""
        login_res = self.client.post(
            "/api/v1/auth/login",
            json={"username": "collector", "password": "Collector@123"},
        )
        token = login_res.json()["access_token"]

        res = self.client.get(
            "/api/v1/protected/project-approve",
            headers={"Authorization": f"Bearer {token}"},
        )
        self.assertEqual(res.status_code, 200)

    def test_19_citizen_cannot_access_audit_view(self):
        """19. Citizen cannot access AUDIT_VIEW (403 Forbidden)."""
        login_res = self.client.post(
            "/api/v1/auth/login",
            json={"username": "citizen", "password": "Citizen@123"},
        )
        token = login_res.json()["access_token"]

        res = self.client.get(
            "/api/v1/protected/audit",
            headers={"Authorization": f"Bearer {token}"},
        )
        self.assertEqual(res.status_code, 403)

    def test_20_admin_has_all_initial_permissions(self):
        """20. Admin has all initial statutory permissions."""
        admin_user = UserRepository.get_by_username_or_email(self.db, "admin")
        self.assertIsNotNone(admin_user)
        all_permissions = self.db.query(Permission).all()
        self.assertEqual(len(admin_user.permission_names), len(all_permissions))


if __name__ == "__main__":
    unittest.main()
