import os
from typing import Dict, List
from sqlalchemy.orm import Session
from api.core.database import SessionLocal
from api.core.security import hash_password
from api.models import Role, Permission, Department, User
from api.repositories.user_repository import UserRepository

# 27 statutory permissions defined in the specification
PERMISSIONS_DATA: List[Dict[str, str]] = [
    {"name": "PROJECT_VIEW", "description": "View land acquisition project corridors & schedules"},
    {"name": "PROJECT_CREATE", "description": "Create new land acquisition corridor proposal"},
    {"name": "PROJECT_UPDATE", "description": "Update corridor alignment & RoW buffer parameters"},
    {"name": "PROJECT_APPROVE", "description": "Statutory project approval under RFCTLARR Act"},
    {"name": "PARCEL_VIEW", "description": "View cadastral land parcels & ULPIN geometry"},
    {"name": "PARCEL_CREATE", "description": "Register cadastral parcel into project boundary"},
    {"name": "PARCEL_UPDATE", "description": "Update parcel ownership & classification"},
    {"name": "PARCEL_VERIFY", "description": "Verify field survey & boundary demarcation"},
    {"name": "LAND_RECORD_VIEW", "description": "Access computerized Records of Rights (RoR)"},
    {"name": "LAND_RECORD_VERIFY", "description": "Certify encumbrance and title authenticity"},
    {"name": "DOCUMENT_VIEW", "description": "View notifications, gazettes & orders"},
    {"name": "DOCUMENT_UPLOAD", "description": "Upload panchnama, field notes & claims"},
    {"name": "DOCUMENT_VERIFY", "description": "Digitally sign and certify statutory notices"},
    {"name": "OBJECTION_VIEW", "description": "View Section 15 objections & claims"},
    {"name": "OBJECTION_CREATE", "description": "Submit objection against acquisition"},
    {"name": "OBJECTION_PROCESS", "description": "Review and process Section 15 objections"},
    {"name": "HEARING_VIEW", "description": "View scheduled revenue court hearings"},
    {"name": "HEARING_CREATE", "description": "Issue hearing notices to affected parties"},
    {"name": "HEARING_CONDUCT", "description": "Record hearing statements & findings"},
    {"name": "COMPENSATION_VIEW", "description": "View Section 26-30 valuation matrix"},
    {"name": "COMPENSATION_CALCULATE", "description": "Execute RFCTLARR compensation calculator"},
    {"name": "COMPENSATION_APPROVE", "description": "Sanction compensation award budget"},
    {"name": "AWARD_VIEW", "description": "View Section 23/31 award dockets"},
    {"name": "AWARD_PREPARE", "description": "Draft statutory award enquiry statements"},
    {"name": "AWARD_APPROVE", "description": "Finalize and publish Section 37 land award"},
    {"name": "PAYMENT_VIEW", "description": "View PFMS DBT disbursement status"},
    {"name": "PAYMENT_INITIATE", "description": "Initiate DBT compensation tranche"},
    {"name": "PAYMENT_APPROVE", "description": "Authorize bank disbursement order"},
    {"name": "FOREST_VIEW", "description": "View forest compartment & eco-sensitive layers"},
    {"name": "FOREST_REVIEW", "description": "Scrutinize tree enumeration & wildlife corridors"},
    {"name": "FOREST_APPROVE", "description": "Grant MoEFCC Stage-I/II statutory clearance"},
    {"name": "SURVEY_VIEW", "description": "View drone/satellite cadastral surveys"},
    {"name": "SURVEY_CREATE", "description": "Initiate LiDAR & drone survey orders"},
    {"name": "SURVEY_VERIFY", "description": "Approve ground truth cadastral alignment"},
    {"name": "WORKFLOW_VIEW", "description": "Monitor statutory workflow pipeline stages"},
    {"name": "WORKFLOW_TRANSITION", "description": "Advance acquisition case to next statutory stage"},
    {"name": "AUDIT_VIEW", "description": "Access immutable statutory audit trail"},
    {"name": "CITIZEN_VIEW", "description": "View citizen land status & entitlements"},
    {"name": "GRIEVANCE_CREATE", "description": "Lodge grievance / objection through portal"},
]

ROLES_DATA: List[Dict[str, str]] = [
    {"name": "ADMIN", "description": "System Administrator with unrestricted access"},
    {"name": "AGENCY", "description": "Requisite Agency (NHAI / MoRTH / Railways)"},
    {"name": "LAO", "description": "Land Acquisition Officer & Competent Authority"},
    {"name": "FOREST", "description": "Divisional Forest Officer / MoEFCC Authority"},
    {"name": "COLLECTOR", "description": "District Collector & District Magistrate"},
    {"name": "TEHSILDAR", "description": "Executive Magistrate & Revenue Court"},
    {"name": "CITIZEN", "description": "Landowner & Project Affected Person (PAP)"},
]

