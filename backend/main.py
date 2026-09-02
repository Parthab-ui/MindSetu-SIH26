import json
import os
import re
import time
import uuid
from contextlib import asynccontextmanager, contextmanager
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlparse

import psycopg
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from psycopg_pool import ConnectionPool
from pydantic import BaseModel, Field

ENV_PATH = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=ENV_PATH)

GEMINI_API_KEY = (os.getenv("GEMINI_API_KEY") or "").strip()
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.6-flash")
GEMINI_TOTAL_TIMEOUT_SECONDS = min(max(float(os.getenv("GEMINI_TOTAL_TIMEOUT_SECONDS", "15")), 5.0), 30.0)
MAX_CHAT_LENGTH = 4000
MAX_MOOD_NOTE_LENGTH = 1000

_DEFAULT_CORS_ORIGINS = "http://localhost:5173,http://127.0.0.1:5173"
CORS_ORIGINS = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", _DEFAULT_CORS_ORIGINS).split(",")
    if origin.strip()
]


def _build_conninfo() -> str:
    """Build a PostgreSQL connection string.

    Supports Render-style ``DATABASE_URL`` or individual ``DB_*`` vars.
    """
    database_url = (os.getenv("DATABASE_URL") or "").strip()
    if database_url:
        return database_url
    password = os.getenv("DB_PASSWORD")
    if not password:
        raise RuntimeError(
            "Database credentials are not configured. "
            "Set DATABASE_URL or DB_HOST/DB_PORT/DB_NAME/DB_USER/DB_PASSWORD in .env"
        )
    host = os.getenv("DB_HOST", "localhost")
    port = os.getenv("DB_PORT", "5432")
    dbname = os.getenv("DB_NAME", "mindsetu_db")
    user = os.getenv("DB_USER", "postgres")
    return f"postgresql://{user}:{password}@{host}:{port}/{dbname}"


_pool: ConnectionPool | None = None
_tables_initialized = False


def _init_pool():
    global _pool
    if _pool is None:
        _pool = ConnectionPool(
            conninfo=_build_conninfo(),
            min_size=0,
            max_size=10,
            open=True,
        )


def _close_pool():
    global _pool
    if _pool is not None:
        _pool.close()
        _pool = None


def _ensure_tables_once():
    global _tables_initialized
    if not _tables_initialized:
        try:
            ensure_core_tables()
            from sih26186_server import ensure_sih26186_tables
            ensure_sih26186_tables()
            _tables_initialized = True
        except Exception as exc:
            print("SCHEMA INIT NOTICE:", exc)


@contextmanager
def get_connection():
    """Borrow a connection from the pool (context manager), initializing lazily if needed."""
    if _pool is None:
        _init_pool()
        _ensure_tables_once()
    with _pool.connection() as conn:
        yield conn


@asynccontextmanager
async def lifespan(application: FastAPI):
    """Application startup and shutdown."""
    _init_pool()
    _ensure_tables_once()
    yield
    _close_pool()


