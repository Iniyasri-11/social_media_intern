"""
app/services/hash_service.py

Service for SHA-256 image hashing, fingerprint tracking, and database audit logging.
"""

import hashlib
import logging
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from app.db.models import VerificationRecord
from app.db.database import init_db

logger = logging.getLogger(__name__)

# Ensure tables exist when module is loaded
try:
    init_db()
except Exception as e:
    logger.warning(f"Could not automatically initialize DB tables: {e}")


class HashService:
    """
    Computes cryptographic image hashes and manages database provenance records.
    """

    @staticmethod
    def compute_sha256(image_bytes: bytes) -> str:
        """
        Generates a SHA-256 hex string digest of the provided image bytes.
        """
        if not image_bytes:
            raise ValueError("Cannot hash empty image bytes.")
        return hashlib.sha256(image_bytes).hexdigest()

    @staticmethod
    def save_audit_record(
        db: Optional[Session],
        sha256_hash: Optional[str],
        post_text: Optional[str],
        post_url: Optional[str],
        verdict: str,
        confidence_score: float,
        text_score: Optional[float],
        image_score: Optional[float],
        deepfake_score: Optional[float],
        c2pa_valid: bool = False,
    ) -> Optional[VerificationRecord]:
        """
        Persists a verification audit record in the database.
        """
        if db is None:
            return None

        try:
            record = VerificationRecord(
                sha256_hash=sha256_hash,
                post_text=post_text,
                post_url=post_url,
                verdict=verdict,
                confidence_score=confidence_score,
                text_score=text_score,
                image_score=image_score,
                deepfake_score=deepfake_score,
                c2pa_valid=c2pa_valid,
            )
            db.add(record)
            db.commit()
            db.refresh(record)
            logger.info(f"Saved DB audit record (ID: {record.id}, Hash: {sha256_hash})")
            return record
        except Exception as e:
            logger.error(f"Failed to save verification audit record to DB: {e}")
            db.rollback()
            return None

    @staticmethod
    def find_previous_record(db: Optional[Session], sha256_hash: str) -> Optional[Dict[str, Any]]:
        """
        Queries the database to check if this exact SHA-256 image fingerprint has been seen before.
        """
        if db is None or not sha256_hash:
            return None

        try:
            record = (
                db.query(VerificationRecord)
                .filter(VerificationRecord.sha256_hash == sha256_hash)
                .order_by(VerificationRecord.created_at.desc())
                .first()
            )
            if record:
                return {
                    "seen_before": True,
                    "previous_verdict": record.verdict,
                    "previous_confidence": record.confidence_score,
                    "created_at": record.created_at.isoformat() if record.created_at else None,
                }
        except Exception as e:
            logger.warning(f"Error querying previous audit record: {e}")

        return None
