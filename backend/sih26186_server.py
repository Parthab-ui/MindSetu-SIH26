import json
import uuid
from datetime import datetime, timezone

import requests
from fastapi import HTTPException
from pydantic import BaseModel, Field

from main import OLLAMA_MODEL, OLLAMA_URL, app, get_connection, session_exists


# =========================================================
# SIH26186 DATA MODELS
# =========================================================

class SIH26186WellnessRequest(BaseModel):
    session_id: uuid.UUID
    answers: list[int] = Field(..., min_length=6, max_length=6)


class SIH26186WorkloadRequest(BaseModel):
    session_id: uuid.UUID
    role: str = Field(..., min_length=2, max_length=120)
    unit: str = Field(default="", max_length=120)
    duty_hours: float = Field(..., ge=0, le=24)
    night_duties: int = Field(..., ge=0, le=14)
    rest_hours: float = Field(..., ge=0, le=24)
    days_since_leave: int = Field(..., ge=0, le=90)
    workload_level: int = Field(..., ge=1, le=5)
    high_pressure_assignment: bool = False
    duty_change_frequency: int = Field(default=0, ge=0, le=7)


# =========================================================
# SIH26186 DATABASE
# =========================================================

def ensure_sih26186_tables():
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                CREATE TABLE IF NOT EXISTS sih26186_wellness (
                    id UUID PRIMARY KEY,
                    session_id UUID NOT NULL REFERENCES sessions(id),
                    answers JSONB NOT NULL,
                    stress_score NUMERIC(6,2) NOT NULL,
                    created_at TIMESTAMP DEFAULT NOW()
                );

                CREATE TABLE IF NOT EXISTS sih26186_workload (
                    id UUID PRIMARY KEY,
                    session_id UUID NOT NULL REFERENCES sessions(id),
                    role VARCHAR(120) NOT NULL,
                    unit VARCHAR(120),
                    duty_hours NUMERIC(5,2) NOT NULL,
                    night_duties INTEGER NOT NULL,
                    rest_hours NUMERIC(5,2) NOT NULL,
                    days_since_leave INTEGER NOT NULL,
                    workload_level INTEGER NOT NULL,
                    high_pressure_assignment BOOLEAN NOT NULL DEFAULT FALSE,
                    duty_change_frequency INTEGER NOT NULL DEFAULT 0,
                    workload_score NUMERIC(6,2) NOT NULL,
                    created_at TIMESTAMP DEFAULT NOW()
                );

                CREATE TABLE IF NOT EXISTS sih26186_analysis (
                    id UUID PRIMARY KEY,
                    session_id UUID NOT NULL REFERENCES sessions(id),
                    wellness_score NUMERIC(6,2) NOT NULL,
                    workload_score NUMERIC(6,2) NOT NULL,
                    combined_score NUMERIC(6,2) NOT NULL,
                    risk_level VARCHAR(20) NOT NULL,
                    recommendation TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT NOW()
                );
                """
            )


def _require_session(session_id: uuid.UUID):
    if not session_exists(session_id):
        raise HTTPException(status_code=404, detail="Session not found.")


def _latest_wellness(session_id):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT stress_score
                FROM sih26186_wellness
                WHERE session_id = %s
                ORDER BY created_at DESC
                LIMIT 1
                """,
                (session_id,),
            )
            row = cur.fetchone()
            return float(row[0]) if row else None


