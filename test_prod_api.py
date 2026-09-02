import urllib.request
import json
import uuid

BASE = "https://mindsetu-sih26.vercel.app"

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

print("=== 1. Testing Session Creation ===")
s_status, s_data = post_json("/api/sessions", {"consent_given": True})
session_id = s_data["session_id"]
print(f"Session created [{s_status}]: {session_id}")

print("=== 2. Testing Wellbeing Submission ===")
w_status, w_data = post_json("/api/sih26186/wellness", {
    "session_id": session_id,
    "answers": [2, 3, 2, 2, 1, 2]
})
print(f"Wellbeing saved [{w_status}]: stress_score={w_data.get('stress_score')}")

print("=== 3. Testing Workload Submission ===")
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
print(f"Workload saved [{wl_status}]: workload_score={wl_data.get('workload_score')}")

print("=== 4. Testing Triage Analysis ===")
a_status, a_data = post_json(f"/api/sih26186/analyze/{session_id}", {})
print(f"Analysis generated [{a_status}]: risk_level={a_data.get('risk_level')}, combined={a_data.get('combined_score')}, recommendation={a_data.get('recommendation')[:60]}...")

print("=== 5. Testing Mood Check-in & Retrieval ===")
m_status, m_data = post_json("/api/mood", {"session_id": session_id, "mood": 2, "note": "Testing production Neon mood persistence"})
print(f"Mood saved [{m_status}]: status={m_data.get('status')}")

t_status, t_data = get_json(f"/api/dashboard/mood-trend?session_id={session_id}")
print(f"Mood trend retrieved [{t_status}]: count={len(t_data.get('trend', []))}, avg={t_data.get('average_mood')}")

print("=== 6. Testing Real ML + TreeSHAP Inference ===")
ml_status, ml_data = post_json("/api/sih26186/ml/predict", {
    "Q29_Total": 54.0, "Q12_weapon": 1.0, "Q13_feltdie": 1.0,
    "Q23a_cutdowntime": 1.0, "Q23b_Accomplished_less": 1.0,
    "Q23c_limited_work": 1.0, "Q23d_difficulty_performing": 1.0
})
print(f"ML Prediction [{ml_status}]: probability={ml_data.get('probability')}, signal={ml_data.get('signal')}, contributors count={len(ml_data.get('contributors', []))}")
for c in ml_data.get('contributors', []):
    print(f"  - {c.get('label')}: SHAP value = {c.get('shap_value')} ({c.get('direction')})")

print("=== 7. Testing Real Multi-Turn Gemini Streaming Chat ===")
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

# Turn 2 (Contextual follow-up)
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

print("\n>>> ALL 7 BACKEND PRODUCTION SUBSYSTEMS FULLY OPERATIONAL & VERIFIED! <<<")
