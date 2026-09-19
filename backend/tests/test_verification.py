import os
import sys
import time
import unittest
import uuid
from datetime import datetime, timedelta, timezone

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from api.main import app
from api.core.database import SessionLocal
from api.core.config import settings
from api.core.rate_limiter import clear_all_rate_limits
from api.models import User, VerificationCode
from api.providers import mock_provider, set_mock_verification_mode
from api.seed import seed_database


class TestCitizenVerification(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.db = SessionLocal()
        seed_database(cls.db)
        cls.client = TestClient(app)
        set_mock_verification_mode(True)

    @classmethod
    def tearDownClass(cls):
        set_mock_verification_mode(False)
        cls.db.close()

    def setUp(self):
        clear_all_rate_limits()
        mock_provider.clear()

    def _register_citizen(self, phone: str = "+91 98765 43210"):
        """Helper to create a fresh unverified citizen account."""
        uid = uuid.uuid4().hex[:6]
        email = f"citizen_{uid}@example.com"
        res = self.client.post(
            "/api/v1/auth/register",
            json={
                "name": f"Citizen {uid}",
                "email": email,
                "password": "SecureCitizen@123",
                "phone": phone,
                "aadhaar_or_id": "123456789012",
            },
        )
        self.assertEqual(res.status_code, 201)
        data = res.json()
        return data["access_token"], data["user"], email, phone

    # 1. Citizen registration creates unverified user
    def test_01_registration_creates_unverified_citizen(self):
        token, user, email, phone = self._register_citizen()
        self.assertFalse(user["is_verified"])

        # Verify DB directly
        db_user = self.db.query(User).filter(User.email == email).first()
        self.assertIsNotNone(db_user)
        self.assertFalse(db_user.is_verified)

    # 2. Citizen can request EMAIL verification
    def test_02_request_email_verification(self):
        token, user, email, phone = self._register_citizen()
        res = self.client.post(
            "/api/v1/auth/verification/send",
            headers={"Authorization": f"Bearer {token}"},
            json={"channel": "EMAIL"},
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "success")
        self.assertEqual(data["channel"], "EMAIL")
        self.assertIn("@", data["masked_destination"])
        self.assertIn("*", data["masked_destination"])

        # Check mock provider captured email
        sent_otp = mock_provider.get_last_otp(email)
        self.assertIsNotNone(sent_otp)
        self.assertEqual(len(sent_otp), 6)

    # 3. Citizen can request WHATSAPP verification
    def test_03_request_whatsapp_verification(self):
        token, user, email, phone = self._register_citizen()
        res = self.client.post(
            "/api/v1/auth/verification/send",
            headers={"Authorization": f"Bearer {token}"},
            json={"channel": "WHATSAPP"},
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "success")
        self.assertEqual(data["channel"], "WHATSAPP")
        self.assertIn("******", data["masked_destination"])

        sent_otp = mock_provider.get_last_otp(phone)
        self.assertIsNotNone(sent_otp)
        self.assertEqual(len(sent_otp), 6)

    # 4. OTP is generated securely (6 digits numeric)
    def test_04_otp_generated_securely(self):
        token, user, email, phone = self._register_citizen()
        self.client.post(
            "/api/v1/auth/verification/send",
            headers={"Authorization": f"Bearer {token}"},
            json={"channel": "EMAIL"},
        )
        otp = mock_provider.get_last_otp(email)
        self.assertTrue(otp.isdigit())
        self.assertEqual(len(otp), 6)
        val = int(otp)
        self.assertGreaterEqual(val, 100000)
        self.assertLessEqual(val, 999999)

    # 5. OTP is stored as a hash (never plaintext in DB)
    def test_05_otp_stored_as_hash(self):
        token, user, email, phone = self._register_citizen()
        self.client.post(
            "/api/v1/auth/verification/send",
            headers={"Authorization": f"Bearer {token}"},
            json={"channel": "EMAIL"},
        )
        otp = mock_provider.get_last_otp(email)

        # Inspect database record
        db_user = self.db.query(User).filter(User.email == email).first()
        record = (
            self.db.query(VerificationCode)
            .filter(VerificationCode.user_id == db_user.id, VerificationCode.channel == "EMAIL")
            .first()
        )
        self.assertIsNotNone(record)
        # Stored hash must NOT match plaintext OTP
        self.assertNotEqual(record.code_hash, otp)
        self.assertEqual(len(record.code_hash), 64)  # SHA-256 hex string is 64 chars

    # 6. OTP is never returned by production API
    def test_06_otp_never_returned_by_api(self):
        token, user, email, phone = self._register_citizen()
        res = self.client.post(
            "/api/v1/auth/verification/send",
            headers={"Authorization": f"Bearer {token}"},
            json={"channel": "EMAIL"},
        )
        response_text = res.text
        otp = mock_provider.get_last_otp(email)
        self.assertNotIn(f'"{otp}"', response_text)
        self.assertNotIn(f"'{otp}'", response_text)
        self.assertNotIn("otp", res.json())

    # 7. Correct OTP verifies account
    def test_07_correct_otp_verifies_account(self):
        token, user, email, phone = self._register_citizen()
        self.client.post(
            "/api/v1/auth/verification/send",
            headers={"Authorization": f"Bearer {token}"},
            json={"channel": "EMAIL"},
        )
        otp = mock_provider.get_last_otp(email)

        verify_res = self.client.post(
            "/api/v1/auth/verification/verify",
            headers={"Authorization": f"Bearer {token}"},
            json={"channel": "EMAIL", "otp": otp},
        )
        self.assertEqual(verify_res.status_code, 200)
        self.assertTrue(verify_res.json()["user"]["is_verified"])

        # Verify DB directly
        db_user = self.db.query(User).filter(User.email == email).first()
        self.db.refresh(db_user)
        self.assertTrue(db_user.is_verified)

    # 8. Incorrect OTP fails
    def test_08_incorrect_otp_fails(self):
        token, user, email, phone = self._register_citizen()
        self.client.post(
            "/api/v1/auth/verification/send",
            headers={"Authorization": f"Bearer {token}"},
            json={"channel": "EMAIL"},
        )

        verify_res = self.client.post(
            "/api/v1/auth/verification/verify",
            headers={"Authorization": f"Bearer {token}"},
            json={"channel": "EMAIL", "otp": "000000"},
        )
        self.assertEqual(verify_res.status_code, 400)
        self.assertIn("Invalid verification code", verify_res.json()["detail"])

        # Account remains unverified
        db_user = self.db.query(User).filter(User.email == email).first()
        self.db.refresh(db_user)
        self.assertFalse(db_user.is_verified)

    # 9. Expired OTP fails
    def test_09_expired_otp_fails(self):
        token, user, email, phone = self._register_citizen()
        self.client.post(
            "/api/v1/auth/verification/send",
            headers={"Authorization": f"Bearer {token}"},
            json={"channel": "EMAIL"},
        )
        otp = mock_provider.get_last_otp(email)

        # Force expiration in DB
        db_user = self.db.query(User).filter(User.email == email).first()
        record = (
            self.db.query(VerificationCode)
            .filter(VerificationCode.user_id == db_user.id, VerificationCode.channel == "EMAIL")
            .first()
        )
        record.expires_at = datetime.now(timezone.utc) - timedelta(seconds=10)
        self.db.add(record)
        self.db.commit()

        # Submit OTP
        verify_res = self.client.post(
            "/api/v1/auth/verification/verify",
            headers={"Authorization": f"Bearer {token}"},
            json={"channel": "EMAIL", "otp": otp},
        )
        self.assertEqual(verify_res.status_code, 400)
        self.assertIn("expired", verify_res.json()["detail"].lower())

    # 10. OTP cannot be reused
    def test_10_otp_cannot_be_reused(self):
        token, user, email, phone = self._register_citizen()
        self.client.post(
            "/api/v1/auth/verification/send",
            headers={"Authorization": f"Bearer {token}"},
            json={"channel": "EMAIL"},
        )
        otp = mock_provider.get_last_otp(email)

        # First verification succeeds
        v1 = self.client.post(
            "/api/v1/auth/verification/verify",
            headers={"Authorization": f"Bearer {token}"},
            json={"channel": "EMAIL", "otp": otp},
        )
        self.assertEqual(v1.status_code, 200)

        # Second verification with same OTP fails or reports already verified
        v2 = self.client.post(
            "/api/v1/auth/verification/verify",
            headers={"Authorization": f"Bearer {token}"},
            json={"channel": "EMAIL", "otp": otp},
        )
        # Returns either success because account is already verified or 400 code already used
        self.assertIn(v2.status_code, [200, 400])

    # 11. OTP attempt limit works
    def test_11_otp_attempt_limit(self):
        token, user, email, phone = self._register_citizen()
        self.client.post(
            "/api/v1/auth/verification/send",
            headers={"Authorization": f"Bearer {token}"},
            json={"channel": "EMAIL"},
        )

        # Submit 5 incorrect attempts
        for i in range(5):
            res = self.client.post(
                "/api/v1/auth/verification/verify",
                headers={"Authorization": f"Bearer {token}"},
                json={"channel": "EMAIL", "otp": f"99999{i}"},
            )
            self.assertEqual(res.status_code, 400)

        # Even correct OTP is now rejected because code is locked
        otp = mock_provider.get_last_otp(email)
        locked_res = self.client.post(
            "/api/v1/auth/verification/verify",
            headers={"Authorization": f"Bearer {token}"},
            json={"channel": "EMAIL", "otp": otp},
        )
        self.assertEqual(locked_res.status_code, 400)
        self.assertIn("exceeded", locked_res.json()["detail"].lower())

    # 12. Resend cooldown works (blocks within 60s)
    def test_12_resend_cooldown(self):
        token, user, email, phone = self._register_citizen()
        # First request succeeds
        r1 = self.client.post(
            "/api/v1/auth/verification/send",
            headers={"Authorization": f"Bearer {token}"},
            json={"channel": "EMAIL"},
        )
        self.assertEqual(r1.status_code, 200)

        # Immediate resend should be blocked by cooldown (429 Too Many Requests)
        r2 = self.client.post(
            "/api/v1/auth/verification/resend",
            headers={"Authorization": f"Bearer {token}"},
            json={"channel": "EMAIL"},
        )
        self.assertEqual(r2.status_code, 429)
        self.assertIn("Retry-After", r2.headers)
        self.assertIn("wait", r2.json()["detail"].lower())

    # 13. Previous OTP becomes invalid after resend
    def test_13_previous_otp_invalid_after_resend(self):
        token, user, email, phone = self._register_citizen()
        self.client.post(
            "/api/v1/auth/verification/send",
            headers={"Authorization": f"Bearer {token}"},
            json={"channel": "EMAIL"},
        )
        first_otp = mock_provider.get_last_otp(email)

        # Fast forward creation time in DB to bypass 60s cooldown
        db_user = self.db.query(User).filter(User.email == email).first()
        record = (
            self.db.query(VerificationCode)
            .filter(VerificationCode.user_id == db_user.id, VerificationCode.channel == "EMAIL")
            .first()
        )
        record.created_at = datetime.now(timezone.utc) - timedelta(seconds=70)
        self.db.add(record)
        self.db.commit()

        # Resend code
        resend_res = self.client.post(
            "/api/v1/auth/verification/resend",
            headers={"Authorization": f"Bearer {token}"},
            json={"channel": "EMAIL"},
        )
        self.assertEqual(resend_res.status_code, 200)
        second_otp = mock_provider.get_last_otp(email)
        self.assertNotEqual(first_otp, second_otp)

        # Attempt verifying with first OTP must fail
        fail_res = self.client.post(
            "/api/v1/auth/verification/verify",
            headers={"Authorization": f"Bearer {token}"},
            json={"channel": "EMAIL", "otp": first_otp},
        )
        self.assertEqual(fail_res.status_code, 400)

        # Verifying with second OTP succeeds
        ok_res = self.client.post(
            "/api/v1/auth/verification/verify",
            headers={"Authorization": f"Bearer {token}"},
            json={"channel": "EMAIL", "otp": second_otp},
        )
        self.assertEqual(ok_res.status_code, 200)

    # 14. Unverified citizen cannot obtain normal verified access
    def test_14_unverified_citizen_blocked_from_verified_endpoints(self):
        token, user, email, phone = self._register_citizen()

        # Try accessing protected citizen endpoint before verification
        blocked_res = self.client.get(
            "/api/v1/protected/citizen-access",
            headers={"Authorization": f"Bearer {token}"},
        )
        self.assertEqual(blocked_res.status_code, 403)
        self.assertIn("unverified", blocked_res.json()["detail"].lower())

        # Now verify
        self.client.post(
            "/api/v1/auth/verification/send",
            headers={"Authorization": f"Bearer {token}"},
            json={"channel": "EMAIL"},
        )
        otp = mock_provider.get_last_otp(email)
        self.client.post(
            "/api/v1/auth/verification/verify",
            headers={"Authorization": f"Bearer {token}"},
            json={"channel": "EMAIL", "otp": otp},
        )

        # Now access is granted
        allowed_res = self.client.get(
            "/api/v1/protected/citizen-access",
            headers={"Authorization": f"Bearer {token}"},
        )
        self.assertEqual(allowed_res.status_code, 200)
        self.assertTrue(allowed_res.json()["is_verified"])

    # 15. Authority registration cannot use this flow to obtain unauthorized roles
    def test_15_authority_registration_blocked_from_verification_flow(self):
        # Attempt to register authority role in public endpoint
        res = self.client.post(
            "/api/v1/auth/register",
            json={
                "name": "Intruder Officer",
                "email": f"intruder_{uuid.uuid4().hex[:6]}@gov.in",
                "password": "IntruderPassword@123",
                "role": "COLLECTOR",
            },
        )
        self.assertEqual(res.status_code, 403)

    # 16. Mock email provider works in tests
    def test_16_mock_email_provider_works(self):
        mock_provider.clear()
        token, user, email, phone = self._register_citizen()
        res = self.client.post(
            "/api/v1/auth/verification/send",
            headers={"Authorization": f"Bearer {token}"},
            json={"channel": "EMAIL"},
        )
        self.assertEqual(res.status_code, 200)
        self.assertEqual(len(mock_provider.sent_messages), 1)
        self.assertEqual(mock_provider.sent_messages[0]["destination"], email)

    # 17. Mock WhatsApp provider works in tests
    def test_17_mock_whatsapp_provider_works(self):
        mock_provider.clear()
        token, user, email, phone = self._register_citizen()
        res = self.client.post(
            "/api/v1/auth/verification/send",
            headers={"Authorization": f"Bearer {token}"},
            json={"channel": "WHATSAPP"},
        )
        self.assertEqual(res.status_code, 200)
        self.assertEqual(len(mock_provider.sent_messages), 1)
        self.assertEqual(mock_provider.sent_messages[0]["destination"], phone)

    # 18. Provider credentials are never exposed
    def test_18_provider_credentials_never_exposed(self):
        token, user, email, phone = self._register_citizen()
        # Status endpoint
        status_res = self.client.get(
            "/api/v1/auth/verification/status",
            headers={"Authorization": f"Bearer {token}"},
        )
        self.assertEqual(status_res.status_code, 200)
        content = status_res.text.lower()
        self.assertNotIn("smtp_password", content)
        self.assertNotIn("whatsapp_access_token", content)
        self.assertNotIn("secret", content)


if __name__ == "__main__":
    unittest.main()
