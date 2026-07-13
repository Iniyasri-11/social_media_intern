"""
app/routes/verify.py

Defines the /verify endpoint using an APIRouter, rather than attaching
routes directly to the main `app` object. This keeps main.py clean and
lets each feature area (verify, and later e.g. auth, history, admin) live
in its own router module that main.py simply includes.
"""

from fastapi import APIRouter

from app.schemas.verify import VerifyRequest, VerifyResponse
from app.services.verification_service import verify_post

# prefix/tags here keep Swagger UI organized and give all routes in this
# file a consistent base path (e.g. this could become /api/v1/verify later)
router = APIRouter(
    prefix="/verify",
    tags=["Verification"],
)


@router.post(
    "",
    response_model=VerifyResponse,
    summary="Verify the authenticity of a social media post",
    description=(
        "Accepts a post's text (and optionally its source URL) and returns "
        "an authenticity verdict. Currently returns a dummy response — "
        "no AI model is wired in yet."
    ),
)
def verify(request: VerifyRequest) -> VerifyResponse:
    """
    Route handler: stays thin on purpose.

    Its only job is to:
      1. Receive the validated request (FastAPI + Pydantic already checked
         the shape/types before we get here).
      2. Delegate the actual work to the service layer.
      3. Return the service's result.

    No business logic belongs here — see app/services/verification_service.py.
    """
    return verify_post(post_text=request.post_text, post_url=request.post_url)
