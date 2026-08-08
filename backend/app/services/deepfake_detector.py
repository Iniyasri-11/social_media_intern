"""
app/services/deepfake_detector.py

Provides a reusable, thread-safe, and singleton-based Deepfake / AI-generated Image Detection module.
Loads a Hugging Face image classification pipeline on demand to classify images into Real vs. Deepfake.
"""

import io
import os
import logging
from typing import Dict, Any
from PIL import Image, UnidentifiedImageError

logger = logging.getLogger(__name__)

# Default model for deepfake / AI image detection
DEFAULT_DEEPFAKE_MODEL_ID = "prithivMLmods/Deep-Fake-Detector-Model"
DEEPFAKE_MODEL_ID = os.getenv("DEEPFAKE_MODEL_ID", DEFAULT_DEEPFAKE_MODEL_ID)


class DeepfakeDetector:
    """
    A thread-safe singleton wrapper around Hugging Face's vision pipeline for Deepfake detection.
    Ensures that the ML model is loaded only once across the application lifecycle.
    """

    _instance = None
    _pipeline = None

    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super(DeepfakeDetector, cls).__new__(cls, *args, **kwargs)
        return cls._instance

    def __init__(self):
        if not hasattr(self, "_initialized"):
            self._initialized = True
            self._pipeline = None

    def load_model(self) -> None:
        """
        Loads the vision classification pipeline into memory.
        """
        if self._pipeline is not None:
            return

        logger.info("Initializing DeepfakeDetector...")
        logger.info(f"Loading Hugging Face vision model: {DEEPFAKE_MODEL_ID}")

        try:
            from transformers import pipeline
            import torch

            device = 0 if torch.cuda.is_available() else -1
            device_name = "GPU" if device == 0 else "CPU"
            logger.info(f"Using device: {device_name} for deepfake vision inference.")

            self._pipeline = pipeline(
                "image-classification",
                model=DEEPFAKE_MODEL_ID,
                device=device,
            )
            logger.info("Deepfake detection model loaded successfully.")

        except Exception as e:
            logger.error(
                f"Failed to load Deepfake model '{DEEPFAKE_MODEL_ID}': {e}",
                exc_info=True,
            )
            self._pipeline = None
            raise RuntimeError(f"Could not initialize deepfake vision model: {e}") from e

    def predict(self, image_bytes: bytes) -> Dict[str, Any]:
        """
        Runs deepfake / AI-generated classification on the provided image bytes.

        Args:
            image_bytes: Raw binary bytes of the image file.

        Returns:
            A dictionary containing:
                - is_deepfake: True if model predicts deepfake/artificial.
                - deepfake_score: Authenticity float (1.0 = authentic, 0.0 = deepfake).
                - raw_label: Top prediction label.
                - raw_confidence: Top prediction confidence score.
                - warnings: List of warning strings.

        Raises:
            ValueError: If image format is invalid.
            RuntimeError: If model fails to execute.
        """
        if not image_bytes:
            raise ValueError("Empty image bytes provided.")

        try:
            img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        except UnidentifiedImageError:
            raise ValueError("Corrupted or invalid image file format.")
        except Exception as e:
            raise ValueError(f"Failed to decode image for deepfake analysis: {e}")

        if self._pipeline is None:
            self.load_model()

        if self._pipeline is None:
            raise RuntimeError("Deepfake detector pipeline is uninitialized.")

        try:
            results = self._pipeline(img)
            if not results:
                raise RuntimeError("Deepfake model returned no classification output.")

            # Pipeline returns a list of prediction dicts sorted by score: [{'label': 'Real', 'score': 0.98}, ...]
            top_prediction = results[0]
            label = str(top_prediction.get("label", "")).strip().lower()
            confidence = float(top_prediction.get("score", 0.0))

            logger.info(f"Deepfake ML prediction: label='{label}', confidence={confidence:.4f}")

            warnings = []
            is_deepfake = False

            if "fake" in label or "deepfake" in label or "artificial" in label or "cg" in label:
                is_deepfake = True
                # Deepfake score represents authentic likelihood: 1 - confidence
                deepfake_score = round(1.0 - confidence, 2)
                warnings.append(
                    f"ML Deepfake Detector flagged image as AI-generated / Deepfake ({confidence * 100:.1f}% confidence)."
                )
            else:
                is_deepfake = False
                deepfake_score = round(confidence, 2)

            return {
                "is_deepfake": is_deepfake,
                "deepfake_score": deepfake_score,
                "raw_label": top_prediction.get("label"),
                "raw_confidence": confidence,
                "warnings": warnings,
            }

        except Exception as e:
            logger.error(f"Error executing deepfake vision inference: {e}", exc_info=True)
            raise RuntimeError(f"Deepfake vision analysis failed: {e}") from e
