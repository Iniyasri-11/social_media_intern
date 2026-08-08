"""
app/main.py

Application entry point. Responsibilities kept deliberately narrow:
  1. Create the FastAPI instance with project metadata.
  2. Register routers (feature modules) from app/routes/.
  3. Expose a basic health/root endpoint.

Run with:
    uvicorn app.main:app --reload

Then visit:
    http://127.0.0.1:8000/docs   -> interactive Swagger UI
    http://127.0.0.1:8000/redoc  -> alternative ReDoc UI
"""

# Disable SSL verification globally BEFORE any network library is imported.
# Required on Windows/Anaconda where the local CA bundle may be missing.
import os, ssl
os.environ.setdefault("PYTHONHTTPSVERIFY", "0")
ssl._create_default_https_context = ssl._create_unverified_context  # noqa: SLF001

from fastapi import FastAPI

from app.routes.auth_bridge import router as auth_bridge_router
from app.routes.verify import router as verify_router
from app.routes.verify_api import router as verify_api_router

# ---------------------------------------------------------------------------
# Project metadata
# ---------------------------------------------------------------------------
# Shown in Swagger UI (/docs) and ReDoc (/redoc). Keeping this in one place
# makes it easy to bump the version as the API evolves.
APP_TITLE = "AI-Based Post Authenticity Verification System"
APP_DESCRIPTION = (
    "MVP backend for verifying the authenticity of social media posts. "
    "Combines text and image analysis into a single trust verdict "
    "(True / Suspicious / False). This build is the backend foundation "
    "only — AI model integration is added in a later phase."
)
APP_VERSION = "0.1.0"

# ---------------------------------------------------------------------------
# FastAPI app instance
# ---------------------------------------------------------------------------
app = FastAPI(
    title=APP_TITLE,
    description=APP_DESCRIPTION,
    version=APP_VERSION,
)

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------
# Each router encapsulates one feature area. Registering it here is the only
# wiring main.py needs to do — the router itself owns its paths, tags, and
# request/response schemas.
app.include_router(verify_router)
app.include_router(auth_bridge_router)
app.include_router(verify_api_router)


# ---------------------------------------------------------------------------
# Root / health check endpoint
# ---------------------------------------------------------------------------
@app.get("/", tags=["Health"], summary="Basic health check")
def read_root():
    """
    Simple endpoint to confirm the API is running and reachable.
    Useful for load balancers, uptime checks, or a quick manual sanity check.
    """
    return {
        "status": "ok",
        "service": APP_TITLE,
        "version": APP_VERSION,
        "docs": "/docs",
    }
