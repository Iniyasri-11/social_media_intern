"""
app/services/image_verification_service.py

Dedicated image verification service for coordinating metadata analysis
and reverse image search scoring. Combines results using a 60% metadata / 40% reverse search split.
"""

import logging
from typing import Dict, Any, List
from app.services.metadata_analyzer import MetadataAnalyzer
from app.services.reverse_image_search import ReverseImageSearch

logger = logging.getLogger(__name__)


class ImageVerificationService:
    """
    Coordinating service for Phase 1 image authenticity verification.
    """

    def __init__(self):
        self.metadata_analyzer = MetadataAnalyzer()
        self.reverse_search = ReverseImageSearch()

    def verify_image(self, image_bytes: bytes, filename: str) -> Dict[str, Any]:
        """
        Coordinates the analysis of an uploaded image.

        Args:
            image_bytes: Raw binary content of the image.
            filename: Original filename of the upload.

        Returns:
            A dictionary containing:
                - image_score: Combined authenticity score between 0.0 and 1.0.
                - metadata: Extracted EXIF and file metadata.
                - warnings: Aggregated list of warning strings.
                - upload_trace: Tracing information including saved path and file ID.
        """
        # 1. Save image temporarily for traceability
        file_path, file_id = self.metadata_analyzer.save_image_temporarily(
            image_bytes, filename
        )

        # 2. Extract and score EXIF and structural metadata
        # Can raise ValueError if the image is corrupted or invalid
        meta_result = self.metadata_analyzer.extract_and_score(image_bytes)
        metadata = meta_result["metadata"]
        metadata_score = meta_result["metadata_score"]  # 0 to 100
        meta_warnings = meta_result["warnings"]

        # 3. Execute mock/stub reverse image search
        rev_result = self.reverse_search.search_and_score(image_bytes)
        reverse_score = rev_result["reverse_search_score"]  # 0 to 100
        rev_warnings = rev_result["warnings"]

        # 4. Compute weighted score: 60% metadata, 40% reverse search
        combined_score_100 = (0.60 * metadata_score) + (0.40 * reverse_score)
        image_score_normalized = round(combined_score_100 / 100.0, 2)

        # 5. Aggregate warnings
        warnings = []
        warnings.extend(meta_warnings)
        warnings.extend(rev_warnings)

        logger.info(
            f"Image verification completed for {filename} (ID: {file_id}) - "
            f"Meta score: {metadata_score}, Reverse score: {reverse_score}, "
            f"Combined image score: {image_score_normalized}"
        )

        return {
            "image_score": image_score_normalized,
            "metadata": metadata,
            "warnings": warnings,
            "upload_trace": {
                "file_path": file_path,
                "file_id": file_id,
                "filename": filename,
            },
        }