ROLE_PERMISSIONS_MAPPING: Dict[str, List[str]] = {
    "ADMIN": [p["name"] for p in PERMISSIONS_DATA],
    "AGENCY": [
        "PROJECT_VIEW",
        "PROJECT_CREATE",
        "PROJECT_UPDATE",
        "PARCEL_VIEW",
        "PARCEL_CREATE",
        "PARCEL_UPDATE",
        "LAND_RECORD_VIEW",
        "DOCUMENT_VIEW",
        "DOCUMENT_UPLOAD",
        "SURVEY_VIEW",
    ],
    "LAO": [
        "PROJECT_VIEW",
        "PARCEL_VIEW",
        "PARCEL_VERIFY",
        "LAND_RECORD_VIEW",
        "LAND_RECORD_VERIFY",
        "DOCUMENT_VIEW",
        "DOCUMENT_VERIFY",
        "OBJECTION_VIEW",
        "OBJECTION_PROCESS",
        "HEARING_VIEW",
        "HEARING_CREATE",
        "HEARING_CONDUCT",
        "COMPENSATION_VIEW",
        "COMPENSATION_CALCULATE",
        "AWARD_VIEW",
        "AWARD_PREPARE",
        "SURVEY_VIEW",
        "SURVEY_VERIFY",
    ],
    "FOREST": [
        "PROJECT_VIEW",
        "PARCEL_VIEW",
        "LAND_RECORD_VIEW",
        "DOCUMENT_VIEW",
        "DOCUMENT_UPLOAD",
        "DOCUMENT_VERIFY",
        "FOREST_VIEW",
        "FOREST_REVIEW",
        "FOREST_APPROVE",
    ],
    "COLLECTOR": [
        "PROJECT_VIEW",
        "PROJECT_APPROVE",
        "PARCEL_VIEW",
        "OBJECTION_VIEW",
        "HEARING_VIEW",
        "COMPENSATION_VIEW",
        "COMPENSATION_APPROVE",
        "AWARD_VIEW",
        "AWARD_APPROVE",
        "WORKFLOW_VIEW",
        "WORKFLOW_TRANSITION",
        "AUDIT_VIEW",
    ],
    "TEHSILDAR": [
        "PROJECT_VIEW",
        "PARCEL_VIEW",
        "LAND_RECORD_VIEW",
        "LAND_RECORD_VERIFY",
        "DOCUMENT_VIEW",
        "DOCUMENT_VERIFY",
        "HEARING_VIEW",
        "HEARING_CREATE",
        "HEARING_CONDUCT",
        "SURVEY_VIEW",
        "SURVEY_VERIFY",
        "WORKFLOW_VIEW",
        "WORKFLOW_TRANSITION",
    ],
    "CITIZEN": [
        "CITIZEN_VIEW",
        "DOCUMENT_VIEW",
        "OBJECTION_VIEW",
        "OBJECTION_CREATE",
        "GRIEVANCE_CREATE",
    ],
}

DEPARTMENTS_DATA: List[Dict[str, str]] = [
    {"code": "SYSTEM_ADMIN", "name": "System & Security Administration", "description": "National Informatics Center"},
    {"code": "NHAI", "name": "National Highways Authority of India", "description": "PIU Nagpur Corridor Division"},
    {"code": "LAND_ACQUISITION", "name": "Land Acquisition & Rehabilitation Office", "description": "Revenue Dept. - Pune Division"},
    {"code": "FOREST_ENVIRONMENT", "name": "Forest & Wildlife Department", "description": "MoEFCC - Western Region"},
    {"code": "DISTRICT_ADMINISTRATION", "name": "Office of the District Collector", "description": "District Administration - Nagpur"},
    {"code": "REVENUE", "name": "Revenue Court & Tehsil Office", "description": "Revenue Court - Sikar Tehsil"},
    {"code": "CITIZEN", "name": "Citizen Services & PAP Welfare", "description": "Public Landowners & Affected Families"},
]

