import os
import time

from google import genai
from google.genai import types

MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
TIMEOUT_MS = int(os.getenv("GEMINI_TIMEOUT_MS", "20000"))
MAX_ATTEMPTS = 3
RETRY_DELAY_SECONDS = 0.8
SYSTEM_PROMPT = """You are the supportive communication layer for MindSetu.
The supplied risk signal and contributing factors come from a local supervised ML model.
Never diagnose a person, never change the supplied signal, and do not invent personal facts.
Write concise, empathetic, non-judgmental wellbeing guidance. Encourage appropriate human support when concerning.
Do not describe SHAP values as causal effects.
"""


def generate_supportive_response(ml_result: dict) -> str:
    api_key = (os.getenv("GEMINI_API_KEY") or "").strip()
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY is not configured")

    client = genai.Client(
        api_key=api_key,
        http_options=types.HttpOptions(timeout=TIMEOUT_MS),
    )
    payload = {
        "signal": ml_result.get("signal"),
        "contributors": [
            {"label": x.get("label"), "direction": x.get("direction")}
            for x in ml_result.get("contributors", [])
        ],
    }
    prompt = (
        SYSTEM_PROMPT
        + "\nStructured result:\n"
        + str(payload)
        + "\n\nRespond in 2-4 short paragraphs with practical, supportive guidance."
    )

    last_error = None
    for attempt in range(1, MAX_ATTEMPTS + 1):
        try:
            interaction = client.interactions.create(
                model=MODEL,
                input=prompt
            )
            text = (getattr(interaction, "output_text", None) or "").strip()
            if text:
                return text
            last_error = RuntimeError("Gemini returned no text output")
        except Exception as exc:
            last_error = exc
        if attempt < MAX_ATTEMPTS:
            time.sleep(RETRY_DELAY_SECONDS * attempt)

    if isinstance(last_error, RuntimeError) and str(last_error) == "Gemini returned no text output":
        raise last_error
    raise RuntimeError(f"Gemini request failed after {MAX_ATTEMPTS} attempts: {type(last_error).__name__}")