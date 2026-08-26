import json
import os
import uuid
from datetime import datetime, timezone

import psycopg
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

load_dotenv()


# =========================================================
# CONFIGURATION
# =========================================================

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
GEMINI_TIMEOUT_MS = int(os.getenv("GEMINI_TIMEOUT_MS", "20000"))

MAX_CHAT_LENGTH = 4000
MAX_MOOD_NOTE_LENGTH = 1000


# =========================================================
# APP
# =========================================================

app = FastAPI(
    title="MindSetu API",
    description="Digital Mental Health & Psychological Support Platform",
    version="1.2.0"
)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


# =========================================================
# SECURITY HEADERS
# =========================================================

@app.middleware("http")
async def security_headers(request: Request, call_next):

    response = await call_next(request)

    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "no-referrer"
    response.headers["Cache-Control"] = "no-store"

    return response


# =========================================================
# DATABASE
# =========================================================

def get_connection():

    password = os.getenv("DB_PASSWORD")

    if not password:

        raise RuntimeError(
            "DB_PASSWORD is missing from the environment."
        )

    return psycopg.connect(
        host=os.getenv(
            "DB_HOST",
            "localhost"
        ),
        port=os.getenv(
            "DB_PORT",
            "5432"
        ),
        dbname=os.getenv(
            "DB_NAME",
            "mindsetu_db"
        ),
        user=os.getenv(
            "DB_USER",
            "postgres"
        ),
        password=password,
    )


# =========================================================
# REQUEST MODELS
# =========================================================

class SessionRequest(BaseModel):
    consent_given: bool = True


class AssessmentRequest(BaseModel):
    session_id: uuid.UUID

    answers: list[int] = Field(
        ...,
        min_length=7,
        max_length=9
    )


class ChatRequest(BaseModel):
    session_id: uuid.UUID

    message: str = Field(
        ...,
        min_length=1,
        max_length=MAX_CHAT_LENGTH
    )


class MoodRequest(BaseModel):
    session_id: uuid.UUID

    mood: int = Field(
        ...,
        ge=1,
        le=5
    )

    note: str | None = Field(
        default=None,
        max_length=MAX_MOOD_NOTE_LENGTH
    )


class AppointmentRequest(BaseModel):
    session_id: uuid.UUID
    counsellor_id: uuid.UUID
    appointment_time: str


# =========================================================
# SESSION VALIDATION
# =========================================================

def session_exists(session_id):

    with get_connection() as conn:

        with conn.cursor() as cur:

            cur.execute(
                """
                SELECT id
                FROM sessions
                WHERE id = %s
                """,
                (session_id,)
            )

            return cur.fetchone() is not None


def require_session(session_id):

    if not session_exists(session_id):

        raise HTTPException(
            status_code=404,
            detail="Session not found."
        )


# =========================================================
# PHQ-9
# =========================================================

def calculate_phq9_score(answers):

    if len(answers) != 9:

        raise ValueError(
            "PHQ-9 requires exactly 9 answers."
        )

    if any(
        answer < 0 or answer > 3
        for answer in answers
    ):

        raise ValueError(
            "Each PHQ-9 answer must be between 0 and 3."
        )

    return sum(answers)


def classify_phq9(score):

    if score <= 4:
        return "minimal"

    if score <= 9:
        return "mild"

    if score <= 14:
        return "moderate"

    if score <= 19:
        return "moderately_severe"

    return "severe"


# =========================================================
# GAD-7
# =========================================================

def calculate_gad7_score(answers):

    if len(answers) != 7:

        raise ValueError(
            "GAD-7 requires exactly 7 answers."
        )

    if any(
        answer < 0 or answer > 3
        for answer in answers
    ):

        raise ValueError(
            "Each GAD-7 answer must be between 0 and 3."
        )

    return sum(answers)


def classify_gad7(score):

    if score <= 4:
        return "minimal"

    if score <= 9:
        return "mild"

    if score <= 14:
        return "moderate"

    return "severe"


