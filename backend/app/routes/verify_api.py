from typing import Any, Dict, Optional

from fastapi import APIRouter, File, Form, Request, UploadFile

from app.routes.verify import verify as verify_endpoint
from app.schemas.verify import VerifyResponse

router = APIRouter(prefix="/api", tags=["API Bridge"])


@router.get("/", summary="API health check")
def api_health() -> Dict[str, Any]:
    """Health check accessible via the /api/ prefix used by the frontend proxy."""
    return {
        "status": "ok",
        "service": "AI-Based Post Authenticity Verification System",
        "version": "0.1.0",
    }


@router.post("/verify", response_model=VerifyResponse)
async def verify_alias(
    request: Request,
    post_text: Optional[str] = Form(None),
    post_url: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
) -> VerifyResponse:
    result = await verify_endpoint(request, post_text=post_text, post_url=post_url, image=image)
    return result
