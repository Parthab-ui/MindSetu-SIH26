import json
import os
import re
import time
import uuid
from datetime import datetime, timezone
from pathlib import Path

import psycopg
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

ENV_PATH = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=ENV_PATH)

GEMINI_API_KEY = (os.getenv("GEMINI_API_KEY") or "").strip()
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
GEMINI_TOTAL_TIMEOUT_SECONDS = min(max(float(os.getenv("GEMINI_TOTAL_TIMEOUT_SECONDS", "15")), 5.0), 30.0)
MAX_CHAT_LENGTH = 4000
MAX_MOOD_NOTE_LENGTH = 1000

app = FastAPI(
    title="MindSetu API",
    description="MindSetu personnel welfare support platform",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


@app.middleware("http")
async def security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "no-referrer"
    response.headers["Cache-Control"] = "no-store"
    return response


def get_connection():
    password = os.getenv("DB_PASSWORD")
    if not password:
        raise RuntimeError("DB_PASSWORD is missing from the environment.")
    return psycopg.connect(
        host=os.getenv("DB_HOST", "localhost"),
        port=os.getenv("DB_PORT", "5432"),
        dbname=os.getenv("DB_NAME", "mindsetu_db"),
        user=os.getenv("DB_USER", "postgres"),
        password=password,
    )



def ensure_core_tables():
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                CREATE TABLE IF NOT EXISTS sessions (
                    id UUID PRIMARY KEY,
                    anonymous BOOLEAN NOT NULL DEFAULT TRUE,
                    consent_given BOOLEAN NOT NULL DEFAULT FALSE,
                    created_at TIMESTAMP DEFAULT NOW()
                )
                """
            )
            cur.execute(
                """
                CREATE TABLE IF NOT EXISTS mood_entries (
                    id UUID PRIMARY KEY,
                    session_id UUID REFERENCES sessions(id),
                    mood INT,
                    note TEXT,
                    created_at TIMESTAMP DEFAULT NOW()
                )
                """
            )



@app.on_event("startup")
def startup_core_tables():
    ensure_core_tables()

def session_exists(session_id: uuid.UUID) -> bool:
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT id FROM sessions WHERE id = %s", (session_id,))
            return cur.fetchone() is not None


def require_session(session_id: uuid.UUID):
    if not session_exists(session_id):
        raise HTTPException(status_code=404, detail="Session not found.")


class SessionRequest(BaseModel):
    consent_given: bool = True


class ChatHistoryItem(BaseModel):
    sender: str = Field(..., pattern="^(user|ai)$")
    text: str = Field(..., min_length=1, max_length=MAX_CHAT_LENGTH)


class WellbeingContext(BaseModel):
    risk_level: str | None = Field(default=None, max_length=80)
    primary_focus: str | None = Field(default=None, max_length=300)
    wellness_summary: str | None = Field(default=None, max_length=1000)
    recommended_next_step: str | None = Field(default=None, max_length=1000)


class ChatRequest(BaseModel):
    session_id: uuid.UUID
    message: str = Field(..., min_length=1, max_length=MAX_CHAT_LENGTH)
    history: list[ChatHistoryItem] = Field(default_factory=list, max_length=12)
    wellbeing_context: WellbeingContext = Field(default_factory=WellbeingContext)


class MoodRequest(BaseModel):
    session_id: uuid.UUID
    mood: int = Field(..., ge=1, le=5)
    note: str | None = Field(default=None, max_length=MAX_MOOD_NOTE_LENGTH)


MINDSETU_SYSTEM_PROMPT = """
You are MindSetu, a supportive personnel wellbeing companion.
Output only the final response. Be calm, empathetic, practical, concise and non-judgmental.
Use the supplied MINDSETU CONTEXT when relevant, but never invent missing facts.
Keep normal responses between 2 and 5 short sentences and ask at most one gentle follow-up question.
You are not a doctor or emergency service: never diagnose, prescribe medication, or make employment/disciplinary decisions.
If the user describes immediate danger, suicide, self-harm, or intent to seriously hurt themselves or another person, prioritise immediate emergency/professional support and a trusted person nearby.
"""


def build_ai_context(history, wellbeing_context=None) -> str:
    recent = []
    for item in (history or [])[-12:]:
        sender = item.get("sender") if isinstance(item, dict) else getattr(item, "sender", "")
        text = item.get("text") if isinstance(item, dict) else getattr(item, "text", "")
        if text:
            recent.append(f"{sender}: {text.strip()[:500]}")
    context = wellbeing_context.model_dump(exclude_none=True) if hasattr(wellbeing_context, "model_dump") else (wellbeing_context or {})
    lines = ["MINDSETU CONTEXT (use only when relevant):"]
    for key in ("risk_level", "primary_focus", "wellness_summary", "recommended_next_step"):
        value = context.get(key) if isinstance(context, dict) else None
        if value:
            lines.append(f"{key.replace('_', ' ')}: {str(value)[:300]}")
    if recent:
        lines.append("Recent conversation:\n" + "\n".join(recent))
    return "\n".join(lines)


def validate_ai_response(text: str, message: str, history=None) -> str:
    text = (text or "").strip()
    if len(text) < 8:
        return ""
    lowered = text.lower()
    if any(marker in lowered for marker in ("system prompt", "hidden prompt", "internal reasoning")):
        return ""
    previous_ai = [((item.get("text") if isinstance(item, dict) else getattr(item, "text", "")) or "").strip()
                   for item in (history or []) if (item.get("sender") if isinstance(item, dict) else getattr(item, "sender", "")) == "ai"]
    if previous_ai and text == previous_ai[-1]:
        return ""
    return text

CRISIS_TERMS = [
    "suicide", "kill myself", "killing myself", "end my life", "want to die",
    "wish i was dead", "wish i were dead", "self harm", "self-harm", "hurt myself",
    "cut myself", "overdose",
]


def contains_crisis_language(message: str) -> bool:
    text = message.lower()
    return any(term in text for term in CRISIS_TERMS)


def supportive_fallback_response(message: str) -> str:
    text = message.lower()
    if any(term in text for term in ("overwhelmed", "exhausted", "burnout", "burned out", "stress", "stressed")):
        return (
            "That sounds like a heavy amount to carry. Try to identify one immediate step that reduces pressure today, "
            "such as a short recovery break, speaking with someone you trust, or asking for practical workload support. "
            "If this feeling continues or worsens, consider reaching out to a qualified support professional."
        )
    return (
        "Thank you for sharing that. Take things one step at a time, and consider what practical support or recovery "
        "would help most right now. If your wellbeing becomes difficult to manage, reaching out to someone you trust "
        "or a qualified support professional can be a useful next step."
    )


def crisis_response() -> str:
    return (
        "I'm really sorry you're going through something this difficult. "
        "Please contact your local emergency service or a qualified mental-health "
        "professional now, and stay with someone you trust if possible."
    )


def _extract_gemini_text(response) -> str:
    text = getattr(response, "text", None)
    if isinstance(text, str) and text.strip():
        return text.strip()

    candidates = getattr(response, "candidates", None) or []
    for candidate in candidates:
        content = getattr(candidate, "content", None)
        parts = getattr(content, "parts", None) or []
        collected = []
        for part in parts:
            value = getattr(part, "text", None)
            if isinstance(value, str) and value.strip():
                collected.append(value.strip())
        if collected:
            return "\n".join(collected)
    return ""


def generate_gemini_response(message: str, history=None, wellbeing_context=None) -> str:
    """Give Gemini one shared response window with validated retries."""
    if not GEMINI_API_KEY:
        raise RuntimeError("GEMINI_API_KEY is not configured")
    from google import genai
    from google.genai import types
    deadline = time.monotonic() + GEMINI_TOTAL_TIMEOUT_SECONDS
    last_error = None
    context = build_ai_context(history, wellbeing_context)
    contents = [{"role": "user", "parts": [{"text": context}]}]
    contents.append({"role": "user", "parts": [{"text": message}]})
    for attempt in range(3):
        remaining = deadline - time.monotonic()
        if remaining <= 0: break
        try:
            started = time.monotonic()
            client = genai.Client(api_key=GEMINI_API_KEY, http_options={"timeout": max(1000, int(remaining * 1000))})
            response = client.models.generate_content(model=GEMINI_MODEL, contents=contents,
                config={"system_instruction": MINDSETU_SYSTEM_PROMPT, "temperature": 0.55, "max_output_tokens": 500})
            text = validate_ai_response(_extract_gemini_text(response), message, history)
            print(f"GEMINI attempt={attempt + 1} latency_ms={int((time.monotonic()-started)*1000)} valid={bool(text)}")
            if text: return text
            raise RuntimeError("Gemini returned an invalid or repeated response")
        except Exception as exc:
            last_error = exc
            if attempt < 2:
                time.sleep(min(0.6 * (attempt + 1), max(0, deadline - time.monotonic())))
    raise RuntimeError(f"Gemini unavailable after {GEMINI_TOTAL_TIMEOUT_SECONDS:.0f}s: {last_error}") from last_error

@app.get("/")
def root():
    return {"message": "MindSetu API is running", "status": "success", "ai_model": GEMINI_MODEL}


@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "MindSetu Backend", "ai_model": GEMINI_MODEL}


def gemini_runtime_status():
    try:
        from google import genai  # noqa: F401
        sdk_available = True
    except Exception:
        sdk_available = False

    configured = bool(GEMINI_API_KEY)
    if configured and sdk_available:
        status = "ready"
    elif not configured:
        status = "needs_configuration"
    else:
        status = "sdk_unavailable"

    return {
        "status": status,
        "provider": "Google Gemini",
        "model": GEMINI_MODEL,
        "api_key_configured": configured,
        "sdk_available": sdk_available,
        "env_file_detected": ENV_PATH.exists(),
    }


@app.get("/api/chat/health")
def chat_health():
    return gemini_runtime_status()


@app.get("/api/gemini/health")
def gemini_health():
    return gemini_runtime_status()


@app.get("/api/database")
def database_check():
    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT current_database()")
                database = cur.fetchone()[0]
        return {"status": "connected", "database": database}
    except Exception as exc:
        raise HTTPException(status_code=503, detail="Database connection unavailable.") from exc


@app.post("/api/sessions")
def create_session(request: SessionRequest):
    if not request.consent_given:
        raise HTTPException(status_code=400, detail="Consent is required before starting.")
    session_id = uuid.uuid4()
    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    "INSERT INTO sessions (id, anonymous, consent_given) VALUES (%s, %s, %s)",
                    (session_id, True, True),
                )
    except Exception as exc:
        raise HTTPException(status_code=503, detail="Unable to create session.") from exc
    return {"session_id": str(session_id), "anonymous": True, "consent_given": True}


@app.post("/api/chat")
def chat(request: ChatRequest):
    require_session(request.session_id)
    message = request.message.strip()

    if contains_crisis_language(message):
        def crisis_stream():
            yield json.dumps({"type": "start", "model": "safety_response", "risk_level": "safety_priority"}) + "\n"
            yield json.dumps({"type": "token", "content": crisis_response()}) + "\n"
            yield json.dumps({"type": "done"}) + "\n"
        return StreamingResponse(crisis_stream(), media_type="application/x-ndjson")

    def response_generator():
        yield json.dumps({"type": "start", "model": GEMINI_MODEL, "risk_level": "supportive"}) + "\n"
        try:
            text = generate_gemini_response(message, request.history, request.wellbeing_context)
            yield json.dumps({"type": "token", "content": text}) + "\n"
            yield json.dumps({"type": "done"}) + "\n"
        except Exception as exc:
            print("GEMINI ERROR:", exc)
            yield json.dumps({"type": "token", "content": supportive_fallback_response(message)}) + "\n"
            yield json.dumps({"type": "fallback", "source": "deterministic"}) + "\n"
            yield json.dumps({"type": "done"}) + "\n"

    return StreamingResponse(
        response_generator(),
        media_type="application/x-ndjson",
        headers={"Cache-Control": "no-cache, no-transform", "X-Accel-Buffering": "no"},
    )


@app.post("/api/mood")
def add_mood(request: MoodRequest):
    require_session(request.session_id)
    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    "INSERT INTO mood_entries (id, session_id, mood, note) VALUES (%s, %s, %s, %s)",
                    (uuid.uuid4(), request.session_id, request.mood, request.note),
                )
    except Exception as exc:
        raise HTTPException(status_code=503, detail="Unable to save mood check-in.") from exc
    return {"message": "Mood check-in recorded.", "mood": request.mood}


@app.get("/api/mood/{session_id}")
def get_mood_history(session_id: uuid.UUID):
    require_session(session_id)
    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    "SELECT mood, note, created_at FROM mood_entries WHERE session_id = %s ORDER BY created_at DESC LIMIT 30",
                    (session_id,),
                )
                rows = cur.fetchall()
    except Exception as exc:
        raise HTTPException(status_code=503, detail="Mood history is temporarily unavailable.") from exc
    return {"history": [{"mood": row[0], "note": row[1], "created_at": row[2].isoformat()} for row in rows]}


@app.get("/api/dashboard/mood-trend")
def dashboard_mood_trend():
    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT DATE(created_at), ROUND(AVG(mood)::numeric, 2), COUNT(*)
                    FROM mood_entries GROUP BY DATE(created_at)
                    ORDER BY DATE(created_at) DESC LIMIT 30
                    """
                )
                rows = cur.fetchall()
    except Exception as exc:
        raise HTTPException(status_code=503, detail="Mood trend is temporarily unavailable.") from exc
    return {"trend": [{"date": row[0].isoformat(), "average_mood": float(row[1]), "entries": row[2]} for row in reversed(rows)]}


# Register SIH26186 workflow routes after the core app and database helpers are defined.
import sih26186_server  # noqa: E402,F401
