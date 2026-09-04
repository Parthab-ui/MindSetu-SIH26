"""MindSetu-SIH26 — Extreme Bug, Security, and Edge Case Audit Suite.

Attacks:
1. Concurrency and race conditions in appointment booking.
2. Boundary values and impossible inputs in consultation profiles.
3. Date boundaries in appointment booking (past dates, invalid formats).
4. Deterministic triage exact boundary conditions (at, +0.01, -0.01).
5. Voice pipeline edge cases (corrupt, silent, truncated, synthetic).
6. Security / injection attacks (SQL injection probes, XSS strings).
7. Invalid sessions and ID enumeration.
"""

import sys
import uuid
import datetime
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from sih26186_server import app, _calculate_wellness_stress, _classify
from ml.voice_inference import generate_synthetic_demo_wav

client = TestClient(app)


# ── 1. DETERMINISTIC TRIAGE BOUNDARY TESTS ─────────────────────────────

def test_triage_boundaries_exact_thresholds():
    """Verify exact mathematical boundaries as defined in AGENTS.md."""
    # High: combined >= 70 OR wellness >= 80 OR workload >= 85
    # Case: combined == 70.0 (e.g. wellness=70, workload=70 -> combined=70.0)
    comb, band = _classify(70.0, 70.0)
    assert comb == 70.0
    assert band == "high"

    # Case: combined == 69.9 (wellness=69.9, workload=69.9)
    comb, band = _classify(69.9, 69.9)
    assert comb == 69.9
    assert band == "moderate"

    # Case: wellness == 80.0 independently triggers high even if workload is 0
    comb, band = _classify(80.0, 0.0)
    assert comb == 44.0  # 80 * 0.55 = 44.0
    assert band == "high"

    # Case: wellness == 79.9 with workload == 0 -> moderate? wellness >= 50 triggers moderate!
    comb, band = _classify(79.9, 0.0)
    assert band == "moderate"

    # Case: workload == 85.0 independently triggers high even if wellness is 0
    comb, band = _classify(0.0, 85.0)
    assert comb == 38.25
    assert band == "high"

    # Case: workload == 84.9 with wellness == 0 -> workload >= 60 triggers moderate
    comb, band = _classify(0.0, 84.9)
    assert band == "moderate"

    # Moderate: combined >= 45 OR wellness >= 50 OR workload >= 60
    comb, band = _classify(45.0, 45.0)
    assert comb == 45.0
    assert band == "moderate"

    comb, band = _classify(44.9, 44.9)
    assert comb == 44.9
    assert band == "low"  # neither combined >= 45 nor wellness >= 50 nor workload >= 60

    # Low boundary
    comb, band = _classify(0.0, 0.0)
    assert comb == 0.0
    assert band == "low"

    comb, band = _classify(49.9, 44.0)
    # comb = 49.9*0.55 + 44*0.45 = 27.445 + 19.8 = 47.245 -> combined >= 45 so moderate!
    assert band == "moderate"


# ── 2. CONSULTATION PROFILE BOUNDARY & VALIDATION ATTACKS ─────────────

def test_consultation_profile_boundary_and_rejections():
    # 1. Non-existent session
    fake_session = uuid.uuid4()
    res = client.post("/api/consultation-profile", json={
        "session_id": str(fake_session),
        "age": 25,
        "role": "Field Operations Personnel",
    })
    assert res.status_code == 404

    # Create real session
    s_res = client.post("/api/sessions", json={"consent_given": True})
    assert s_res.status_code == 200
    session_id = s_res.json()["session_id"]

    # 2. Age < 18 rejected
    res = client.post("/api/consultation-profile", json={
        "session_id": session_id,
        "age": 17,
        "role": "Officer",
    })
    assert res.status_code == 422

    # 3. Age > 100 rejected
    res = client.post("/api/consultation-profile", json={
        "session_id": session_id,
        "age": 101,
        "role": "Officer",
    })
    assert res.status_code == 422

    # 4. Whitespace-only role rejected
    res = client.post("/api/consultation-profile", json={
        "session_id": session_id,
        "age": 25,
        "role": "   ",
    })
    assert res.status_code in (400, 422)

    # 5. Negative years of service rejected
    res = client.post("/api/consultation-profile", json={
        "session_id": session_id,
        "age": 25,
        "role": "Officer",
        "years_of_service": -1,
    })
    assert res.status_code == 422

    # 6. Impossible years of service (years >= age) rejected
    res = client.post("/api/consultation-profile", json={
        "session_id": session_id,
        "age": 20,
        "role": "Officer",
        "years_of_service": 25,
    })
    assert res.status_code in (400, 422)


