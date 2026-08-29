import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from main import run_ai_self_audit


def test_ai_self_audit():
    result = run_ai_self_audit()
    assert result["status"] == "passed", result
    assert result["failed"] == []
