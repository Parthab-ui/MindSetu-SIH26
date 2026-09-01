"""Vercel Serverless Function entrypoint for MindSetu FastAPI backend."""
import sys
from pathlib import Path

# Add backend directory to sys.path so all backend modules and ML models resolve cleanly
BACKEND_DIR = Path(__file__).resolve().parent.parent / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

# Import the existing configured FastAPI app from main.py
from main import app  # noqa: E402

# Export app for Vercel's ASGI serverless runtime
__all__ = ["app"]
