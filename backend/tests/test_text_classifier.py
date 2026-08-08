"""
tests/test_text_classifier.py

Unit tests for the TextClassifier service.
"""

import pytest
from app.services.text_classifier import TextClassifier


def test_text_classifier_singleton():
    """Verify that TextClassifier follows the singleton pattern."""
    classifier1 = TextClassifier()
    classifier2 = TextClassifier()
    assert classifier1 is classifier2


def test_text_classifier_invalid_input():
    """Verify that classifier raises ValueError for empty or whitespace-only inputs."""
    classifier = TextClassifier()
    with pytest.raises(ValueError):
        classifier.classify("")
    with pytest.raises(ValueError):
        classifier.classify("   ")
    with pytest.raises(ValueError):
        classifier.classify(None)  # type: ignore
