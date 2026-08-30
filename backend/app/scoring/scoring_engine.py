"""
app/scoring/scoring_engine.py

Multi-modal Multi-Factor Trust Scoring Engine that incorporates:
- Text Claim Reliability (NLP)
- Media Integrity (EXIF, metadata)
- Originality & Repost Risk
- AI Generation Probability / Deepfake Risk
- Source Reliability
- Community Confidence
Produces a 0-100 normalized authenticity score and verdict.
"""

from typing import Optional, Dict, Any


class MultimodalScoringEngine:
    """
    Fuses multiple verification signals into a single trust score (0-100).
    Maps scores to verdicts: Reliable, Mostly Reliable, Needs Verification, Misleading.
    """

    def __init__(self):
        """Initialize the scoring engine with factor weights."""
        # Weights for each factor (must sum to 1.0)
        self.weights = {
            "text_score": 0.20,           # NLP credibility
            "image_score": 0.20,          # Media integrity (EXIF, metadata)
            "originality_score": 0.15,    # Duplicate/repost detection
            "deepfake_score": 0.15,       # AI-generation probability
            "source_score": 0.15,         # Source domain reliability
            "community_score": 0.15,      # Community fact-checking votes
        }

    def compute_trust_verdict(
        self,
        text_score: Optional[float] = None,
        image_score: Optional[float] = None,
        originality_score: Optional[float] = None,
        deepfake_score: Optional[float] = None,
        source_score: Optional[float] = None,
        community_score: Optional[float] = None,
        metadata_score: Optional[float] = None,
        reverse_search_score: Optional[float] = None,
        provenance_score: Optional[float] = None,
    ) -> Dict[str, Any]:
        """
        Compute final trust score and verdict from individual factors.

        Args:
            text_score: Text NLP credibility (0-100)
            image_score: Media integrity score (0-100)
            originality_score: Originality/repost score (0-100)
            deepfake_score: Deepfake probability (0-100, inverted so 100=authentic)
            source_score: Source reliability (0-100)
            community_score: Community confidence (0-100)
            metadata_score: Legacy metadata score (0-100)
            reverse_search_score: Legacy reverse search score (0-100)
            provenance_score: C2PA provenance score (0-100)

        Returns:
            Dict with verdict, confidence_score, and breakdown
        """
        # Normalize and use provided scores
        scores = {
            "text_score": self._normalize(text_score, 50.0),
            "image_score": self._normalize(image_score, 50.0),
            "originality_score": self._normalize(originality_score, 80.0),
            "deepfake_score": self._normalize(deepfake_score, 20.0),
            "source_score": self._normalize(source_score, 50.0),
            "community_score": self._normalize(community_score, 50.0),
        }

        # Legacy compatibility: use metadata/reverse/provenance if primary scores not provided
        if image_score is None and metadata_score is not None:
            scores["image_score"] = self._normalize(metadata_score, 50.0)
        
        if deepfake_score is None and provenance_score is not None:
            scores["deepfake_score"] = self._normalize(provenance_score * 100, 50.0)

        # Compute weighted average
        weighted_score = sum(
            scores[key] * self.weights[key]
            for key in self.weights.keys()
            if key in scores
        )

        # Map score to verdict
        verdict, verdict_level = self._score_to_verdict(weighted_score)

        return {
            "verdict": verdict,
            "confidence_score": round(weighted_score, 2),
            "verdict_level": verdict_level,
            "signal_breakdown": scores,
            "factors": {
                "text_reliability": scores["text_score"],
                "media_integrity": scores["image_score"],
                "originality": scores["originality_score"],
                "ai_generation_risk": 100 - scores["deepfake_score"],  # Invert for risk
                "source_trust": scores["source_score"],
                "community_confidence": scores["community_score"],
            },
        }

    def compute_community_confidence(self, votes: Dict[str, int]) -> float:
        """
        Compute community confidence score from fact-checking votes.

        Args:
            votes: Dict with keys: "true", "false", "misleading", "cannot_verify"

        Returns:
            Confidence score (0-100)
        """
        total = sum(votes.values())
        if total == 0:
            return 50.0  # Neutral if no votes

        true_pct = votes.get("true", 0) / total
        false_pct = votes.get("false", 0) / total
        misleading_pct = votes.get("misleading", 0) / total

        # Community confidence is inversely related to disagreement
        disagreement = 1.0 - max(true_pct, false_pct, misleading_pct)
        confidence = (1.0 - disagreement) * 100.0

        return round(max(20.0, min(100.0, confidence)), 2)

    def _normalize(self, score: Optional[float], default: float = 50.0) -> float:
        """
        Normalize score to 0-100 range.

        Args:
            score: Score value (may be 0-1 or 0-100)
            default: Default value if score is None

        Returns:
            Normalized score (0-100)
        """
        if score is None:
            return default

        # If score is 0-1, scale to 0-100
        if score <= 1.0:
            return score * 100.0
        
        # Already 0-100
        return max(0.0, min(100.0, score))

    def _score_to_verdict(self, score: float) -> tuple:
        """
        Map trust score to human-readable verdict.

        Args:
            score: Trust score (0-100)

        Returns:
            Tuple of (verdict, verdict_level)
        """
        if score >= 90:
            return "Reliable", "Highly Reliable (90-100)"
        elif score >= 70:
            return "Mostly Reliable", "Mostly Reliable (70-89)"
        elif score >= 40:
            return "Needs Verification", "Needs Verification (40-69)"
        else:
            return "Misleading", "Potentially Misleading (0-39)"


# Singleton instance
_engine = MultimodalScoringEngine()


def get_scoring_engine() -> MultimodalScoringEngine:
    """Get singleton scoring engine instance."""
    return _engine