# =========================================================
# OVERALL RISK ENGINE
# =========================================================

def calculate_overall_risk(
    phq9_score,
    gad7_score
):

    highest_score = max(
        phq9_score,
        gad7_score
    )

    if highest_score >= 15:

        return {
            "risk_level": "high",
            "support_path": "professional_support"
        }

    if highest_score >= 10:

        return {
            "risk_level": "moderate",
            "support_path": "guided_support"
        }

    if highest_score >= 5:

        return {
            "risk_level": "mild",
            "support_path": "self_help"
        }

    return {
        "risk_level": "low",
        "support_path": "self_help"
    }


def get_latest_assessments(session_id):

    with get_connection() as conn:

        with conn.cursor() as cur:

            cur.execute(
                """
                SELECT
                    assessment_type,
                    total_score
                FROM assessments
                WHERE session_id = %s
                ORDER BY created_at DESC
                """,
                (session_id,)
            )

            rows = cur.fetchall()

    phq9_score = None
    gad7_score = None

    for assessment_type, score in rows:

        if (
            assessment_type == "PHQ-9"
            and phq9_score is None
        ):

            phq9_score = score

        elif (
            assessment_type == "GAD-7"
            and gad7_score is None
        ):

            gad7_score = score

    return phq9_score, gad7_score


# =========================================================
# BASIC ENDPOINTS
# =========================================================

@app.get("/")
def root():

    return {
        "message": "MindSetu API is running",
        "status": "success",
        "ai_model": GEMINI_MODEL
    }


@app.get("/api/health")
def health_check():

    return {
        "status": "healthy",
        "service": "MindSetu Backend",
        "ai_model": GEMINI_MODEL
    }


@app.get("/api/database")
def database_check():

    try:

        with get_connection() as conn:

            with conn.cursor() as cur:

                cur.execute(
                    "SELECT current_database();"
                )

                database = cur.fetchone()[0]

        return {
            "status": "connected",
            "database": database
        }

    except Exception:

        raise HTTPException(
            status_code=503,
            detail="Database connection unavailable."
        )


# =========================================================
# ANONYMOUS SESSION
# =========================================================

@app.post("/api/sessions")
def create_session(
    request: SessionRequest
):

    if not request.consent_given:

        raise HTTPException(
            status_code=400,
            detail="Consent is required before starting."
        )

    session_id = uuid.uuid4()

    try:

        with get_connection() as conn:

            with conn.cursor() as cur:

                cur.execute(
                    """
                    INSERT INTO sessions
                    (
                        id,
                        anonymous,
                        consent_given
                    )
                    VALUES
                    (
                        %s,
                        %s,
                        %s
                    )
                    """,
                    (
                        session_id,
                        True,
                        True
                    )
                )

    except Exception:

        raise HTTPException(
            status_code=503,
            detail="Unable to create session."
        )

    return {
        "session_id": str(session_id),
        "anonymous": True,
        "consent_given": True
    }


# =========================================================
# PHQ-9
# =========================================================

@app.post("/api/assessments/phq9")
def submit_phq9(
    request: AssessmentRequest
):

    if len(request.answers) != 9:

        raise HTTPException(
            status_code=400,
            detail="PHQ-9 requires exactly 9 answers."
        )

    require_session(
        request.session_id
    )

    try:

        score = calculate_phq9_score(
            request.answers
        )

    except ValueError as error:

        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    severity = classify_phq9(score)

    assessment_id = uuid.uuid4()

    try:

        with get_connection() as conn:

            with conn.cursor() as cur:

                cur.execute(
                    """
                    INSERT INTO assessments
                    (
                        id,
                        session_id,
                        assessment_type,
                        total_score,
                        risk_level
                    )
                    VALUES
                    (
                        %s,
                        %s,
                        %s,
                        %s,
                        %s
                    )
                    """,
                    (
                        assessment_id,
                        request.session_id,
                        "PHQ-9",
                        score,
                        severity
                    )
                )

                for question_number, answer in enumerate(
                    request.answers,
                    start=1
                ):

                    cur.execute(
                        """
                        INSERT INTO assessment_responses
                        (
                            id,
                            assessment_id,
                            question_number,
                            answer
                        )
                        VALUES
                        (
                            %s,
                            %s,
                            %s,
                            %s
                        )
                        """,
                        (
                            uuid.uuid4(),
                            assessment_id,
                            question_number,
                            answer
                        )
                    )

    except Exception:

        raise HTTPException(
            status_code=503,
            detail="Unable to save PHQ-9 assessment."
        )

    return {
        "assessment_id": str(
            assessment_id
        ),
        "assessment": "PHQ-9",
        "score": score,
        "severity": severity,
        "message": "Assessment recorded successfully."
    }


