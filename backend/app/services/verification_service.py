import logging
from typing import Optional, Any
from app.schemas.verify import VerifyResponse, VerificationBreakdown
from app.services.text_classifier import TextClassifier
from app.services.image_verification_service import ImageVerificationService
from app.services.hash_service import HashService
from app.services.signature_verifier import SignatureVerifier
from app.services.deepfake_detector import DeepfakeDetector
from scoring.scoring_engine import MultimodalScoringEngine

logger = logging.getLogger(__name__)

# Instantiate singletons & services
text_classifier = TextClassifier()
image_service = ImageVerificationService()
signature_verifier = SignatureVerifier()
deepfake_detector = DeepfakeDetector()
scoring_engine = MultimodalScoringEngine()


def verify_post(
    post_text: str | None,
    post_url: str | None = None,
    image_bytes: bytes | None = None,
    image_filename: str | None = None,
    db: Optional[Any] = None,
) -> VerifyResponse:
    """
    Multimodal verification pipeline: Text NLP, EXIF Metadata, Reverse Search,
    SHA-256 Hashing, C2PA Digital Signatures, PyTorch Deepfake ML detection, DB Audit logging,
    and Multimodal Multi-Factor Trust Scoring.
    """
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
            sha256_hash=None,
            c2pa_provenance=None,
            deepfake_analysis=None,
            audit_record_id=None,
            warnings=["No text or image content was provided for analysis."],
            message="No content was provided for analysis. Verification is inconclusive.",
        )

    warnings = []
    text_score = None
    raw_confidence = 0.0
    model_verdict_type = "N/A"

    # 1. Text NLP Analysis
    if has_text:
        try:
            classification = text_classifier.classify(post_text)  # type: ignore
            raw_label = classification["label"]
            raw_confidence = classification["score"]

            label_clean = str(raw_label).strip().lower()
            if label_clean in ("real", "label_0", "true", "authentic") or label_clean.startswith("label_0"):
                text_score = round(raw_confidence, 2)
                model_verdict_type = "Authentic"
            elif label_clean in ("fake", "label_1", "false", "misinformation", "suspicious") or label_clean.startswith("label_1"):
                text_score = round(1.0 - raw_confidence, 2)
                model_verdict_type = "Fake"
            else:
                text_score = 0.50
                model_verdict_type = "Unknown"
        except Exception as e:
            logger.error(f"Text classification service failed internally: {e}", exc_info=True)
            text_score = 0.50
            warnings.append(f"Text analysis encountered a system error: {str(e)}")

    # 2. Image Analysis (EXIF + Reverse Search + SHA256 + C2PA + Deepfake ML)
    sha256_hash = None
    image_score = None
    metadata_analysis = None
    c2pa_result = None
    deepfake_result = None
    metadata_score_raw = None
    reverse_score_raw = None
    provenance_score_raw = None
    deepfake_score_raw = None

    if has_image:
        try:
            # 2a. SHA-256 Fingerprinting
            sha256_hash = HashService.compute_sha256(image_bytes)  # type: ignore

            # Check if image hash was previously logged in DB
            prev_record = HashService.find_previous_record(db, sha256_hash)
            if prev_record:
                warnings.append(
                    f"Duplicate image hash detected. Previously verified on {prev_record.get('created_at')} with verdict '{prev_record.get('previous_verdict')}'."
                )

            # 2b. EXIF Metadata & Reverse Search
            image_res = image_service.verify_image(image_bytes, image_filename or "uploaded.jpg")  # type: ignore
            image_score = image_res["image_score"]
            metadata_analysis = image_res["metadata"]
            warnings.extend(image_res["warnings"])
            
            # Extract raw scores for fusion engine (0-100 scale)
            metadata_score_raw = image_score * 100.0
            reverse_score_raw = 100.0

            # 2c. C2PA / Digital Signature Verification
            c2pa_result = signature_verifier.verify_provenance(image_bytes)  # type: ignore
            provenance_score_raw = c2pa_result["provenance_score"]
            warnings.extend(c2pa_result["warnings"])

            # 2d. PyTorch ML Deepfake Detection
            try:
                deepfake_result = deepfake_detector.predict(image_bytes)  # type: ignore
                deepfake_score_raw = deepfake_result["deepfake_score"]  # 0.0 to 1.0 scale
                warnings.extend(deepfake_result["warnings"])
            except Exception as e:
                logger.warning(f"Deepfake ML detection skipped/failed: {e}")
                deepfake_score_raw = 0.50
                warnings.append(f"Deepfake ML detector error: {str(e)}")

        except ValueError as e:
            logger.error(f"Image validation failed: {e}")
            raise e
        except Exception as e:
            logger.error(f"Image pipeline failed: {e}", exc_info=True)
            image_score = 0.50
            warnings.append(f"Image analysis error: {str(e)}")

    # 3. Multimodal Multi-Factor Trust Scoring Fusion
    scoring_result = scoring_engine.compute_trust_verdict(
        text_score=text_score,
        metadata_score=metadata_score_raw,
        reverse_search_score=reverse_score_raw,
        provenance_score=provenance_score_raw,
        deepfake_score=deepfake_score_raw,
    )

    verdict = scoring_result["verdict"]
    confidence_score = scoring_result["confidence_score"]
    signals = scoring_result["signal_breakdown"]

    final_text_score = signals["text_score"]
    final_image_score = signals["image_metadata_score"]

    # 4. Persist Audit Record into Database
    audit_rec = HashService.save_audit_record(
        db=db,
        sha256_hash=sha256_hash,
        post_text=post_text,
        post_url=post_url,
        verdict=verdict,
        confidence_score=confidence_score,
        text_score=final_text_score,
        image_score=final_image_score,
        deepfake_score=signals["deepfake_score"],
        c2pa_valid=c2pa_result.get("has_c2pa", False) if c2pa_result else False,
    )
    audit_id = audit_rec.id if audit_rec else None

    # 5. Build Explanation Message
    explanations = []
    if has_text:
        explanations.append(
            f"Text score is {final_text_score:.2f} (model predicted '{model_verdict_type}' with {raw_confidence * 100:.1f}% confidence)."
        )
    if has_image:
        explanations.append(
            f"Image metadata score is {final_image_score:.2f}, C2PA score is {signals['provenance_score']:.2f}, deepfake score is {signals['deepfake_score']:.2f}."
        )
    if warnings:
        explanations.append(f"Multimodal check flagged {len(warnings)} warning(s).")

    return VerifyResponse(
        verdict=verdict,
        confidence_score=confidence_score,
        breakdown=VerificationBreakdown(
            text_authenticity_score=final_text_score,
            image_authenticity_score=final_image_score,
        ),
        text_score=final_text_score,
        image_score=final_image_score,
        metadata_analysis=metadata_analysis,
        sha256_hash=sha256_hash,
        c2pa_provenance=c2pa_result,
        deepfake_analysis=deepfake_result,
        audit_record_id=audit_id,
        warnings=warnings,
        message=" ".join(explanations),
    )

