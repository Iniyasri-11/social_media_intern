"""
app/services/source_analyzer.py

Domain and URL reliability analyzer: checks domain authenticity, known journalistic/scientific sources,
flags clickbait/unverified sources, and computes 0-100 source reliability score.
"""

import re
from typing import Tuple, Dict, Any
from urllib.parse import urlparse


class SourceAnalyzer:
    """Analyze source URLs for reliability and authenticity."""

    # Trusted domains for journalism, science, and fact-checking
    TRUSTED_SOURCES = {
        "reuters.com",
        "apnews.com",
        "bbc.com",
        "bbc.co.uk",
        "nature.com",
        "nasa.gov",
        "nytimes.com",
        "washingtonpost.com",
        "theguardian.com",
        "nature.com",
        "sciencedaily.com",
        "snopes.com",
        "factcheck.org",
        "politifact.com",
        "cnn.com",
        "bbc.co.uk",
        "theguardian.com",
        "bbc.com",
        "aljazeera.com",
        "reuters.com",
        "apnews.com",
        "nytimes.com",
        "washingtonpost.com",
        "axios.com",
        "businessinsider.com",
        "cnbc.com",
        "forbes.com",
        "techcrunch.com",
        "arstechnica.com",
        "theverge.com",
        "wired.com",
        "nist.gov",
        "fda.gov",
        "cdc.gov",
        "who.int",
        "springer.com",
        "sciencedirect.com",
        "pubmed.ncbi.nlm.nih.gov",
    }

    # Known clickbait patterns and suspicious domains
    SUSPICIOUS_PATTERNS = [
        r"click.*?bait",
        r"top.*?\d+.*?(secrets|tricks|hacks)",
        r"(doctor|expert|scientist)s.*?hate",
        r"this.*?will.*?(shock|amaze|surprise)",
        r"you.*?won\'t.*?believe",
    ]

    # Known fake news and misinformation sites
    BLOCKED_DOMAINS = {
        "example-misinformation.com",
        "fake-news-site.net",
        "conspiracy-central.com",
    }

    def __init__(self):
        """Initialize the SourceAnalyzer."""
        pass

    def analyze(self, source_url: str) -> Tuple[float, Dict[str, Any]]:
        """
        Analyze a source URL for reliability.

        Args:
            source_url: The URL to analyze

        Returns:
            Tuple of (score: 0-100, details: dict)
        """
        if not source_url:
            return 0.0, {"error": "No source URL provided", "warnings": []}

        try:
            parsed = urlparse(source_url)
            domain = parsed.netloc.lower().replace("www.", "")

            score = 50.0  # Base score
            details = {"domain": domain, "warnings": [], "checks": {}}

            # Check if domain is blocked
            if domain in self.BLOCKED_DOMAINS:
                score = 0.0
                details["warnings"].append("Domain is known to spread misinformation")
                details["checks"]["blocked"] = True
                return score, details

            # Check if domain is trusted
            if domain in self.TRUSTED_SOURCES:
                score = 90.0
                details["checks"]["trusted_source"] = True
            else:
                details["checks"]["trusted_source"] = False

            # Check for HTTPS (adds 10 points if present)
            if parsed.scheme == "https":
                score += 10.0
                details["checks"]["https"] = True
            else:
                details["warnings"].append("Unencrypted connection (HTTP)")
                details["checks"]["https"] = False

            # Check URL patterns for clickbait
            if self._is_clickbait(source_url):
                score -= 15.0
                details["warnings"].append("URL contains clickbait patterns")
                details["checks"]["clickbait"] = True

            # Check domain age indicators (basic heuristic)
            if self._looks_suspicious_domain(domain):
                score -= 10.0
                details["warnings"].append("Domain looks suspicious (unusual TLD or pattern)")
                details["checks"]["suspicious_domain"] = True

            # Clamp score to 0-100
            score = max(0.0, min(100.0, score))

            details["score"] = score
            details["reliability_level"] = self._score_to_level(score)

            return score, details

        except Exception as e:
            return 0.0, {"error": str(e), "warnings": ["Failed to parse URL"]}

    def _is_clickbait(self, text: str) -> bool:
        """Check if text contains clickbait patterns."""
        text_lower = text.lower()
        for pattern in self.SUSPICIOUS_PATTERNS:
            if re.search(pattern, text_lower):
                return True
        return False

    def _looks_suspicious_domain(self, domain: str) -> bool:
        """Check if domain looks suspicious."""
        # Domains with numbers and hyphens are often suspicious
        if domain.count("-") > 2 or domain.count("0") > 1:
            return True
        # Short domains with unusual patterns
        if len(domain.split(".")[0]) < 3 and "-" in domain:
            return True
        return False

    def _score_to_level(self, score: float) -> str:
        """Convert score to reliability level."""
        if score >= 80:
            return "Highly Reliable"
        elif score >= 60:
            return "Mostly Reliable"
        elif score >= 40:
            return "Needs Verification"
        else:
            return "Potentially Misleading"


# Singleton instance
_analyzer = SourceAnalyzer()


async def analyze_source(url: str) -> Tuple[float, Dict[str, Any]]:
    """Async wrapper for source analysis."""
    return _analyzer.analyze(url)