app = FastAPI(
    title="MindSetu API",
    description="MindSetu personnel welfare support platform",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_origin_regex=r"https:\/\/.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)


@app.middleware("http")
async def security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "no-referrer"
    response.headers["Cache-Control"] = "no-store"
    return response





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


def _ai_context_to_dict(value):
    return value.model_dump(exclude_none=True) if hasattr(value, "model_dump") else (value or {})


def build_ai_context(history, wellbeing_context=None) -> str:
    recent = []
    for item in (history or [])[-12:]:
        sender = item.get("sender") if isinstance(item, dict) else getattr(item, "sender", "")
        text = item.get("text") if isinstance(item, dict) else getattr(item, "text", "")
        if text:
            recent.append(f"{sender}: {text.strip()[:500]}")
    context = _ai_context_to_dict(wellbeing_context)
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



def run_ai_self_audit() -> dict:
    cases = [
        ("context", build_ai_context([ChatHistoryItem(sender="user", text="I feel exhausted")], WellbeingContext(primary_focus="Recovery")).find("Recovery") >= 0),
        ("empty_response_rejected", validate_ai_response("", "hello", []) == ""),
        ("short_response_rejected", validate_ai_response("ok", "hello", []) == ""),
        ("repeat_rejected", validate_ai_response("Same answer.", "again", [ChatHistoryItem(sender="ai", text="Same answer.")]) == ""),
        ("crisis_detection", contains_crisis_language("I want to die")),
        ("non_crisis_detection", not contains_crisis_language("I am stressed about work")),
        ("fallback_available", len(supportive_fallback_response("I am stressed")) >= 20),
    ]
    failed = [name for name, passed in cases if not passed]
    return {"status": "passed" if not failed else "failed", "passed": len(cases) - len(failed), "total": len(cases), "failed": failed}


@app.get("/api/ai/self-audit")
def ai_self_audit():
    return run_ai_self_audit()

def crisis_response() -> str:
    return (
        "I'm really sorry you're going through something this difficult. "
        "Please contact your local emergency service or a qualified mental-health "
        "professional now, and stay with someone you trust if possible."
    )





_gemini_client = None


def get_gemini_client():
    global _gemini_client
    if _gemini_client is None:
        if not GEMINI_API_KEY:
            raise RuntimeError("GEMINI_API_KEY is not configured")
        from google import genai
        from google.genai import types
        _gemini_client = genai.Client(
            api_key=GEMINI_API_KEY,
            http_options=types.HttpOptions(timeout=int(GEMINI_TOTAL_TIMEOUT_SECONDS * 1000)),
        )
    return _gemini_client


def stream_gemini_response(message: str, history=None, wellbeing_context=None):
    """Yield incremental chunks from Gemini 3.5 Flash Lite with bounded output."""
    client = get_gemini_client()
    from google.genai import types

    context = build_ai_context(history, wellbeing_context)
    prompt = f"{context}\n\nLatest user message: {message}"

    stream = client.models.generate_content_stream(
        model=GEMINI_MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(
            system_instruction=MINDSETU_SYSTEM_PROMPT,
            max_output_tokens=300,
            temperature=0.7,
        ),
    )

    for chunk in stream:
        text = chunk.text
        if text:
            yield text


def generate_gemini_response(message: str, history=None, wellbeing_context=None) -> str:
    """Give Gemini one shared response window with validated output."""
    accumulated = []
    for token in stream_gemini_response(message, history, wellbeing_context):
        accumulated.append(token)
    full_text = "".join(accumulated).strip()
    valid_text = validate_ai_response(full_text, message, history)
    if valid_text:
        return valid_text
    raise RuntimeError("Gemini returned an invalid or repeated response")

@app.get("/")
def root():
    frontend_dist = Path(__file__).resolve().parent.parent / "frontend" / "dist"
    index_html = frontend_dist / "index.html"
    if index_html.is_file():
        from starlette.responses import FileResponse
        return FileResponse(index_html)
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
        accumulated = []
        try:
            started = time.monotonic()
            first_token = True
            for token in stream_gemini_response(message, request.history, request.wellbeing_context):
                if first_token:
                    first_token = False
                    ttft_ms = int((time.monotonic() - started) * 1000)
                    print(f"GEMINI STREAM TTFT: {ttft_ms}ms")
                accumulated.append(token)
                yield json.dumps({"type": "token", "content": token}) + "\n"

            full_text = "".join(accumulated).strip()
            if not full_text:
                fallback_msg = supportive_fallback_response(message)
                yield json.dumps({"type": "token", "content": fallback_msg}) + "\n"
                yield json.dumps({"type": "fallback", "source": "empty_stream"}) + "\n"

            yield json.dumps({"type": "done"}) + "\n"
        except Exception as exc:
            print("GEMINI STREAM ERROR:", exc)
            if not accumulated:
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
