"""
scoring/scoring_engine.py

Multimodal Multi-Factor Trust Scoring Engine.
Combines NLP text credibility, EXIF metadata, reverse image search,
C2PA digital provenance, and PyTorch deepfake ML vision predictions into
a unified authenticity score (0.0 - 1.0) and overall verdict.
"""

import logging
from typing import Dict, Any, Optional, List, Tuple

logger = logging.getLogger(__name__)

# Threshold constants for verdict mapping
THRESHOLD_AUTHENTIC = 0.70
THRESHOLD_SUSPICIOUS = 0.40


class MultimodalScoringEngine:
    """
    Blends multi-modal signals using dynamically normalized weights depending
    on which signals (Text, Image EXIF, Reverse Search, Provenance, Deepfake ML) are present.
    """

    def compute_trust_verdict(
        self,
        text_score: Optional[float] = None,
        metadata_score: Optional[float] = None,  # 0 to 100 scale
        reverse_search_score: Optional[float] = None,  # 0 to 100 scale
        provenance_score: Optional[float] = None,  # 0 to 100 scale
        deepfake_score: Optional[float] = None,  # 0.0 to 1.0 scale
    ) -> Dict[str, Any]:
        """
        Calculates the overall confidence score and maps it to a final verdict.

        Returns:
            A dictionary containing:
                - verdict: "Authentic", "Suspicious", or "Likely Misinformation"
                - confidence_score: Overall normalized trust score (0.0 to 1.0)
                - signal_breakdown: Dictionary of normalized individual sub-scores
        """
        has_text = text_score is not None
        has_image = (
            metadata_score is not None
            or reverse_search_score is not None
            or provenance_score is not None
            or deepfake_score is not None
        )

        if not has_text and not has_image:
            return {
                "verdict": "Suspicious",
                "confidence_score": 0.50,
                "signal_breakdown": {
                    "text_score": 0.50,
                    "image_metadata_score": 0.50,
                    "reverse_search_score": 0.50,
                    "provenance_score": 0.50,
                    "deepfake_score": 0.50,
                },
            }

        # Normalize all sub-scores to 0.0 - 1.0 scale for uniform fusion
        norm_text = text_score if text_score is not None else 0.50
        norm_meta = (metadata_score / 100.0) if metadata_score is not None else 0.50
        norm_rev = (reverse_search_score / 100.0) if reverse_search_score is not None else 0.50
        norm_prov = (provenance_score / 100.0) if provenance_score is not None else 0.50
        norm_df = deepfake_score if deepfake_score is not None else 0.50

        # Define default multi-factor weights
        if has_text and has_image:
            w_text, w_meta, w_rev, w_prov, w_df = 0.30, 0.20, 0.15, 0.15, 0.20
        elif has_text:
            w_text, w_meta, w_rev, w_prov, w_df = 1.00, 0.00, 0.00, 0.00, 0.00
        else:
            w_text, w_meta, w_rev, w_prov, w_df = 0.00, 0.30, 0.20, 0.20, 0.30

        # Compute weighted average
        weighted_sum = (
            (w_text * norm_text)
            + (w_meta * norm_meta)
            + (w_rev * norm_rev)
            + (w_prov * norm_prov)
            + (w_df * norm_df)
        )

        total_weight = w_text + w_meta + w_rev + w_prov + w_df
        confidence_score = round(weighted_sum / total_weight, 2) if total_weight > 0 else 0.50

        # Map to verdict
        if confidence_score >= THRESHOLD_AUTHENTIC:
            verdict = "Authentic"
        elif confidence_score >= THRESHOLD_SUSPICIOUS:
            verdict = "Suspicious"
        else:
            verdict = "Likely Misinformation"

        return {
            "verdict": verdict,
            "confidence_score": confidence_score,
            "signal_breakdown": {
                "text_score": round(norm_text, 2),
                "image_metadata_score": round(norm_meta, 2),
                "reverse_search_score": round(norm_rev, 2),
                "provenance_score": round(norm_prov, 2),
                "deepfake_score": round(norm_df, 2),
            },
        }
