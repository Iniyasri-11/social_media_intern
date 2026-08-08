"""
tests/test_verify.py

Basic tests using FastAPI's TestClient (built on httpx). These don't need
a running server — they call the app in-process, so they're fast and
safe to run in CI.

Run with: pytest tests/
"""

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_root_health_check():
    """The root endpoint should confirm the service is up."""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_verify_returns_valid_response():
    """POST /verify should accept text and return a well-formed verdict."""
    payload = {"post_text": "Breaking news: something happened!"}
    response = client.post("/verify", json=payload)

    assert response.status_code == 200
    data = response.json()

    assert "verdict" in data
    assert "confidence_score" in data
    assert "breakdown" in data
    assert "text_authenticity_score" in data["breakdown"]
    assert "image_authenticity_score" in data["breakdown"]


def test_verify_works_with_empty_body():
    """post_text and post_url are optional, so an empty body should still succeed."""
    response = client.post("/verify", json={})
    assert response.status_code == 200
    data = response.json()
    assert data["verdict"] == "Suspicious"
    assert data["breakdown"]["text_authenticity_score"] == 0.50


def test_verify_authentic_text():
    """POST /verify should correctly classify and score credible news as Authentic."""
    payload = {"post_text": "WASHINGTON (Reuters) - The Federal Reserve kept interest rates unchanged on Wednesday."}
    response = client.post("/verify", json=payload)

    assert response.status_code == 200
    data = response.json()
    assert data["verdict"] == "Authentic"
    assert data["breakdown"]["text_authenticity_score"] >= 0.70
    assert "Authentic" in data["message"]


def test_verify_misinformation_text():
    """POST /verify should correctly classify and score suspicious/fake claims as Likely Misinformation."""
    payload = {"post_text": "BREAKING: Secret government base discovered on the moon, aliens confirmed to be running it!"}
    response = client.post("/verify", json=payload)

    assert response.status_code == 200
    data = response.json()
    assert data["verdict"] == "Likely Misinformation"
    assert data["breakdown"]["text_authenticity_score"] < 0.40
    assert "Fake" in data["message"]

