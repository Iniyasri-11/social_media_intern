"""
tests/test_reverse_search.py

Unit tests for live visual reverse search services.
Checks mock fallback and parser logic for Bing Visual Search and SerpApi Google Lens.
"""

from unittest.mock import MagicMock, patch
import pytest
from app.services.reverse_image_search import ReverseImageSearch


def test_reverse_search_mock_fallback():
    """Verify that when no API keys are present, the service falls back to Mock mode gracefully."""
    # Temporarily remove any env keys to verify fallback
    with patch.dict("os.environ", {}, clear=True):
        with patch("app.services.reverse_image_search.BING_API_KEY", None), \
             patch("app.services.reverse_image_search.SERPAPI_KEY", None):
             
            verifier = ReverseImageSearch()
            res = verifier.search_and_score(b"fake image bytes")
            
            assert res["matches_count"] == 0
            assert res["reverse_search_score"] == 100.0
            assert any("mock" in w.lower() for w in res["warnings"])


def test_bing_search_parser():
    """Verify that Bing Visual Search parser extracts domains and computes scores correctly."""
    mock_response = {
        "tags": [
            {
                "actions": [
                    {
                        "actionType": "VisualSearch",
                        "data": {
                            "value": [
                                {"hostPageUrl": "https://example.com/page1.html"},
                                {"hostPageUrl": "https://anothersite.org/sub/page2.html"},
                                {"hostPageUrl": "https://example.com/page3.html"}
                            ]
                        }
                    }
                ]
            }
        ]
    }
    
    with patch("httpx.Client.post") as mock_post:
        mock_post.return_value = MagicMock(
            status_code=200,
            json=lambda: mock_response
        )
        
        with patch("app.services.reverse_image_search.BING_API_KEY", "dummy_key"):
            verifier = ReverseImageSearch()
            res = verifier.search_and_score(b"image bytes")
            
            assert res["matches_count"] == 3
            # Two unique domains: example.com and anothersite.org
            assert "example.com" in res["source_domains"]
            assert "anothersite.org" in res["source_domains"]
            assert len(res["source_domains"]) == 2
            # 100 - 15 (for matches > 0) = 85
            assert res["reverse_search_score"] == 85.0


def test_serpapi_search_parser():
    """Verify that SerpApi Google Lens parser extracts domains and uploads via tmpfiles.org."""
    mock_upload_response = {
        "status": "success",
        "data": {
            "url": "https://tmpfiles.org/12345/image.jpg"
        }
    }
    
    mock_serp_response = {
        "visual_matches": [
            {"source": "wikipedia.org", "link": "https://wikipedia.org/wiki/Image"},
            {"link": "https://news.yahoo.com/article1.html"}
        ]
    }
    
    with patch("httpx.Client.post") as mock_post, \
         patch("httpx.Client.get") as mock_get:
         
        mock_post.return_value = MagicMock(
            status_code=200,
            json=lambda: mock_upload_response
        )
        
        mock_get.return_value = MagicMock(
            status_code=200,
            json=lambda: mock_serp_response
        )
        
        with patch("app.services.reverse_image_search.BING_API_KEY", None), \
             patch("app.services.reverse_image_search.SERPAPI_KEY", "serp_dummy_key"):
             
            verifier = ReverseImageSearch()
            res = verifier.search_and_score(b"image bytes")
            
            assert res["matches_count"] == 2
            assert "wikipedia.org" in res["source_domains"]
            assert "news.yahoo.com" in res["source_domains"]
            assert res["reverse_search_score"] == 85.0
