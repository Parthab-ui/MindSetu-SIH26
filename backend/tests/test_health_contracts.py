import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from main import app


def test_ai_self_audit_route_registered():
    routes = {route.path for route in app.routes}
    assert "/api/ai/self-audit" in routes


def test_core_health_routes_registered():
    routes = {route.path for route in app.routes}
    for path in ("/api/health", "/api/database", "/api/chat/health", "/api/gemini/health"):
        assert path in routes


def test_sih_routes_registered():
    routes = {route.path for route in app.routes}
    for path in (
        "/api/sih26186/wellness",
        "/api/sih26186/workload",
        "/api/sih26186/analyze/{session_id}",
        "/api/sih26186/dashboard/{session_id}",
        "/api/sih26186/history/{session_id}",
        "/api/sih26186/ml/health",
        "/api/sih26186/ml/predict",
        "/api/sih26186/ml/analyze",
    ):
        assert path in routes

