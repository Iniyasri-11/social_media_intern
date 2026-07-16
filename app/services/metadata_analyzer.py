"""
app/services/metadata_analyzer.py

Service for extracting and validating image metadata using Pillow.
Evaluates the metadata against a rule-based checklist to generate a score (0-100)
and list of warnings.
"""

import io
import os
import uuid
import logging
from datetime import datetime
from typing import Dict, Any, List, Optional, Tuple
from PIL import Image, UnidentifiedImageError
from PIL.ExifTags import TAGS, GPSTAGS

logger = logging.getLogger(__name__)

# List of lowercase substrings indicating image editing software
EDITING_SOFTWARE_SIGNATURES = [
    "photoshop", "adobe", "gimp", "canva", "figma", 
    "pixelmator", "lightroom", "paint.net", "corel", 
    "acorn", "snapseed", "picsart", "affinity"
]

UPLOAD_DIR = os.path.join("data", "uploads")


def get_decimal_coordinates(geotagging: Dict[str, Any]) -> Optional[Dict[str, float]]:
    """
    Converts raw GPS rational values into decimal degrees.
    """
    if not geotagging:
        return None

    def to_float(val: Any) -> float:
        if isinstance(val, (int, float)):
            return float(val)
        if hasattr(val, "numerator") and hasattr(val, "denominator"):
            return float(val.numerator) / float(val.denominator)
        if isinstance(val, tuple) and len(val) == 2:
            return float(val[0]) / float(val[1])
        return float(val)

    def convert_to_degrees(value: Any) -> Optional[float]:
        try:
            if not value or len(value) < 3:
                return None
            d = to_float(value[0])
            m = to_float(value[1])
            s = to_float(value[2])
            return d + (m / 60.0) + (s / 3600.0)
        except Exception:
            return None

    try:
        lat_value = geotagging.get("GPSLatitude")
        lat_ref = geotagging.get("GPSLatitudeRef")
        lon_value = geotagging.get("GPSLongitude")
        lon_ref = geotagging.get("GPSLongitudeRef")

        if not lat_value or not lon_value or not lat_ref or not lon_ref:
            return None

        lat = convert_to_degrees(lat_value)
        lon = convert_to_degrees(lon_value)

        if lat is None or lon is None:
            return None

        if lat_ref != "N":
            lat = -lat
        if lon_ref != "E":
            lon = -lon

        return {"latitude": round(lat, 6), "longitude": round(lon, 6)}
    except Exception as e:
        logger.debug(f"Failed to parse GPS decimal coordinates: {e}")
        return None