# =========================================================
# GAD-7
# =========================================================

@app.post("/api/assessments/gad7")
def submit_gad7(
    request: AssessmentRequest
):

    if len(request.answers) != 7:

        raise HTTPException(
            status_code=400,
            detail="GAD-7 requires exactly 7 answers."
        )

    require_session(
        request.session_id
    )

    try:

        score = calculate_gad7_score(
            request.answers
        )

    except ValueError as error:

        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    severity = classify_gad7(score)

    assessment_id = uuid.uuid4()

    try:

        with get_connection() as conn:

            with conn.cursor() as cur:

                cur.execute(
                    """
                    INSERT INTO assessments
                    (
                        id,
                        session_id,
                        assessment_type,
                        total_score,
                        risk_level
                    )
                    VALUES
                    (
                        %s,
                        %s,
                        %s,
                        %s,
                        %s
                    )
                    """,
                    (
                        assessment_id,
                        request.session_id,
                        "GAD-7",
                        score,
                        severity
                    )
                )

                for question_number, answer in enumerate(
                    request.answers,
                    start=1
                ):

                    cur.execute(
                        """
                        INSERT INTO assessment_responses
                        (
                            id,
                            assessment_id,
                            question_number,
                            answer
                        )
                        VALUES
                        (
                            %s,
                            %s,
                            %s,
                            %s
                        )
                        """,
                        (
                            uuid.uuid4(),
                            assessment_id,
                            question_number,
                            answer
                        )
                    )

    except Exception:

        raise HTTPException(
            status_code=503,
            detail="Unable to save GAD-7 assessment."
        )

    return {
        "assessment_id": str(
            assessment_id
        ),
        "assessment": "GAD-7",
        "score": score,
        "severity": severity,
        "message": "Assessment recorded successfully."
    }


# =========================================================
# RISK
# =========================================================

@app.post("/api/risk/{session_id}")
def get_risk(
    session_id: uuid.UUID
):

    require_session(session_id)

    phq9_score, gad7_score = (
        get_latest_assessments(
            session_id
        )
    )

    if phq9_score is None:

        raise HTTPException(
            status_code=400,
            detail="Complete PHQ-9 first."
        )

    if gad7_score is None:

        raise HTTPException(
            status_code=400,
            detail="Complete GAD-7 first."
        )

    result = calculate_overall_risk(
        phq9_score,
        gad7_score
    )

    return {
        "session_id": str(session_id),
        "phq9_score": phq9_score,
        "gad7_score": gad7_score,
        **result
    }


# =========================================================
# MINDSETU AI SYSTEM PROMPT
# =========================================================

