"""
BHU-NIRIKSHAN Next-Gen Automated Land Acquisition Engine Backend API
Production-Grade Authentication & Statutory RBAC Engine
Compliant with India's RFCTLARR Act (2013)
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from api.core.config import settings
from api.routers import auth_router, protected_router, users_router

app = FastAPI(
    title=settings.APP_NAME,
    description="Production-Grade Authentication & Statutory Role-Based Access Control (RBAC) Engine for Land Acquisition Management System.",
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth_router)
app.include_router(protected_router)
app.include_router(users_router)


# --- System Health Check ---
@app.get("/")
@app.get("/api/v1/health", tags=["Health & Status"])
def health_check():
    return {
        "system": "BHU-NIRIKSHAN Land Acquisition Engine API",
        "status": "ONLINE",
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
        "compliance": "RFCTLARR Act (2013)",
        "auth_engine": "PostgreSQL + Argon2id + JWT + Rotating Refresh Tokens",
    }


# --- Backward Compatibility: RFCTLARR Compensation Calculation Placeholder ---
class CompensationRequest(BaseModel):
    parcel_id: str
    base_market_rate: float
    area_ha: float
    market_multiplier: float = 1.5
    structure_value: float = 0.0
    crop_value: float = 0.0
    tree_value: float = 0.0
    interest_years: float = 1.0


class CompensationResponse(BaseModel):
    parcel_id: str
    base_land_value: float
    multiplied_land_value: float
    asset_structure_value: float
    crop_value: float
    tree_value: float
    solatium_100_percent: float
    interest_accrued_12_percent: float
    total_award_sanctioned: float
    rfctlarr_sections: dict


@app.post("/api/v1/valuation/calculate", response_model=CompensationResponse, tags=["Valuation Engine (RFCTLARR)"])
def calculate_rfctlarr_compensation(req: CompensationRequest):
    base_land_val = req.base_market_rate * req.area_ha
    multiplied_land_val = base_land_val * req.market_multiplier
    asset_val = req.structure_value + req.crop_value + req.tree_value
    solatium = multiplied_land_val + asset_val
    interest = (multiplied_land_val + asset_val + solatium) * (0.12 * req.interest_years)
    total = multiplied_land_val + asset_val + solatium + interest

    return CompensationResponse(
        parcel_id=req.parcel_id,
        base_land_value=round(base_land_val, 2),
        multiplied_land_value=round(multiplied_land_val, 2),
        asset_structure_value=round(asset_val, 2),
        crop_value=round(req.crop_value, 2),
        tree_value=round(req.tree_value, 2),
        solatium_100_percent=round(solatium, 2),
        interest_accrued_12_percent=round(interest, 2),
        total_award_sanctioned=round(total, 2),
        rfctlarr_sections={
            "Section 26": "Determination of Market Value of Land",
            "Section 29": "Determination of Value of Things Attached to Land",
            "Section 30(1)": "100% Solatium Mandatory Grant on Aggregate Asset Value",
            "Section 30(3)": "12% per annum Interest from Section 4 Notification Date",
            "Schedule I": "Award Composition Formula Applied",
        },
    )