# Development & Demo Users
DEMO_USERS = [
    {
        "username": "admin",
        "email": "admin@gov.in",
        "password": "Admin@123",
        "full_name": "Sh. Rajeshwar Verma",
        "phone": "+91 98110 00001",
        "role": "ADMIN",
        "department": "SYSTEM_ADMIN",
    },
    {
        "username": "agency",
        "email": "agency@nhai.gov.in",
        "password": "Agency@123",
        "full_name": "Sh. Jagdish Deshmukh",
        "phone": "+91 98220 11223",
        "role": "AGENCY",
        "department": "NHAI",
    },
    {
        "username": "lao",
        "email": "lao.pune@revenue.gov.in",
        "password": "LAO@123",
        "full_name": "Smt. Meera Kulkarni",
        "phone": "+91 98221 22334",
        "role": "LAO",
        "department": "LAND_ACQUISITION",
    },
    {
        "username": "forest",
        "email": "dfo.forest@moefcc.gov.in",
        "password": "Forest@123",
        "full_name": "Dr. Anil Sharma",
        "phone": "+91 98222 33445",
        "role": "FOREST",
        "department": "FOREST_ENVIRONMENT",
    },
    {
        "username": "collector",
        "email": "collector.nagpur@gov.in",
        "password": "Collector@123",
        "full_name": "Sh. Ramesh Kumar, IAS",
        "phone": "+91 98223 44556",
        "role": "COLLECTOR",
        "department": "DISTRICT_ADMINISTRATION",
    },
    {
        "username": "tehsildar",
        "email": "tehsildar.court@revenue.gov.in",
        "password": "Tehsildar@123",
        "full_name": "Sh. Vikram Singh",
        "phone": "+91 98224 55667",
        "role": "TEHSILDAR",
        "department": "REVENUE",
    },
    {
        "username": "citizen",
        "email": "citizen@gov.in",
        "password": "Citizen@123",
        "full_name": "Sh. Rajendra Patel",
        "phone": "+91 98225 66778",
        "role": "CITIZEN",
        "department": "CITIZEN",
    },
]


def seed_database(db: Session = None):
    close_after = False
    if db is None:
        db = SessionLocal()
        close_after = True

    try:
        print("[*] Seeding permissions...")
        perm_objs: Dict[str, Permission] = {}
        for pdata in PERMISSIONS_DATA:
            p = db.query(Permission).filter(Permission.name == pdata["name"]).first()
            if not p:
                p = Permission(name=pdata["name"], description=pdata["description"])
                db.add(p)
                db.flush()
            perm_objs[p.name] = p
        db.commit()

        print("[*] Seeding departments...")
        dept_objs: Dict[str, Department] = {}
        for ddata in DEPARTMENTS_DATA:
            d = db.query(Department).filter(Department.code == ddata["code"]).first()
            if not d:
                d = Department(name=ddata["name"], code=ddata["code"], description=ddata["description"])
                db.add(d)
                db.flush()
            dept_objs[d.code] = d
        db.commit()

        print("[*] Seeding roles & role-permission mappings...")
        role_objs: Dict[str, Role] = {}
        for rdata in ROLES_DATA:
            r = db.query(Role).filter(Role.name == rdata["name"]).first()
            if not r:
                r = Role(name=rdata["name"], description=rdata["description"])
                db.add(r)
                db.flush()
            
            # Map permissions
            required_perm_names = ROLE_PERMISSIONS_MAPPING.get(r.name, [])
            current_perm_names = {p.name for p in r.permissions}
            for pname in required_perm_names:
                if pname in perm_objs and pname not in current_perm_names:
                    r.permissions.append(perm_objs[pname])
            
            db.add(r)
            db.flush()
            role_objs[r.name] = r
        db.commit()

        print("[*] Seeding demo users with Argon2id hashes...")
        for udata in DEMO_USERS:
            u = db.query(User).filter(
                (User.username == udata["username"]) | (User.email == udata["email"])
            ).first()

            role_obj = role_objs.get(udata["role"])
            dept_obj = dept_objs.get(udata["department"])

            # Use password from user data or fallback to SEED_PASSWORD env var
            pwd = os.getenv("SEED_PASSWORD", udata["password"])
            argon2_hash = hash_password(pwd)

            if not u:
                u = User(
                    username=udata["username"],
                    email=udata["email"],
                    password_hash=argon2_hash,
                    full_name=udata["full_name"],
                    phone=udata["phone"],
                    is_active=True,
                    is_verified=True,
                    roles=[role_obj] if role_obj else [],
                    departments=[dept_obj] if dept_obj else [],
                )
                db.add(u)
                print(f"   Created user: {udata['username']} ({udata['role']})")
            else:
                # Update password hash and roles to ensure accurate seed state
                u.password_hash = argon2_hash
                if role_obj and role_obj not in u.roles:
                    u.roles.append(role_obj)
                if dept_obj and dept_obj not in u.departments:
                    u.departments.append(dept_obj)
                db.add(u)
                print(f"   Updated user: {udata['username']} ({udata['role']})")

        db.commit()
        print("[+] Database seeding completed successfully!")
    finally:
        if close_after:
            db.close()


if __name__ == "__main__":
    seed_database()
