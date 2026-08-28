import os
import sys

# Ensure backend package is in Python import path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.app.main import app

# Export FastAPI app for Vercel Python Serverless Runtime
__all__ = ["app"]
