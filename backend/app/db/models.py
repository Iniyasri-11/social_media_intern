"""
app/db/models.py

SQLAlchemy ORM models for storing verification audit records and file fingerprints.
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean
from app.db.database import Base


class VerificationRecord(Base):
    """
    Stores an audit log of every post/image verification request.
    Tracks SHA-256 image hashes, post text, individual sub-scores, and overall verdicts.
    """
    __tablename__ = "verification_records"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    sha256_hash = Column(String(64), index=True, nullable=True)
    post_text = Column(Text, nullable=True)
    post_url = Column(Text, nullable=True)
    verdict = Column(String(50), nullable=False)
    confidence_score = Column(Float, nullable=False)
    text_score = Column(Float, nullable=True)
    image_score = Column(Float, nullable=True)
    deepfake_score = Column(Float, nullable=True)
    c2pa_valid = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
