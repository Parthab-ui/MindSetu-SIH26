export function BookingConfirmationModal({
  appointment,
  onViewAppointments,
  onClose,
}) {
  if (!appointment) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirmation-modal-title"
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
          maxWidth: "480px",
          padding: "32px 24px",
          background: "var(--bg-surface-elevated)",
          borderRadius: "var(--radius-xl)",
          border: "1px solid var(--border-medium)",
          boxShadow: "var(--shadow-lg)",
          textAlign: "center",
          animation: "scaleIn 250ms cubic-bezier(0.2, 0.8, 0.2, 1) both",
        }}
      >
        {/* Success Icon */}
        <div
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            background: "var(--signal-low-bg)",
            border: "2px solid var(--signal-low)",
            color: "var(--signal-low)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.8rem",
            margin: "0 auto 16px",
            boxShadow: "var(--signal-low-glow)",
          }}
        >
          ✓
        </div>

        <span className="eyebrow" style={{ color: "var(--signal-low)", letterSpacing: "0.08em" }}>
          APPOINTMENT CONFIRMED
        </span>
        <h2 id="confirmation-modal-title" style={{ fontSize: "1.4rem", fontWeight: 800, margin: "6px 0 8px", color: "var(--text-primary)" }}>
          You&apos;re all set
        </h2>
        <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", margin: "0 0 20px" }}>
          Your confidential video consultation has been scheduled.
        </p>

        {/* Appointment Card Preview */}
        <div
          style={{
            padding: "16px",
            background: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-lg)",
            textAlign: "left",
            marginBottom: "24px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "50%",
                background: appointment.doctor_avatar_color || "var(--primary)",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: "0.95rem",
                flexShrink: 0,
              }}
            >
              Dr
            </div>
            <div>
              <div style={{ fontSize: "1.02rem", fontWeight: 800, color: "var(--text-primary)" }}>
                {appointment.doctor_name}
              </div>
              <div style={{ fontSize: "0.80rem", color: "var(--primary)", fontWeight: 600 }}>
                {appointment.doctor_specialization}
              </div>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "10px",
              paddingTop: "10px",
              borderTop: "1px solid var(--border-subtle)",
              fontSize: "0.82rem",
            }}
          >
            <div>
              <span style={{ color: "var(--text-muted)", display: "block", fontSize: "0.72rem", textTransform: "uppercase" }}>
                Date & Time
              </span>
              <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>
                {appointment.appointment_date} · {appointment.appointment_time}
              </span>
            </div>
            <div>
              <span style={{ color: "var(--text-muted)", display: "block", fontSize: "0.72rem", textTransform: "uppercase" }}>
                Format
              </span>
              <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>
                Video Consultation (30m)
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onViewAppointments}
            style={{ width: "100%", padding: "12px", fontSize: "0.92rem", fontWeight: 700 }}
          >
            View in My Appointments →
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onClose}
            style={{ width: "100%", padding: "10px", fontSize: "0.85rem" }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
