"""
app/services/reverse_image_search.py

Service for executing and scoring reverse image search results.
Supports Bing Visual Search API (direct file upload) and SerpApi Google Lens (public URL via tmpfiles.org).
Falls back gracefully to a mock engine if no API credentials are configured.
"""

import os
import logging
from datetime import datetime
from typing import Dict, Any, List, Tuple, Optional
import httpx

logger = logging.getLogger(__name__)

# Load API keys from environment
BING_API_KEY = os.getenv("BING_SEARCH_API_KEY")
BING_ENDPOINT = os.getenv("BING_SEARCH_ENDPOINT", "https://api.bing.microsoft.com/v7.0/images/visualsearch")
SERPAPI_KEY = os.getenv("SERPAPI_API_KEY")


class ReverseImageSearch:
    """
    Coordinates reverse image search across configured API providers with safe fallback.
    """

    def search_and_score(self, image_bytes: bytes) -> Dict[str, Any]:
        """
        Runs visual search and evaluates the authenticity of the result.

        Args:
            image_bytes: Raw binary bytes of the image file.

        Returns:
            A dictionary containing:
                - matches_count: Number of matching images found online.
                - source_domains: List of web domains containing the image.
                - earliest_indexed_date: The date this image was first indexed online (YYYY-MM-DD).
                - reverse_search_score: Evaluated score from 0 to 100.
                - warnings: List of warning strings.
        """
        if not image_bytes:
            return {
                "matches_count": 0,
                "source_domains": [],
                "earliest_indexed_date": None,
                "reverse_search_score": 100.0,
                "warnings": ["No image bytes provided for search."],
            }

        # 1. Attempt Bing Visual Search (direct upload, preferred)
        if BING_API_KEY:
            try:
                logger.info("Executing Bing Visual Search API call...")
                return self._run_bing_search(image_bytes)
            except Exception as e:
                logger.error(f"Bing Visual Search API failed: {e}", exc_info=True)

        # 2. Attempt SerpApi Google Lens (upload URL required)
        if SERPAPI_KEY:
            try:
                logger.info("Executing SerpApi Google Lens call via temp upload...")
                return self._run_serpapi_search(image_bytes)
            except Exception as e:
                logger.error(f"SerpApi Google Lens search failed: {e}", exc_info=True)

        # 3. Fallback Mock Mode
        logger.info("No API credentials configured. Running in Mock Mode.")
        matches_count = 0
        source_domains = []
        earliest_indexed_date = None

        score, warnings = self._evaluate(matches_count, earliest_indexed_date)
        warnings.append("Reverse search running in MOCK mode (no API keys configured).")

        return {
            "matches_count": matches_count,
            "source_domains": source_domains,
            "earliest_indexed_date": earliest_indexed_date,
            "reverse_search_score": score,
            "warnings": warnings,
        }

    def _run_bing_search(self, image_bytes: bytes) -> Dict[str, Any]:
        """
        Executes Bing Visual Search API query.
        """
        headers = {"Ocp-Apim-Subscription-Key": BING_API_KEY}
        files = {"image": ("image.jpg", image_bytes, "image/jpeg")}

        with httpx.Client() as client:
            response = client.post(BING_ENDPOINT, headers=headers, files=files, timeout=12.0)
            response.raise_for_status()
            data = response.json()

        matches = []
        source_domains = set()

        tags = data.get("tags", [])
        for tag in tags:
            actions = tag.get("actions", [])
            for action in actions:
                if action.get("actionType") == "VisualSearch":
                    images = action.get("data", {}).get("value", [])
                    for img in images:
                        host_page_url = img.get("hostPageUrl")
                        if host_page_url:
                            matches.append(host_page_url)
                            try:
                                domain = host_page_url.split("//")[-1].split("/")[0]
                                if domain:
                                    source_domains.add(domain)
                            except Exception:
                                pass

        matches_count = len(matches)
        earliest_date = None  # Bing does not consistently return index timestamps

        score, warnings = self._evaluate(matches_count, earliest_date)
        return {
            "matches_count": matches_count,
            "source_domains": list(source_domains)[:10],
            "earliest_indexed_date": earliest_date,
            "reverse_search_score": score,
            "warnings": warnings,
        }

    def _run_serpapi_search(self, image_bytes: bytes) -> Dict[str, Any]:
        """
        Uploads image anonymously to tmpfiles.org and executes SerpApi Google Lens.
        """
        # Upload file to tmpfiles.org to get temporary public URL
        with httpx.Client() as client:
            upload_files = {"file": ("image.jpg", image_bytes, "image/jpeg")}
            upload_res = client.post("https://tmpfiles.org/api/v1/upload", files=upload_files, timeout=10.0)
            upload_res.raise_for_status()
            upload_data = upload_res.json()

            view_url = upload_data.get("data", {}).get("url")
            if not view_url:
                raise RuntimeError("Failed to retrieve upload URL from tmpfiles.org")

            # Convert to direct raw link
            direct_url = view_url.replace("tmpfiles.org/", "tmpfiles.org/dl/")
            logger.info(f"Temporarily hosted image link: {direct_url}")

            # Query SerpApi Google Lens
            params = {
                "engine": "google_lens",
                "url": direct_url,
                "api_key": SERPAPI_KEY,
                "hl": "en",
            }
            serp_res = client.get("https://serpapi.com/search.json", params=params, timeout=15.0)
            serp_res.raise_for_status()
            data = serp_res.json()

        visual_matches = data.get("visual_matches", [])
        matches_count = len(visual_matches)
        source_domains = set()

        for match in visual_matches:
            domain = match.get("source")
            if domain:
                source_domains.add(domain)
            else:
                link = match.get("link")
                if link:
                    try:
                        domain = link.split("//")[-1].split("/")[0]
                        source_domains.add(domain)
                    except Exception:
                        pass

        # Estimate earliest indexed date from data if available
        # Note: Google Lens API does not return indexed timestamps directly,
        # but we can look for snippets or keep as None.
        earliest_date = None

        score, warnings = self._evaluate(matches_count, earliest_date)
        return {
            "matches_count": matches_count,
            "source_domains": list(source_domains)[:10],
            "earliest_indexed_date": earliest_date,
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
