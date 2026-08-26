import os

from google import genai

MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
TIMEOUT_MS = int(os.getenv("GEMINI_TIMEOUT_MS", "20000"))
SYSTEM_PROMPT = """You are the supportive communication layer for MindSetu.
The supplied risk signal and contributing factors come from a local supervised ML model.
Never diagnose a person, never change the supplied signal, and do not invent personal facts.
Write concise, empathetic, non-judgmental wellbeing guidance. Encourage appropriate human support when concerning.
Do not describe SHAP values as causal effects.
"""


def generate_supportive_response(ml_result: dict) -> str:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY is not configured")

    client = genai.Client(
        api_key=api_key,
        http_options={"timeout": TIMEOUT_MS},
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

    try:
        response = client.models.generate_content(
            model=MODEL,
            contents=prompt,
            config={
                "temperature": 0.35,
                "max_output_tokens": 350,
            },
        )
    except Exception as exc:
        raise RuntimeError(f"Gemini request failed: {type(exc).__name__}") from exc

    text = getattr(response, "text", None)
    if not text:
        raise RuntimeError("Gemini returned no text output")
    return text.strip()
