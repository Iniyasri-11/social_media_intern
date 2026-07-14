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

logger = logging.getLogger(__name__)

# Threshold constants for verdict mapping
THRESHOLD_AUTHENTIC = 0.70
THRESHOLD_SUSPICIOUS = 0.40

# Instantiate the singleton text classifier
text_classifier = TextClassifier()


def verify_post(post_text: str | None, post_url: str | None = None) -> VerifyResponse:
    """
    Verifies the authenticity of a social media post using a text classification AI model.

    Args:
        post_text: The text content submitted for verification.
        post_url: Optional source URL, currently unused.

    Returns:
        A VerifyResponse containing the verdict, confidence score, sub-scores, and an explanation.
    """
    # 1. Gracefully handle empty, missing, or whitespace-only text
    if not post_text or not post_text.strip():
        logger.info("Empty or missing post text received. Defaulting to neutral/suspicious verdict.")
        neutral_score = 0.50
        return VerifyResponse(
            verdict="Suspicious",
            confidence_score=neutral_score,
            breakdown=VerificationBreakdown(
                text_authenticity_score=neutral_score,
                image_authenticity_score=0.50,  # Placeholder image score
            ),
            message="No text content was provided for analysis. Verification is inconclusive.",
        )

    try:
        # 2. Run text classification using the singleton AI model
        classification = text_classifier.classify(post_text)
        raw_label = classification["label"]
        raw_confidence = classification["score"]

        logger.info(f"Text classifier result - raw label: '{raw_label}', confidence: {raw_confidence:.4f}")

        # 3. Normalize prediction label to 'Real' or 'Fake'
        label_clean = str(raw_label).strip().lower()
        if label_clean in ("real", "label_0", "true", "authentic") or label_clean.startswith("label_0"):
            # Model predicts it is Real (authentic). The text authenticity score is the confidence score itself.
            text_score = round(raw_confidence, 2)
            model_verdict_type = "Authentic"
        elif label_clean in ("fake", "label_1", "false", "misinformation", "suspicious") or label_clean.startswith("label_1"):
            # Model predicts it is Fake (misinformation). Text authenticity score is the inverse (1 - confidence).
            text_score = round(1.0 - raw_confidence, 2)
            model_verdict_type = "Fake"
        else:
            # Fallback if label is unrecognized
            logger.warning(f"Unrecognized prediction label: '{raw_label}'. Falling back to neutral score.")
            text_score = 0.50
            model_verdict_type = "Unknown"

        # 4. Image score remains a placeholder in this phase
        image_score = 0.50

        # 5. Compute overall authenticity score (for now, simple average between text and placeholder image)
        confidence = round((text_score + image_score) / 2, 2)

        # 6. Map the text authenticity score to the appropriate verdict
        if text_score >= THRESHOLD_AUTHENTIC:
            verdict = "Authentic"
            explanation = (
                f"The text content appears authentic (credibility score: {text_score:.2f}). "
                f"Model predicted '{model_verdict_type}' with {raw_confidence * 100:.1f}% confidence."
            )
        elif text_score >= THRESHOLD_SUSPICIOUS:
            verdict = "Suspicious"
            explanation = (
                f"The text content is suspicious or contains unverified claims (credibility score: {text_score:.2f}). "
                f"Model confidence is mixed or close to neutral."
            )
        else:
            verdict = "Likely Misinformation"
            explanation = (
                f"The text content has been flagged as likely misinformation (credibility score: {text_score:.2f}). "
                f"Model predicted '{model_verdict_type}' with {raw_confidence * 100:.1f}% confidence."
            )

        return VerifyResponse(
            verdict=verdict,
            confidence_score=confidence,
            breakdown=VerificationBreakdown(
                text_authenticity_score=text_score,
                image_authenticity_score=image_score,
            ),
            message=explanation,
        )

    except Exception as e:
        logger.error(f"Error executing text verification service: {e}", exc_info=True)
        # Graceful fallback so API doesn't return 500 on model failures
        return VerifyResponse(
            verdict="Suspicious",
            confidence_score=0.50,
            breakdown=VerificationBreakdown(
                text_authenticity_score=0.50,
                image_authenticity_score=0.50,
            ),
            message=f"Verification failed due to an internal system error: {str(e)}",
        )
