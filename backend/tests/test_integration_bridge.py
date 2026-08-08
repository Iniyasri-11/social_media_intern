from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_auth_bridge_login_endpoint():
    response = client.post(
        "/api/auth/login",
        json={"identifier": "demo", "password": "demo"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["user"]["phone"] == "+1-555-0100"
    assert data["session"]["access_token"]


def test_verify_api_alias_endpoint():
    response = client.post(
        "/api/verify",
        json={"post_text": "Reuters reports that the central bank kept rates unchanged."},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["verdict"] in {"Authentic", "Suspicious", "Likely Misinformation"}
