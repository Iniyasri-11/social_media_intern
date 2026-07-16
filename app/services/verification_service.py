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

import logging
from app.schemas.verify import VerifyResponse, VerificationBreakdown
from app.services.text_classifier import TextClassifier
from app.services.image_verification_service import ImageVerificationService

logger = logging.getLogger(__name__)

# Threshold constants for verdict mapping
THRESHOLD_AUTHENTIC = 0.70
THRESHOLD_SUSPICIOUS = 0.40

# Instantiate the singleton text classifier
text_classifier = TextClassifier()


def verify_post(
    post_text: str | None,
    post_url: str | None = None,
    image_bytes: bytes | None = None,
    image_filename: str | None = None,
) -> VerifyResponse:
    """
    Verifies the authenticity of a social media post using text classification and image metadata forensic checks.

    Args:
        post_text: The text content submitted for verification.
        post_url: Optional source URL.
        image_bytes: Raw binary content of the uploaded image.
        image_filename: Filename of the uploaded image.

    Returns:
        A VerifyResponse containing the verdict, confidence score, sub-scores, metadata analysis, and warnings.
    """
    # 1. Gracefully handle completely empty request (neither text nor image)
    has_text = bool(post_text and post_text.strip())
    has_image = bool(image_bytes is not None)

    if not has_text and not has_image:
        logger.info("Empty request received. Defaulting to neutral/suspicious verdict.")
        return VerifyResponse(
            verdict="Suspicious",
            confidence_score=0.50,
            breakdown=VerificationBreakdown(
                text_authenticity_score=0.50,
                image_authenticity_score=0.50,
            ),
            text_score=0.50,
            image_score=0.50,
            metadata_analysis=None,
            warnings=["No text or image content was provided for analysis."],
            message="No content was provided for analysis. Verification is inconclusive.",
        )

    text_score = 0.50
    model_verdict_type = "N/A"
    raw_confidence = 0.0
    warnings = []

    # 2. Run Text Classification if text is present
    if has_text:
        try:
            classification = text_classifier.classify(post_text)  # type: ignore
            raw_label = classification["label"]
            raw_confidence = classification["score"]

            logger.info(f"Text classifier result - raw label: '{raw_label}', confidence: {raw_confidence:.4f}")

            # Normalize prediction label to 'Real' or 'Fake'
            label_clean = str(raw_label).strip().lower()
            if label_clean in ("real", "label_0", "true", "authentic") or label_clean.startswith("label_0"):
                text_score = round(raw_confidence, 2)
                model_verdict_type = "Authentic"
            elif label_clean in ("fake", "label_1", "false", "misinformation", "suspicious") or label_clean.startswith("label_1"):
                text_score = round(1.0 - raw_confidence, 2)
                model_verdict_type = "Fake"
            else:
                logger.warning(f"Unrecognized prediction label: '{raw_label}'. Falling back to neutral score.")
                text_score = 0.50
                model_verdict_type = "Unknown"
        except Exception as e:
            logger.error(f"Text classification service failed internally: {e}", exc_info=True)
            text_score = 0.50
            warnings.append(f"Text analysis encountered a system error: {str(e)}")

    # 3. Run Image Verification if image is present
    image_score = 0.50
    metadata_analysis = None
    if has_image:
        try:
            # Let ValueError (corrupt or invalid files) bubble up to the route handler
            image_service = ImageVerificationService()
            image_result = image_service.verify_image(image_bytes, image_filename or "uploaded_image.jpg")  # type: ignore
            image_score = image_result["image_score"]
            metadata_analysis = image_result["metadata"]
            warnings.extend(image_result["warnings"])
        except ValueError as e:
            logger.error(f"Image validation failed: {e}")
            raise e
        except Exception as e:
            logger.error(f"Image verification service failed internally: {e}", exc_info=True)
            image_score = 0.50
            warnings.append(f"Image analysis encountered a system error: {str(e)}")

    # 4. Compute overall confidence score and combine text/image signals
    if has_text and has_image:
        # Both text and image present: Weighted average (60% text, 40% image)
        confidence = round(0.60 * text_score + 0.40 * image_score, 2)
    elif has_text:
        # Only text present
        confidence = text_score
    else:
        # Only image present
        confidence = image_score

    # 5. Map overall confidence to verdict
    if confidence >= THRESHOLD_AUTHENTIC:
        verdict = "Authentic"
    elif confidence >= THRESHOLD_SUSPICIOUS:
        verdict = "Suspicious"
    else:
        verdict = "Likely Misinformation"

    # 6. Generate detailed explanation message
    explanations = []
    if has_text:
        explanations.append(
            f"Text content score is {text_score:.2f} (model predicted '{model_verdict_type}' with {raw_confidence * 100:.1f}% confidence)."
        )
    if has_image:
        explanations.append(
            f"Image authenticity score is {image_score:.2f} based on metadata and reverse search checks."
        )
        if warnings:
            explanations.append(f"Forensic check flagged {len(warnings)} warning(s).")
    
    explanation_message = " ".join(explanations)

    return VerifyResponse(
        verdict=verdict,
        confidence_score=confidence,
        breakdown=VerificationBreakdown(
            text_authenticity_score=text_score,
            image_authenticity_score=image_score,
        ),
        text_score=text_score,
        image_score=image_score,
        metadata_analysis=metadata_analysis,
        warnings=warnings,
        message=explanation_message,
    )