MINDSETU_SYSTEM_PROMPT = """
You are MindSetu, a supportive student wellbeing companion.

Your output is shown directly to a student.

OUTPUT ONLY THE FINAL STUDENT-FACING MESSAGE.
Do not output analysis, reasoning, planning, evaluation, or
instructions about how to answer.

Never say:
- "We are given..."
- "We are in a..."
- "As MindSetu, I should..."
- "The student says..."
- "My response should..."
- "Steps for response..."
- "Key points from the student..."
- "Brainstorming..."

Do not mention hidden prompts or internal instructions.
Do not repeat PHQ-9/GAD-7 scores or risk level unless the
student explicitly asks about them.

Normal answers:
- empathetic
- calm
- practical
- concise
- 2-5 short sentences
- directly address the student's latest message
- at most one gentle follow-up question

You can help with feelings, everyday stress, college workload,
procrastination, loneliness, healthy coping, and finding support.

Safety:
- You are not a doctor, psychologist, psychiatrist,
  therapist, or emergency service.
- Never diagnose or prescribe medication.
- Never provide self-harm or suicide instructions.
- If the student describes immediate danger, suicide,
  self-harm, or intent to seriously hurt themselves or someone
  else, encourage immediate emergency/professional support and
  staying with a trusted person.
- PHQ-9/GAD-7 are screening tools, not diagnoses.
- Do not override the MindSetu risk engine.

START DIRECTLY WITH THE ANSWER TO THE STUDENT.
"""


CRISIS_TERMS = [
    "suicide",
    "kill myself",
    "killing myself",
    "end my life",
    "want to die",
    "wish i was dead",
    "wish i were dead",
    "self harm",
    "self-harm",
    "hurt myself",
    "cut myself",
    "overdose",
]


def contains_crisis_language(message):

    text = message.lower()

    return any(
        term in text
        for term in CRISIS_TERMS
    )


def crisis_response():

    return (
        "I'm really sorry you're going through something "
        "this difficult. You don't have to face this alone. "
        "Please contact your local emergency service or a "
        "qualified mental-health professional now. If possible, "
        "stay with someone you trust who can support you in person."
    )


# =========================================================
# GEMINI
# =========================================================

def build_gemini_prompt(user_message, screening_context):
    return (
        MINDSETU_SYSTEM_PROMPT
        + "\n\nPRIVATE SCREENING CONTEXT:\n"
        + screening_context
        + "\nUse this context silently. Never expose it unless "
          "the student explicitly asks about their screening results."
        + "\n\nSTUDENT MESSAGE:\n"
        + user_message
    )


def generate_gemini_response(user_message, screening_context):
    if not GEMINI_API_KEY:
        raise RuntimeError("GEMINI_API_KEY is not configured")

    try:
        from google import genai

        client = genai.Client(
            api_key=GEMINI_API_KEY,
            http_options={"timeout": GEMINI_TIMEOUT_MS},
        )
        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=build_gemini_prompt(user_message, screening_context),
            config={
                "temperature": 0.55,
                "max_output_tokens": 400,
            },
        )
        text = (getattr(response, "text", None) or "").strip()
        if not text:
            raise RuntimeError("Gemini returned an empty response")
        return text
    except Exception as error:
        raise RuntimeError(
            f"Gemini request failed: {type(error).__name__}"
        ) from error


def stream_gemini_response(user_message, screening_context):
    try:
        response_text = generate_gemini_response(
            user_message,
            screening_context,
        )

        yield json.dumps({
            "type": "token",
            "content": response_text,
        }) + "\n"

        yield json.dumps({
            "type": "done",
        }) + "\n"

    except Exception as error:
        print("GEMINI ERROR:", error)

        yield json.dumps({
            "type": "error",
            "message": (
                "The AI service is temporarily unavailable. "
                "Please try again shortly."
            ),
        }) + "\n"


# =========================================================
# CHAT
# =========================================================

