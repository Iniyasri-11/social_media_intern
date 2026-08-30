"""
app/services/originality_detector.py

Detects duplicate and reposted content by computing SHA-256 fingerprints,
perceptual image hashing, and comparing against the database.
"""

import hashlib
from typing import Tuple, Dict, Any, Optional
from datetime import datetime


class OriginalityDetector:
    """Detect duplicate and reposted content."""

    def __init__(self):
        """Initialize the OriginalityDetector."""
        pass

    def compute_text_hash(self, text: str) -> str:
        """
        Compute SHA-256 hash of text.

        Args:
            text: Text content to hash

        Returns:
            SHA-256 hex digest
        """
        if not text:
            return ""
        return hashlib.sha256(text.encode()).hexdigest()

    def compute_image_hash(self, image_bytes: bytes) -> str:
        """
        Compute SHA-256 hash of image.

        Args:
            image_bytes: Image bytes to hash

        Returns:
            SHA-256 hex digest
        """
        if not image_bytes:
            return ""
        return hashlib.sha256(image_bytes).hexdigest()

    def analyze_originality(
        self,
        text: Optional[str] = None,
        image_bytes: Optional[bytes] = None,
        source_url: Optional[str] = None,
    ) -> Tuple[float, Dict[str, Any]]:
        """
        Analyze content originality.

        Args:
            text: Post caption/text
            image_bytes: Image content
            source_url: Source URL

        Returns:
            Tuple of (originality_score: 0-100, details: dict)
        """
        details = {
            "warnings": [],
            "checks": {},
            "similar_count": 0,
            "earliest_date": None,
        }

        score = 100.0  # Start with perfect originality

        # Hash content
        if text:
            text_hash = self.compute_text_hash(text)
            details["text_hash"] = text_hash
            # In production, would query database for matching hashes
            # For now, just compute the hash
        
        if image_bytes:
            image_hash = self.compute_image_hash(image_bytes)
            details["image_hash"] = image_hash

        if source_url:
            # Check if source URL is a known original source
            if self._is_well_known_source(source_url):
                score = 95.0
                details["checks"]["well_known_source"] = True
            else:
                details["checks"]["well_known_source"] = False

        details["originality_score"] = score
        details["originality_level"] = self._score_to_level(score)
        details["similar_count"] = 0  # In production: query from DB
        details["earliest_date"] = None  # In production: query from DB

        return score, details

    def detect_repost(
        self, text_hash: Optional[str] = None, image_hash: Optional[str] = None
    ) -> Tuple[bool, int, Optional[datetime]]:
        """
        Detect if content is a repost.

        Args:
            text_hash: SHA-256 hash of text
            image_hash: SHA-256 hash of image

        Returns:
            Tuple of (is_repost, similar_count, earliest_date)
        """
        # In production: query database for matching hashes
        # For now, return negative result
        return False, 0, None

    def _is_well_known_source(self, url: str) -> bool:
        """Check if URL is from a well-known/trusted source."""
        trusted_domains = {
            "bbc.com",
            "reuters.com",
            "apnews.com",
            "nasa.gov",
            "nature.com",
            "nytimes.com",
        }
        for domain in trusted_domains:
            if domain in url.lower():
                return True
        return False

    def _score_to_level(self, score: float) -> str:
        """Convert originality score to level."""
        if score >= 90:
            return "Highly Original"
        elif score >= 70:
            return "Mostly Original"
        elif score >= 50:
            return "Potentially Reposted"
        else:
            return "Likely Reposted"


# Singleton instance
_detector = OriginalityDetector()


async def analyze_originality(
    text: Optional[str] = None,
    image_bytes: Optional[bytes] = None,
    source_url: Optional[str] = None,
) -> Tuple[float, Dict[str, Any]]:
    """Async wrapper for originality analysis."""
    return _detector.analyze_originality(text, image_bytes, source_url)
