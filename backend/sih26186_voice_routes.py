"""FastAPI Route Registration for Voice ML Analysis in MindSetu SIH26186.

Endpoints:
- GET  /api/sih26186/voice/health
- POST /api/sih26186/voice/demo-sample
- POST /api/sih26186/voice/analyze
"""

import base64
from typing import Optional
from fastapi import File, Form, HTTPException, UploadFile, status
from pydantic import BaseModel

from ml.voice_inference import (
    analyze_voice_recording,
    generate_synthetic_demo_wav,
    load_voice_model,
)
from ml.voice_feature_extractor import ACOUSTIC_FEATURE_NAMES


class VoiceAnalysisBase64Request(BaseModel):
    session_id: Optional[str] = None
    audio_base64: str
    scenario: Optional[str] = None


def register_voice_routes(app):
    @app.get("/api/sih26186/voice/health")
    def get_voice_model_health():
        """Returns the operational status of the Voice ML subsystem."""
        try:
            bundle = load_voice_model()
            return {
                "status": "ready",
                "model": "GradientBoostingClassifier",
                "model_version": bundle.get("model_version", "1.0.0-voice-gbdt"),
                "features_count": len(bundle.get("features", [])),
                "features": bundle.get("features", ACOUSTIC_FEATURE_NAMES),
                "metrics": bundle.get("metrics", {}),
                "description": "Acoustic and prosodic paralinguistic voice screening model",
                "clinical_diagnosis": False,
            }
        except Exception as e:
            return {
                "status": "degraded",
                "error": str(e),
                "features": ACOUSTIC_FEATURE_NAMES,
            }

    @app.post("/api/sih26186/voice/demo-sample")
    def get_demo_voice_sample(scenario: str = "strained"):
        """Generates a synthetic 16kHz PCM WAV demo sample for noisy hackathon environments."""
        if scenario not in ("strained", "resilient", "moderate"):
            scenario = "strained"
        wav_bytes = generate_synthetic_demo_wav(scenario)
        result = analyze_voice_recording(wav_bytes, session_id="demo-session")
        audio_b64 = base64.b64encode(wav_bytes).decode("ascii")
        return {
            "scenario": scenario,
            "audio_base64": f"data:audio/wav;base64,{audio_b64}",
            "analysis": result,
        }

    @app.post("/api/sih26186/voice/analyze")
    async def analyze_voice(
        audio: Optional[UploadFile] = File(None),
        session_id: Optional[str] = Form(None),
        payload: Optional[VoiceAnalysisBase64Request] = None,
    ):
        """Processes audio and extracts paralinguistic mental health signals.

        Raw audio is processed entirely in-memory and immediately discarded (zero audio stored).
        """
        raw_bytes = None
        active_session_id = session_id

        # 1. Check if multipart file upload
        if audio is not None:
            # Read file with 10MB limit
            raw_bytes = await audio.read()
            if len(raw_bytes) > 10 * 1024 * 1024:
                raise HTTPException(
                    status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                    detail="Audio file exceeds maximum 10MB size limit.",
                )
        elif payload is not None and payload.audio_base64:
            active_session_id = payload.session_id or active_session_id
            # Parse base64
            b64_str = payload.audio_base64
            if "," in b64_str:
                b64_str = b64_str.split(",", 1)[1]
            try:
                raw_bytes = base64.b64decode(b64_str)
            except Exception:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid base64 audio data.",
                )
        else:
            # Fallback to demo sample if scenario is specified
            scenario = "strained"
            raw_bytes = generate_synthetic_demo_wav(scenario)

        if not raw_bytes or len(raw_bytes) < 100:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No valid audio data received.",
            )

        # 2. Run Voice Inference
        try:
            analysis = analyze_voice_recording(raw_bytes, session_id=active_session_id)
            return analysis
        except ValueError as ve:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=str(ve),
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Voice processing failed: {str(e)}",
            )