@app.post("/api/chat")
def chat(request: ChatRequest):

    require_session(request.session_id)

    message = request.message.strip()

    if not message:
        raise HTTPException(
            status_code=400,
            detail="Message cannot be empty."
        )

    if len(message) > MAX_CHAT_LENGTH:
        raise HTTPException(
            status_code=400,
            detail="Message is too long."
        )

    # Handle obvious crisis language before calling the model.
    if contains_crisis_language(message):

        def crisis_stream():

            yield json.dumps({
                "type": "start",
                "model": "safety_response",
                "risk_level": "safety_priority",
            }) + "\n"

            yield json.dumps({
                "type": "token",
                "content": crisis_response(),
            }) + "\n"

            yield json.dumps({
                "type": "done",
            }) + "\n"

        return StreamingResponse(
            crisis_stream(),
            media_type="application/x-ndjson",
            headers={
                "Cache-Control": "no-cache, no-transform",
                "X-Accel-Buffering": "no",
            },
        )

    screening_context, risk_level = get_screening_context(
        request.session_id
    )

    def response_generator():

        yield json.dumps({
            "type": "start",
            "model": GEMINI_MODEL,
            "risk_level": risk_level,
        }) + "\n"

        yield from stream_gemini_response(
            message,
            screening_context,
        )

    return StreamingResponse(
        response_generator(),
        media_type="application/x-ndjson",
        headers={
            "Cache-Control": "no-cache, no-transform",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        },
    )


# =========================================================
# MOOD TRACKING
# =========================================================

@app.post("/api/mood")
def add_mood(
    request: MoodRequest
):

    require_session(
        request.session_id
    )

    note = (
        request.note.strip()
        if request.note
        else None
    )

    mood_id = uuid.uuid4()

    try:

        with get_connection() as conn:

            with conn.cursor() as cur:

                cur.execute(
                    """
                    INSERT INTO mood_entries
                    (
                        id,
                        session_id,
                        mood,
                        note
                    )
                    VALUES
                    (
                        %s,
                        %s,
                        %s,
                        %s
                    )
                    """,
                    (
                        mood_id,
                        request.session_id,
                        request.mood,
                        note
                    )
                )

    except Exception:

        raise HTTPException(
            status_code=503,
            detail="Unable to save mood entry."
        )

    return {
        "id": str(mood_id),
        "mood": request.mood,
        "note": note,
        "message": "Mood entry saved successfully."
    }


@app.get("/api/mood/{session_id}")
def get_mood_history(
    session_id: uuid.UUID
):

    require_session(
        session_id
    )

    try:

        with get_connection() as conn:

            with conn.cursor() as cur:

                cur.execute(
                    """
                    SELECT
                        mood,
                        note,
                        created_at
                    FROM mood_entries
                    WHERE session_id = %s
                    ORDER BY created_at DESC
                    """,
                    (session_id,)
                )

                rows = cur.fetchall()

    except Exception:

        raise HTTPException(
            status_code=503,
            detail="Unable to retrieve mood history."
        )

    return {
        "session_id": str(session_id),
        "entries": [
            {
                "mood": row[0],
                "note": row[1],
                "created_at": row[2].isoformat()
            }
            for row in rows
        ]
    }


# =========================================================
# COUNSELLORS
# =========================================================

@app.get("/api/counsellors")
def get_counsellors():

    try:

        with get_connection() as conn:

            with conn.cursor() as cur:

                cur.execute(
                    """
                    SELECT
                        id,
                        name,
                        specialization,
                        available
                    FROM counsellors
                    ORDER BY name
                    """
                )

                rows = cur.fetchall()

    except Exception:

        raise HTTPException(
            status_code=503,
            detail="Unable to retrieve counsellors."
        )

    return {
        "counsellors": [
            {
                "id": str(row[0]),
                "name": row[1],
                "specialization": row[2],
                "available": row[3]
            }
            for row in rows
        ]
    }


# =========================================================
# APPOINTMENTS
# =========================================================

