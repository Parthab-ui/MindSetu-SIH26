import { useState, useEffect, useRef } from "react";

export function ConsultationScreen({
  appointment,
  initialDevices = { cameraOn: true, micOn: true },
  onEndCall,
  onNavigateToSummary,
}) {
  const localVideoRef = useRef(null);
  const localStreamRef = useRef(null);

  const [callStatus, setCallStatus] = useState("connecting"); // 'connecting', 'connected', 'ended', 'error'
  const [errorMessage, setErrorMessage] = useState("");
  const [cameraOn, setCameraOn] = useState(initialDevices.cameraOn ?? true);
  const [micOn, setMicOn] = useState(initialDevices.micOn ?? true);
  const [callDuration, setCallDuration] = useState(0);
  const [showNotesDrawer, setShowNotesDrawer] = useState(false);
  const [showEndDialog, setShowEndDialog] = useState(false);

  // Setup user's local video feed
  useEffect(() => {
    let active = true;

    async function initUserMedia() {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error("WebRTC camera/microphone APIs are not available in this environment.");
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        if (!active) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        localStreamRef.current = stream;

        // Apply initial mute/video states
        stream.getVideoTracks().forEach((t) => {
          t.enabled = initialDevices.cameraOn ?? true;
        });
        stream.getAudioTracks().forEach((t) => {
          t.enabled = initialDevices.micOn ?? true;
        });

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // Simulate secure peer-to-peer handshake completion after 1.2 seconds
        setTimeout(() => {
          if (active) setCallStatus("connected");
        }, 1200);
      } catch (err) {
        console.warn("Local media stream error:", err);
        if (active) {
          setErrorMessage(err?.message || "Media device connection error.");
          // If browser restricts camera, still allow doctor consultation in demo fallback mode
          setCallStatus("connected");
        }
      }
    }

    initUserMedia();

    return () => {
      active = false;
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [initialDevices]);

  // Call timer
  useEffect(() => {
    let timer;
    if (callStatus === "connected") {
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [callStatus]);

  const toggleCamera = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = !cameraOn;
      });
    }
    setCameraOn(!cameraOn);
  };

  const toggleMic = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !micOn;
      });
    }
    setMicOn(!micOn);
  };

  const handleEndCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
    }
    setCallStatus("ended");
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const initials = appointment.doctor_name
    ? appointment.doctor_name
        .replace("Dr. ", "")
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
    : "DR";

  // End Call Screen
  if (callStatus === "ended") {
    return (
      <div className="page-container" style={{ maxWidth: "680px", margin: "40px auto", padding: "0 16px" }}>
        <div
          className="card"
          style={{
            padding: "36px 28px",
            background: "var(--bg-surface-elevated)",
            borderRadius: "var(--radius-xl)",
            border: "1px solid var(--border-medium)",
            textAlign: "center",
            boxShadow: "var(--shadow-lg)",
            animation: "scaleIn 250ms ease both",
          }}
        >
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              background: "var(--primary-light)",
              border: "2px solid var(--primary)",
              color: "var(--primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.6rem",
              margin: "0 auto 16px",
            }}
          >
            ✓
          </div>

          <span className="eyebrow" style={{ color: "var(--primary)" }}>CONSULTATION CONCLUDED</span>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 800, margin: "6px 0 8px" }}>
            Session with {appointment.doctor_name} has ended
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.90rem", maxWidth: "460px", margin: "0 auto 20px" }}>
            Duration: <strong style={{ color: "var(--text-primary)" }}>{formatTimer(callDuration)}</strong>.
            Your conversation was confidential and non-punitive. Recovery suggestions discussed during the call can be reviewed anytime.
          </p>

          <div
            style={{
              padding: "16px",
              background: "var(--bg-surface)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-subtle)",
              textAlign: "left",
              fontSize: "0.82rem",
              color: "var(--text-secondary)",
              marginBottom: "28px",
            }}
          >
            <div style={{ fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>
              💡 Welfare & Follow-up Guidance
            </div>
            • Prioritize 7+ hours rest before your next high-intensity operational shift.<br />
            • Use grounding techniques discussed if stress spikes occur on duty.<br />
            • Book a check-in appointment anytime through MindSetu.
          </div>

          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onEndCall}
              style={{ minWidth: "180px", padding: "12px 20px" }}
            >
              Back to Appointments
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={onNavigateToSummary}
              style={{ minWidth: "180px", padding: "12px 20px" }}
            >
              View Welfare Summary →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (callStatus === "error") {
    return (
      <div className="page-container" style={{ maxWidth: "580px", margin: "40px auto", padding: "0 16px" }}>
        <div
          className="card"
          style={{
            padding: "32px",
            background: "var(--bg-surface-elevated)",
            borderRadius: "var(--radius-xl)",
            border: "1px solid var(--signal-high-border)",
            textAlign: "center",
          }}
        >
          <span style={{ fontSize: "2.4rem", display: "block", marginBottom: "12px" }}>⚠️</span>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 800, margin: "0 0 8px" }}>We couldn&apos;t connect the video call</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", margin: "0 0 24px" }}>
            {errorMessage || "Check your camera and microphone permissions, then try again."}
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onEndCall}
            >
              Leave Consultation
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setCallStatus("connecting");
                setTimeout(() => setCallStatus("connected"), 1000);
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        height: "calc(100vh - 72px)",
        minHeight: "560px",
        backgroundColor: "#03080e",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Top Video Room Header Bar */}
      <div
        style={{
          height: "56px",
          padding: "0 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "rgba(7, 16, 26, 0.92)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid var(--border-subtle)",
          zIndex: 20,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              background: callStatus === "connected" ? "var(--signal-low)" : "var(--signal-mod)",
              boxShadow: callStatus === "connected" ? "var(--signal-low-glow)" : "none",
              display: "inline-block",
            }}
          />
          <div>
            <div style={{ fontSize: "0.90rem", fontWeight: 800, color: "var(--text-primary)" }}>
              {appointment.doctor_name}
            </div>
            <div style={{ fontSize: "0.72rem", color: "var(--primary)" }}>
              {appointment.doctor_specialization}
            </div>
          </div>
        </div>

        {/* Center Timer & Connection Status */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              padding: "4px 12px",
              background: "rgba(0,0,0,0.4)",
              borderRadius: "var(--radius-full)",
              border: "1px solid var(--border-subtle)",
              fontSize: "0.82rem",
              fontWeight: 700,
              color: "var(--text-primary)",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            ⏱️ {formatTimer(callDuration)}
          </div>
          <span style={{ fontSize: "0.76rem", color: "var(--signal-low)", fontWeight: 600 }}>
            🔒 Protected Prototype Session
          </span>
        </div>

        {/* Right Drawer Toggle */}
        <button
          type="button"
          onClick={() => setShowNotesDrawer(!showNotesDrawer)}
          style={{
            background: showNotesDrawer ? "var(--primary-light)" : "var(--bg-input)",
            border: `1px solid ${showNotesDrawer ? "var(--primary)" : "var(--border-medium)"}`,
            color: showNotesDrawer ? "var(--primary)" : "var(--text-secondary)",
            padding: "6px 12px",
            borderRadius: "var(--radius-md)",
            fontSize: "0.78rem",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          📋 Welfare Context
        </button>
      </div>

      {/* Main Video Call Area */}
      <div style={{ flex: 1, position: "relative", display: "flex", overflow: "hidden" }}>
        {/* Doctor Stream (Dominant View) */}
        <div
          style={{
            flex: 1,
            position: "relative",
            backgroundColor: "#060d15",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          {callStatus === "connecting" ? (
            <div style={{ textAlign: "center" }}>
              <div className="spinner-ring" style={{ width: "48px", height: "48px", borderWidth: "3px", margin: "0 auto 16px" }} />
              <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)" }}>
                Connecting consultation room with {appointment.doctor_name}…
              </div>
              <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", marginTop: "6px" }}>
                Initializing video session & local media pipeline
              </p>
            </div>
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                background: "radial-gradient(circle at center, #0e1e2d 0%, #060d15 100%)",
                position: "relative",
              }}
            >
              {/* Doctor Avatar with Speaking Pulse */}
              <div
                style={{
                  position: "relative",
                  width: "130px",
                  height: "130px",
                  borderRadius: "50%",
                  background: appointment.doctor_avatar_color || "var(--primary)",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 900,
                  fontSize: "2.8rem",
                  boxShadow: "0 0 50px rgba(20, 184, 166, 0.35)",
                }}
              >
                {initials}
                {/* Active audio speaking pulse ring */}
                <div
                  style={{
                    position: "absolute",
                    inset: "-8px",
                    borderRadius: "50%",
                    border: "2px solid var(--primary)",
                    animation: "pulse 1.8s infinite",
                    opacity: 0.7,
                  }}
                />
              </div>

              <div style={{ marginTop: "24px", textAlign: "center" }}>
                <h3 style={{ fontSize: "1.3rem", fontWeight: 800, margin: "0 0 4px", color: "var(--text-primary)" }}>
                  {appointment.doctor_name}
                </h3>
                <span style={{ fontSize: "0.86rem", color: "var(--primary)", fontWeight: 600 }}>
                  {appointment.doctor_specialization}
                </span>

                {/* Live audio indicator */}
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    marginTop: "12px",
                    padding: "4px 12px",
                    background: "rgba(20, 184, 166, 0.12)",
                    borderRadius: "var(--radius-full)",
                    border: "1px solid var(--primary-dim)",
                    fontSize: "0.76rem",
                    color: "var(--primary)",
                  }}
                >
                  <span>● Prototype Consultation Preview</span>
                </div>
              </div>
            </div>
          )}

          {/* Picture-in-Picture Floating Self Preview */}
          <div
            style={{
              position: "absolute",
              bottom: "84px",
              right: "20px",
              width: "180px",
              height: "120px",
              backgroundColor: "#03080e",
              borderRadius: "var(--radius-md)",
              overflow: "hidden",
              border: "2px solid var(--border-medium)",
              boxShadow: "var(--shadow-lg)",
              zIndex: 30,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {cameraOn ? (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  transform: "scaleX(-1)",
                }}
              />
            ) : (
              <div style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "0.72rem" }}>
                <span style={{ fontSize: "1.4rem", display: "block" }}>📷</span>
                <span>Camera off</span>
              </div>
            )}

            <div
              style={{
                position: "absolute",
                bottom: "6px",
                left: "6px",
                padding: "2px 6px",
                background: "rgba(0, 0, 0, 0.75)",
                borderRadius: "var(--radius-sm)",
                fontSize: "0.68rem",
                fontWeight: 700,
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <span>You</span>
              {!micOn && <span style={{ color: "var(--signal-high)" }}>🔇</span>}
            </div>
          </div>
        </div>

        {/* Welfare Context Side Drawer */}
        {showNotesDrawer && (
          <div
            style={{
              width: "320px",
              background: "var(--bg-surface-elevated)",
              borderLeft: "1px solid var(--border-subtle)",
              padding: "20px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              animation: "slideInRight 200ms ease",
              zIndex: 25,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h4 style={{ fontSize: "0.92rem", fontWeight: 800, margin: 0 }}>Consultation Notes</h4>
              <button
                type="button"
                onClick={() => setShowNotesDrawer(false)}
                style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "1rem" }}
              >
                ✕
              </button>
            </div>

            <div style={{ fontSize: "0.80rem", color: "var(--text-secondary)", lineHeight: "1.5" }}>
              <strong style={{ color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>
                Personnel Welfare Focus:
              </strong>
              • Primary symptom: Shift exhaustion and operational load.<br />
              • Recovery priority: Rest alignment & sleep hygiene.<br />
              • Triage status: Support session; non-diagnostic.
            </div>

            {appointment.notes && (
              <div style={{ fontSize: "0.80rem", background: "var(--bg-input)", padding: "10px", borderRadius: "var(--radius-sm)" }}>
                <strong style={{ color: "var(--text-primary)" }}>Your Note:</strong> {appointment.notes}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating Bottom Control Bar */}
      <div
        style={{
          height: "72px",
          background: "rgba(7, 16, 26, 0.95)",
          backdropFilter: "blur(12px)",
          borderTop: "1px solid var(--border-subtle)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "16px",
          padding: "0 20px",
          zIndex: 40,
        }}
      >
        {/* Microphone Toggle */}
        <button
          type="button"
          onClick={toggleMic}
          title={micOn ? "Mute Microphone" : "Unmute Microphone"}
          aria-label={micOn ? "Mute Microphone" : "Unmute Microphone"}
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            background: micOn ? "var(--bg-surface-elevated)" : "var(--signal-high)",
            border: `1.5px solid ${micOn ? "var(--border-medium)" : "var(--signal-high)"}`,
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.1rem",
            cursor: "pointer",
            transition: "all 150ms ease",
          }}
        >
          {micOn ? "🎤" : "🔇"}
        </button>

        {/* Camera Toggle */}
        <button
          type="button"
          onClick={toggleCamera}
          title={cameraOn ? "Turn off camera" : "Turn on camera"}
          aria-label={cameraOn ? "Turn off camera" : "Turn on camera"}
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            background: cameraOn ? "var(--bg-surface-elevated)" : "var(--signal-high)",
            border: `1.5px solid ${cameraOn ? "var(--border-medium)" : "var(--signal-high)"}`,
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.1rem",
            cursor: "pointer",
            transition: "all 150ms ease",
          }}
        >
          {cameraOn ? "📹" : "🚫"}
        </button>

        {/* End Call Button */}
        <button
          type="button"
          onClick={() => setShowEndDialog(true)}
          title="End Consultation"
          aria-label="End Consultation"
          style={{
            padding: "0 22px",
            height: "48px",
            borderRadius: "var(--radius-full)",
            background: "#dc2626",
            border: "1.5px solid #ef4444",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontWeight: 800,
            fontSize: "0.90rem",
            cursor: "pointer",
            boxShadow: "0 2px 10px rgba(220, 38, 38, 0.4)",
            transition: "all 150ms ease",
          }}
        >
          <span>☎</span>
          <span>End Call</span>
        </button>
      </div>

      {/* End Call Confirmation Modal */}
      {showEndDialog && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(6px)",
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
              maxWidth: "400px",
              padding: "24px",
              background: "var(--bg-surface-elevated)",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--border-medium)",
              textAlign: "center",
            }}
          >
            <h3 style={{ fontSize: "1.15rem", fontWeight: 800, margin: "0 0 8px", color: "var(--text-primary)" }}>
              End this consultation?
            </h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", margin: "0 0 20px" }}>
              Are you ready to conclude your video session with {appointment.doctor_name}?
            </p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowEndDialog(false)}
              >
                Continue Call
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleEndCall}
                style={{ background: "#dc2626", borderColor: "#dc2626", color: "#ffffff" }}
              >
                Yes, End Call
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
