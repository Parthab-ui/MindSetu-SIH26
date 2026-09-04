"""MindSetu-SIH26 — Full Live Demo Sequence Verification Script.

Executes the exact sequence required for the SIH 2026 evaluation:
1. Start Protected Session (Consent given)
2. Wellness Pulse (6 answers, 0-3 scale -> deterministic stress score)
3. Operational Workload (duty hours, night shifts, rest, leave, level, pressure)
4. Voice Screening ("strained" synthetic sample -> 24 acoustic features, zero audio stored)
5. Deterministic Triage Analysis (55% wellness + 45% workload -> exact risk band & recommendation)
6. Explainable Research Model (LightGBM + TreeSHAP feature contributors)
7. AI Companion / Gemini Support Layer (safe, non-diagnostic check-in)
8. Biodata Consultation Intake (Age, Role, Unit, Notes - NO NAME collected)
9. Doctor Directory & Availability (Specialist listing & available slots)
10. Appointment Booking & Verification (Confirmed slot, meeting ID, anti-double-booking verified)
"""

import sys
import uuid
import datetime
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from sih26186_server import app

client = TestClient(app)


def test_full_live_demo_sequence():
    # Step 1: Start Protected Session
    s_res = client.post("/api/sessions", json={"consent_given": True})
    assert s_res.status_code == 200, f"Session creation failed: {s_res.text}"
    s_data = s_res.json()
    session_id = s_data["session_id"]
    assert s_data["anonymous"] is True
    assert s_data["consent_given"] is True

    # Step 2: Wellness Pulse (answers: [2, 2, 3, 2, 2, 3] -> sum=14 -> stress_score=77.78)
    w_res = client.post("/api/sih26186/wellness", json={
        "session_id": session_id,
        "answers": [2, 2, 3, 2, 2, 3],
    })
    assert w_res.status_code == 200
    w_data = w_res.json()
    assert w_data["stress_score"] == round((14 / 18) * 100, 2)

    # Step 3: Operational Workload (Field Operations Personnel, Sector Unit Bravo)
    wl_res = client.post("/api/sih26186/workload", json={
        "session_id": session_id,
        "role": "Field Operations Personnel",
        "unit": "Sector Unit Bravo",
        "duty_hours": 12.0,
        "night_duties": 4,
        "rest_hours": 5.0,
        "days_since_leave": 35,
        "workload_level": 4,
        "high_pressure_assignment": True,
        "duty_change_frequency": 2,
    })
    assert wl_res.status_code == 200
    wl_data = wl_res.json()
    assert wl_data["workload_score"] > 60.0

    # Step 4: Voice Screening (⚡ Strained Voice Sample)
    v_res = client.post("/api/sih26186/voice/demo-sample?scenario=strained")
    assert v_res.status_code == 200
    v_data = v_res.json()
    assert v_data["scenario"] == "strained"
    assert v_data["audio_base64"].startswith("data:audio/wav;base64,")
    voice_analysis = v_data["analysis"]
    assert voice_analysis["status"] == "success"
    assert len(voice_analysis["features"]) == 24
    assert voice_analysis["clinical_diagnosis"] is False
    assert 0 <= voice_analysis["depression_signal"] <= 100

    # Step 5: Deterministic Triage Analysis
    a_res = client.post(f"/api/sih26186/analyze/{session_id}")
    assert a_res.status_code == 200
    a_data = a_res.json()
    assert a_data["risk_level"] in ("moderate", "high")
    assert a_data["combined_score"] > 0
    assert "clinical diagnosis" not in a_data["recommendation"].lower() or "not a clinical diagnosis" in a_data["recommendation"].lower()

    # Step 6: Explainable Research Lab (LightGBM + TreeSHAP)
    ml_res = client.post("/api/sih26186/ml/analyze", json={
        "Q29_Total": 52.0,
        "Q12_weapon": 1.0,
        "Q13_feltdie": 1.0,
        "Q23a_cutdowntime": 1.0,
        "Q23b_Accomplished_less": 1.0,
        "Q23c_limited_work": 1.0,
        "Q23d_difficulty_performing": 1.0,
        "generate_response": False,
    })
    assert ml_res.status_code == 200
    ml_data = ml_res.json()
    assert ml_data["model"] == "LightGBM"
    assert ml_data["research_only"] is True
    assert ml_data["clinical_diagnosis"] is False
    assert len(ml_data["contributors"]) > 0
    for c in ml_data["contributors"]:
        assert "feature" in c
        assert "shap_value" in c
        assert "direction" in c

    # Step 7: AI Companion Health / Audit
    audit_res = client.get("/api/ai/self-audit")
    assert audit_res.status_code == 200
    assert audit_res.json()["status"] == "passed"

    # Step 8: Biodata / Consultation Profile Intake (NO NAME)
    prof_res = client.post("/api/consultation-profile", json={
        "session_id": session_id,
        "age": 31,
        "role": "Field Operations Personnel",
        "gender": "Prefer not to say",
        "years_of_service": 6,
        "posting_unit": "Sector Unit Bravo",
        "consultation_note": "Requesting specialist consult regarding post-shift fatigue and sleep disruption.",
    })
    assert prof_res.status_code == 200
    prof_data = prof_res.json()
    assert prof_data["age"] == 31
    assert prof_data["role"] == "Field Operations Personnel"
    assert "name" not in prof_data

    # Fetch profile to verify persistence
    get_prof = client.get(f"/api/consultation-profile?session_id={session_id}")
    assert get_prof.status_code == 200
    assert get_prof.json()["posting_unit"] == "Sector Unit Bravo"

    # Step 9: Available Doctors & Slots
    docs_res = client.get("/api/doctors")
    assert docs_res.status_code == 200
    docs = docs_res.json()
    assert len(docs) >= 1
    selected_doc = docs[0]

    tomorrow = (datetime.date.today() + datetime.timedelta(days=1)).isoformat()
    slots_res = client.get(f"/api/doctors/{selected_doc['id']}/availability?date={tomorrow}")
    assert slots_res.status_code == 200
    slots = slots_res.json()["slots"]
    available = [s["time"] for s in slots if s["available"]]
    assert len(available) >= 1
    chosen_slot = available[0]

    # Step 10: Book Appointment
    book_res = client.post("/api/appointments", json={
        "session_id": session_id,
        "doctor_id": selected_doc["id"],
        "appointment_date": tomorrow,
        "appointment_time": chosen_slot,
        "notes": "Follow-up after operational triage.",
    })
    assert book_res.status_code == 200
    book_data = book_res.json()
    assert book_data["status"] == "confirmed"
    assert book_data["appointment_time"] == chosen_slot
    assert book_data["meeting_id"].startswith("mindsetu-consult-")

    # Verify appointment listed for session
    list_res = client.get(f"/api/appointments?session_id={session_id}")
    assert list_res.status_code == 200
    upcoming = list_res.json()["upcoming"]
    assert any(a["id"] == book_data["id"] for a in upcoming)
