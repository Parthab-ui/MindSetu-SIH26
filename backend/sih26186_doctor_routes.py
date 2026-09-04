"""MindSetu-SIH26 — Doctor Directory, Appointment Scheduling & Consultation Routes.

Provides:
- Doctor directory listing with specialization & availability filters
- Doctor profile retrieval
- Dynamic slot availability calculation
- Conflict-safe appointment booking with double-booking prevention
- Appointment listing (upcoming / past) for a protected session
- Appointment cancellation
"""
import json
import uuid
from datetime import date, datetime, timedelta, timezone
from typing import List, Optional

from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel, Field

def get_connection():
    import main
    return main.get_connection()

DEFAULT_SLOTS = ["09:30", "11:00", "14:30", "16:00", "18:00"]

SEEDED_DOCTORS = [
    {
        "id": "e0a1b2c3-0001-4000-8000-000000000001",
        "name": "Dr. Vikramaditya Rao",
        "specialization": "Military & Operational Stress Psychiatrist",
        "qualification": "M.B.B.S., M.D. (Psychiatry), D.N.B.",
        "experience_years": 16,
        "bio": "Former military consulting psychiatrist specializing in acute operational exhaustion, hypervigilance de-escalation, and tactical stress recovery for field personnel.",
        "avatar_color": "#14b8a6",
        "rating": 4.9,
        "review_count": 52,
        "focus_areas": ["Operational Stress", "Sleep Architecture", "Duty Exhaustion"],
        "availability_status": "Available today",
    },
    {
        "id": "e0a1b2c3-0002-4000-8000-000000000002",
        "name": "Dr. Neha Sen",
        "specialization": "Clinical Psychologist & Trauma Specialist",
        "qualification": "M.Phil. (Clinical Psychology), Ph.D.",
        "experience_years": 11,
        "bio": "Clinical psychologist with extensive experience in CAPF, disaster response, and trauma-informed cognitive regulation for high-stress frontline responders.",
        "avatar_color": "#38bdf8",
        "rating": 4.9,
        "review_count": 44,
        "focus_areas": ["Trauma & PTSD", "Grounding Protocols", "Emotional Pacing"],
        "availability_status": "Available today",
    },
    {
        "id": "e0a1b2c3-0003-4000-8000-000000000003",
        "name": "Dr. Aris Thorne",
        "specialization": "Defense Behavioral Health Consultant",
        "qualification": "M.Sc., Psy.D. (Behavioral Health)",
        "experience_years": 14,
        "bio": "Specialist in post-mission decompression, prolonged isolation stress, and reintegration protocols for defense and strategic service members.",
        "avatar_color": "#818cf8",
        "rating": 4.8,
        "review_count": 39,
        "focus_areas": ["Reintegration Pacing", "Hyperarousal", "Peer Stress"],
        "availability_status": "Available tomorrow",
    },
    {
        "id": "e0a1b2c3-0004-4000-8000-000000000004",
        "name": "Dr. Priya Menakshi",
        "specialization": "CAPF & Shift Work Recovery Specialist",
        "qualification": "M.B.B.S., D.P.M. (Psychological Medicine)",
        "experience_years": 9,
        "bio": "Focuses on circadian disruption, high-rotation night duties, cumulative fatigue management, and burn-out prevention in police and paramilitary services.",
        "avatar_color": "#f59e0b",
        "rating": 4.9,
        "review_count": 47,
        "focus_areas": ["Circadian Recovery", "Night Shift Strain", "Burnout Prevention"],
        "availability_status": "Available today",
    },
]


