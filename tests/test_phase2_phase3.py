"""
tests/test_phase2_phase3.py

Unit tests for Phase 2 (Cryptographic Provenance & DB Audit) and Phase 3 (Deepfake ML & Multimodal Scoring Engine).
"""

import pytest
from fastapi.testclient import TestClient
from PIL import Image
import io

from app.main import app
from app.services.hash_service import HashService
from app.services.signature_verifier import SignatureVerifier
from scoring.scoring_engine import MultimodalScoringEngine

client = TestClient(app)


def test_hash_service_compute_sha256():
    """Verify that HashService computes valid 64-character SHA-256 hex digests."""
    data = b"test image content for hashing"
    digest = HashService.compute_sha256(data)
    assert len(digest) == 64
    assert digest == HashService.compute_sha256(data)


def test_signature_verifier_c2pa_detection():
    """Verify that SignatureVerifier detects C2PA markers when present."""
    verifier = SignatureVerifier()

    # Unsigned bytes
    unsigned_bytes = b"standard jpeg image data without signatures"
    res1 = verifier.verify_provenance(unsigned_bytes)
    assert res1["has_c2pa"] is False
    assert res1["provenance_score"] == 50.0

    # C2PA signed bytes
    signed_bytes = b"header data jumb urn:c2pa c2pa.claim signature data"
    res2 = verifier.verify_provenance(signed_bytes)
    assert res2["has_c2pa"] is True
    assert res2["provenance_score"] == 100.0


def test_multimodal_scoring_engine_fusion():
    """Verify signal blending and verdict mapping in MultimodalScoringEngine."""
    engine = MultimodalScoringEngine()

    # High authentic signals across all modalities
    res = engine.compute_trust_verdict(
        text_score=1.0,
        metadata_score=100.0,
        reverse_search_score=100.0,
        provenance_score=100.0,
        deepfake_score=1.0,
    )
    assert res["verdict"] == "Authentic"
    assert res["confidence_score"] == 1.0

    # Low trust signals (fake text, low metadata, deepfake detected)
    res_fake = engine.compute_trust_verdict(
        text_score=0.0,
        metadata_score=20.0,
        reverse_search_score=50.0,
        provenance_score=50.0,
        deepfake_score=0.1,
    )
    assert res_fake["verdict"] == "Likely Misinformation"
    assert res_fake["confidence_score"] < 0.40


def test_api_verify_full_phase2_phase3_payload():
    """Test POST /verify endpoint returns sha256_hash, c2pa_provenance, deepfake_analysis, and audit_record_id."""
    img = Image.new("RGB", (50, 50), color="green")
    out = io.BytesIO()
    img.save(out, format="JPEG")
    img_bytes = out.getvalue()

    files = {"image": ("test_full.jpg", img_bytes, "image/jpeg")}
    payload = {"post_text": "WASHINGTON (Reuters) - The Federal Reserve kept interest rates unchanged on Wednesday."}

    response = client.post("/verify", data=payload, files=files)
    assert response.status_code == 200

    data = response.json()
    assert "sha256_hash" in data
    assert len(data["sha256_hash"]) == 64
    assert "c2pa_provenance" in data
    assert "deepfake_analysis" in data
    assert "audit_record_id" in data
    assert data["audit_record_id"] is not None
    assert data["verdict"] == "Authentic"
