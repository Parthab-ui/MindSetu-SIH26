"""Tests for Doctor Directory, Availability, and Appointment Booking Routes."""
import uuid
from datetime import date, timedelta
import pytest
from fastapi.testclient import TestClient

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from sih26186_server import app

client = TestClient(app)


def test_list_doctors():
    res = client.get("/api/doctors")
    assert res.status_code == 200
    doctors = res.json()
    assert isinstance(doctors, list)
    assert len(doctors) >= 4
    first = doctors[0]
    assert "id" in first
    assert "name" in first
    assert "specialization" in first
    assert "qualification" in first
    assert "experience_years" in first
    assert "bio" in first
    assert "rating" in first
    assert "focus_areas" in first
    assert isinstance(first["focus_areas"], list)


def test_filter_doctors_by_specialization():
    res = client.get("/api/doctors?specialization=Trauma")
    assert res.status_code == 200
    doctors = res.json()
    assert len(doctors) >= 1
    for doc in doctors:
        assert "trauma" in doc["specialization"].lower() or "trauma" in " ".join(doc["focus_areas"]).lower()


def test_get_doctor_detail_and_not_found():
    res = client.get("/api/doctors")
    doc_id = res.json()[0]["id"]

    res_doc = client.get(f"/api/doctors/{doc_id}")
    assert res_doc.status_code == 200
    assert res_doc.json()["id"] == doc_id

    # Non-existent
    fake_id = str(uuid.uuid4())
    res_fake = client.get(f"/api/doctors/{fake_id}")
    assert res_fake.status_code == 404


def test_get_doctor_availability_slots():
    res = client.get("/api/doctors")
    doc_id = res.json()[0]["id"]
    today_str = (date.today() + timedelta(days=2)).isoformat()

    res_avail = client.get(f"/api/doctors/{doc_id}/availability?date={today_str}")
    assert res_avail.status_code == 200
    data = res_avail.json()
    assert data["doctor_id"] == doc_id
    assert data["date"] == today_str
    assert isinstance(data["slots"], list)
    assert len(data["slots"]) == 5
    for s in data["slots"]:
        assert "time" in s
        assert "available" in s
        assert s["available"] is True


def test_appointment_booking_and_double_booking_prevention():
    # 1. Create a real session
    s_res = client.post("/api/sessions", json={"consent_given": True})
    assert s_res.status_code == 200
    session_id = s_res.json()["session_id"]

    # 2. Get a doctor
    docs = client.get("/api/doctors").json()
    doctor_id = docs[0]["id"]
    test_date = (date.today() + timedelta(days=3)).isoformat()
    test_slot = "14:30"

    # 3. Book appointment
    book_payload = {
        "session_id": session_id,
        "doctor_id": doctor_id,
        "appointment_date": test_date,
        "appointment_time": test_slot,
        "notes": "Testing operational stress consult.",
    }
    b_res = client.post("/api/appointments", json=book_payload)
    assert b_res.status_code == 200
    apt = b_res.json()
    apt_id = apt["id"]
    assert apt["session_id"] == session_id
    assert apt["doctor_id"] == doctor_id
    assert apt["appointment_date"] == test_date
    assert apt["appointment_time"] == test_slot
    assert apt["status"] == "confirmed"
    assert "meeting_id" in apt

    # 4. Slot availability should now show 14:30 as NOT available
    avail_res = client.get(f"/api/doctors/{doctor_id}/availability?date={test_date}").json()
    slot_map = {s["time"]: s["available"] for s in avail_res["slots"]}
    assert slot_map["14:30"] is False
    assert slot_map["09:30"] is True

    # 5. Attempting to book the SAME slot should fail with 409 Conflict
    s_res2 = client.post("/api/sessions", json={"consent_given": True})
    session_id2 = s_res2.json()["session_id"]
    book_payload2 = {
        "session_id": session_id2,
        "doctor_id": doctor_id,
        "appointment_date": test_date,
        "appointment_time": test_slot,
    }
    conflict_res = client.post("/api/appointments", json=book_payload2)
    assert conflict_res.status_code == 409

    # 6. List appointments for session 1
    list_res = client.get(f"/api/appointments?session_id={session_id}")
    assert list_res.status_code == 200
    list_data = list_res.json()
    assert len(list_data["upcoming"]) >= 1
    found = any(a["id"] == apt_id for a in list_data["upcoming"])
    assert found is True

    # 7. Cancel appointment
    cancel_res = client.post(f"/api/appointments/{apt_id}/cancel")
    assert cancel_res.status_code == 200
    assert cancel_res.json()["status"] == "cancelled"

    # 8. Slot should now be freed and available again!
    avail_res_after = client.get(f"/api/doctors/{doctor_id}/availability?date={test_date}").json()
    slot_map_after = {s["time"]: s["available"] for s in avail_res_after["slots"]}
    assert slot_map_after["14:30"] is True
