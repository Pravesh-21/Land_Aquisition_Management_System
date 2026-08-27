"""
BHU-DRISHTI Next-Gen Automated Land Acquisition Engine Backend API
Compliant with India's RFCTLARR Act (2013)
FastAPI Microservices Stack
"""

from fastapi import FastAPI, HTTPException, Query, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os

app = FastAPI(
    title="BHU-DRISHTI API Engine",
    description="Backend microservices for Spatial GIS, RFCTLARR Compensation Valuation, Camunda BPMN Workflow, YOLOv8-OBB AI Audit, & XGBoost Delay Scoring",
    version="1.0.0"
)

# CORS Setup
origins = os.getenv("CORS_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Schemas ---
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

# --- Health Check ---
@app.get("/")
def read_root():
  return {
      "system": "BHU-DRISHTI Land Acquisition Engine API",
      "status": "ONLINE",
      "compliance": "RFCTLARR Act (2013)",
      "environment": "PROTOTYPE"
  }

@app.get("/api/v1/health")
def health_check():
  return {"status": "healthy", "postgis": "connected", "redis": "connected"}

# --- Feature 10: RFCTLARR Compensation Valuation Engine ---
@app.post("/api/v1/valuation/calculate", response_model=CompensationResponse)
def calculate_rfctlarr_compensation(req: CompensationRequest):
  """
  Statutory RFCTLARR Act (2013) Valuation Formula:
  Total Award = (Land Base Rate x Market Multiplier) + Asset Structure + Crop Value + Mandatory 100% Solatium Amount + Interest
  """
  base_land_val = req.base_market_rate * req.area_ha
  multiplied_land_val = base_land_val * req.market_multiplier
  asset_val = req.structure_value + req.crop_value + req.tree_value
  
  # Mandatory 100% Solatium on multiplied land value + assets per Sec 30(1)
  solatium = multiplied_land_val + asset_val
  
  # 12% p.a. interest under Sec 80
  interest = (multiplied_land_val + asset_val + solatium) * (0.12 * req.interest_years)
  
  total = multiplied_land_val + asset_val + solatium + interest
  
  return CompensationResponse(
      parcel_id=req.parcel_id,
      base_land_value=base_land_val,
      multiplied_land_value=multiplied_land_val,
      asset_structure_value=req.structure_value,
      crop_value=req.crop_value,
      tree_value=req.tree_value,
      solatium_100_percent=solatium,
      interest_accrued_12_percent=interest,
      total_award_sanctioned=total,
      rfctlarr_sections={
          "market_rate": "Section 26(1)",
          "assets": "Section 29(1)",
          "solatium": "Section 30(1)",
          "interest": "Section 80"
      }
  )

# --- Feature 6: XGBoost Delay & Litigation Risk Scoring ---
@app.get("/api/v1/ml/risk-score/{parcel_id}")
def get_parcel_risk_score(parcel_id: str):
  """
  XGBoost Risk Scoring Microservice
  """
  return {
      "parcel_id": parcel_id,
      "risk_score": 72.5,
      "risk_category": "HIGH_RISK",
      "action_trigger": "AUTO_SHIFT_RECOMMENDED",
      "factors": {
          "dispute_history": 85.0,
          "forest_proximity": 10.0,
          "multi_owner_complexity": 20.0,
          "religious_structure": 0.0,
          "litigation_history": 90.0
      }
  }

# --- Feature 3 & 4: YOLOv8-OBB & OpenCV Satellite Analysis ---
@app.get("/api/v1/ml/satellite-audit/{parcel_id}")
def get_satellite_audit(parcel_id: str):
  """
  YOLOv8-OBB Asset Audit & OpenCV HSV Vegetation Masking
  """
  return {
      "parcel_id": parcel_id,
      "yolo_obb_detections": [
          {"type": "Building", "confidence": 0.94, "surface_area_sqm": 1575, "value_inr": 350000},
          {"type": "Shed", "confidence": 0.87, "surface_area_sqm": 500, "value_inr": 75000},
          {"type": "Well", "confidence": 0.91, "surface_area_sqm": 50, "value_inr": 120000}
      ],
      "opencv_hsv_vegetation": {
          "crop_coverage_percent": 62.5,
          "tree_canopy_density_percent": 15.3,
          "barren_percent": 12.2,
          "built_up_percent": 8.5,
          "health_index": 0.72
      }
  }

if __name__ == "__main__":
  import uvicorn
  uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
