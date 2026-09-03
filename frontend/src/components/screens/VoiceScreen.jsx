import { useState, useRef, useEffect, useCallback } from "react";
import { api } from "../../services/api";

const MIN_RECORDING_SECONDS = 10;
const TARGET_RECORDING_SECONDS = 12;
const MAX_RECORDING_SECONDS = 15;

const SPEAKING_SCRIPT =
  "“Lately, I’ve been feeling a little stressed and tired. My workload has been quite demanding, and sometimes I find it difficult to get enough rest. I’m trying to manage it as best as I can.”";

export function VoiceScreen({
  sessionId,
  onNext,
  onBack,
  voiceResult,
  setVoiceResult,
  loading,
  error,
  setError,
}) {
  const [recorderState, setRecorderState] = useState("idle"); // 'idle' | 'countdown' | 'recording' | 'processing' | 'complete' | 'too_short' | 'low_speech' | 'mic_denied' | 'error'
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [countdownNum, setCountdownNum] = useState(3);
  const [audioUrl, setAudioUrl] = useState(null);
  const [micActive, setMicActive] = useState(false);
  const [localErrorDetail, setLocalErrorDetail] = useState("");

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerIntervalRef = useRef(null);
  const countdownIntervalRef = useRef(null);
  const audioStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);
  const canvasRef = useRef(null);
  const peakAmplitudeRef = useRef(0);
  const recordingDurationRef = useRef(0);

  // Clean up object URLs and audio contexts on unmount
  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, [audioUrl]);

  // Convert AudioBuffer to 16-bit PCM WAV Blob
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
    view.setUint16(20, 1, true); // PCM format
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

  // Draw audio waveform on canvas
  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    if (analyserRef.current && recorderState === "recording") {
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyserRef.current.getByteFrequencyData(dataArray);

      // Track max peak amplitude for low-speech detection
      let currentPeak = 0;
      for (let i = 0; i < bufferLength; i++) {
        if (dataArray[i] > currentPeak) currentPeak = dataArray[i];
      }
      if (currentPeak > peakAmplitudeRef.current) {
        peakAmplitudeRef.current = currentPeak;
      }

      // Draw mirrored frequency bars with gradient
      const barCount = 36;
      const barWidth = 4;
      const gap = (width - barCount * barWidth) / (barCount + 1);

      for (let i = 0; i < barCount; i++) {
        const binIndex = Math.floor((i / barCount) * (bufferLength * 0.65));
        const value = dataArray[binIndex] || 0;
        const normalized = value / 255;
        const barHeight = Math.max(4, normalized * (height - 8));
        const x = gap + i * (barWidth + gap);
        const y = (height - barHeight) / 2;

        const grad = ctx.createLinearGradient(0, y, 0, y + barHeight);
        grad.addColorStop(0, "#14b8a6");
        grad.addColorStop(1, "#38bdf8");

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 2);
        ctx.fill();
      }

      animationFrameRef.current = requestAnimationFrame(drawWaveform);
    } else {
      // Idle / Resting baseline
      ctx.strokeStyle = "rgba(143, 174, 192, 0.25)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      const mid = height / 2;
      for (let x = 0; x < width; x += 6) {
        const y = mid + Math.sin(x * 0.05 + Date.now() * 0.002) * 2;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      if (recorderState === "idle" || recorderState === "countdown") {
        animationFrameRef.current = requestAnimationFrame(drawWaveform);
      }
    }
  }, [recorderState]);

  useEffect(() => {
    drawWaveform();
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [drawWaveform]);

  // Send audio to backend for ML feature extraction & scoring
  const processAndAnalyzeAudio = useCallback(async (blob) => {
    setRecorderState("processing");
    if (setError) setError("");

    try {
      let finalBlob = blob;
      // Convert to standard WAV using Web Audio API if needed
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
          setRecorderState("complete");
        } catch (err) {
          const msg = err.message || "";
          if (
            msg.toLowerCase().includes("silent") ||
            msg.toLowerCase().includes("volume") ||
            msg.toLowerCase().includes("low")
          ) {
            setRecorderState("low_speech");
          } else {
            setRecorderState("error");
            setLocalErrorDetail("We couldn't process that recording.");
          }
          if (setError) setError(err.message);
        }
      };
    } catch (err) {
      setRecorderState("error");
      setLocalErrorDetail("We couldn't process that recording.");
      if (setError) setError(err.message);
    }
  }, [sessionId, setError, setVoiceResult]);

  // Handle actual recording start after countdown or direct start
  const beginMediaRecording = useCallback(async () => {
    setRecorderState("recording");
    setRecordingSeconds(0);
    recordingDurationRef.current = 0;
    peakAmplitudeRef.current = 0;
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;
      setMicActive(true);

      // Setup Web Audio Analyser for live visualization
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        const audioCtx = new AudioCtx();
        audioContextRef.current = audioCtx;
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 128;
        analyser.smoothingTimeConstant = 0.75;
        source.connect(analyser);
        analyserRef.current = analyser;
      }

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const duration = recordingDurationRef.current;
        const peak = peakAmplitudeRef.current;

        // Release audio stream tracks
        stream.getTracks().forEach((track) => track.stop());
        setMicActive(false);

        if (audioContextRef.current && audioContextRef.current.state !== "closed") {
          audioContextRef.current.close().catch(() => {});
        }

        // STEP 16: Check if recording was too short (< 10 seconds)
        if (duration < MIN_RECORDING_SECONDS) {
          setRecorderState("too_short");
          return;
        }

        // STEP 17: Check if recording was essentially silent
        if (peak < 12) {
          setRecorderState("low_speech");
          return;
        }

        // Valid recording -> process audio
        const blob = new Blob(audioChunksRef.current, {
          type: mediaRecorder.mimeType || "audio/wav",
        });
        setAudioUrl(URL.createObjectURL(blob));
        await processAndAnalyzeAudio(blob);
      };

      mediaRecorder.start(200);

      // Start elapsed timer (1-second tick up to MAX_RECORDING_SECONDS)
      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => {
          const nextSec = prev + 1;
          recordingDurationRef.current = nextSec;

          if (nextSec >= MAX_RECORDING_SECONDS) {
            clearInterval(timerIntervalRef.current);
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
              mediaRecorderRef.current.stop();
            }
            return MAX_RECORDING_SECONDS;
          }
          return nextSec;
        });
      }, 1000);
    } catch (err) {
      console.warn("Microphone access failed:", err);
      setMicActive(false);
      setRecorderState("mic_denied");
      setLocalErrorDetail("Microphone access is required for Voice Check.");
    }
  }, [processAndAnalyzeAudio]);

  // Initiate countdown before recording
  function handleInitiateRecording() {
    if (setError) setError("");
    setLocalErrorDetail("");
    setRecorderState("countdown");
    setCountdownNum(3);

    let count = 3;
    countdownIntervalRef.current = setInterval(() => {
      count -= 1;
      if (count <= 0) {
        clearInterval(countdownIntervalRef.current);
        beginMediaRecording();
      } else {
        setCountdownNum(count);
      }
    }, 900);
  }

  // Skip countdown and start recording immediately
  function handleSkipCountdown() {
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    beginMediaRecording();
  }

  // User manually stops recording
  function handleStopRecording() {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  }

  // Load demo sample for testing in noisy environments
  async function handleLoadDemoSample(scenario) {
    setRecorderState("processing");
    if (setError) setError("");
    setLocalErrorDetail("");
    try {
      const res = await api.getVoiceDemoSample(scenario);
      setVoiceResult(res.analysis);
      setAudioUrl(res.audio_base64);
      setRecorderState("complete");
    } catch (err) {
      setRecorderState("error");
      setLocalErrorDetail("Failed to load demo sample.");
      if (setError) setError(err.message);
    }
  }

  // Reset to idle state for re-recording
  function handleResetRecording() {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setRecordingSeconds(0);
    setLocalErrorDetail("");
    if (setError) setError("");
    setRecorderState("idle");
  }

  // Format MM:SS
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const isTargetReached = recordingSeconds >= MIN_RECORDING_SECONDS;
  const progressPercent = Math.min(100, Math.round((recordingSeconds / TARGET_RECORDING_SECONDS) * 100));

  return (
    <div className="page-container narrow voice-check-wrapper">
      {/* Step Header */}
      <header style={{ marginBottom: "18px", animation: "slideUp 280ms cubic-bezier(0.2,0.8,0.2,1) both" }}>
        <span className="eyebrow">STEP 04 · VOICE CHECK</span>
        <h1 className="page-title">Voice Check</h1>
        <p className="page-subtitle">
          A short voice sample helps us understand patterns in your speech.
        </p>
      </header>

      {/* Main Container Card */}
      <main className="card card-elevated" style={{ animation: "slideUp 340ms cubic-bezier(0.2,0.8,0.2,1) both" }}>
        {/* STEP 8: Instruction Card */}
        <section className="voice-instruction-card" aria-label="Speaking Instructions">
          <div className="voice-instruction-header">
            <span>📝</span>
            <span>Before you begin</span>
          </div>
          <div className="voice-script-helper">
            You don't need to sound perfect. Speak naturally.
          </div>
          <blockquote className="voice-script-quote">
            {SPEAKING_SCRIPT}
          </blockquote>
        </section>

        {/* STEP 9: Central Recording Area */}
        <section className="voice-recording-area" aria-label="Recording Interface">
          {/* Microphone Status Indicator */}
          <div className="voice-mic-status-row">
            <span
              className={`voice-mic-dot ${
                recorderState === "recording" ? "active" : micActive ? "ready" : ""
              }`}
              aria-hidden="true"
            />
            <span>
              {recorderState === "recording"
                ? "Microphone active"
                : micActive
                ? "Microphone connected"
                : "Microphone ready"}
            </span>
          </div>

          {/* Waveform Visualization Canvas */}
          <div className="voice-canvas-wrap">
            <canvas
              ref={canvasRef}
              width={480}
              height={64}
              role="img"
              aria-label="Live audio waveform visualization"
            />
          </div>

          {/* Dynamic State Machine Display */}
          {recorderState === "countdown" && (
            <div className="voice-countdown-box">
              <span className="voice-countdown-num">{countdownNum}</span>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", margin: "0 0 8px 0" }}>
                Get ready to speak…
              </p>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={handleSkipCountdown}
                style={{ fontSize: "0.78rem", padding: "4px 10px" }}
              >
                Skip countdown
              </button>
            </div>
          )}

          {recorderState === "recording" && (
            <div>
              {/* Compact Timer 00:07 / 00:12 */}
              <div className="voice-timer-row">
                <span className="voice-timer-digits">
                  {formatTime(recordingSeconds)} / {formatTime(TARGET_RECORDING_SECONDS)}
                </span>
                <span className={`voice-target-label ${isTargetReached ? "reached" : ""}`}>
                  {isTargetReached ? "✓ Target reached" : "10–15s target"}
                </span>
              </div>

              {/* Progress Bar */}
              <div
                className="voice-progress-track"
                role="progressbar"
                aria-valuenow={recordingSeconds}
                aria-valuemin={0}
                aria-valuemax={TARGET_RECORDING_SECONDS}
              >
                <div
                  className={`voice-progress-fill ${isTargetReached ? "reached" : ""}`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Spoken Feedback */}
              <div className="voice-status-feedback">
                {isTargetReached
                  ? "Target reached — finish your sentence or stop anytime."
                  : "Keep speaking naturally…"}
              </div>

              {/* Primary Stop CTA */}
              <button
                type="button"
                className="voice-cta-record recording"
                onClick={handleStopRecording}
                aria-label="Stop recording audio"
              >
                ⏹ Stop Recording
              </button>
            </div>
          )}

          {recorderState === "processing" && (
            <div style={{ padding: "16px" }} aria-live="polite">
              <div className="spinner-ring" style={{ margin: "0 auto 12px" }} />
              <strong style={{ fontSize: "0.95rem", display: "block", marginBottom: "4px", color: "var(--primary)" }}>
                ✓ Voice sample captured
              </strong>
              <p style={{ fontSize: "0.84rem", color: "var(--text-secondary)", margin: 0 }}>
                Analyzing your voice…
              </p>
            </div>
          )}

          {recorderState === "complete" && (
            <div style={{ padding: "8px 0" }} aria-live="polite">
              <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#10b981", fontWeight: 700, fontSize: "0.98rem", marginBottom: "12px" }}>
                <span>✓</span>
                <span>Voice analysis complete</span>
              </div>
              <p style={{ fontSize: "0.84rem", color: "var(--text-secondary)", margin: "0 0 16px 0" }}>
                Your speech signals have been analyzed and added to your screening session.
              </p>
              <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={handleResetRecording}
                  style={{ fontSize: "0.86rem" }}
                >
                  🔄 Record Again
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={onNext}
                  disabled={loading}
                  style={{ fontSize: "0.88rem", padding: "10px 20px" }}
                >
                  {loading ? "Generating Analysis…" : "View Summary →"}
                </button>
              </div>
            </div>
          )}

          {recorderState === "idle" && (
            <div>
              <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", marginBottom: "16px" }}>
                Ready when you are
              </p>
              <button
                type="button"
                className="btn btn-primary voice-cta-record"
                onClick={handleInitiateRecording}
                disabled={loading}
                style={{ fontSize: "0.96rem" }}
                aria-label="Start recording voice"
              >
                🎙️ Start Recording
              </button>
            </div>
          )}

          {/* Error States */}
          {recorderState === "too_short" && (
            <div className="voice-feedback-card warning" role="alert">
              <span>⏱️ A little more speech will help us analyze your sample reliably.</span>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleResetRecording}
                style={{ fontSize: "0.84rem", padding: "8px 18px" }}
              >
                🎙️ Record Again
              </button>
            </div>
          )}

          {recorderState === "low_speech" && (
            <div className="voice-feedback-card warning" role="alert">
              <span>🔊 We need a little more spoken audio. Please try again and speak naturally.</span>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleResetRecording}
                style={{ fontSize: "0.84rem", padding: "8px 18px" }}
              >
                🎙️ Try Again
              </button>
            </div>
          )}

          {recorderState === "mic_denied" && (
            <div className="voice-feedback-card error" role="alert">
              <span>🔒 Microphone access is required for Voice Check.</span>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center" }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleInitiateRecording}
                  style={{ fontSize: "0.82rem", padding: "6px 14px" }}
                >
                  Allow Microphone
                </button>
                <button
                  type="button"
                  className="preset-chip-btn"
                  onClick={() => handleLoadDemoSample("strained")}
                  style={{ fontSize: "0.80rem" }}
                >
                  Use Demo Audio
                </button>
              </div>
            </div>
          )}

          {recorderState === "error" && (
            <div className="voice-feedback-card error" role="alert">
              <span>⚠️ {localErrorDetail || "We couldn't process that recording."}</span>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleResetRecording}
                style={{ fontSize: "0.84rem", padding: "8px 18px" }}
              >
                🔄 Try Again
              </button>
            </div>
          )}
        </section>

        {/* Voice Result Metrics (When Analysis Available) */}
        {voiceResult && recorderState !== "recording" && recorderState !== "processing" && (
          <section className="voice-result-container" aria-label="Voice Analysis Results">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <strong style={{ fontSize: "0.88rem", color: "var(--text-primary)" }}>
                Objective Acoustic Signals
              </strong>
              <span className="badge" style={{ fontSize: "0.72rem" }}>
                Quality: {voiceResult.audio_quality?.toUpperCase()}
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
              <div style={{ padding: "10px 12px", background: "var(--bg-surface)", borderRadius: "var(--radius-sm)" }}>
                <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", display: "block" }}>
                  Depression Signal
                </span>
                <strong
                  style={{
                    fontSize: "1.25rem",
                    color: voiceResult.depression_signal >= 70 ? "#ef4444" : "#10b981",
                  }}
                >
                  {voiceResult.depression_signal}%
                </strong>
              </div>
              <div style={{ padding: "10px 12px", background: "var(--bg-surface)", borderRadius: "var(--radius-sm)" }}>
                <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", display: "block" }}>
                  Acoustic Stress
                </span>
                <strong style={{ fontSize: "1.25rem", color: "var(--primary)" }}>
                  {voiceResult.trauma_signal}%
                </strong>
              </div>
            </div>

            <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", margin: 0, lineHeight: 1.4 }}>
              {voiceResult.signal_interpretation}
            </p>
          </section>
        )}

        {/* Demo Samples (Secondary Option for Judges / Reviewers) */}
        <div style={{ marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
              Evaluation Presets (For Noisy Environments)
            </span>
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <button
              type="button"
              className="preset-chip-btn"
              onClick={() => handleLoadDemoSample("strained")}
              disabled={recorderState === "recording" || recorderState === "processing"}
            >
              ⚡ Strained Voice Sample
            </button>
            <button
              type="button"
              className="preset-chip-btn"
              onClick={() => handleLoadDemoSample("resilient")}
              disabled={recorderState === "recording" || recorderState === "processing"}
            >
              🌿 Resilient Voice Sample
            </button>
          </div>
        </div>

        {/* STEP 15: Privacy & Reassurance Note */}
        <footer className="voice-privacy-footer">
          <span aria-hidden="true">🔒</span>
          <span>Your voice sample is used only for this screening experience. In-memory analysis. Audio is not saved.</span>
        </footer>

        {error && (
          <div className="error-alert" role="alert" style={{ marginBottom: "16px" }}>
            {error}
          </div>
        )}

        {/* Navigation Actions */}
        <nav
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
          aria-label="Workflow Navigation"
        >
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onBack}
            disabled={recorderState === "recording" || recorderState === "processing" || loading}
          >
            ← Back
          </button>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onNext}
              disabled={recorderState === "recording" || recorderState === "processing" || loading}
            >
              Skip
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={onNext}
              disabled={recorderState === "recording" || recorderState === "processing" || loading}
            >
              {loading ? "Analyzing…" : "View Summary →"}
            </button>
          </div>
        </nav>
      </main>
    </div>
  );
}
