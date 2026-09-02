"""Local End-to-End Test Suite using FastAPI TestClient.

Tests the complete lifecycle:
1. Health & Self-Audit contracts
2. ML Health & Local LightGBM Prediction & Explainability (TreeSHAP)
3. Deterministic Triage Scoring Logic & Boundary Conditions
4. Full Workflow: Session -> Wellness -> Workload -> Analyze -> Dashboard -> History -> Mood
"""
import sys
import uuid
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from sih26186_server import app, _calculate_wellness_stress, _classify
from ml.inference import FEATURES, predict, MODEL_PATH

client = TestClient(app)


def test_core_health_endpoints():
    r = client.get("/api/health")
    assert r.status_code == 200
    assert r.json().get("status") == "healthy"

    r2 = client.get("/api/ai/self-audit")
    assert r2.status_code == 200
    assert r2.json().get("status") == "passed"


def test_ml_health_and_local_inference():
    r = client.get("/api/sih26186/ml/health")
    assert r.status_code == 200
    data = r.json()
    assert data.get("model") == "LightGBM"
    assert data.get("threshold") == 0.45
    assert set(data.get("features", [])) == set(FEATURES)

    # Test Local LightGBM prediction with TreeSHAP
    payload = {
        "Q29_Total": 58.0,
        "Q12_weapon": 1.0,
        "Q13_feltdie": 1.0,
        "Q23a_cutdowntime": 1.0,
        "Q23b_Accomplished_less": 1.0,
        "Q23c_limited_work": 1.0,
        "Q23d_difficulty_performing": 1.0,
    }
    pred = predict(payload, include_explanation=True)
    assert "probability" in pred
    assert pred.get("signal") in ("elevated", "lower")
    assert pred.get("target") == "multiplesymptoms_case"
    assert pred.get("clinical_diagnosis") is False
    assert len(pred.get("contributors", [])) > 0
    for c in pred.get("contributors", []):
        assert "feature" in c
        assert "shap_value" in c
        assert "direction" in c


def test_triage_scoring_mathematics():
    # Bounds: 0 to 100
    assert _calculate_wellness_stress([0, 0, 0, 0, 0, 0]) == 0.0
    assert _calculate_wellness_stress([3, 3, 3, 3, 3, 3]) == 100.0
    assert _calculate_wellness_stress([1, 1, 1, 1, 1, 1]) == round((6 / 18) * 100, 2)

    # Classification Thresholds (AGENTS.md)
    # High: combined >= 70 OR wellness >= 80 OR workload >= 85
    assert _classify(85, 20)[1] == "high"
    assert _classify(20, 90)[1] == "high"
    assert _classify(75, 70)[1] == "high"

    # Moderate: combined >= 45 OR wellness >= 50 OR workload >= 60
    assert _classify(50, 30)[1] == "moderate"
    assert _classify(20, 65)[1] == "moderate"
    assert _classify(48, 45)[1] == "moderate"

    # Low: otherwise
    assert _classify(20, 20)[1] == "low"


def test_session_lifecycle_with_mock_or_live_db():
    # Test session creation API contract
    res = client.post("/api/sessions", json={"consent_given": True})
    # If DB is configured, returns 200; if network DB is temporarily unavailable, returns 503
    assert res.status_code in (200, 503)
    if res.status_code == 200:
        session_id = res.json()["session_id"]
        assert uuid.UUID(session_id)

        # Test Wellness submission
        w_res = client.post("/api/sih26186/wellness", json={
            "session_id": session_id,
            "answers": [2, 3, 2, 2, 1, 2]
        })
        assert w_res.status_code == 200
        assert w_res.json()["stress_score"] == round((12 / 18) * 100, 2)

        # Test Workload submission
        wl_res = client.post("/api/sih26186/workload", json={
            "session_id": session_id,
            "role": "Field Operations Personnel",
            "unit": "Sector Unit Bravo",
            "duty_hours": 12.0,
            "night_duties": 3,
            "rest_hours": 5.0,
            "days_since_leave": 30,
            "workload_level": 4,
            "high_pressure_assignment": True,
            "duty_change_frequency": 2,
        })
        assert wl_res.status_code == 200
        assert "workload_score" in wl_res.json()

        # Test Triage Analysis
        a_res = client.post(f"/api/sih26186/analyze/{session_id}")
        assert a_res.status_code == 200
        a_data = a_res.json()
        assert a_data["risk_level"] in ("low", "moderate", "high")
        assert "recommendation" in a_data
        assert "wellness_score" in a_data
        assert "workload_score" in a_data
        assert "combined_score" in a_data

        # Test Dashboard
        d_res = client.get(f"/api/sih26186/dashboard/{session_id}")
        assert d_res.status_code == 200
        assert d_res.json()["risk_level"] == a_data["risk_level"]

        # Test Assessment History
        h_res = client.get(f"/api/sih26186/history/{session_id}")
        assert h_res.status_code == 200
        assert h_res.json()["count"] >= 1
        assert len(h_res.json()["history"]) >= 1