@app.post("/api/appointments")
def create_appointment(
    request: AppointmentRequest
):

    require_session(
        request.session_id
    )

    try:

        appointment_datetime = (
            datetime.fromisoformat(
                request.appointment_time.replace(
                    "Z",
                    "+00:00"
                )
            )
        )

    except ValueError:

        raise HTTPException(
            status_code=400,
            detail="Invalid appointment date/time."
        )

    if appointment_datetime.tzinfo is None:

        raise HTTPException(
            status_code=400,
            detail="Appointment time must include timezone."
        )

    if appointment_datetime <= datetime.now(
        timezone.utc
    ):

        raise HTTPException(
            status_code=400,
            detail="Appointment must be in the future."
        )

    try:

        with get_connection() as conn:

            with conn.cursor() as cur:

                cur.execute(
                    """
                    SELECT
                        id,
                        name,
                        available
                    FROM counsellors
                    WHERE id = %s
                    """,
                    (request.counsellor_id,)
                )

                counsellor = cur.fetchone()

                if counsellor is None:

                    raise HTTPException(
                        status_code=404,
                        detail="Counsellor not found."
                    )

                if not counsellor[2]:

                    raise HTTPException(
                        status_code=400,
                        detail="Counsellor is unavailable."
                    )

                cur.execute(
                    """
                    SELECT id
                    FROM appointments
                    WHERE counsellor_id = %s
                    AND appointment_time = %s
                    AND status = 'booked'
                    """,
                    (
                        request.counsellor_id,
                        appointment_datetime
                    )
                )

                if cur.fetchone() is not None:

                    raise HTTPException(
                        status_code=409,
                        detail="This slot is already booked."
                    )

                appointment_id = uuid.uuid4()

                cur.execute(
                    """
                    INSERT INTO appointments
                    (
                        id,
                        session_id,
                        counsellor_id,
                        appointment_time,
                        status
                    )
                    VALUES
                    (
                        %s,
                        %s,
                        %s,
                        %s,
                        %s
                    )
                    """,
                    (
                        appointment_id,
                        request.session_id,
                        request.counsellor_id,
                        appointment_datetime,
                        "booked"
                    )
                )

    except HTTPException:

        raise

    except Exception:

        raise HTTPException(
            status_code=503,
            detail="Unable to create appointment."
        )

    return {
        "appointment_id": str(
            appointment_id
        ),
        "counsellor_id": str(
            request.counsellor_id
        ),
        "counsellor_name": counsellor[1],
        "appointment_time":
            appointment_datetime.isoformat(),
        "status": "booked",
        "message": "Appointment booked successfully."
    }


@app.get("/api/appointments/{session_id}")
def get_appointments(
    session_id: uuid.UUID
):

    require_session(
        session_id
    )

    try:

        with get_connection() as conn:

            with conn.cursor() as cur:

                cur.execute(
                    """
                    SELECT
                        a.id,
                        c.name,
                        c.specialization,
                        a.appointment_time,
                        a.status
                    FROM appointments a
                    JOIN counsellors c
                        ON a.counsellor_id = c.id
                    WHERE a.session_id = %s
                    ORDER BY a.appointment_time DESC
                    """,
                    (session_id,)
                )

                rows = cur.fetchall()

    except Exception:

        raise HTTPException(
            status_code=503,
            detail="Unable to retrieve appointments."
        )

    return {
        "session_id": str(
            session_id
        ),
        "appointments": [
            {
                "appointment_id": str(row[0]),
                "counsellor_name": row[1],
                "specialization": row[2],
                "appointment_time":
                    row[3].isoformat(),
                "status": row[4]
            }
            for row in rows
        ]
    }


# =========================================================
# INSTITUTIONAL DASHBOARD
# =========================================================

