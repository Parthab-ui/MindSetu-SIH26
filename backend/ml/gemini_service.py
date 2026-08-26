"""Gemini response layer for MindSetu.

The local LightGBM model remains authoritative for the wellbeing signal. Gemini
only converts a minimal, de-identified structured result into supportive text.
"""
import os
from google import genai

MODEL = os.getenv("GEMINI_MODEL", "gemini-3.7-flash")

SYSTEM_PROMPT = """You are the supportive communication layer for MindSetu.
The supplied risk signal and contributing factors come from a local supervised ML
model and explainability layer. Never diagnose a person, never claim the model is
clinically validated, and never change the supplied risk signal or probability.
Write concise, empathetic, non-judgmental wellbeing guidance. Encourage appropriate
human/professional support when the situation appears concerning. Do not mention
internal model scores or SHAP values unless explicitly requested. Use only the
provided de-identified information; do not invent personal facts."""


def generate_supportive_response(ml_result: dict) -> str:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY is not configured")
    client = genai.Client(api_key=api_key)
    prompt = (
        SYSTEM_PROMPT + "\n\nStructured result:\n" + str({
            "signal": ml_result.get("signal"),
            "probability": round(float(ml_result.get("probability", 0)), 3),
            "contributors": [
                {"label": x.get("label"), "direction": x.get("direction")}
                for x in ml_result.get("contributors", [])
            ],
        })
        + "\n\nRespond in 2-4 short paragraphs with practical, supportive guidance."
    )
    response = client.models.generate_content(model=MODEL, contents=prompt)
    return response.text.strip()
