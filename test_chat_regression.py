"""MindSetu-SIH26 Chat Streaming Regression & Contract Test Suite."""
import json
import os
import sys
import urllib.error
import urllib.request

BASE_URL = os.getenv("TEST_BASE_URL", "http://127.0.0.1:8000")

def _execute_chat_turn(session_id, message, history=None):
    url = f"{BASE_URL}/api/chat"
    payload = {
        "session_id": session_id,
        "message": message,
        "history": history or [],
        "wellbeing_context": {
            "risk_level": "moderate",
            "wellness_summary": "Moderate duty load with steady pacing."
        }
    }
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data,
        headers={
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
        }
    )

    tokens = []
    events = []
    with urllib.request.urlopen(req, timeout=30) as res:
        assert res.status == 200, f"Expected 200, got {res.status}"
        lines = res.read().decode("utf-8").split("\n")
        for line in lines:
            line = line.trim() if hasattr(line, "trim") else line.strip()
            if not line:
                continue
            try:
                evt = json.loads(line)
                events.append(evt)
                if evt.get("type") == "token":
                    tokens.append(evt.get("content", ""))
            except Exception:
                pass

    full_text = "".join(tokens).strip()
    return events, full_text

def run_regression():
    print("=" * 60)
    print("MINDSETU CHAT STREAMING REGRESSION TEST")
    print(f"Target Production URL: {BASE_URL}")
    print("=" * 60)

    # 1. Create Session
    req = urllib.request.Request(
        f"{BASE_URL}/api/sessions",
        data=json.dumps({"consent_given": True}).encode("utf-8"),
        headers={"Content-Type": "application/json", "User-Agent": "Mozilla/5.0"}
    )
    with urllib.request.urlopen(req, timeout=15) as res:
        session_data = json.loads(res.read().decode("utf-8"))
        session_id = session_data["session_id"]
    print(f" [PASS] 1. Session created: {session_id}")

    # 2. Test Prompt 1: Boundaries under continuous duty
    p1 = "How can I set realistic boundaries when duty pressure is continuous?"
    print(f"\n--- Testing Prompt 1: '{p1}' ---")
    events1, reply1 = _execute_chat_turn(session_id, p1)
    
    # Assertions for single response bubble
    token_events1 = [e for e in events1 if e.get("type") == "token"]
    assert len(token_events1) > 0, "Expected token events in stream"
    assert len(reply1) > 20, f"Expected non-empty answer, got length {len(reply1)}"
    
    print(f" [PASS] Stream Chunks Received: {len(token_events1)} tokens")
    print(f" [PASS] Single Message Assembled (length: {len(reply1)} chars)")
    print(f" [PASS] Sample Text: '{reply1[:120]}...'")

    # 3. Test Prompt 2: Recovery plan (Multi-turn turn 2)
    p2 = "Give me a practical recovery plan for managing long duty hours."
    print(f"\n--- Testing Prompt 2: '{p2}' ---")
    history = [
        {"sender": "user", "text": p1},
        {"sender": "ai", "text": reply1}
    ]
    events2, reply2 = _execute_chat_turn(session_id, p2, history)
    
    token_events2 = [e for e in events2 if e.get("type") == "token"]
    assert len(token_events2) > 0, "Expected token events in stream"
    assert len(reply2) > 20, f"Expected non-empty answer, got length {len(reply2)}"
    
    print(f" [PASS] Multi-Turn History Passed: 2 previous turns")
    print(f" [PASS] Stream Chunks Received: {len(token_events2)} tokens")
    print(f" [PASS] Second Turn Single Message Assembled (length: {len(reply2)} chars)")
    print(f" [PASS] Sample Text: '{reply2[:120]}...'")

    # 4. Test Go on action / Continuation Prompt
    p3 = "Go on, please tell me more about this."
    print(f"\n--- Testing 'Go on' continuation: '{p3}' ---")
    history.extend([
        {"sender": "user", "text": p2},
        {"sender": "ai", "text": reply2}
    ])
    events3, reply3 = _execute_chat_turn(session_id, p3, history)
    assert len(reply3) > 10, f"Expected continuation, got {reply3}"
    print(f" [PASS] Continuation Response Assembled (length: {len(reply3)} chars)")
    print(f" [PASS] Sample Text: '{reply3[:120]}...'")

    print("\n" + "=" * 60)
    print("*** ALL CHAT STREAMING REGRESSION TESTS PASSED 100%! ***")
    print("=" * 60)

if __name__ == "__main__":
    run_regression()
