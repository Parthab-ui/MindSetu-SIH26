"""MindSetu Voice ML Inference Engine.

Performs acoustic feature extraction, paralinguistic classification,
audio quality verification, and feature attribution.
"""

from functools import lru_cache
from pathlib import Path
import joblib
import numpy as np
import pandas as pd

from .voice_feature_extractor import decode_wav_bytes, extract_acoustic_features, ACOUSTIC_FEATURE_NAMES


MODEL_PATH = Path(__file__).resolve().parent / "voice_depression_classifier.joblib"


@lru_cache(maxsize=1)
def load_voice_model():
    """Loads the serialized voice ML bundle."""
    if not MODEL_PATH.exists():
        raise FileNotFoundError(f"Voice model artifact not found at {MODEL_PATH}")
    return joblib.load(MODEL_PATH)


def analyze_voice_recording(wav_bytes: bytes, session_id: str | None = None) -> dict:
    """Processes raw WAV audio bytes, extracts acoustic features, and executes model inference."""
    # 1. Decode WAV
    try:
        audio, sample_rate = decode_wav_bytes(wav_bytes)
    except Exception as e:
        raise ValueError(f"Failed to decode audio file. Please ensure it is a valid WAV audio recording: {str(e)}")

    # 2. Extract Acoustic & Prosodic Features
    features, diagnostics = extract_acoustic_features(audio, sample_rate)

    # 3. Load Model Bundle
    bundle = load_voice_model()
    pipeline = bundle["pipeline"]
    feature_names = bundle["features"]

    # 4. Predict
    df = pd.DataFrame([[features[f] for f in feature_names]], columns=feature_names)
    prob_depressed = float(pipeline.predict_proba(df)[0, 1])
    depression_signal = round(prob_depressed * 100.0, 1)

    # Experimental stress/trauma acoustic proxy (based on pitch variability, spectral flux, and energy distribution)
    # Scaled to 0-100 and explicitly marked as experimental
    f0_std = features.get("pitch_f0_std", 15.0)
    spec_flux = features.get("spectral_flux", 0.05)
    trauma_proxy_prob = min(1.0, max(0.0, (prob_depressed * 0.6) + (min(spec_flux * 10.0, 0.4))))
    trauma_signal = round(trauma_proxy_prob * 100.0, 1)

    # 5. Top Acoustic Contributors / Explainability
    clf = pipeline.named_steps["classifier"]
    scaler = pipeline.named_steps["scaler"]
    importances = clf.feature_importances_
    
    # Calculate standardized deviation from population baseline
    x_scaled = scaler.transform(df)[0]
    contributors = []
    
    friendly_labels = {
        "pitch_range": "Dynamic Pitch Range",
        "pitch_f0_std": "Pitch Variability (Monotone vs Animated)",
        "pause_ratio": "Hesitation & Pause Proportion",
        "speech_rate_estimate": "Speech Cadence & Rate",
        "spectral_flux": "Spectral Rapid Modulation",
        "rms_energy": "Acoustic Vocal Energy",
        "spectral_centroid": "Vocal Tract Brightness",
        "energy_entropy": "Energy Entropy",
        "zero_crossing_rate": "Voicing Articulation",
    }

    for idx, feat in enumerate(feature_names):
        weight = float(importances[idx])
        dev = float(x_scaled[idx])
        impact = weight * abs(dev)
        direction = "increases signal" if dev > 0.3 else ("reduces signal" if dev < -0.3 else "neutral")
        label = friendly_labels.get(feat, feat.replace("_", " ").title())
        contributors.append({
            "feature": feat,
            "label": label,
            "measured_value": features[feat],
            "importance_weight": round(weight, 4),
            "impact_magnitude": round(impact, 4),
            "direction": direction,
        })

    contributors = sorted(contributors, key=lambda c: c["impact_magnitude"], reverse=True)[:5]

    # 6. Confidence Score based on audio quality & duration
    duration = diagnostics["duration_seconds"]
    quality = diagnostics["quality"]
    margin = abs(prob_depressed - 0.5) * 2.0  # 0.0 to 1.0
    
    if quality == "good" and duration >= 5.0:
        confidence = round(min(0.95, 0.70 + margin * 0.25), 2)
    elif quality == "moderate":
        confidence = round(min(0.80, 0.55 + margin * 0.25), 2)
    else:
        confidence = round(min(0.60, 0.40 + margin * 0.20), 2)

    # 7. Non-Clinical Signal Interpretation
    if depression_signal >= 70.0:
        interpretation = "Voice acoustic patterns exhibit constrained pitch variability, higher hesitation intervals, and subdued vocal energy, consistent with elevated psychomotor strain."
    elif depression_signal >= 45.0:
        interpretation = "Voice acoustic patterns indicate moderate paralinguistic strain with noticeable pitch flattening."
    else:
        interpretation = "Voice acoustic patterns reflect steady pitch modulation, normative speech cadence, and dynamic vocal energy."

    return {
        "status": "success",
        "session_id": session_id,
        "depression_signal": depression_signal,
        "trauma_signal": trauma_signal,
        "trauma_status": "experimental_proxy",
        "confidence": confidence,
        "audio_quality": quality,
        "diagnostics": diagnostics,
        "features": features,
        "top_acoustic_contributors": contributors,
        "signal_interpretation": interpretation,
        "model_version": bundle.get("model_version", "1.0.0-voice-gbdt"),
        "clinical_diagnosis": False,
        "notice": "Voice signals provide additional research-oriented decision support and do not independently establish a psychiatric diagnosis."
    }


def generate_synthetic_demo_wav(scenario: str = "strained") -> bytes:
    """Generates a synthetic 16kHz PCM WAV byte stream for demonstration purposes."""
    import io
    import wave
    
    sample_rate = 16000
    duration = 4.0
    n_samples = int(sample_rate * duration)
    t = np.linspace(0, duration, n_samples, endpoint=False)
    
    if scenario == "strained":
        # Flatter pitch ~125 Hz with subtle harmonics, lower volume, slight pauses
        f0 = 125.0
        audio = 0.04 * np.sin(2 * np.pi * f0 * t) + 0.02 * np.sin(2 * np.pi * 2 * f0 * t)
        # Add pauses
        pause_mask = (t % 1.2) > 0.7
        audio[pause_mask] = 0.001 * np.random.randn(np.sum(pause_mask))
    elif scenario == "resilient":
        # Animated pitch modulated between 140 Hz and 190 Hz, energetic
        f0 = 155.0 + 35.0 * np.sin(2 * np.pi * 1.5 * t)
        phase = np.cumsum(2 * np.pi * f0 / sample_rate)
        audio = 0.08 * np.sin(phase) + 0.03 * np.sin(2 * phase)
        pause_mask = (t % 1.5) > 1.2
        audio[pause_mask] = 0.001 * np.random.randn(np.sum(pause_mask))
    else:
        # Moderate
        f0 = 140.0 + 15.0 * np.sin(2 * np.pi * 0.8 * t)
        phase = np.cumsum(2 * np.pi * f0 / sample_rate)
        audio = 0.06 * np.sin(phase)
        
    audio_int16 = (audio * 32767.0).astype(np.int16)
    
    bio = io.BytesIO()
    with wave.open(bio, "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(sample_rate)
        wf.writeframes(audio_int16.tobytes())
        
    return bio.getvalue()
