"""
app/routes/auth_bridge.py

Authentication using Supabase REST API called directly via httpx (verify=False).
This bypasses the SSL cert issue on Windows/Anaconda without needing any patch.
- signup: username, phone_number, password
- login:  username, password
"""

import os
from pathlib import Path
from typing import Any, Dict

import bcrypt
import httpx
from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException, Request

# Load .env from project root
load_dotenv(dotenv_path=Path(__file__).resolve().parents[3] / ".env")

SUPABASE_URL = os.environ.get("SUPABASE_URL", "").rstrip("/")
SUPABASE_KEY = os.environ.get("SUPABASE_ANON_KEY", "")

router = APIRouter(prefix="/api/auth", tags=["Auth Bridge"])

def _hash_password(plain: str) -> str:
    return bcrypt.hashpw(plain.encode(), bcrypt.gensalt()).decode()

def _verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())


def _headers() -> dict:
    return {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }


def _sb_get(table: str, params: dict) -> list:
    """SELECT from Supabase table via REST, SSL verification disabled."""
    url = f"{SUPABASE_URL}/rest/v1/{table}"
    with httpx.Client(verify=False) as client:
        r = client.get(url, headers=_headers(), params=params)
    if r.status_code not in (200, 206):
        raise HTTPException(status_code=502, detail=f"Supabase error: {r.text}")
    return r.json()


def _sb_insert(table: str, payload: dict) -> dict:
    """INSERT into Supabase table via REST, SSL verification disabled."""
    url = f"{SUPABASE_URL}/rest/v1/{table}"
    with httpx.Client(verify=False) as client:
        r = client.post(url, headers=_headers(), json=payload)
    if r.status_code not in (200, 201):
        raise HTTPException(status_code=502, detail=f"Supabase error: {r.text}")
    rows = r.json()
    return rows[0] if rows else payload


# ── Routes ────────────────────────────────────────────────────────────────────

@router.post("/signup")
async def signup(request: Request) -> Dict[str, Any]:
    try:
        payload = await request.json()
    except Exception:
        payload = {}

    username     = str(payload.get("username") or "").strip().lower()
    phone_number = str(payload.get("phone_number") or "").strip()
    password     = str(payload.get("password") or "").strip()

    if not username or not password or not phone_number:
        raise HTTPException(status_code=400, detail="username, phone_number and password are required.")

    if not SUPABASE_URL or not SUPABASE_KEY:
        raise HTTPException(status_code=500, detail="Supabase env vars not configured.")

    # Check duplicate username
    existing = _sb_get("users", {"username": f"eq.{username}", "select": "username"})
    if existing:
        raise HTTPException(status_code=409, detail="Username already taken.")

    # Insert new user
    _sb_insert("users", {
        "username":      username,
        "phone_number":  phone_number,
        "password_hash": _hash_password(password),
    })

    return {
        "user": {"username": username, "phone_number": phone_number},
        "session": {"access_token": f"tok_{username}", "token_type": "bearer"},
    }


@router.post("/login")
async def login(request: Request) -> Dict[str, Any]:
    try:
        payload = await request.json()
    except Exception:
        payload = {}

    username = str(payload.get("username") or "").strip().lower()
    password = str(payload.get("password") or "").strip()

    if not username or not password:
        raise HTTPException(status_code=400, detail="username and password are required.")

    if not SUPABASE_URL or not SUPABASE_KEY:
        raise HTTPException(status_code=500, detail="Supabase env vars not configured.")

    rows = _sb_get("users", {
        "username": f"eq.{username}",
        "select": "username,phone_number,password_hash",
    })

    if not rows or not _verify_password(password, rows[0]["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid username or password.")

    user_row = rows[0]
    return {
        "user": {"username": user_row["username"], "phone_number": user_row["phone_number"]},
        "session": {"access_token": f"tok_{username}", "token_type": "bearer"},
    }


@router.post("/logout")
def logout() -> Dict[str, Any]:
    return {"message": "Signed out successfully."}