def _latest_workload(session_id):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT role, unit, duty_hours, night_duties, rest_hours,
                       days_since_leave, workload_level,
                       high_pressure_assignment, duty_change_frequency,
                       workload_score
                FROM sih26186_workload
                WHERE session_id = %s
                ORDER BY created_at DESC
                LIMIT 1
                """,
                (session_id,),
            )
            row = cur.fetchone()
            if not row:
                return None
            return {
                "role": row[0],
                "unit": row[1] or "",
                "duty_hours": float(row[2]),
                "night_duties": row[3],
                "rest_hours": float(row[4]),
                "days_since_leave": row[5],
                "workload_level": row[6],
                "high_pressure_assignment": row[7],
                "duty_change_frequency": row[8],
                "workload_score": float(row[9]),
            }


# =========================================================
# SCORING
# =========================================================


def _validate_answers(answers):
    if any(answer < 0 or answer > 3 for answer in answers):
        raise HTTPException(
            status_code=400,
            detail="Each wellness answer must be between 0 and 3.",
        )


def _calculate_wellness_stress(answers):
    _validate_answers(answers)
    return round((sum(answers) / 18) * 100, 2)


def _calculate_workload_score(request: SIH26186WorkloadRequest):
    duty = min(request.duty_hours / 12, 1) * 25
    night = min(request.night_duties / 7, 1) * 15
    rest = max(0, (8 - request.rest_hours) / 8) * 15
    leave = min(request.days_since_leave / 30, 1) * 10
    workload = ((request.workload_level - 1) / 4) * 20
    pressure = 10 if request.high_pressure_assignment else 0
    change = min(request.duty_change_frequency / 5, 1) * 5
    return round(min(100, duty + night + rest + leave + workload + pressure + change), 2)


def _classify(wellness_score, workload_score):
    combined = round((wellness_score * 0.55) + (workload_score * 0.45), 2)

    if combined >= 70 or wellness_score >= 80 or workload_score >= 85:
        return combined, "high"

    if combined >= 45 or wellness_score >= 50 or workload_score >= 60:
        return combined, "moderate"

    return combined, "low"


def _fallback_recommendation(risk_level, workload):
    if risk_level == "high":
        return (
            "Prioritise an immediate welfare check-in. Review non-essential workload, "
            "protect recovery time, and connect the person with the appropriate welfare "
            "or qualified mental-health support channel. This is a welfare triage signal, "
            "not a clinical diagnosis."
        )

    if risk_level == "moderate":
        return (
            "Schedule a welfare follow-up, review duty load and recovery time, and consider "
            "temporary workload adjustments or protected rest. Repeat the check-in within a week."
        )

    return (
        "Current signals are low concern. Maintain healthy rest and workload practices, "
        "and repeat the welfare check-in periodically or after a major duty change."
    )


def _ai_recommendation(risk_level, wellness_score, workload_score, workload):
    fallback = _fallback_recommendation(risk_level, workload)
    prompt = f"""
You are a welfare-support assistant for SIH26186.
Do not diagnose, provide medical treatment, or make disciplinary decisions.
Return only a concise welfare recommendation for a personnel welfare dashboard.

Risk level: {risk_level}
Wellness stress score (0-100): {wellness_score}
Workload score (0-100): {workload_score}
Role: {workload['role']}
Unit: {workload['unit']}
Duty hours/day: {workload['duty_hours']}
Night duties in recent period: {workload['night_duties']}
Rest hours/day: {workload['rest_hours']}
Days since leave: {workload['days_since_leave']}
Workload intensity: {workload['workload_level']}/5
High-pressure assignment: {workload['high_pressure_assignment']}
Duty changes: {workload['duty_change_frequency']}/7

