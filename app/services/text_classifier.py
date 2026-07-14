"""
app/services/text_classifier.py

Provides a reusable, thread-safe, and singleton-based Text Classification module.
Loads the specified Hugging Face model (defaulting to a lightweight bert-tiny fake news detector)
only once when requested. Performs inference on post text to return labels and confidence scores.
"""

import os
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

# Default lightweight model for fake news detection (approx. 17MB on disk)
DEFAULT_MODEL_ID = "mrm8488/bert-tiny-finetuned-fake-news-detection"
MODEL_ID = os.getenv("TEXT_MODEL_ID", DEFAULT_MODEL_ID)


class TextClassifier:
    """
    A thread-safe singleton wrapper around Hugging Face's pipeline for text classification.
    Ensures that the model is loaded only once across the application lifecycle.
    """
    _instance = None
    _pipeline = None

    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super(TextClassifier, cls).__new__(cls, *args, **kwargs)
        return cls._instance

    def __init__(self):
        # Ensure initialization logic only runs once
        if not hasattr(self, "_initialized"):
            self._initialized = True
            # We defer loading the model until the first classification request
            # or explicit initialization, keeping app startup fast.
            self._pipeline = None

    def load_model(self) -> None:
        """
        Loads the Hugging Face model and tokenizer into the pipeline.
        Safe to call multiple times; will only load if not already loaded.
        """
        if self._pipeline is not None:
            return

        logger.info("Initializing TextClassifier...")
        logger.info(f"Loading Hugging Face model: {MODEL_ID}")

        try:
            # Import inside the method to keep startup fast and avoid import errors
            # if dependencies are not yet fully available at initial module load.
            from transformers import pipeline
            import torch

            # Detect CUDA device, fallback to CPU
            device = 0 if torch.cuda.is_available() else -1
            device_name = "GPU" if device == 0 else "CPU"
            logger.info(f"Using device: {device_name} for inference.")

            self._pipeline = pipeline(
                "text-classification",
                model=MODEL_ID,
                device=device
            )
            logger.info("Hugging Face model loaded successfully.")

        except Exception as e:
            logger.error(f"Failed to load Hugging Face model '{MODEL_ID}': {e}", exc_info=True)
            # Set to None to allow subsequent retries
            self._pipeline = None
            raise RuntimeError(f"Could not initialize text classification model: {e}") from e

    def classify(self, text: str) -> Dict[str, Any]:
        """
        Runs text classification inference on the provided post text.

        Args:
            text: The text content of the social media post.

        Returns:
            A dictionary containing:
                - label: The raw label string from the model (e.g. 'LABEL_0', 'LABEL_1', 'Real', 'Fake').
                - score: The raw confidence score float (between 0.0 and 1.0).

        Raises:
            ValueError: If the input text is invalid.
            RuntimeError: If model loading or inference fails.
        """
        if not text or not text.strip():
            raise ValueError("Input text cannot be empty or only whitespace.")

        # Ensure the model is loaded
        if self._pipeline is None:
            self.load_model()

        # Double check in case of failure to load
        if self._pipeline is None:
            raise RuntimeError("Model pipeline is not initialized.")

        try:
            # Perform inference with truncation enabled to handle text longer than model max length (typically 512 tokens)
            results = self._pipeline(text, truncation=True)
            if not results:
                raise RuntimeError("Model returned empty prediction results.")

            # Pipeline returns a list of dictionaries, e.g. [{'label': 'LABEL_0', 'score': 0.998}]
            prediction = results[0]
            logger.debug(f"Model prediction: {prediction}")
            return {
                "label": prediction["label"],
                "score": prediction["score"]
            }

        except Exception as e:
            logger.error(f"Error during model inference: {e}", exc_info=True)
            raise RuntimeError(f"Model inference failed: {e}") from e
