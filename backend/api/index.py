"""
BHU-NIRIKSHAN Next-Gen Automated Land Acquisition Engine Backend API
Vercel Serverless Function Entrypoint (/api/index.py)
Re-exports the production-grade FastAPI application from api.main
"""

from api.main import app

# Export app for Vercel Serverless runtime
__all__ = ["app"]
