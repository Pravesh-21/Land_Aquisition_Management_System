<div align="center">

# 🏛️ BHU-NIRIKSHAN
### AI-Powered Land Acquisition Management System

**Compliant with RFCTLARR Act, 2013 | Government of India**

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js&logoColor=white)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.11-3776AB?logo=python&logoColor=white)](https://python.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+PostGIS-4169E1?logo=postgresql&logoColor=white)](https://postgresql.org/)
[![Leaflet](https://img.shields.io/badge/Leaflet-GIS%20Maps-199900?logo=leaflet&logoColor=white)](https://leafletjs.com/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://docker.com/)

> **Smart India Hackathon 2024** | Ministry of Rural Development & Ministry of Road Transport & Highways

</div>

---

## 📌 Problem Statement

India's land acquisition process under RFCTLARR Act (2013) suffers from:
- **Manual, paper-based** workflows causing delays of 3–7 years per project
- **No single platform** connecting Agency, LAO, Forest Dept, Collector, Tehsildar & Citizens
- **Opaque compensation** calculations leading to 60%+ legal disputes
- **Zero digital tracking** for citizens on their parcel status and payment

**BHU-NIRIKSHAN** solves this with a unified, role-based GIS platform that digitises the entire acquisition pipeline — from corridor identification to compensation disbursement.

---

## 🌟 Key Features

### 🗺️ Spatial Intelligence
- **Interactive Cadastral Map** — Leaflet.js + ISRO Bhuvan WMS layers + Mapbox
- **Corridor Detection** — Highway/railway alignment overlay on survey parcels
- **Forest Intersection Analysis** — Automatic FRA 2006 conflict flagging
- **Real-time parcel status** with color-coded acquisition stages

### 🤖 AI / ML Modules
- **YOLOv8-OBB Satellite Audit** — Detects unauthorized construction in acquisition zones
- **XGBoost Delay Predictor** — Flags high-risk parcels likely to cause project delays
- **AI Compensation Valuation** — Market-rate + solatium + 12% interest calculator (RFCTLARR §26-30)

### 🔐 Enterprise Authentication
- **Argon2id password hashing** (NIC security standards)
- **JWT + Refresh token** rotation
- **Role-Based Access Control** — 7 distinct roles with fine-grained permissions
- **OTP verification** via WhatsApp & Email (Citizen onboarding)

### 📋 End-to-End Workflow (BPMN)
- Section 11 → 19 → 28 statutory stages tracked digitally
- Collector approval queue with one-click sanction
- Tehsildar hearing scheduler with objection management
- Citizen grievance portal (CPGRAMS-style)

---

## 👥 User Roles & Dashboards

| Role | Ministry / Dept | Key Features |
|------|----------------|-------------|
| 🏗️ **Agency** (NHAI) | Road Transport | Corridor GIS, parcel list, risk scoring |
| 📋 **LAO** | Revenue Dept | AI audit, field survey, vegetation assessment |
| 🌳 **Forest Officer** | MoEFCC | Forest intersection map, FRA compliance |
| 🏛️ **District Collector** | District Admin | Award approvals, BPMN workflow tracker |
| ⚖️ **Tehsildar** | Revenue Court | Hearing manager, objection resolver |
| 🔐 **Admin** | NIC | User management, audit logs, RBAC |
| 👤 **Citizen** | G2C Portal | Compensation status, documents, grievances, map |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser / Client                     │
│           Next.js 15  (App Router · TypeScript)             │
│   Leaflet Maps · Bhuvan WMS · Role-Based Dashboards         │
└────────────────────────┬────────────────────────────────────┘
                         │ REST API (JWT Bearer)
┌────────────────────────▼────────────────────────────────────┐
│                    FastAPI Backend                          │
│   Auth · RBAC · OTP · Audit · Compensation Calculator      │
└──────┬───────────────────────────────────┬──────────────────┘
       │                                   │
┌──────▼──────┐                   ┌────────▼────────┐
│  PostgreSQL  │                   │     Redis        │
│  + PostGIS   │                   │  (Rate limiting) │
│  Alembic ORM │                   └─────────────────┘
└─────────────┘
```

---

## 📁 Project Structure

```
BHU-NIRIKSHAN/
├── frontend/                    # Next.js 15 · TypeScript
│   ├── src/
│   │   ├── app/
│   │   │   ├── login/           # Auth page (login + register + OTP)
│   │   │   └── dashboard/       # 7 role-based dashboard modules
│   │   ├── components/          # Sidebar, TopBar, Maps, DataGrid, KPICard…
│   │   ├── contexts/            # AuthContext, RoleContext, NotificationContext
│   │   ├── data/                # Mock data for demo
│   │   └── types/               # Global TypeScript interfaces
│   ├── public/                  # Static assets & GIS background images
│   ├── Dockerfile
│   └── package.json
│
├── backend/                     # FastAPI · Python 3.11
│   ├── app/                     # Prototype server (in-memory, no DB needed)
│   ├── api/                     # Production server
│   │   ├── core/                #   Config, DB, Security, Rate limiter
│   │   ├── models/              #   SQLAlchemy ORM (User, Role, OTP, Audit…)
│   │   ├── routers/             #   Auth, Admin, Users, Verification
│   │   ├── services/            #   Business logic layer
│   │   ├── repositories/        #   Data access layer
│   │   └── providers/           #   WhatsApp / Email OTP adapters
│   ├── alembic/                 # Database migrations
│   ├── tests/                   # pytest test suites
│   ├── requirements.txt
│   └── Dockerfile
│
├── docker-compose.yml           # Full stack (Next.js + FastAPI + PostgreSQL + Redis)
└── README.md
```

---

## 🚀 Quick Start

### Option 1 — Docker (Recommended for full stack)

```bash
git clone https://github.com/your-username/Land_Aquisition_Management_System.git
cd Land_Aquisition_Management_System
docker compose up --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| API Docs | http://localhost:8000/docs |

### Option 2 — Manual (Prototype, no DB needed)

**Frontend:**
```bash
cd frontend
npm install
npm run dev          # → http://localhost:3000
```

**Backend (prototype — no PostgreSQL required):**
```bash
cd backend
pip install fastapi uvicorn
uvicorn app.main:app --port 8000 --reload
```

### Option 3 — Production (Full PostgreSQL stack)

```bash
# Start DB
docker compose up db redis -d

# Run migrations
cd backend
alembic upgrade head
python api/seed.py          # Seed roles, permissions, officers

# Start API
uvicorn api.main:app --port 8001 --reload
```

---

## 🔑 Demo Credentials

> Use the **"Official Credentials Directory"** button on the login page for one-click autofill.

| Role | Email | Password |
|------|-------|----------|
| Agency (NHAI) | `agency@gov.in` | `password123` |
| LAO | `lao@gov.in` | `password123` |
| Forest Officer | `forest@gov.in` | `password123` |
| District Collector | `collector@gov.in` | `password123` |
| Tehsildar | `tehsildar@gov.in` | `password123` |
| Citizen | `citizen@gov.in` | `password123` |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend Framework | Next.js 15 (App Router) |
| Language (FE) | TypeScript 5 |
| Styling | Vanilla CSS + CSS Variables |
| Maps | Leaflet.js + React-Leaflet + ISRO Bhuvan WMS |
| Backend Framework | FastAPI 0.115 |
| Language (BE) | Python 3.11 |
| Database | PostgreSQL 15 + PostGIS 3.3 |
| ORM | SQLAlchemy (async) + Alembic |
| Auth | Argon2id + JWT + Refresh Tokens |
| OTP | WhatsApp (Gupshup) + SMTP Email |
| Cache | Redis 7 |
| Container | Docker + Docker Compose |
| Deployment | Vercel (FE) + Railway/Render (BE) |

---

## 📸 Screenshots

> Dashboard previews across all 7 roles — showcasing GIS maps, KPI cards, workflow trackers, and citizen portal.

| Agency Dashboard | Collector Approvals |
|:---:|:---:|
| *(Corridor map + risk scoring)* | *(Award sanction workflow)* |

| Citizen Portal | LAO AI Audit |
|:---:|:---:|
| *(Compensation + grievance portal)* | *(YOLOv8 satellite scan)* |

---

## 📜 Statutory Compliance

This system implements the full digital workflow for:
- **RFCTLARR Act, 2013** — Sections 11, 15, 19, 28, 31, 38
- **Forest Rights Act, 2006** — Tribal land clearance workflow
- **IT Act, 2000** — Digital signature & audit trail
- **NIC Security Standards** — Argon2id encryption, JWT auth

---

## 🧪 Testing

```bash
cd backend
pip install pytest httpx
pytest tests/ -v
```

| Test Suite | Coverage |
|-----------|---------|
| `test_auth_rbac.py` | Login, JWT, RBAC permissions |
| `test_security_admin.py` | Admin endpoints, access control |
| `test_verification.py` | OTP send/verify/resend, cooldown |

---

## 👨‍💻 Team

> *Smart India Hackathon 2024 — [Team Name]*

| Name | Role |
|------|------|
| *(Add team members)* | *(Add role)* |

---

## 📄 License

MIT License — © 2024 BHU-NIRIKSHAN Team

---

<div align="center">

**Built for Smart India Hackathon 2024**
*Digitising land acquisition for a faster, fairer, transparent India*

⭐ Star this repo if you find it useful!

</div>
