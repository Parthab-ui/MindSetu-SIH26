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
        stream.getTracks().forEach((track) => track.stop());
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
      setMicError("Microphone access is needed for live recording. Use demo sample or skip.");
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
  }

function audioBufferToWav(audioBuffer) {
  const numChannels = 1;
  const sampleRate = audioBuffer.sampleRate;
  const bitDepth = 16;
  
  let channelData;
  if (audioBuffer.numberOfChannels > 1) {
    const ch0 = audioBuffer.getChannelData(0);
    const ch1 = audioBuffer.getChannelData(1);
    channelData = new Float32Array(ch0.length);
    for (let i = 0; i < ch0.length; i++) {
      channelData[i] = (ch0[i] + ch1[i]) / 2;
    }
  } else {
    channelData = audioBuffer.getChannelData(0);
  }

  const numFrames = channelData.length;
  const blockAlign = numChannels * (bitDepth / 8);
  const byteRate = sampleRate * blockAlign;
  const dataSize = numFrames * blockAlign;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  function writeString(offset, string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  writeString(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeString(36, "data");
  view.setUint32(40, dataSize, true);

  let offset = 44;
  for (let i = 0; i < channelData.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, channelData[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }

  return new Blob([view], { type: "audio/wav" });
}

  async function analyzeRecordedBlob(blob) {
    setLocalProcessing(true);
    if (setError) setError("");
    try {
      let finalBlob = blob;
      // Convert to standard WAV using Web Audio API if not already WAV
      if (!blob.type || !blob.type.includes("wav")) {
        try {
          const AudioContextClass = window.AudioContext || window.webkitAudioContext;
          if (AudioContextClass) {
            const audioCtx = new AudioContextClass();
            const arrayBuffer = await blob.arrayBuffer();
            const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
            finalBlob = audioBufferToWav(audioBuffer);
            await audioCtx.close();
          }
        } catch (convErr) {
          console.warn("AudioContext WAV conversion fallback:", convErr);
        }
      }

      const reader = new FileReader();
      reader.readAsDataURL(finalBlob);
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
    <div className="page-container narrow">
      <div style={{ marginBottom: "18px", animation: "slideUp 280ms cubic-bezier(0.2,0.8,0.2,1) both" }}>
        <span className="eyebrow">STEP 04 · VOICE ML</span>
        <h1 className="page-title">Voice Check</h1>
        <p className="page-subtitle">
          Optional speech check for objective paralinguistic signals.
        </p>
      </div>

      <div className="card card-elevated" style={{ animation: "slideUp 340ms cubic-bezier(0.2,0.8,0.2,1) both" }}>
        {/* Prompt */}
        <div
          style={{
            padding: "12px 14px",
            background: "var(--bg-input)",
            borderLeft: "3px solid var(--primary)",
            borderRadius: "var(--radius-md)",
            marginBottom: "16px",
          }}
        >
          <span style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
            Reflection prompt (30–45 sec):
          </span>
          <p style={{ margin: 0, fontSize: "0.90rem", fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.4 }}>
            "How has your recent duty period affected your energy, sleep, or focus?"
          </p>
        </div>

        {/* Demo Presets */}
        <div className="preset-container" style={{ marginBottom: "16px" }}>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <button
              type="button"
              className="preset-chip-btn"
              onClick={() => handleLoadDemoSample("strained")}
              disabled={isRecording || localProcessing}
            >
              ⚡ Strained Audio Sample
            </button>
            <button
              type="button"
              className="preset-chip-btn"
              onClick={() => handleLoadDemoSample("resilient")}
              disabled={isRecording || localProcessing}
            >
              🌿 Resilient Audio Sample
            </button>
          </div>
        </div>

        {/* Recording Interface */}
        <div
          style={{
            textAlign: "center",
            padding: "20px 16px",
            background: "var(--bg-surface-elevated)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-lg)",
            marginBottom: "16px",
          }}
        >
          {isRecording ? (
            <div>
              <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#ef4444", marginBottom: "4px" }}>
                Listening… {formatTime(recordingSeconds)}
              </div>
              <p style={{ fontSize: "0.80rem", color: "var(--text-muted)", marginBottom: "12px" }}>
                Speak naturally about your duty load.
              </p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={stopRecording}
                style={{ background: "#ef4444", borderColor: "#ef4444" }}
              >
                ⏹ Stop & Analyze
              </button>
            </div>
          ) : (
            <div>
              <button
                type="button"
                className="btn btn-primary"
                onClick={startRecording}
                disabled={localProcessing}
                style={{ padding: "12px 24px", fontSize: "0.95rem" }}
              >
                🎙️ {audioUrl ? "Record Again" : "Start Live Voice Check"}
              </button>
            </div>
          )}

          {micError && (
            <div style={{ marginTop: "10px", padding: "8px 10px", background: "rgba(239, 68, 68, 0.1)", border: "1px solid #ef4444", borderRadius: "var(--radius-md)", fontSize: "0.78rem", color: "#ef4444" }}>
              {micError}
            </div>
          )}
        </div>

        {/* Processing State */}
        {localProcessing && (
          <div style={{ textAlign: "center", padding: "12px" }}>
            <div className="spinner-ring" style={{ margin: "0 auto 8px" }} />
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", margin: 0 }}>
              Analyzing voice…
            </p>
          </div>
        )}

        {/* Result Card */}
        {voiceResult && !localProcessing && (
          <div
            style={{
              padding: "14px",
              background: "var(--bg-input)",
              border: "1px solid var(--border-medium)",
              borderRadius: "var(--radius-md)",
              marginBottom: "16px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <strong style={{ fontSize: "0.88rem" }}>Voice Signal Ready</strong>
              <span className="badge" style={{ fontSize: "0.72rem" }}>
                Quality: {voiceResult.audio_quality?.toUpperCase()}
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "8px" }}>
              <div style={{ padding: "8px 10px", background: "var(--bg-surface)", borderRadius: "var(--radius-sm)" }}>
                <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", display: "block" }}>Depression Signal</span>
                <strong style={{ fontSize: "1.2rem", color: voiceResult.depression_signal >= 70 ? "#ef4444" : "#10b981" }}>
                  {voiceResult.depression_signal}%
                </strong>
              </div>
              <div style={{ padding: "8px 10px", background: "var(--bg-surface)", borderRadius: "var(--radius-sm)" }}>
                <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", display: "block" }}>Acoustic Stress</span>
                <strong style={{ fontSize: "1.2rem", color: "var(--primary)" }}>
                  {voiceResult.trauma_signal}%
                </strong>
              </div>
            </div>

            <p style={{ fontSize: "0.80rem", color: "var(--text-secondary)", margin: 0, lineHeight: 1.35 }}>
              {voiceResult.signal_interpretation}
            </p>
          </div>
        )}

        {/* Privacy badge */}
        <div style={{ padding: "8px 12px", background: "var(--bg-input)", borderRadius: "var(--radius-sm)", fontSize: "0.76rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "6px", marginBottom: "16px" }}>
          <span>🔒</span>
          <span>In-memory analysis. Audio is not saved.</span>
        </div>

        {error && (
          <div className="error-alert" role="alert" style={{ marginBottom: "16px" }}>
            {error}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button type="button" className="btn btn-ghost" onClick={onBack} disabled={isRecording || localProcessing || loading}>
            ← Back
          </button>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onNext}
              disabled={isRecording || localProcessing || loading}
            >
              Skip
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={onNext}
              disabled={isRecording || localProcessing || loading}
            >
              {loading ? "Analyzing…" : "View Summary →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
