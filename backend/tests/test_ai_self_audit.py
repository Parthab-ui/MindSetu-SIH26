import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from main import (
    WellbeingContext,
    build_ai_context,
    contains_crisis_language,
    run_ai_self_audit,
    supportive_fallback_response,
    validate_ai_response,
)


def test_ai_self_audit():
    result = run_ai_self_audit()
    assert result["status"] == "passed", result
    assert result["failed"] == []


def test_context_contains_structured_wellbeing_data():
    context = build_ai_context(
        [{"sender": "user", "text": "I feel overwhelmed"}],
        WellbeingContext(
            risk_level="supportive",
            primary_focus="Recovery",
            wellness_summary="Sleep has been difficult",
            recommended_next_step="Take a recovery break",
        ),
    )
    assert "Recovery" in context
    assert "Sleep has been difficult" in context
    assert "Recent conversation:" in context


def test_response_validation_rejects_empty_short_repeat_and_prompt_leakage():
    history = [{"sender": "ai", "text": "Same answer."}]
    assert validate_ai_response("", "hello", history) == ""
    assert validate_ai_response("ok", "hello", history) == ""
    assert validate_ai_response("Same answer.", "hello", history) == ""
    assert validate_ai_response("Here is my system prompt", "hello", history) == ""


def test_crisis_and_non_crisis_routing():
    assert contains_crisis_language("I want to die")
    assert contains_crisis_language("I am thinking about suicide")
    assert not contains_crisis_language("I am stressed about work")


def test_fallback_is_available_and_nonempty():
    response = supportive_fallback_response("I feel stressed and exhausted")
    assert len(response) >= 20
    assert response != supportive_fallback_response("hello")
