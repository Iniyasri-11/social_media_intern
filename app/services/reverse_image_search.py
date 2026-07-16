"""
app/services/reverse_image_search.py

Service for executing and scoring reverse image search results.
In Phase 1 MVP, this returns a mock result designed to be easily replaced
by a real API (e.g. Google Lens, TinEye, Bing Image Search).
"""

import logging
from datetime import datetime
from typing import Dict, Any, List, Tuple, Optional

logger = logging.getLogger(__name__)


class ReverseImageSearch:
    """
    Simulates reverse image search and scores the result based on internet reuse and age.
    """

    def search_and_score(self, image_bytes: bytes) -> Dict[str, Any]:
        """
        Mock reverse image search execution.

        Args:
            image_bytes: Raw bytes of the image.

        Returns:
            A dictionary containing:
                - matches_count: Number of matching images found online.
                - source_domains: List of web domains containing the image.
                - earliest_indexed_date: The date this image was first indexed online (YYYY-MM-DD).
                - reverse_search_score: Evaluated score from 0 to 100.
                - warnings: List of warning strings.
        """
        # For MVP purposes, we default to returning 0 matches (original/authentic image)
        # unless custom test rules apply or mock data is injected.
        matches_count = 0
        source_domains = []
        earliest_indexed_date = None

        # Calculate score based on findings
        score, warnings = self._evaluate(matches_count, earliest_indexed_date)

        logger.info(
            f"Reverse image search completed - matches: {matches_count}, score: {score}"
        )

        return {
            "matches_count": matches_count,
            "source_domains": source_domains,
            "earliest_indexed_date": earliest_indexed_date,
            "reverse_search_score": score,
            "warnings": warnings,
        }

    def _evaluate(
        self, matches_count: int, earliest_date_str: Optional[str]
    ) -> Tuple[float, List[str]]:
        """
        Heuristic scoring engine for reverse search evidence.
        """
        score = 100.0
        warnings = []

        if matches_count > 0:
            if matches_count > 50:
                score -= 50
                warnings.append(
                    f"Image found on {matches_count} external web pages. High likelihood of reuse."
                )
            elif matches_count > 10:
                score -= 30
                warnings.append(
                    f"Image found on {matches_count} external web pages. Potential reuse."
                )
            else:
                score -= 15
                warnings.append(f"Image found on {matches_count} external web pages.")

        if earliest_date_str:
            try:
                # Format expected: YYYY-MM-DD
                earliest_date = datetime.strptime(earliest_date_str.strip(), "%Y-%m-%d")
                days_ago = (datetime.now() - earliest_date).days
                if days_ago > 365:
                    score -= 30
                    warnings.append(
                        f"Image first appeared online over a year ago ({earliest_date_str})."
                    )
                elif days_ago > 30:
                    score -= 15
                    warnings.append(
                        f"Image first appeared online over a month ago ({earliest_date_str})."
                    )
            except Exception as e:
                logger.debug(f"Failed to parse earliest indexed date: {e}")

        score = max(0.0, min(100.0, score))
        return float(score), warnings
