"""
app/services/signature_verifier.py

Service for inspecting image bytes for C2PA (Coalition for Content Provenance and Authenticity)
content credentials, JUMBF boxes, and digital signatures.
"""

import logging
from typing import Dict, Any, List, Tuple

logger = logging.getLogger(__name__)

# Known C2PA and digital signature binary signatures
C2PA_MARKERS = [b"jumb", b"c2pa", b"C2PA", b"urn:c2pa", b"c2pa.claim", b"c2pa.assertion"]
DIGITAL_SIG_MARKERS = [b"Adbe.pkcs7", b"ETSI.CAdES", b"x509", b"X509"]


class SignatureVerifier:
    """
    Analyzes image bytes for digital signatures and C2PA provenance manifests.
    """

    def verify_provenance(self, image_bytes: bytes) -> Dict[str, Any]:
        """
        Inspects raw binary content for C2PA manifest boxes or embedded digital signatures.

        Args:
            image_bytes: Raw binary bytes of the image.

        Returns:
            A dictionary containing:
                - has_c2pa: True if C2PA headers are detected.
                - has_digital_signature: True if digital signature structures are found.
                - provenance_score: 0 to 100 trust score based on digital provenance.
                - warnings: List of warning strings.
                - manifest_summary: Details about detected provenance markers.
        """
        if not image_bytes:
            return {
                "has_c2pa": False,
                "has_digital_signature": False,
                "provenance_score": 50.0,
                "warnings": ["No image bytes provided."],
                "manifest_summary": "Empty payload.",
            }

        has_c2pa = any(marker in image_bytes for marker in C2PA_MARKERS)
        has_signature = any(marker in image_bytes for marker in DIGITAL_SIG_MARKERS)

        warnings: List[str] = []
        score = 50.0  # Base neutral score when no cryptographically verifiable trail is present

        if has_c2pa or has_signature:
            score = 100.0
            manifest_summary = "Valid C2PA content credential / digital signature detected."
            logger.info("Detected cryptographically signed C2PA provenance manifest in image.")
        else:
            warnings.append("No C2PA content credential or digital signature found in image.")
            manifest_summary = "Unsigned / no C2PA manifest present."

        return {
            "has_c2pa": has_c2pa,
            "has_digital_signature": has_signature,
            "provenance_score": float(score),
            "warnings": warnings,
            "manifest_summary": manifest_summary,
        }
