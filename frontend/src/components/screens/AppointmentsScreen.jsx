import { useState, useEffect } from "react";
import { api } from "../../services/api";

export function AppointmentsScreen({
  sessionId,
  onJoinAppointment,
  onNavigateToDoctors,
  onBack,
}) {
  const [appointments, setAppointments] = useState({ upcoming: [], past: [] });
  const [loading, setLoading] = useState(Boolean(sessionId));
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("upcoming");
  const [cancellingId, setCancellingId] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [targetAppointment, setTargetAppointment] = useState(null);

  const refreshAppointments = () => {
    if (!sessionId) return;
    setLoading(true);
    setError("");
    api
      .getAppointments(sessionId)
      .then((data) => {
        setAppointments(data || { upcoming: [], past: [] });
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load appointments.");
        setLoading(false);
      });
  };

  useEffect(() => {
    let active = true;
    if (!sessionId) {
      return;
    }

    api
      .getAppointments(sessionId)
      .then((data) => {
        if (active) {
          setAppointments(data || { upcoming: [], past: [] });
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err.message || "Failed to load appointments.");
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [sessionId]);

  const handleConfirmCancel = async () => {
    if (!targetAppointment) return;
    setCancellingId(targetAppointment.id);

    try {
      await api.cancelAppointment(targetAppointment.id);
      setShowCancelModal(false);
      setTargetAppointment(null);
      setCancellingId(null);
      refreshAppointments();
    } catch (err) {
      setError(err.message || "Failed to cancel appointment.");
      setCancellingId(null);
    }
  };

  const getStatusBadge = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "confirmed") {
      return (
        <span
          style={{
            fontSize: "0.74rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            padding: "3px 10px",
            borderRadius: "var(--radius-full)",
            background: "var(--signal-low-bg)",
            color: "var(--signal-low)",
            border: "1px solid var(--signal-low-border)",
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
          }}
        >
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--signal-low)" }} />
          CONFIRMED
        </span>
      );
    }
    if (s === "cancelled") {
      return (
        <span
          style={{
            fontSize: "0.74rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            padding: "3px 10px",
            borderRadius: "var(--radius-full)",
            background: "var(--signal-high-bg)",
            color: "var(--signal-high)",
            border: "1px solid var(--signal-high-border)",
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
          }}
        >
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--signal-high)" }} />
          CANCELLED
        </span>
      );
    }
    return (
      <span
        style={{
          fontSize: "0.74rem",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          padding: "3px 10px",
          borderRadius: "var(--radius-full)",
          background: "var(--bg-input)",
          color: "var(--text-muted)",
          border: "1px solid var(--border-subtle)",
        }}
      >
        {status}
      </span>
    );
  };

  const upcomingList = appointments.upcoming || [];
  const pastList = appointments.past || [];
  const currentList = activeTab === "upcoming" ? upcomingList : pastList;

  return (
    <div className="page-container" style={{ maxWidth: "920px", margin: "0 auto", padding: "0 16px 40px" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <span className="eyebrow" style={{ color: "var(--primary)" }}>SCHEDULED WELFARE SESSIONS</span>
          <h1 className="page-title" style={{ margin: "4px 0 6px" }}>My Consultations</h1>
          <p className="page-subtitle" style={{ maxWidth: "600px", margin: 0 }}>
            Manage your confidential professional video appointments and join active sessions.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={onNavigateToDoctors}
          style={{ fontSize: "0.85rem", padding: "10px 18px" }}
        >
          + Book New Consultation
        </button>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          borderBottom: "1px solid var(--border-subtle)",
          marginBottom: "24px",
          paddingBottom: "8px",
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab("upcoming")}
          style={{
            padding: "8px 16px",
            background: activeTab === "upcoming" ? "var(--primary-light)" : "transparent",
            color: activeTab === "upcoming" ? "var(--primary)" : "var(--text-secondary)",
            border: `1px solid ${activeTab === "upcoming" ? "var(--primary)" : "transparent"}`,
            borderRadius: "var(--radius-md)",
            fontWeight: 700,
            fontSize: "0.85rem",
            cursor: "pointer",
            transition: "all 150ms ease",
          }}
        >
          Upcoming ({upcomingList.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("past")}
          style={{
            padding: "8px 16px",
            background: activeTab === "past" ? "var(--primary-light)" : "transparent",
            color: activeTab === "past" ? "var(--primary)" : "var(--text-secondary)",
            border: `1px solid ${activeTab === "past" ? "var(--primary)" : "transparent"}`,
            borderRadius: "var(--radius-md)",
            fontWeight: 700,
            fontSize: "0.85rem",
            cursor: "pointer",
            transition: "all 150ms ease",
          }}
        >
          Past / Completed ({pastList.length})
        </button>
      </div>

      {/* Error state */}
      {error && (
        <div className="error-alert" role="alert" style={{ marginBottom: "20px" }}>
          {error}
        </div>
      )}

      {/* Loading Skeletons */}
      {loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {[1, 2].map((n) => (
            <div
              key={n}
              style={{
                height: "140px",
                background: "var(--bg-surface-elevated)",
                borderRadius: "var(--radius-lg)",
                animation: "pulse 1.2s infinite",
              }}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && currentList.length === 0 && (
        <div
          className="card"
          style={{
            textAlign: "center",
            padding: "48px 24px",
            background: "var(--bg-surface)",
            borderRadius: "var(--radius-lg)",
            border: "1px dashed var(--border-medium)",
          }}
        >
          <span style={{ fontSize: "2rem", display: "block", marginBottom: "8px" }}>📅</span>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "6px" }}>
            {activeTab === "upcoming" ? "No upcoming appointments" : "No past appointments"}
          </h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", maxWidth: "420px", margin: "0 auto 16px" }}>
            {activeTab === "upcoming"
              ? "Book a confidential consultation with a qualified professional when you're ready."
              : "Past consultations and session summaries will appear here."}
          </p>
          {activeTab === "upcoming" && (
            <button type="button" className="btn btn-primary" onClick={onNavigateToDoctors}>
              Find a Doctor →
            </button>
          )}
        </div>
      )}

      {/* Appointment Cards List */}
      {!loading && currentList.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          {currentList.map((apt, index) => {
            const isFirstUpcoming = activeTab === "upcoming" && index === 0;

            return (
              <div
                key={apt.id}
                className="card card-elevated"
                style={{
                  padding: "24px",
                  background: isFirstUpcoming ? "var(--bg-surface-elevated)" : "var(--bg-surface)",
                  borderRadius: "var(--radius-lg)",
                  border: `1.5px solid ${isFirstUpcoming ? "var(--primary-dim)" : "var(--border-subtle)"}`,
                  boxShadow: isFirstUpcoming ? "var(--shadow-glow)" : "var(--shadow-sm)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
                  {/* Doctor Info */}
                  <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
                    <div
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "50%",
                        background: apt.doctor_avatar_color || "var(--primary)",
                        color: "#ffffff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 800,
                        fontSize: "1.1rem",
                        flexShrink: 0,
                      }}
                    >
                      Dr
                    </div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <h3 style={{ fontSize: "1.1rem", fontWeight: 800, margin: 0, color: "var(--text-primary)" }}>
                          {apt.doctor_name}
                        </h3>
                        {getStatusBadge(apt.status)}
                      </div>
                      <span style={{ fontSize: "0.82rem", color: "var(--primary)", fontWeight: 600, display: "block", marginTop: "2px" }}>
                        {apt.doctor_specialization}
                      </span>
                    </div>
                  </div>

                  {/* Date and Time Badge */}
                  <div
                    style={{
                      textAlign: "right",
                      padding: "8px 14px",
                      background: "var(--bg-input)",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--border-subtle)",
                    }}
                  >
                    <span style={{ fontSize: "0.72rem", textTransform: "uppercase", color: "var(--text-muted)", display: "block" }}>
                      Session Time
                    </span>
                    <span style={{ fontSize: "0.95rem", fontWeight: 800, color: "var(--text-primary)" }}>
                      {apt.appointment_date} · {apt.appointment_time}
                    </span>
                    <span style={{ fontSize: "0.74rem", color: "var(--text-secondary)", display: "block" }}>
                      Video Consultation (30 min)
                    </span>
                  </div>
                </div>

                {apt.notes && (
                  <div style={{ fontSize: "0.80rem", color: "var(--text-secondary)", background: "var(--bg-app)", padding: "8px 12px", borderRadius: "var(--radius-sm)" }}>
                    <strong style={{ color: "var(--text-primary)" }}>Note:</strong> {apt.notes}
                  </div>
                )}

                {/* Card Action Controls */}
                {activeTab === "upcoming" && apt.status === "confirmed" && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      paddingTop: "14px",
                      borderTop: "1px solid var(--border-subtle)",
                      flexWrap: "wrap",
                      gap: "10px",
                    }}
                  >
                    <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                      🔒 Meeting ID: <code style={{ color: "var(--text-secondary)" }}>{apt.meeting_id}</code>
                    </span>

                    <div style={{ display: "flex", gap: "10px" }}>
                      <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={() => {
                          setTargetAppointment(apt);
                          setShowCancelModal(true);
                        }}
                        style={{ fontSize: "0.80rem", color: "var(--signal-high)", padding: "8px 14px" }}
                      >
                        Cancel Appointment
                      </button>

                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => onJoinAppointment(apt)}
                        style={{
                          fontSize: "0.88rem",
                          fontWeight: 800,
                          padding: "10px 20px",
                          boxShadow: isFirstUpcoming ? "var(--primary-glow-strong)" : "none",
                        }}
                      >
                        Join Consultation →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Back Button */}
      <div style={{ marginTop: "32px", display: "flex", justifyContent: "flex-start" }}>
        <button type="button" className="btn btn-ghost" onClick={onBack}>
          ← Back
        </button>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && targetAppointment && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cancel-modal-title"
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "var(--bg-overlay)",
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
              width: "100%",
              maxWidth: "440px",
              padding: "24px",
              background: "var(--bg-surface-elevated)",
              borderRadius: "var(--radius-xl)",
              border: "1px solid var(--border-medium)",
              boxShadow: "var(--shadow-lg)",
            }}
          >
            <h3 id="cancel-modal-title" style={{ fontSize: "1.15rem", fontWeight: 800, margin: "0 0 8px", color: "var(--signal-high)" }}>
              Cancel Consultation?
            </h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: "1.5", margin: "0 0 20px" }}>
              Are you sure you want to cancel your appointment with <strong>{targetAppointment.doctor_name}</strong> on{" "}
              <strong>{targetAppointment.appointment_date}</strong> at <strong>{targetAppointment.appointment_time}</strong>? This will release the reserved slot.
            </p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button
                type="button"
                className="btn btn-secondary"
                disabled={Boolean(cancellingId)}
                onClick={() => {
                  setShowCancelModal(false);
                  setTargetAppointment(null);
                }}
              >
                Keep Appointment
              </button>
              <button
                type="button"
                className="btn btn-primary"
                disabled={Boolean(cancellingId)}
                onClick={handleConfirmCancel}
                style={{ background: "var(--signal-high)", borderColor: "var(--signal-high)", color: "#ffffff" }}
              >
                {cancellingId ? "Cancelling…" : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
