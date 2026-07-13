"""
app/services/verification_service.py

Service layer: holds the business logic for verification, kept separate
from the route (app/routes/verify.py) so that:
  - Routes stay thin (just handle HTTP concerns: request/response).
  - Logic here can be unit-tested without spinning up FastAPI or HTTP.
  - When real AI models are wired in later, only this file changes —
    the route and schemas stay the same.

Today this returns a fixed dummy result. No ML, no image processing,
no database — just proves the request -> service -> response flow works.
"""

from app.schemas.verify import VerifyResponse, VerificationBreakdown


def verify_post(post_text: str | None, post_url: str | None = None) -> VerifyResponse:
    """
    Placeholder verification logic.

    Args:
        post_text: The text content submitted for verification.
        post_url: Optional source URL, currently unused (reserved for logging
                   or future metadata lookups).

    Returns:
        A VerifyResponse with dummy/fixed values. Replace the body of this
        function with real model calls once text/image analysis modules
        are implemented — the function signature and return type should
        stay stable so routes don't need to change.
    """
    # TODO: replace with real text authenticity model output
    dummy_text_score = 0.5

    # TODO: replace with real image authenticity model output
    dummy_image_score = 0.5

    # TODO: replace with real weighted scoring logic (see scoring/ module)
    dummy_confidence = round((dummy_text_score + dummy_image_score) / 2, 2)

    return VerifyResponse(
        verdict="Suspicious",  # neutral placeholder verdict
        confidence_score=dummy_confidence,
        breakdown=VerificationBreakdown(
            text_authenticity_score=dummy_text_score,
            image_authenticity_score=dummy_image_score,
        ),
        message="This is a dummy response. AI-based verification is not yet implemented.",
    )
