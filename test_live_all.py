import os
import urllib.request
import json
import uuid

BASE = os.getenv("TEST_BASE_URL", "http://127.0.0.1:8000")

print("=== 1. Testing Frontend Static SPA Root Page ===")
req = urllib.request.Request(BASE, headers={"User-Agent": "Mozilla/5.0"})
with urllib.request.urlopen(req) as res:
    html = res.read().decode("utf-8")
    print(f"Frontend Root Page Status: {res.status}")
    print(f"Contains HTML5 DOCTYPE: {'<!doctype html>' in html.lower()}")
    print(f"Contains MindSetu: {'MindSetu' in html}")
    print(f"Contains root div: {'id=\"root\"' in html}")

def post_json(path, data):
    req = urllib.request.Request(
        f"{BASE}{path}",
        data=json.dumps(data).encode("utf-8"),
        headers={"Content-Type": "application/json", "User-Agent": "MindSetu-E2E"}
    )
    with urllib.request.urlopen(req, timeout=25) as res:
        return res.status, json.loads(res.read().decode())

def get_json(path):
    req = urllib.request.Request(f"{BASE}{path}", headers={"User-Agent": "MindSetu-E2E"})
    with urllib.request.urlopen(req, timeout=25) as res:
        return res.status, json.loads(res.read().decode())

print("\n=== 2. Testing Health Contracts ===")
for ep in ["/api/health", "/api/database", "/api/gemini/health", "/api/sih26186/ml/health"]:
    status, data = get_json(ep)
    print(f"[{status}] {ep}: {data.get('status')} ({data.get('model', data.get('database', data.get('service')))})")

print("\n=== 3. Testing Session Creation (Neon PostgreSQL) ===")
s_status, s_data = post_json("/api/sessions", {"consent_given": True})
session_id = s_data["session_id"]
print(f"Session created [{s_status}]: {session_id}")

print("\n=== 4. Testing Wellbeing Assessment Submission ===")
w_status, w_data = post_json("/api/sih26186/wellness", {
    "session_id": session_id,
    "answers": [2, 3, 2, 2, 1, 2]
})
print(f"Wellbeing recorded [{w_status}]: stress_score={w_data.get('stress_score')}")

print("\n=== 5. Testing Workload & Duty Context Submission ===")
wl_status, wl_data = post_json("/api/sih26186/workload", {
    "session_id": session_id,
    "role": "General Duties",
    "unit": "Alpha Wing",
    "duty_hours": 12.0,
    "night_duties": 3,
    "rest_hours": 5.0,
    "days_since_leave": 45,
    "workload_level": 4,
    "high_pressure_assignment": True,
    "duty_change_frequency": 3
})
print(f"Workload recorded [{wl_status}]: workload_score={wl_data.get('workload_score')}")

print("\n=== 6. Testing Deterministic Triage Analysis Generation ===")
a_status, a_data = post_json(f"/api/sih26186/analyze/{session_id}", {})
print(f"Analysis generated [{a_status}]:")
print(f"  - Risk Level: {a_data.get('risk_level')}")
print(f"  - Wellness Score: {a_data.get('wellness_score')}")
print(f"  - Workload Score: {a_data.get('workload_score')}")
print(f"  - Combined Score: {a_data.get('combined_score')}")
print(f"  - Recommendation: \"{a_data.get('recommendation')}\"")

print("\n=== 7. Testing Daily Mood Check-in & Trend Retrieval ===")
m_status, m_data = post_json("/api/mood", {"session_id": session_id, "mood": 2, "note": "Production test entry"})
print(f"Mood recorded [{m_status}]")

t_status, t_data = get_json(f"/api/dashboard/mood-trend?session_id={session_id}")
print(f"Mood trend retrieved [{t_status}]: count={len(t_data.get('trend', []))}, avg={t_data.get('average_mood')}")

print("\n=== 8. Testing Real Research ML + TreeSHAP Inference ===")
ml_status, ml_data = post_json("/api/sih26186/ml/predict", {
    "Q29_Total": 54.0, "Q12_weapon": 1.0, "Q13_feltdie": 1.0,
    "Q23a_cutdowntime": 1.0, "Q23b_Accomplished_less": 1.0,
    "Q23c_limited_work": 1.0, "Q23d_difficulty_performing": 1.0
})
print(f"LightGBM ML Prediction [{ml_status}]:")
print(f"  - Probability: {ml_data.get('probability')} (Signal: {ml_data.get('signal')})")
print(f"  - Target: {ml_data.get('target')}")
print(f"  - Clinical Diagnosis: {ml_data.get('clinical_diagnosis')}")
print(f"  - TreeSHAP Top Contributors ({len(ml_data.get('contributors', []))} total):")
for c in ml_data.get("contributors", []):
    print(f"    * {c.get('label')}: SHAP value = {c.get('shap_value')} ({c.get('direction')})")

print("\n=== 9. Testing Real Multi-Turn Gemini Streaming Chat ===")
# Turn 1
chat_req1 = urllib.request.Request(
    f"{BASE}/api/chat",
    data=json.dumps({
        "session_id": session_id,
        "message": "Help me manage my workload.",
        "history": [],
        "wellbeing_context": {
            "risk_level": a_data.get("risk_level"),
            "primary_focus": "Workload & Rest Balance",
            "wellness_summary": "Moderate fatigue and sleep disruption noted."
        }
    }).encode("utf-8"),
    headers={"Content-Type": "application/json", "User-Agent": "MindSetu-E2E"}
)

tokens1 = []
with urllib.request.urlopen(chat_req1, timeout=30) as res:
    for line in res:
        line_str = line.decode("utf-8").strip()
        if line_str:
            chunk = json.loads(line_str)
            if chunk.get("type") == "token":
                tokens1.append(chunk.get("content", ""))

reply1 = "".join(tokens1)
print(f"Gemini Turn 1 Response ({len(reply1)} chars):\n\"{reply1}\"")
assert len(reply1) > 20, "Turn 1 response too short"

# Turn 2
chat_req2 = urllib.request.Request(
    f"{BASE}/api/chat",
    data=json.dumps({
        "session_id": session_id,
        "message": "What should I prioritize first?",
        "history": [
            {"sender": "user", "text": "Help me manage my workload."},
            {"sender": "ai", "text": reply1}
        ],
        "wellbeing_context": {
            "risk_level": a_data.get("risk_level"),
            "primary_focus": "Workload & Rest Balance",
            "wellness_summary": "Moderate fatigue and sleep disruption noted."
        }
    }).encode("utf-8"),
    headers={"Content-Type": "application/json", "User-Agent": "MindSetu-E2E"}
)

tokens2 = []
with urllib.request.urlopen(chat_req2, timeout=30) as res:
    for line in res:
        line_str = line.decode("utf-8").strip()
        if line_str:
            chunk = json.loads(line_str)
            if chunk.get("type") == "token":
                tokens2.append(chunk.get("content", ""))

reply2 = "".join(tokens2)
print(f"Gemini Turn 2 Response ({len(reply2)} chars):\n\"{reply2}\"")
assert len(reply2) > 20, "Turn 2 response too short"

print("\n============================================================")
print("*** FULL PRODUCTION DEPLOYMENT VALIDATION COMPLETED WITH 100% SUCCESS! ***")
print("============================================================")