class MetadataAnalyzer:
    """
    Extracts EXIF metadata from uploaded images and runs heuristic checks
    to compute an authenticity metadata score (0 to 100).
    """

    def save_image_temporarily(self, image_bytes: bytes, filename: str) -> Tuple[str, str]:
        """
        Saves the image bytes temporarily in data/uploads/ for traceability.
        Returns:
            Tuple[file_path, file_id]
        """
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        file_id = str(uuid.uuid4())
        
        # Keep original extension or fallback to jpg
        _, ext = os.path.splitext(filename)
        if not ext:
            ext = ".jpg"
            
        unique_filename = f"{file_id}{ext}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)

        with open(file_path, "wb") as f:
            f.write(image_bytes)

        logger.info(f"Temporarily saved uploaded image to {file_path}")
        return file_path, file_id

    def extract_and_score(self, image_bytes: bytes) -> Dict[str, Any]:
        """
        Extracts metadata using Pillow and evaluates the authenticity score.

        Args:
            image_bytes: Raw bytes of the uploaded image file.

        Returns:
            A dictionary containing:
                - metadata: Extracted metadata tags.
                - score: Score between 0 and 100.
                - warnings: List of warning strings.

        Raises:
            ValueError: If the file is invalid or corrupted.
        """
        try:
            img = Image.open(io.BytesIO(image_bytes))
        except UnidentifiedImageError as e:
            logger.error(f"Failed to identify image format: {e}")
            raise ValueError("Invalid or corrupted image file format.")
        except Exception as e:
            logger.error(f"Unexpected image load error: {e}")
            raise ValueError("Could not read image file.")

        width, height = img.size
        img_format = img.format or "Unknown"

        metadata = {
            "format": img_format,
            "dimensions": {"width": width, "height": height},
            "camera_make": None,
            "camera_model": None,
            "capture_date": None,
            "software": None,
            "gps_coordinates": None,
        }

        warnings = []
        has_exif = False

        # Attempt to read EXIF tags
        try:
            exif_raw = img.getexif()
            if exif_raw:
                exif_data = {}
                for tag_id, value in exif_raw.items():
                    tag_name = TAGS.get(tag_id, tag_id)
                    exif_data[tag_name] = value

                # Pillow's getexif() doesn't automatically load nested tags like GPSInfo or ExifOffset, 
                # so we try to load them via _getexif() if available (mainly on JPEGs)
                if hasattr(img, "_getexif"):
                    detailed_exif = img._getexif()
                    if detailed_exif:
                        for tag_id, value in detailed_exif.items():
                            tag_name = TAGS.get(tag_id, tag_id)
                            exif_data[tag_name] = value

                if exif_data:
                    has_exif = True
                    metadata["camera_make"] = exif_data.get("Make")
                    metadata["camera_model"] = exif_data.get("Model")
                    metadata["software"] = exif_data.get("Software")

                    # Extract capture date
                    metadata["capture_date"] = exif_data.get("DateTimeOriginal") or exif_data.get("DateTime")

                    # Extract GPS Info
                    geotagging = {}
                    for tag_id, value in exif_data.items():
                        if tag_id == "GPSInfo" and isinstance(value, dict):
                            for sub_key, sub_val in value.items():
                                sub_tag_name = GPSTAGS.get(sub_key, sub_key)
                                geotagging[sub_tag_name] = sub_val
                    
                    metadata["gps_coordinates"] = get_decimal_coordinates(geotagging)

        except Exception as e:
            logger.warning(f"Error extracting EXIF tags: {e}")
            warnings.append(f"Exif metadata extraction encountered an error: {str(e)}")

        # Check for image info dict (useful for PNG metadata chunks)
        if img.info and isinstance(img.info, dict):
            if "Software" in img.info and not metadata["software"]:
                metadata["software"] = img.info["Software"]

        # Run scoring checklist (base score 100)
        score = 100

        is_jpeg = img_format.upper() in ("JPEG", "JPG")

        if is_jpeg:
            if not has_exif:
                score -= 50
                warnings.append("No EXIF metadata found in JPEG/JPG image.")
            else:
                if not metadata["camera_make"] or not metadata["camera_model"]:
                    score -= 20
                    warnings.append("Missing camera manufacturer or model details in EXIF.")
                
                if not metadata["capture_date"]:
                    score -= 20
                    warnings.append("Missing original capture date/time in EXIF.")
        else:
            # For PNG and other formats, missing EXIF is expected, but we note limited metadata
            if not has_exif:
                warnings.append(f"Metadata is limited (image is {img_format} format).")
                # PNG is typically a web export; start it slightly lower or note lack of forensic history
                score -= 10

        # Check for editing software signatures
        software = metadata.get("software")
        if software:
            software_lower = str(software).lower()
            detected_editors = [sig for sig in EDITING_SOFTWARE_SIGNATURES if sig in software_lower]
            if detected_editors:
                score -= 40
                warnings.append(f"Image was edited or processed using: {software} (signature: {detected_editors[0]})")

        # Inconsistent capture vs digitized dates
        # If we have both tags, they should logically match or capture should be <= digitized
        try:
            if has_exif and exif_data:
                orig_date_str = exif_data.get("DateTimeOriginal")
                digitized_date_str = exif_data.get("DateTimeDigitized")
                if orig_date_str and digitized_date_str:
                    # Formats are typically YYYY:MM:DD HH:MM:SS
                    fmt = "%Y:%m:%d %H:%M:%S"
                    orig_dt = datetime.strptime(str(orig_date_str).strip(), fmt)
                    dig_dt = datetime.strptime(str(digitized_date_str).strip(), fmt)
                    if orig_dt > dig_dt:
                        score -= 15
                        warnings.append("Metadata capture date is newer than digitized date (inconsistent timestamps).")
        except Exception:
            # If date format is weird, ignore inconsistency check
            pass

        # Cap the score between 0 and 100
        score = max(0, min(100, score))

        return {
            "metadata": metadata,
            "metadata_score": float(score),
            "warnings": warnings
        }
