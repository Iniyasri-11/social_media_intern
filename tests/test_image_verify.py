"""
tests/test_image_verify.py

Unit tests for the Image Verification service and API endpoint.
Tests image-only upload, metadata extraction, scoring, file format validation,
and combined text + image verification.
"""

import io
import pytest
from fastapi.testclient import TestClient
from PIL import Image

from app.main import app

client = TestClient(app)


@pytest.fixture
def make_test_jpeg():
    """
    Fixture to programmatically generate JPEG files with customizable EXIF tags.
    """
    def _create(with_exif=True, software=None, missing_date=False, missing_camera=False):
        img = Image.new("RGB", (100, 100), color="blue")
        out = io.BytesIO()
        if with_exif:
            exif = img.getexif()
            if not missing_camera:
                exif[271] = "Canon"  # Camera Make
                exif[272] = "EOS R"  # Camera Model
            if not missing_date:
                exif[36867] = "2026:07:16 12:00:00"  # DateTimeOriginal
            if software:
                exif[305] = software  # Software
            img.save(out, format="JPEG", exif=exif)
        else:
            img.save(out, format="JPEG")
        out.seek(0)
        return out.read()
    return _create


@pytest.fixture
def make_test_png():
    """
    Fixture to programmatically generate PNG files with customizable metadata.
    """
    def _create(software=None):
        img = Image.new("RGB", (100, 100), color="red")
        out = io.BytesIO()
        # Save PNG with metadata chunks if software is defined
        if software:
            from PIL import PngImagePlugin
            meta = PngImagePlugin.PngInfo()
            meta.add_text("Software", software)
            img.save(out, format="PNG", pnginfo=meta)
        else:
            img.save(out, format="PNG")
        out.seek(0)
        return out.read()
    return _create


def test_image_only_upload_authentic(make_test_jpeg):
    """Test image upload with complete camera EXIF tags, expecting Authentic verdict."""
    img_bytes = make_test_jpeg(with_exif=True)
    files = {"image": ("authentic_camera.jpg", img_bytes, "image/jpeg")}
    
    response = client.post("/verify", files=files)
    assert response.status_code == 200
    
    data = response.json()
    assert data["verdict"] == "Authentic"
    assert data["image_score"] == 1.0
    assert data["confidence_score"] >= 0.70
    assert data["metadata_analysis"]["camera_make"] == "Canon"
    assert data["metadata_analysis"]["camera_model"] == "EOS R"
    assert data["metadata_analysis"]["format"] == "JPEG"


def test_image_only_upload_edited(make_test_jpeg):
    """Test image containing editing software metadata, expecting lowered trust score and warnings."""
    img_bytes = make_test_jpeg(with_exif=True, software="Adobe Photoshop 2026")
    files = {"image": ("edited_image.jpg", img_bytes, "image/jpeg")}
    
    response = client.post("/verify", files=files)
    assert response.status_code == 200
    
    data = response.json()
    assert data["verdict"] == "Suspicious"  # Multimodal fusion score < 0.70 due to software, C2PA, and deepfake signals
    assert data["image_score"] == 0.76
    assert any("edited" in w.lower() or "photoshop" in w.lower() for w in data["warnings"])


def test_image_missing_exif(make_test_jpeg):
    """Test image with missing EXIF tags, expecting high deduction in score."""
    img_bytes = make_test_jpeg(with_exif=False)
    files = {"image": ("no_metadata.jpg", img_bytes, "image/jpeg")}
    
    response = client.post("/verify", files=files)
    assert response.status_code == 200
    
    data = response.json()
    assert data["verdict"] == "Suspicious"
    assert data["image_score"] == 0.70
    assert any("no exif" in w.lower() for w in data["warnings"])


def test_image_only_upload_suspicious(make_test_jpeg):
    """Test image with multiple missing fields and editing tags, expecting Suspicious verdict."""
    img_bytes = make_test_jpeg(with_exif=True, software="Adobe Photoshop", missing_date=True, missing_camera=True)
    files = {"image": ("manipulated.jpg", img_bytes, "image/jpeg")}
    
    response = client.post("/verify", files=files)
    assert response.status_code == 200
    
    data = response.json()
    assert data["verdict"] == "Suspicious"
    assert data["image_score"] == 0.52
    assert len(data["warnings"]) >= 3


def test_png_image_upload(make_test_png):
    """Test PNG image metadata processing and custom PNG info chunks."""
    img_bytes = make_test_png(software="Canva Design Studio")
    files = {"image": ("design.png", img_bytes, "image/png")}
    
    response = client.post("/verify", files=files)
    assert response.status_code == 200
    
    data = response.json()
    assert data["metadata_analysis"]["format"] == "PNG"
    assert data["metadata_analysis"]["software"] == "Canva Design Studio"
    assert data["image_score"] == 0.70
    assert any("canva" in w.lower() for w in data["warnings"])



def test_corrupted_image_upload():
    """Test uploading invalid binary data, expecting HTTP 400 validation error."""
    files = {"image": ("broken.jpg", b"badrawbinarydatahere", "image/jpeg")}
    
    response = client.post("/verify", files=files)
    assert response.status_code == 400
    assert "invalid" in response.json()["detail"].lower() or "corrupted" in response.json()["detail"].lower()


def test_unsupported_format_upload():
    """Test uploading unsupported file format, expecting HTTP 400 error."""
    files = {"image": ("notes.txt", b"plain text content", "text/plain")}
    
    response = client.post("/verify", files=files)
    assert response.status_code == 400
    assert "unsupported" in response.json()["detail"].lower()


def test_combined_text_and_image_authentic(make_test_jpeg):
    """Test combined text and image request where both are authentic."""
    img_bytes = make_test_jpeg(with_exif=True)
    payload = {
        "post_text": "WASHINGTON (Reuters) - The Federal Reserve kept interest rates unchanged on Wednesday."
    }
    files = {"image": ("reuters_photo.jpg", img_bytes, "image/jpeg")}
    
    response = client.post("/verify", data=payload, files=files)
    assert response.status_code == 200
    
    data = response.json()
    assert data["verdict"] == "Authentic"
    assert data["confidence_score"] == 0.80
    assert data["text_score"] == 1.0
    assert data["image_score"] == 1.0


def test_combined_text_authentic_image_edited(make_test_jpeg):
    """Test combined request with authentic text but edited image."""
    img_bytes = make_test_jpeg(with_exif=True, software="Adobe Photoshop")
    payload = {
        "post_text": "WASHINGTON (Reuters) - The Federal Reserve kept interest rates unchanged on Wednesday."
    }
    files = {"image": ("faked_photo.jpg", img_bytes, "image/jpeg")}
    
    response = client.post("/verify", data=payload, files=files)
    assert response.status_code == 200
    
    data = response.json()
    assert data["verdict"] == "Authentic"
    assert data["confidence_score"] >= 0.70
    assert any("photoshop" in w.lower() for w in data["warnings"])