def ensure_doctor_tables():
    """Idempotently create doctor & appointment tables in Neon PostgreSQL."""
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                CREATE TABLE IF NOT EXISTS doctors (
                    id UUID PRIMARY KEY,
                    name VARCHAR(140) NOT NULL,
                    specialization VARCHAR(140) NOT NULL,
                    qualification VARCHAR(255) NOT NULL,
                    experience_years INTEGER NOT NULL,
                    bio TEXT NOT NULL,
                    avatar_color VARCHAR(30) DEFAULT '#14b8a6',
                    rating NUMERIC(3,1) DEFAULT 4.9,
                    review_count INTEGER DEFAULT 40,
                    focus_areas JSONB NOT NULL DEFAULT '[]'::jsonb,
                    availability_status VARCHAR(60) NOT NULL DEFAULT 'Available today',
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );

                CREATE TABLE IF NOT EXISTS appointments (
                    id UUID PRIMARY KEY,
                    session_id UUID NOT NULL REFERENCES sessions(id),
                    doctor_id UUID NOT NULL REFERENCES doctors(id),
                    appointment_date DATE NOT NULL,
                    appointment_time VARCHAR(10) NOT NULL,
                    status VARCHAR(30) NOT NULL DEFAULT 'confirmed',
                    meeting_id VARCHAR(80) NOT NULL,
                    notes TEXT,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );

                CREATE UNIQUE INDEX IF NOT EXISTS idx_active_doctor_slot
                ON appointments (doctor_id, appointment_date, appointment_time)
                WHERE status != 'cancelled';

                CREATE TABLE IF NOT EXISTS consultation_profiles (
                    id UUID PRIMARY KEY,
                    session_id UUID NOT NULL REFERENCES sessions(id),
                    age INTEGER NOT NULL,
                    role VARCHAR(120) NOT NULL,
                    gender VARCHAR(50) DEFAULT 'Prefer not to say',
                    years_of_service INTEGER,
                    posting_unit VARCHAR(120),
                    consultation_note TEXT,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );

                CREATE UNIQUE INDEX IF NOT EXISTS idx_consultation_profile_session
                ON consultation_profiles (session_id);
                """
            )

            # Seed demo doctors if table is empty
            cur.execute("SELECT COUNT(*) FROM doctors")
            count = cur.fetchone()[0]
            if count == 0:
                for doc in SEEDED_DOCTORS:
                    cur.execute(
                        """
                        INSERT INTO doctors
                        (id, name, specialization, qualification, experience_years, bio, avatar_color, rating, review_count, focus_areas, availability_status)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s::jsonb, %s)
                        ON CONFLICT (id) DO NOTHING
                        """,
                        (
                            doc["id"],
                            doc["name"],
                            doc["specialization"],
                            doc["qualification"],
                            doc["experience_years"],
                            doc["bio"],
                            doc["avatar_color"],
                            doc["rating"],
                            doc["review_count"],
                            json.dumps(doc["focus_areas"]),
                            doc["availability_status"],
                        ),
                    )


# ── Pydantic Request & Response Models ───────────────────────────────

class DoctorResponse(BaseModel):
    id: str
    name: str
    specialization: str
    qualification: str
    experience_years: int
    bio: str
    avatar_color: str
    rating: float
    review_count: int
    focus_areas: List[str]
    availability_status: str


class SlotInfo(BaseModel):
    time: str
    available: bool


class AvailabilityResponse(BaseModel):
    doctor_id: str
    date: str
    slots: List[SlotInfo]


class BookAppointmentRequest(BaseModel):
    session_id: uuid.UUID
    doctor_id: uuid.UUID
    appointment_date: str = Field(..., pattern=r"^\d{4}-\d{2}-\d{2}$")
    appointment_time: str = Field(..., pattern=r"^\d{2}:\d{2}$")
    notes: Optional[str] = Field(default=None, max_length=500)


class AppointmentResponse(BaseModel):
    id: str
    session_id: str
    doctor_id: str
    doctor_name: str
    doctor_specialization: str
    doctor_avatar_color: str
    appointment_date: str
    appointment_time: str
    status: str
    meeting_id: str
    notes: Optional[str] = None
    created_at: str


class AppointmentsListResponse(BaseModel):
    upcoming: List[AppointmentResponse]
    past: List[AppointmentResponse]


class ConsultationProfileCreate(BaseModel):
    session_id: uuid.UUID
    age: int = Field(..., ge=18, le=100, description="Age must be between 18 and 100")
    role: str = Field(..., min_length=1, max_length=120, description="Role or designation")
    gender: Optional[str] = Field(default="Prefer not to say", max_length=50)
    years_of_service: Optional[int] = Field(default=None, ge=0, le=60)
    posting_unit: Optional[str] = Field(default=None, max_length=120)
    consultation_note: Optional[str] = Field(default=None, max_length=1000)


class ConsultationProfileResponse(BaseModel):
    id: str
    session_id: str
    age: int
    role: str
    gender: str
    years_of_service: Optional[int] = None
    posting_unit: Optional[str] = None
    consultation_note: Optional[str] = None
    created_at: str


def _require_valid_session(session_id: uuid.UUID):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT id FROM sessions WHERE id = %s", (session_id,))
            if cur.fetchone() is None:
                raise HTTPException(status_code=404, detail="Active session not found.")


def register_doctor_routes(app: FastAPI):
    """Register all doctor and appointment management routes."""

    @app.get("/api/doctors", response_model=List[DoctorResponse])
    def list_doctors(
        specialization: Optional[str] = Query(None),
        availability: Optional[str] = Query(None),
    ):
        with get_connection() as conn:
            with conn.cursor() as cur:
                query = "SELECT id, name, specialization, qualification, experience_years, bio, avatar_color, rating, review_count, focus_areas, availability_status FROM doctors WHERE 1=1"
                params = []
                if specialization and specialization.lower() != "all":
                    query += " AND specialization ILIKE %s"
                    params.append(f"%{specialization.strip()}%")
                if availability and availability.lower() != "all":
                    query += " AND availability_status ILIKE %s"
                    params.append(f"%{availability.strip()}%")
                query += " ORDER BY rating DESC, experience_years DESC"

                cur.execute(query, tuple(params))
                rows = cur.fetchall()

        results = []
        for r in rows:
            focus = r[9] if isinstance(r[9], list) else (json.loads(r[9]) if r[9] else [])
            results.append(
                DoctorResponse(
                    id=str(r[0]),
                    name=r[1],
                    specialization=r[2],
                    qualification=r[3],
                    experience_years=r[4],
                    bio=r[5],
                    avatar_color=r[6] or "#14b8a6",
                    rating=float(r[7]),
                    review_count=r[8],
                    focus_areas=focus,
                    availability_status=r[10],
                )
            )
        return results

    @app.get("/api/doctors/{doctor_id}", response_model=DoctorResponse)
    def get_doctor(doctor_id: uuid.UUID):
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    "SELECT id, name, specialization, qualification, experience_years, bio, avatar_color, rating, review_count, focus_areas, availability_status FROM doctors WHERE id = %s",
                    (doctor_id,),
                )
                r = cur.fetchone()
                if not r:
                    raise HTTPException(status_code=404, detail="Doctor not found.")

        focus = r[9] if isinstance(r[9], list) else (json.loads(r[9]) if r[9] else [])
        return DoctorResponse(
            id=str(r[0]),
            name=r[1],
            specialization=r[2],
            qualification=r[3],
            experience_years=r[4],
            bio=r[5],
            avatar_color=r[6] or "#14b8a6",
            rating=float(r[7]),
            review_count=r[8],
            focus_areas=focus,
            availability_status=r[10],
        )

    @app.get("/api/doctors/{doctor_id}/availability", response_model=AvailabilityResponse)
    def get_doctor_availability(
        doctor_id: uuid.UUID,
        date_str: str = Query(..., alias="date", pattern=r"^\d{4}-\d{2}-\d{2}$"),
    ):
        # Validate doctor exists
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT id FROM doctors WHERE id = %s", (doctor_id,))
                if not cur.fetchone():
                    raise HTTPException(status_code=404, detail="Doctor not found.")

                # Find all currently booked active appointments for this doctor on this date
                cur.execute(
                    """
                    SELECT appointment_time FROM appointments
                    WHERE doctor_id = %s AND appointment_date = %s AND status != 'cancelled'
                    """,
                    (doctor_id, date_str),
                )
                booked_times = {row[0] for row in cur.fetchall()}

        slots = []
        for slot in DEFAULT_SLOTS:
            slots.append(SlotInfo(time=slot, available=(slot not in booked_times)))

        return AvailabilityResponse(doctor_id=str(doctor_id), date=date_str, slots=slots)

    @app.post("/api/appointments", response_model=AppointmentResponse)
    def book_appointment(req: BookAppointmentRequest):
        _require_valid_session(req.session_id)

        # Validate appointment date
        try:
            target_date = date.fromisoformat(req.appointment_date)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD.")

        # Ensure slot is in supported list
        if req.appointment_time not in DEFAULT_SLOTS:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid appointment slot. Supported slots are: {', '.join(DEFAULT_SLOTS)}",
            )

        appointment_id = uuid.uuid4()
        meeting_id = f"mindsetu-consult-{uuid.uuid4().hex[:12]}"

        with get_connection() as conn:
            with conn.cursor() as cur:
                # Validate doctor exists
                cur.execute(
                    "SELECT name, specialization, avatar_color FROM doctors WHERE id = %s",
                    (req.doctor_id,),
                )
                doc = cur.fetchone()
                if not doc:
                    raise HTTPException(status_code=404, detail="Doctor not found.")

                doc_name, doc_spec, doc_color = doc[0], doc[1], doc[2] or "#14b8a6"

                # Check if this doctor slot is already booked
                cur.execute(
                    """
                    SELECT id FROM appointments
                    WHERE doctor_id = %s AND appointment_date = %s AND appointment_time = %s AND status != 'cancelled'
                    """,
                    (req.doctor_id, target_date, req.appointment_time),
                )
                if cur.fetchone():
                    raise HTTPException(
                        status_code=409,
                        detail="This time slot has already been reserved. Please select another slot.",
                    )

                # Insert appointment
                now_utc = datetime.now(timezone.utc)
                cur.execute(
                    """
                    INSERT INTO appointments
                    (id, session_id, doctor_id, appointment_date, appointment_time, status, meeting_id, notes, created_at)
                    VALUES (%s, %s, %s, %s, %s, 'confirmed', %s, %s, %s)
                    """,
                    (
                        appointment_id,
                        req.session_id,
                        req.doctor_id,
                        target_date,
                        req.appointment_time,
                        meeting_id,
                        req.notes,
                        now_utc,
                    ),
                )

        return AppointmentResponse(
            id=str(appointment_id),
            session_id=str(req.session_id),
            doctor_id=str(req.doctor_id),
            doctor_name=doc_name,
            doctor_specialization=doc_spec,
            doctor_avatar_color=doc_color,
            appointment_date=req.appointment_date,
            appointment_time=req.appointment_time,
            status="confirmed",
            meeting_id=meeting_id,
            notes=req.notes,
            created_at=now_utc.isoformat(),
        )

    @app.get("/api/appointments", response_model=AppointmentsListResponse)
    def list_appointments(session_id: uuid.UUID = Query(...)):
        _require_valid_session(session_id)
        today = date.today()

        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT a.id, a.session_id, a.doctor_id, d.name, d.specialization, d.avatar_color,
                           a.appointment_date, a.appointment_time, a.status, a.meeting_id, a.notes, a.created_at
                    FROM appointments a
                    JOIN doctors d ON a.doctor_id = d.id
                    WHERE a.session_id = %s
                    ORDER BY a.appointment_date ASC, a.appointment_time ASC
                    """,
                    (session_id,),
                )
                rows = cur.fetchall()

        upcoming = []
        past = []

        for r in rows:
            apt_date = r[6]
            status = r[8]
            item = AppointmentResponse(
                id=str(r[0]),
                session_id=str(r[1]),
                doctor_id=str(r[2]),
                doctor_name=r[3],
                doctor_specialization=r[4],
                doctor_avatar_color=r[5] or "#14b8a6",
                appointment_date=apt_date.isoformat() if hasattr(apt_date, "isoformat") else str(apt_date),
                appointment_time=r[7],
                status=status,
                meeting_id=r[9],
                notes=r[10],
                created_at=r[11].isoformat() if hasattr(r[11], "isoformat") else str(r[11]),
            )

            # Categorize into upcoming vs past
            is_future_or_today = apt_date >= today
            if is_future_or_today and status == "confirmed":
                upcoming.append(item)
            else:
                past.append(item)

        return AppointmentsListResponse(upcoming=upcoming, past=past)

    @app.get("/api/appointments/{appointment_id}", response_model=AppointmentResponse)
    def get_appointment(appointment_id: uuid.UUID):
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT a.id, a.session_id, a.doctor_id, d.name, d.specialization, d.avatar_color,
                           a.appointment_date, a.appointment_time, a.status, a.meeting_id, a.notes, a.created_at
                    FROM appointments a
                    JOIN doctors d ON a.doctor_id = d.id
                    WHERE a.id = %s
                    """,
                    (appointment_id,),
                )
                r = cur.fetchone()
                if not r:
                    raise HTTPException(status_code=404, detail="Appointment not found.")

        apt_date = r[6]
        return AppointmentResponse(
            id=str(r[0]),
            session_id=str(r[1]),
            doctor_id=str(r[2]),
            doctor_name=r[3],
            doctor_specialization=r[4],
            doctor_avatar_color=r[5] or "#14b8a6",
            appointment_date=apt_date.isoformat() if hasattr(apt_date, "isoformat") else str(apt_date),
            appointment_time=r[7],
            status=r[8],
            meeting_id=r[9],
            notes=r[10],
            created_at=r[11].isoformat() if hasattr(r[11], "isoformat") else str(r[11]),
        )

    @app.post("/api/appointments/{appointment_id}/cancel")
    def cancel_appointment(appointment_id: uuid.UUID):
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    "SELECT status FROM appointments WHERE id = %s",
                    (appointment_id,),
                )
                row = cur.fetchone()
                if not row:
                    raise HTTPException(status_code=404, detail="Appointment not found.")

                if row[0] == "cancelled":
                    return {"message": "Appointment is already cancelled.", "status": "cancelled"}

                cur.execute(
                    "UPDATE appointments SET status = 'cancelled' WHERE id = %s",
                    (appointment_id,),
                )
        return {"message": "Appointment cancelled successfully.", "status": "cancelled"}

    @app.post("/api/consultation-profile", response_model=ConsultationProfileResponse)
    def save_consultation_profile(req: ConsultationProfileCreate):
        _require_valid_session(req.session_id)
        profile_id = uuid.uuid4()
        now_utc = datetime.now(timezone.utc)
        clean_gender = (req.gender or "Prefer not to say").strip()
        clean_role = req.role.strip()
        clean_unit = req.posting_unit.strip() if req.posting_unit else None
        clean_note = req.consultation_note.strip() if req.consultation_note else None

        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO consultation_profiles
                    (id, session_id, age, role, gender, years_of_service, posting_unit, consultation_note, created_at)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (session_id) DO UPDATE SET
                        age = EXCLUDED.age,
                        role = EXCLUDED.role,
                        gender = EXCLUDED.gender,
                        years_of_service = EXCLUDED.years_of_service,
                        posting_unit = EXCLUDED.posting_unit,
                        consultation_note = EXCLUDED.consultation_note,
                        created_at = EXCLUDED.created_at
                    RETURNING id, session_id, age, role, gender, years_of_service, posting_unit, consultation_note, created_at
                    """,
                    (
                        profile_id,
                        req.session_id,
                        req.age,
                        clean_role,
                        clean_gender,
                        req.years_of_service,
                        clean_unit,
                        clean_note,
                        now_utc,
                    ),
                )
                row = cur.fetchone()

        return ConsultationProfileResponse(
            id=str(row[0]),
            session_id=str(row[1]),
            age=row[2],
            role=row[3],
            gender=row[4],
            years_of_service=row[5],
            posting_unit=row[6],
            consultation_note=row[7],
            created_at=row[8].isoformat() if hasattr(row[8], "isoformat") else str(row[8]),
        )

    @app.get("/api/consultation-profile", response_model=ConsultationProfileResponse)
    def get_consultation_profile(session_id: uuid.UUID = Query(...)):
        _require_valid_session(session_id)
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT id, session_id, age, role, gender, years_of_service, posting_unit, consultation_note, created_at
                    FROM consultation_profiles
                    WHERE session_id = %s
                    """,
                    (session_id,),
                )
                row = cur.fetchone()
                if not row:
                    raise HTTPException(status_code=404, detail="Consultation profile not found.")

        return ConsultationProfileResponse(
            id=str(row[0]),
            session_id=str(row[1]),
            age=row[2],
            role=row[3],
            gender=row[4],
            years_of_service=row[5],
            posting_unit=row[6],
            consultation_note=row[7],
            created_at=row[8].isoformat() if hasattr(row[8], "isoformat") else str(row[8]),
        )
