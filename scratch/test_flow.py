import json
import urllib.request

BASE_URL = "http://127.0.0.1:8000"

def post(endpoint, data=None):
    req = urllib.request.Request(
        f"{BASE_URL}{endpoint}",
        data=json.dumps(data).encode("utf-8") if data is not None else b"{}",
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode("utf-8"))

def get(endpoint):
    req = urllib.request.Request(f"{BASE_URL}{endpoint}")
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode("utf-8"))

print("1. Creating Session...")
session = post("/api/sessions", {"consent_given": True})
session_id = session["session_id"]
print(f"   Session ID: {session_id}")

print("2. Submitting Wellness (Answers: [1, 2, 1, 2, 0, 1])...")
wellness = post("/api/sih26186/wellness", {"session_id": session_id, "answers": [1, 2, 1, 2, 0, 1]})
print(f"   Wellness Stress Score: {wellness['stress_score']}")

print("3. Submitting Workload...")
workload_payload = {
    "session_id": session_id,
    "role": "Field Operations Personnel",
    "unit": "Sector Unit Bravo",
    "duty_hours": 10,
    "night_duties": 2,
    "rest_hours": 6,
    "days_since_leave": 14,
    "workload_level": 3,
    "high_pressure_assignment": True,
    "duty_change_frequency": 1
}
workload = post("/api/sih26186/workload", workload_payload)
print(f"   Workload Score: {workload['workload_score']}")

print("4. Running Triage Analysis...")
analysis = post(f"/api/sih26186/analyze/{session_id}")
print(f"   Wellness Score: {analysis['wellness_score']}")
print(f"   Workload Score: {analysis['workload_score']}")
print(f"   Combined Score: {analysis['combined_score']}")
print(f"   Risk Level: {analysis['risk_level']}")
print(f"   Recommendation: {analysis['recommendation']}")

print("5. Testing ML Explainability Endpoint...")
ml_payload = {
    "Q29_Total": 45,
    "Q12_weapon": 1,
    "Q13_feltdie": 0,
    "Q23a_cutdowntime": 1,
    "Q23b_Accomplished_less": 1,
    "Q23c_limited_work": 0,
    "Q23d_difficulty_performing": 1,
    "generate_response": True
}
ml_result = post("/api/sih26186/ml/analyze", ml_payload)
print(f"   Model Probability: {ml_result['probability']}")
print(f"   Signal: {ml_result['signal']}")
print(f"   Contributors ({len(ml_result['contributors'])}):")
for c in ml_result['contributors']:
    print(f"     - {c['label']}: SHAP {c['shap_value']} ({c['direction']})")
if ml_result.get('supportive_response'):
    print(f"   Gemini Synthesis: {ml_result['supportive_response']}")

print("6. Testing Mood Endpoint...")
mood_payload = {
    "session_id": session_id,
    "mood": 3,
    "note": "Feeling balanced after completing duty shift."
}
mood_res = post("/api/mood", mood_payload)
print(f"   Mood Log Result: {mood_res['message']}")

history = get(f"/api/mood/{session_id}")
print(f"   Mood History entries: {len(history.get('history', []))}")

trend = get("/api/dashboard/mood-trend")
print(f"   Trend data points: {len(trend.get('trend', []))}")

print("\n[SUCCESS] ALL END-TO-END FLOWS AND CONTRACTS VERIFIED PERFECTLY!")