Give 2-4 practical welfare actions. Emphasise rest, workload review,
manager/welfare-officer check-ins, and qualified professional support when appropriate.
Do not label the person with a disorder.
"""

    try:
        response = requests.post(
            OLLAMA_URL,
            json={
                "model": OLLAMA_MODEL,
                "stream": False,
                "think": False,
                "messages": [
                    {
                        "role": "system",
                        "content": "You provide concise non-clinical personnel welfare recommendations.",
                    },
                    {"role": "user", "content": prompt},
                ],
                "options": {
                    "temperature": 0.35,
                    "top_p": 0.8,
                    "num_ctx": 2048,
                    "num_predict": 180,
                },
            },
            timeout=(5, 45),
        )
        if response.status_code == 200:
            data = response.json()
            text = ((data.get("message") or {}).get("content") or "").strip()
            if text:
                return text
    except requests.RequestException:
        pass
    except (ValueError, TypeError):
        pass

    return fallback


@app.on_event("startup")
def startup_sih26186():
    ensure_sih26186_tables()


# =========================================================
# SIH26186 API
# =========================================================

@app.post("/api/sih26186/wellness")
def save_sih26186_wellness(request: SIH26186WellnessRequest):
    _require_session(request.session_id)
    stress_score = _calculate_wellness_stress(request.answers)

    record_id = uuid.uuid4()
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO sih26186_wellness
                (id, session_id, answers, stress_score)
                VALUES (%s, %s, %s::jsonb, %s)
                """,
                (
                    record_id,
                    request.session_id,
                    json.dumps(request.answers),
                    stress_score,
                ),
            )

    return {
        "id": str(record_id),
        "stress_score": stress_score,
        "message": "Wellness assessment recorded.",
    }


@app.post("/api/sih26186/workload")
def save_sih26186_workload(request: SIH26186WorkloadRequest):
    _require_session(request.session_id)
    workload_score = _calculate_workload_score(request)

    record_id = uuid.uuid4()
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO sih26186_workload
                (
                    id, session_id, role, unit, duty_hours, night_duties,
                    rest_hours, days_since_leave, workload_level,
                    high_pressure_assignment, duty_change_frequency,
                    workload_score
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """,
                (
                    record_id,
                    request.session_id,
                    request.role.strip(),
                    request.unit.strip(),
                    request.duty_hours,
                    request.night_duties,
                    request.rest_hours,
                    request.days_since_leave,
                    request.workload_level,
                    request.high_pressure_assignment,
                    request.duty_change_frequency,
                    workload_score,
                ),
            )

    return {
        "id": str(record_id),
        "workload_score": workload_score,
        "message": "Workload and duty information recorded.",
    }


@app.post("/api/sih26186/analyze/{session_id}")
def analyze_sih26186(session_id: uuid.UUID):
    _require_session(session_id)
    wellness_score = _latest_wellness(session_id)
    workload = _latest_workload(session_id)

    if wellness_score is None:
        raise HTTPException(status_code=400, detail="Complete the wellness assessment first.")

    if workload is None:
        raise HTTPException(status_code=400, detail="Complete workload and duty information first.")

    combined_score, risk_level = _classify(wellness_score, workload["workload_score"])
    recommendation = _ai_recommendation(
        risk_level,
        wellness_score,
        workload["workload_score"],
        workload,
    )

    analysis_id = uuid.uuid4()
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO sih26186_analysis
                (
                    id, session_id, wellness_score, workload_score,
                    combined_score, risk_level, recommendation
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                """,
                (
                    analysis_id,
                    session_id,
                    wellness_score,
                    workload["workload_score"],
                    combined_score,
                    risk_level,
                    recommendation,
                ),
            )

    return {
        "analysis_id": str(analysis_id),
        "session_id": str(session_id),
        "wellness_score": wellness_score,
        "workload_score": workload["workload_score"],
        "combined_score": combined_score,
        "risk_level": risk_level,
        "recommendation": recommendation,
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }


@app.get("/api/sih26186/dashboard/{session_id}")
def sih26186_dashboard(session_id: uuid.UUID):
    _require_session(session_id)

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT wellness_score, workload_score, combined_score,
                       risk_level, recommendation, created_at
                FROM sih26186_analysis
                WHERE session_id = %s
                ORDER BY created_at DESC
                LIMIT 1
                """,
                (session_id,),
            )
            row = cur.fetchone()

    if not row:
        raise HTTPException(status_code=404, detail="No SIH26186 analysis found for this session.")

    return {
        "wellness_score": float(row[0]),
        "workload_score": float(row[1]),
        "combined_score": float(row[2]),
        "risk_level": row[3],
        "recommendation": row[4],
        "created_at": row[5].isoformat(),
    }
