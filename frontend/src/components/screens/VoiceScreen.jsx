import React, { useState, useRef, useEffect } from "react";
import { api } from "../../services/api";

export function VoiceScreen({ sessionId, onNext, onBack, voiceResult, setVoiceResult, loading, error, setError }) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [localProcessing, setLocalProcessing] = useState(false);
  const [micError, setMicError] = useState("");

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerIntervalRef = useRef(null);

  // Clean up audio URL on unmount
  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [audioUrl]);

  async function startRecording() {
    setMicError("");
    setAudioBlob(null);
    setAudioUrl(null);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType || "audio/wav" });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        // Stop all tracks to release mic
        stream.getTracks().forEach((track) => track.stop());
        // Automatically analyze recorded voice
        await analyzeRecordedBlob(blob);
      };

      mediaRecorder.start(200);
      setIsRecording(true);
      setRecordingSeconds(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev >= 45) {
            stopRecording();
            return 45;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      console.warn("Microphone access failed:", err);
      setMicError("Microphone access was denied or is unavailable. You can use a demo sample below or skip this step.");
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
  }

  async function analyzeRecordedBlob(blob) {
    setLocalProcessing(true);
    if (setError) setError("");
    try {
      // Convert to base64
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64Audio = reader.result;
        try {
          const res = await api.analyzeVoice(sessionId, base64Audio);
          setVoiceResult(res);
        } catch (err) {
          if (setError) setError(err.message);
        } finally {
          setLocalProcessing(false);
        }
      };
    } catch (err) {
      if (setError) setError(err.message);
      setLocalProcessing(false);
    }
  }

  async function handleLoadDemoSample(scenario) {
    setLocalProcessing(true);
    if (setError) setError("");
    try {
      const res = await api.getVoiceDemoSample(scenario);
      setVoiceResult(res.analysis);
      setAudioUrl(res.audio_base64);
    } catch (err) {
      if (setError) setError(err.message);
    } finally {
      setLocalProcessing(false);
    }
  }

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="page-container">
      {/* Stepper Header */}
      <div className="stepper-header" role="navigation" aria-label="Progress">
        <div className="stepper-tab completed">
          <span className="step-num">✓</span>
          <span>1. Profile</span>
        </div>
        <div className="stepper-tab completed">
          <span className="step-num">✓</span>
          <span>2. Wellbeing</span>
        </div>
        <div className="stepper-tab completed">
          <span className="step-num">✓</span>
          <span>3. Duty Context</span>
        </div>
        <div className="stepper-tab active" aria-current="step">
          <span className="step-num">4</span>
          <span>4. Voice Check</span>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 740, margin: "0 auto" }}>
        <div className="card-header" style={{ marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: "1.6rem" }}>🎙️</span>
            <div>
              <h2 style={{ fontSize: "1.3rem", fontWeight: 700, margin: 0 }}>
                Multimodal Voice Check (Optional ML Signal)
              </h2>
              <p style={{ margin: "4px 0 0", fontSize: "0.86rem", color: "var(--text-secondary)" }}>
                Speech paralinguistics provide an objective behavioral signal alongside your self-reported pulse.
              </p>
            </div>
          </div>
        </div>

        {/* Operational Context Prompt */}
        <div
          style={{
            padding: "16px 18px",
            background: "var(--bg-input)",
            borderLeft: "4px solid var(--primary)",
            borderRadius: "var(--radius-md)",
            marginBottom: 20,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
            <span className="dimension-badge">Operational Voice Reflection</span>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Target: 30–45s Speech</span>
          </div>
          <p style={{ margin: 0, fontSize: "0.95rem", fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.5 }}>
            "Briefly describe how your recent duty period has affected your energy, sleep, concentration, or ability to decompress off-duty."
          </p>
        </div>

        {/* 1-Click Demo Voice Presets for Presentations */}
        <div className="preset-container" style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <span style={{ fontSize: "0.9rem" }}>⚡</span>
            <span style={{ fontSize: "0.80rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)" }}>
              SIH Judge Demonstration Voice Samples:
            </span>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              type="button"
              className="preset-chip-btn"
              onClick={() => handleLoadDemoSample("strained")}
              disabled={isRecording || localProcessing}
            >
              <span>⚡</span> Strained Shift Audio (Monotone / Hesitation)
            </button>
            <button
              type="button"
              className="preset-chip-btn"
              onClick={() => handleLoadDemoSample("resilient")}
              disabled={isRecording || localProcessing}
            >
              <span>🌿</span> Resilient Baseline Audio (Animated / Rhythmic)
            </button>
          </div>
        </div>

        {/* Recording Interface */}
        <div
          style={{
            textAlign: "center",
            padding: "24px 20px",
            background: "var(--bg-surface-elevated)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-lg)",
            marginBottom: 20,
          }}
        >
          {isRecording ? (
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  background: "rgba(239, 68, 68, 0.15)",
                  border: "2px solid #ef4444",
                  animation: "pulseSpark 1.2s infinite ease-in-out",
                  marginBottom: 12,
                }}
              >
                <span style={{ fontSize: "2rem" }}>🎙️</span>
              </div>
              <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#ef4444", marginBottom: 6 }}>
                Recording… {formatTime(recordingSeconds)}
              </div>
              <p style={{ fontSize: "0.84rem", color: "var(--text-muted)", marginBottom: 14 }}>
                Speak naturally about your duty load and energy. Maximum 45 seconds.
              </p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={stopRecording}
                style={{ background: "#ef4444", borderColor: "#ef4444" }}
              >
                ⏹ Stop & Analyze Speech
              </button>
            </div>
          ) : (
            <div>
              <button
                type="button"
                className="btn btn-primary"
                onClick={startRecording}
                disabled={localProcessing}
                style={{ padding: "12px 28px", fontSize: "1rem" }}
              >
                🎙️ {audioUrl ? "Record Again" : "Start Live Voice Check"}
              </button>
              <p style={{ fontSize: "0.80rem", color: "var(--text-muted)", marginTop: 10, marginBottom: 0 }}>
                Requires microphone permission. Audio is processed in memory and never stored.
              </p>
            </div>
          )}

          {micError && (
            <div style={{ marginTop: 12, padding: "8px 12px", background: "rgba(239, 68, 68, 0.1)", border: "1px solid #ef4444", borderRadius: "var(--radius-md)", fontSize: "0.82rem", color: "#ef4444" }}>
              {micError}
            </div>
          )}
        </div>

        {/* Local Processing State */}
        {localProcessing && (
          <div style={{ textAlign: "center", padding: 16 }}>
            <div className="spinner-ring" style={{ margin: "0 auto 10px" }} />
            <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", margin: 0 }}>
              Extracting acoustic features & running paralinguistic ML classifier…
            </p>
          </div>
        )}

        {/* Voice Analysis Result Card */}
        {voiceResult && !localProcessing && (
          <div
            style={{
              padding: 16,
              background: "var(--bg-input)",
              border: "1px solid var(--border-medium)",
              borderRadius: "var(--radius-lg)",
              marginBottom: 20,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: "1.2rem" }}>✅</span>
                <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>Speech Paralinguistics Extracted</span>
              </div>
              <span
                className="badge"
                style={{
                  background: voiceResult.audio_quality === "good" ? "rgba(16, 185, 129, 0.15)" : "rgba(245, 158, 11, 0.15)",
                  color: voiceResult.audio_quality === "good" ? "#10b981" : "#f59e0b",
                  border: "1px solid currentColor",
                }}
              >
                Quality: {voiceResult.audio_quality?.toUpperCase()} (Confidence {Math.round((voiceResult.confidence || 0.8) * 100)}%)
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 10 }}>
              <div style={{ padding: "10px 12px", background: "var(--bg-surface)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Depressive Voice Signal</div>
                <div style={{ fontSize: "1.4rem", fontWeight: 800, color: voiceResult.depression_signal >= 70 ? "#ef4444" : (voiceResult.depression_signal >= 45 ? "#f59e0b" : "#10b981") }}>
                  {voiceResult.depression_signal}%
                </div>
              </div>
              <div style={{ padding: "10px 12px", background: "var(--bg-surface)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Acoustic Stress Proxy</div>
                <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--primary)" }}>
                  {voiceResult.trauma_signal}% <span style={{ fontSize: "0.70rem", fontWeight: 500, color: "var(--text-muted)" }}>(Experimental)</span>
                </div>
              </div>
            </div>

            <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", margin: "0 0 10px", lineHeight: 1.4 }}>
              <strong>Interpretation:</strong> {voiceResult.signal_interpretation}
            </p>

            {voiceResult.top_acoustic_contributors && voiceResult.top_acoustic_contributors.length > 0 && (
              <div>
                <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", marginBottom: 6, textTransform: "uppercase" }}>
                  Primary Acoustic Biomarkers:
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {voiceResult.top_acoustic_contributors.slice(0, 3).map((c, idx) => (
                    <span key={idx} className="dimension-badge" style={{ fontSize: "0.72rem" }}>
                      {c.label} ({c.direction})
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Privacy Note */}
        <div style={{ padding: "10px 14px", background: "var(--bg-input)", borderRadius: "var(--radius-md)", fontSize: "0.78rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
          <span>🔒</span>
          <span>
            <strong>Zero Raw Audio Stored:</strong> Audio waveforms are processed in-memory and immediately discarded after acoustic feature extraction.
          </span>
        </div>

        {/* Navigation Buttons */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button type="button" className="btn btn-ghost" onClick={onBack} disabled={isRecording || localProcessing}>
            ← Back to Duty Context
          </button>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onNext}
              disabled={isRecording || localProcessing}
              title="Proceed to analysis without voice ML input"
            >
              Skip Voice Check
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={onNext}
              disabled={isRecording || localProcessing}
            >
              Generate Multimodal Summary →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
