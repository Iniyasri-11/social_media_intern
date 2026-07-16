"""
app/schemas/verify.py

Pydantic models define the "contract" for our API — what data a client must
send, and what shape of data we promise to send back. FastAPI uses these to:
  1. Validate incoming requests automatically (reject bad input with a 422).
  2. Generate the interactive Swagger docs at /docs.
  3. Serialize our response consistently.

At this stage there is no AI model behind these — VerifyResponse is filled
with dummy/placeholder values by the route handler.
"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class VerifyRequest(BaseModel):
    """
    Incoming payload for POST /verify.

    Image upload isn't included here because file uploads in FastAPI are
    handled separately via UploadFile/Form in the route itself — a JSON
    body and multipart file can't both be declared in one Pydantic model.
    We keep this schema for the text-only part of the request and for
    documenting the endpoint's shape in Swagger.
    """
    post_text: Optional[str] = Field(
        default=None,
        description="The text content of the social media post to verify.",
        examples=["Breaking: scientists confirm shocking discovery!"],
    )
    post_url: Optional[str] = Field(
        default=None,
        description="Optional URL of the original post, for reference/logging.",
    )


class VerificationBreakdown(BaseModel):
    """
    Sub-scores that make up the final verdict. Placeholder values today;
    will be populated by real model outputs once AI integration begins.
    """
    text_authenticity_score: float = Field(
        description="0-1 score representing text authenticity likelihood (placeholder)."
    )
    image_authenticity_score: float = Field(
        description="0-1 score representing image authenticity likelihood (placeholder)."
    )


class VerifyResponse(BaseModel):
    """
    Outgoing payload for POST /verify.

    verdict is intentionally a plain string (not yet an Enum) at this stage
    to keep the foundation simple — this can be tightened later.
    """
    verdict: str = Field(
        description="Overall authenticity verdict.",
        examples=["True", "Suspicious", "False"],
    )
    confidence_score: float = Field(
        description="0-1 overall confidence in the verdict."
    )
    breakdown: VerificationBreakdown
    text_score: Optional[float] = Field(
        default=None,
        description="0-1 score representing text authenticity likelihood."
    )
    image_score: Optional[float] = Field(
        default=None,
        description="0-1 score representing image authenticity likelihood."
    )
    metadata_analysis: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Extracted and analyzed image metadata."
    )
    warnings: List[str] = Field(
        default_factory=list,
        description="List of forensic warnings triggered during verification."
    )
    message: str = Field(
        description="Human-readable explanation of the result.",
    )

