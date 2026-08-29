import sys
from pathlib import Path
import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from sih26186_server import _calculate_wellness_stress, _classify


def test_wellness_score_bounds():
    assert _calculate_wellness_stress([0, 0, 0, 0, 0, 0]) == 0
    assert _calculate_wellness_stress([3, 3, 3, 3, 3, 3]) == 100


def test_invalid_wellness_answer_rejected():
    with pytest.raises(Exception):
        _calculate_wellness_stress([0, 0, 0, 0, 0, 4])


def test_classification_boundaries():
    assert _classify(20, 20)[1] == "low"
    assert _classify(55, 20)[1] == "moderate"
    assert _classify(90, 10)[1] == "high"