@app.get("/api/dashboard/overview")
def dashboard_overview():

    try:

        with get_connection() as conn:

            with conn.cursor() as cur:

                cur.execute(
                    """
                    SELECT COUNT(*)
                    FROM sessions
                    WHERE anonymous = TRUE
                    """
                )

                total_sessions = cur.fetchone()[0]

                cur.execute(
                    """
                    SELECT COUNT(*)
                    FROM assessments
                    WHERE assessment_type = 'PHQ-9'
                    """
                )

                phq9_assessments = cur.fetchone()[0]

                cur.execute(
                    """
                    SELECT COUNT(*)
                    FROM assessments
                    WHERE assessment_type = 'GAD-7'
                    """
                )

                gad7_assessments = cur.fetchone()[0]

                cur.execute(
                    """
                    SELECT
                        risk_level,
                        COUNT(*)
                    FROM assessments
                    GROUP BY risk_level
                    """
                )

                risk_rows = cur.fetchall()

                cur.execute(
                    """
                    SELECT
                        COUNT(*),
                        COALESCE(AVG(mood), 0)
                    FROM mood_entries
                    """
                )

                mood_count, average_mood = (
                    cur.fetchone()
                )

                cur.execute(
                    """
                    SELECT
                        COUNT(*),
                        COUNT(*) FILTER (
                            WHERE status = 'booked'
                        )
                    FROM appointments
                    """
                )

                (
                    total_appointments,
                    booked_appointments
                ) = cur.fetchone()

                cur.execute(
                    """
                    SELECT COUNT(*)
                    FROM counsellors
                    WHERE available = TRUE
                    """
                )

                available_counsellors = (
                    cur.fetchone()[0]
                )

    except Exception:

        raise HTTPException(
            status_code=503,
            detail="Dashboard data is temporarily unavailable."
        )

    risk_distribution = {
        "minimal": 0,
        "mild": 0,
        "moderate": 0,
        "moderately_severe": 0,
        "severe": 0
    }

    for risk_level, count in risk_rows:

        if risk_level in risk_distribution:

            risk_distribution[
                risk_level
            ] = count

    return {
        "sessions": {
            "total_anonymous_sessions":
                total_sessions
        },
        "assessments": {
            "phq9":
                phq9_assessments,
            "gad7":
                gad7_assessments
        },
        "risk_distribution":
            risk_distribution,
        "mood": {
            "total_entries":
                mood_count,
            "average_mood":
                round(
                    float(average_mood),
                    2
                )
        },
        "appointments": {
            "total":
                total_appointments,
            "booked":
                booked_appointments
        },
        "counsellors": {
            "available":
                available_counsellors
        },
        "privacy": {
            "student_names_exposed":
                False,
            "student_profiles_exposed":
                False,
            "data_type":
                "aggregate_only"
        }
    }


# =========================================================
# DASHBOARD MOOD TREND
# =========================================================

@app.get("/api/dashboard/mood-trend")
def dashboard_mood_trend():

    try:

        with get_connection() as conn:

            with conn.cursor() as cur:

                cur.execute(
                    """
                    SELECT
                        DATE(created_at),
                        ROUND(
                            AVG(mood)::numeric,
                            2
                        ),
                        COUNT(*)
                    FROM mood_entries
                    GROUP BY DATE(created_at)
                    ORDER BY DATE(created_at) DESC
                    LIMIT 30
                    """
                )

                rows = cur.fetchall()

    except Exception:

        raise HTTPException(
            status_code=503,
            detail="Mood trend is temporarily unavailable."
        )

    return {
        "trend": [
            {
                "date":
                    row[0].isoformat(),
                "average_mood":
                    float(row[1]),
                "entries":
                    row[2]
            }
            for row in reversed(rows)
        ]
    }


# =========================================================
# DASHBOARD ASSESSMENTS
# =========================================================

@app.get("/api/dashboard/assessments")
def dashboard_assessments():

    try:

        with get_connection() as conn:

            with conn.cursor() as cur:

                cur.execute(
                    """
                    SELECT
                        assessment_type,
                        risk_level,
                        COUNT(*)
                    FROM assessments
                    GROUP BY
                        assessment_type,
                        risk_level
                    ORDER BY
                        assessment_type,
                        risk_level
                    """
                )

                rows = cur.fetchall()

    except Exception:

        raise HTTPException(
            status_code=503,
            detail="Assessment statistics are unavailable."
        )

    result = {
        "PHQ-9": {},
        "GAD-7": {}
    }

    for (
        assessment_type,
        risk_level,
        count
    ) in rows:

        if assessment_type in result:

            result[
                assessment_type
            ][risk_level] = count

    return {
        "assessments": result
    }