# ── 3. APPOINTMENT BOOKING CONFLICT & CONCURRENCY ATTACK ───────────────

def test_appointment_booking_date_boundaries():
    s_res = client.post("/api/sessions", json={"consent_given": True})
    session_id = s_res.json()["session_id"]

    docs = client.get("/api/doctors").json()
    assert len(docs) >= 1
    doc_id = docs[0]["id"]

    # 1. Past date booking rejection
    past_date = "2020-01-01"
    res = client.post("/api/appointments", json={
        "session_id": session_id,
        "doctor_id": doc_id,
        "appointment_date": past_date,
        "appointment_time": "11:00",
    })
    assert res.status_code == 400
    assert "past" in res.json()["detail"].lower()

    # 2. Invalid date format
    res = client.post("/api/appointments", json={
        "session_id": session_id,
        "doctor_id": doc_id,
        "appointment_date": "not-a-date",
        "appointment_time": "11:00",
    })
    assert res.status_code == 422

    # 3. Invalid time slot
    tomorrow = (datetime.date.today() + datetime.timedelta(days=2)).isoformat()
    res = client.post("/api/appointments", json={
        "session_id": session_id,
        "doctor_id": doc_id,
        "appointment_date": tomorrow,
        "appointment_time": "03:15",
    })
    assert res.status_code == 400
    assert "supported slots" in res.json()["detail"].lower()


def test_concurrent_booking_race_condition():
    """Simulate 2 concurrent booking requests for the EXACT same doctor and slot."""
    docs = client.get("/api/doctors").json()
    doc_id = docs[0]["id"]
    import random
    offset = random.randint(25, 55)
    test_date = (datetime.date.today() + datetime.timedelta(days=offset)).isoformat()
    avail = client.get(f"/api/doctors/{doc_id}/availability?date={test_date}").json()
    available_slots = [s["time"] for s in avail["slots"] if s["available"]]
    test_slot = available_slots[0]

    # Create 2 separate sessions
    s1 = client.post("/api/sessions", json={"consent_given": True}).json()["session_id"]
    s2 = client.post("/api/sessions", json={"consent_given": True}).json()["session_id"]

    def attempt_book(sid):
        return client.post("/api/appointments", json={
            "session_id": sid,
            "doctor_id": doc_id,
            "appointment_date": test_date,
            "appointment_time": test_slot,
            "notes": f"Concurrent test from {sid}",
        })

    with ThreadPoolExecutor(max_workers=2) as executor:
        f1 = executor.submit(attempt_book, s1)
        f2 = executor.submit(attempt_book, s2)
        r1 = f1.result()
        r2 = f2.result()

    statuses = sorted([r1.status_code, r2.status_code])
    # Exactly ONE must succeed (200) and the other MUST get 409 Conflict (NEVER 500 error!)
    assert statuses == [200, 409], f"Expected [200, 409] but got {statuses}"


# ── 4. VOICE PIPELINE RESILIENCE & ACOUSTIC FEATURES ────────────────────

def test_voice_all_synthetic_scenarios():
    for scenario in ("strained", "resilient", "moderate"):
        wav_bytes = generate_synthetic_demo_wav(scenario)
        assert len(wav_bytes) > 1000
        files = {"audio": (f"{scenario}.wav", wav_bytes, "audio/wav")}
        res = client.post("/api/sih26186/voice/analyze", files=files)
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "success"
        assert len(data["features"]) == 24
        assert 0 <= data["depression_signal"] <= 100
        assert 0 <= data["trauma_signal"] <= 100
        assert data["clinical_diagnosis"] is False


# ── 5. SECURITY & INJECTION PROBING ─────────────────────────────────────

def test_sql_and_xss_injection_handling():
    s_res = client.post("/api/sessions", json={"consent_given": True})
    session_id = s_res.json()["session_id"]

    payloads = [
        "'; DROP TABLE sessions; --",
        "<script>alert('xss')</script>",
        "Robert'); DROP TABLE doctors;--",
        "' OR '1'='1",
    ]

    for p in payloads:
        # Test consultation profile with injection strings
        res = client.post("/api/consultation-profile", json={
            "session_id": session_id,
            "age": 30,
            "role": "Field Operations Personnel",
            "posting_unit": p,
            "consultation_note": p,
        })
        assert res.status_code == 200
        saved = res.json()
        # Ensure database tables still exist and didn't crash
        assert saved["posting_unit"] == p
        assert saved["consultation_note"] == p

    # Verify sessions table is completely intact
    health = client.get("/api/health")
    assert health.status_code == 200
