"""Tests for MindSetu-SIH26 Voice ML Endpoints and Inference Pipeline."""

import io
import sys
import wave
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from sih26186_server import app
from ml.voice_inference import generate_synthetic_demo_wav, analyze_voice_recording, load_voice_model
from ml.voice_feature_extractor import ACOUSTIC_FEATURE_NAMES, extract_acoustic_features, decode_wav_bytes

client = TestClient(app)


def test_voice_health_endpoint():
    res = client.get("/api/sih26186/voice/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "ready"
    assert data["model"] == "GradientBoostingClassifier"
    assert data["clinical_diagnosis"] is False
    assert len(data["features"]) == 24


def test_voice_demo_sample_endpoint():
    res = client.post("/api/sih26186/voice/demo-sample?scenario=strained")
    assert res.status_code == 200
    data = res.json()
    assert data["scenario"] == "strained"
    assert data["audio_base64"].startswith("data:audio/wav;base64,")
    assert "analysis" in data
    assert 0 <= data["analysis"]["depression_signal"] <= 100


def test_voice_analyze_with_synthetic_wav_multipart():
    wav_bytes = generate_synthetic_demo_wav("strained")
    files = {"audio": ("sample.wav", wav_bytes, "audio/wav")}
    data = {"session_id": "9f2e3b1a-4c5d-6e7f-8a9b-0c1d2e3f4a5b"}
    
    res = client.post("/api/sih26186/voice/analyze", data=data, files=files)
    assert res.status_code == 200
    body = res.json()
    assert body["status"] == "success"
    assert 0 <= body["depression_signal"] <= 100
    assert 0 <= body["trauma_signal"] <= 100
    assert body["audio_quality"] in ("good", "moderate", "poor")
    assert body["clinical_diagnosis"] is False
    assert len(body["top_acoustic_contributors"]) > 0


def test_voice_analyze_with_base64_payload():
    import base64
    wav_bytes = generate_synthetic_demo_wav("resilient")
    b64_str = base64.b64encode(wav_bytes).decode("ascii")
    
    payload = {
        "session_id": "9f2e3b1a-4c5d-6e7f-8a9b-0c1d2e3f4a5b",
        "audio_base64": f"data:audio/wav;base64,{b64_str}",
    }
    res = client.post("/api/sih26186/voice/analyze", json=payload)
    assert res.status_code == 200
    body = res.json()
    assert body["status"] == "success"
    assert 0 <= body["depression_signal"] <= 100
    assert body["confidence"] > 0


def test_voice_analyze_rejects_empty_or_too_short():
    bio = io.BytesIO()
    with wave.open(bio, "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(16000)
        wf.writeframes(b"\x00" * (16000 * 2 // 5))  # 0.2s
        
    short_wav = bio.getvalue()
    files = {"audio": ("short.wav", short_wav, "audio/wav")}
    res = client.post("/api/sih26186/voice/analyze", files=files)
    assert res.status_code == 422


def test_voice_feature_consistency_and_ordering():
    wav_bytes = generate_synthetic_demo_wav("resilient")
    audio, sr = decode_wav_bytes(wav_bytes)
    feats, diagnostics = extract_acoustic_features(audio, sr)
    
    assert len(feats) == len(ACOUSTIC_FEATURE_NAMES)
    for name in ACOUSTIC_FEATURE_NAMES:
        assert name in feats
        assert isinstance(feats[name], (float, int))
        
    bundle = load_voice_model()
    assert bundle["features"] == ACOUSTIC_FEATURE_NAMES


def test_voice_corrupted_audio_rejection():
    corrupt_bytes = b"NOT_A_REAL_WAV_FILE_HEADER_DATA_12345" * 10
    files = {"audio": ("corrupt.wav", corrupt_bytes, "audio/wav")}
    res = client.post("/api/sih26186/voice/analyze", files=files)
    assert res.status_code in (400, 422)
    assert "detail" in res.json() or "error" in res.json()

