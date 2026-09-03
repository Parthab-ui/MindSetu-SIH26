import { useState, useEffect, useRef } from "react";

export function PreCallCheckModal({
  appointment,
  onJoin,
  onClose,
}) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [mediaReady, setMediaReady] = useState(false);
  const [mediaError, setMediaError] = useState("");

  useEffect(() => {
    let active = true;

    async function setupPreview() {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error("Media devices API not supported in this browser.");
        }
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        if (!active) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setMediaReady(true);
      } catch (err) {
        console.warn("Pre-call camera preview warning:", err);
        if (active) {
          setMediaError("Camera or microphone access was restricted. You can still join with simulated preview.");
          setMediaReady(true); // Allow continuing in demo mode
        }
      }
    }

    setupPreview();

    return () => {
      active = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const toggleCamera = () => {
    if (streamRef.current) {
      const videoTracks = streamRef.current.getVideoTracks();
      videoTracks.forEach((track) => {
        track.enabled = !cameraOn;
      });
    }
    setCameraOn(!cameraOn);
  };

  const toggleMic = () => {
    if (streamRef.current) {
      const audioTracks = streamRef.current.getAudioTracks();
      audioTracks.forEach((track) => {
        track.enabled = !micOn;
      });
    }
    setMicOn(!micOn);
  };

  const handleConfirmJoin = () => {
    // Release preview stream tracks so consultation room can acquire dedicated session stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
    onJoin(appointment, { cameraOn, micOn });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="precall-modal-title"
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "var(--bg-overlay)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "16px",
      }}
    >
      <div
        className="card"
        style={{
          width: "100%",
          maxWidth: "520px",
          padding: "26px",
          background: "var(--bg-surface-elevated)",
          borderRadius: "var(--radius-xl)",
          border: "1px solid var(--border-medium)",
          boxShadow: "var(--shadow-lg)",
          animation: "scaleIn 250ms cubic-bezier(0.2, 0.8, 0.2, 1) both",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "16px" }}>
          <span className="eyebrow" style={{ color: "var(--primary)" }}>PRE-CONSULTATION CHECK</span>
          <h2 id="precall-modal-title" style={{ fontSize: "1.3rem", fontWeight: 800, margin: "4px 0 4px", color: "var(--text-primary)" }}>
            Ready to join consultation?
          </h2>
          <p style={{ fontSize: "0.84rem", color: "var(--text-secondary)", margin: 0 }}>
            {appointment.doctor_name} · {appointment.appointment_time}
          </p>
        </div>

        {/* Live Camera Preview Box */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "220px",
            backgroundColor: "#03080e",
            borderRadius: "var(--radius-lg)",
            overflow: "hidden",
            marginBottom: "16px",
            border: "1px solid var(--border-medium)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {cameraOn ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transform: "scaleX(-1)", // Mirror effect for natural self-view
              }}
            />
          ) : (
            <div style={{ textAlign: "center", color: "var(--text-muted)" }}>
              <span style={{ fontSize: "2rem", display: "block" }}>📷</span>
              <span style={{ fontSize: "0.80rem" }}>Camera is paused</span>
            </div>
          )}

          {/* Device toggle floating buttons */}
          <div
            style={{
              position: "absolute",
              bottom: "12px",
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              gap: "12px",
              background: "rgba(7, 16, 26, 0.82)",
              backdropFilter: "blur(6px)",
              padding: "6px 14px",
              borderRadius: "var(--radius-full)",
              border: "1px solid var(--border-medium)",
            }}
          >
            <button
              type="button"
              onClick={toggleMic}
              title={micOn ? "Mute Microphone" : "Unmute Microphone"}
              style={{
                background: micOn ? "var(--bg-surface-elevated)" : "var(--signal-high)",
                border: "none",
                color: "#ffffff",
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.95rem",
              }}
            >
              {micOn ? "🎤" : "🔇"}
            </button>

            <button
              type="button"
              onClick={toggleCamera}
              title={cameraOn ? "Turn off camera" : "Turn on camera"}
              style={{
                background: cameraOn ? "var(--bg-surface-elevated)" : "var(--signal-high)",
                border: "none",
                color: "#ffffff",
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.95rem",
              }}
            >
              {cameraOn ? "📹" : "🚫"}
            </button>
          </div>
        </div>

        {/* Readiness Checklist */}
        <div
          style={{
            background: "var(--bg-surface)",
            padding: "12px 16px",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-subtle)",
            marginBottom: "20px",
            fontSize: "0.82rem",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
            <span style={{ color: "var(--text-secondary)" }}>Camera</span>
            <span style={{ fontWeight: 700, color: cameraOn ? "var(--signal-low)" : "var(--signal-mod)" }}>
              {cameraOn ? "✓ Ready" : "Paused"}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
            <span style={{ color: "var(--text-secondary)" }}>Microphone</span>
            <span style={{ fontWeight: 700, color: micOn ? "var(--signal-low)" : "var(--signal-mod)" }}>
              {micOn ? "✓ Ready" : "Muted"}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "var(--text-secondary)" }}>Session Channel</span>
            <span style={{ fontWeight: 700, color: "var(--signal-low)" }}>
              ✓ Protected Prototype Session
            </span>
          </div>
        </div>

        {mediaError && (
          <p style={{ fontSize: "0.76rem", color: "var(--signal-mod)", margin: "0 0 14px", textAlign: "center" }}>
            {mediaError}
          </p>
        )}

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
              onClose();
            }}
            style={{ flex: 1, padding: "12px" }}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleConfirmJoin}
            disabled={!mediaReady}
            style={{ flex: 2, padding: "12px", fontWeight: 800 }}
          >
            Join Consultation →
          </button>
        </div>
      </div>
    </div>
  );
}
