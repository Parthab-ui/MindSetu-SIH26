import os
from google import genai

MODEL = os.getenv("GEMINI_MODEL", "gemini-3.7-flash")
SYSTEM_PROMPT = """You are the supportive communication layer for MindSetu.
The supplied risk signal and contributing factors come from a local supervised ML model.
Never diagnose a person, never change the supplied signal, and do not invent personal facts.
Write concise, empathetic, non-judgmental wellbeing guidance. Encourage appropriate human support when concerning."""

def generate_supportive_response(ml_result: dict) -> str:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY is not configured")
    client = genai.Client(api_key=api_key)
    payload = {
        "signal": ml_result.get("signal"),
        "contributors": [
            {"label": x.get("label"), "direction": x.get("direction")}
            for x in ml_result.get("contributors", [])
        ],
    }
    prompt = SYSTEM_PROMPT + "\n\nStructured result:\n" + str(payload) + "\n\nRespond in 2-4 short paragraphs with practical, supportive guidance."
    interaction = client.interactions.create(model=MODEL, input=prompt, generation_config={"thinking_level": "low"})
    text = getattr(interaction, "output_text", None)
    if not text:
        raise RuntimeError("Gemini returned no text output")
    return text.strip()
