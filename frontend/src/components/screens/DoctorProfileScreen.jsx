import { useState, useEffect } from "react";
import { api } from "../../services/api";

function formatDisplayDate(dateObj) {
  const options = { weekday: "short", day: "numeric", month: "short" };
  return dateObj.toLocaleDateString("en-US", options);
}

function getNext5Days() {
  const days = [];
  const today = new Date();
  for (let i = 0; i < 5; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const isoDate = d.toISOString().split("T")[0];
    const dayName = i === 0 ? "Today" : i === 1 ? "Tmrw" : d.toLocaleDateString("en-US", { weekday: "short" });
    const dayNum = d.getDate();
    days.push({ isoDate, dayName, dayNum, fullDate: d });
  }
  return days;
}

export function DoctorProfileScreen({
  doctor,
  sessionId,
  consultationProfile = null,
  onEditProfile = null,
  onBookingSuccess,
  onBack,
}) {
  const days = getNext5Days();
  const [selectedDate, setSelectedDate] = useState(days[0].isoDate);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [notes, setNotes] = useState(consultationProfile?.consultation_note || "");
  const [error, setError] = useState("");

  // Fetch availability when selectedDate or doctor changes
  useEffect(() => {
    let isMounted = true;

    api
      .getDoctorAvailability(doctor.id, selectedDate)
      .then((res) => {
        if (isMounted) {
          setSlots(res.slots || []);
          setLoadingSlots(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || "Could not load slot availability.");
          setLoadingSlots(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [doctor.id, selectedDate]);

  const handleSelectDate = (isoDate) => {
    setSelectedDate(isoDate);
    setSelectedSlot(null);
    setLoadingSlots(true);
    setError("");
  };

  const handleBook = async () => {
    if (bookingLoading || !selectedSlot) return;
    if (!sessionId) {
      setError("Active protected session required to schedule an appointment.");
      return;
    }

    setBookingLoading(true);
    setError("");

    try {
      const appointment = await api.bookAppointment({
        sessionId,
        doctorId: doctor.id,
        appointmentDate: selectedDate,
        appointmentTime: selectedSlot,
        notes,
      });
      setBookingLoading(false);
      onBookingSuccess(appointment);
    } catch (err) {
      setBookingLoading(false);
      setError(err.message || "Failed to book appointment. The slot might already be reserved.");
    }
  };

  const selectedDayObj = days.find((d) => d.isoDate === selectedDate);
  const displayFormattedDate = selectedDayObj ? formatDisplayDate(selectedDayObj.fullDate) : selectedDate;

  const initials = doctor.name
    .replace("Dr. ", "")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  return (
    <div className="page-container" style={{ maxWidth: "1080px", margin: "0 auto", padding: "0 16px 40px" }}>
      {/* Navigation Breadcrumb */}
      <div style={{ marginBottom: "20px" }}>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={onBack}
          style={{ fontSize: "0.84rem", padding: "6px 12px" }}
        >
          ← Back to Doctor Directory
        </button>
      </div>

      {/* Two-Column Responsive Layout */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
          gap: "28px",
          alignItems: "start",
        }}
      >
        {/* Left Column: Doctor Profile & Credentials */}
        <div
          className="card"
          style={{
            padding: "28px",
            background: "var(--bg-surface-elevated)",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", gap: "16px", alignItems: "center", marginBottom: "20px" }}>
            <div
              style={{
                width: "68px",
                height: "68px",
                borderRadius: "50%",
                background: doctor.avatar_color || "var(--primary)",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: "1.45rem",
                flexShrink: 0,
                boxShadow: "var(--shadow-md)",
              }}
            >
              {initials}
            </div>

            <div>
              <h2 style={{ fontSize: "1.3rem", fontWeight: 800, margin: "0 0 4px", color: "var(--text-primary)" }}>
                {doctor.name}
              </h2>
              <span style={{ fontSize: "0.90rem", fontWeight: 600, color: "var(--primary)", display: "block" }}>
                {doctor.specialization}
              </span>
              <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", display: "block" }}>
                {doctor.qualification} · {doctor.experience_years} years clinical experience
              </span>
              <div style={{ marginTop: "6px", display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--signal-mod)" }}>
                  ★ {doctor.rating} <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>({doctor.review_count} consultations)</span>
                </span>
                <span
                  style={{
                    fontSize: "0.74rem",
                    padding: "2px 8px",
                    borderRadius: "var(--radius-full)",
                    background: "var(--signal-low-bg)",
                    color: "var(--signal-low)",
                    border: "1px solid var(--signal-low-border)",
                    fontWeight: 600,
                  }}
                >
                  {doctor.availability_status}
                </span>
              </div>
            </div>
          </div>

          {/* About Section */}
          <div style={{ marginBottom: "22px" }}>
            <h4 style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", marginBottom: "8px" }}>
              Clinical Background
            </h4>
            <p style={{ fontSize: "0.88rem", lineHeight: "1.6", color: "var(--text-secondary)", margin: 0 }}>
              {doctor.bio}
            </p>
          </div>

          {/* Areas of Focus */}
          <div style={{ marginBottom: "22px" }}>
            <h4 style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", marginBottom: "8px" }}>
              Areas of Specialization
            </h4>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {doctor.focus_areas.map((tag, idx) => (
                <span
                  key={idx}
                  style={{
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    padding: "4px 10px",
                    borderRadius: "var(--radius-sm)",
                    background: "var(--bg-input)",
                    border: "1px solid var(--border-subtle)",
                    color: "var(--text-primary)",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Consultation Format & Confidentiality Notice */}
          <div
            style={{
              padding: "14px",
              background: "var(--bg-surface)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-subtle)",
              fontSize: "0.80rem",
              color: "var(--text-secondary)",
              lineHeight: "1.5",
            }}
          >
            <strong style={{ color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>
              🔒 Protected & Non-Disciplinary Consultation
            </strong>
            This consultation is strictly for your personal welfare and recovery guidance. Notes and audio are confidential and never shared with commanding officers or personnel databases.
          </div>
        </div>

        {/* Right Column: Slot Selection & Booking Action */}
        <div
          className="card"
          style={{
            padding: "28px",
            background: "var(--bg-surface-elevated)",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          <span className="eyebrow" style={{ color: "var(--primary)" }}>SCHEDULE APPOINTMENT</span>
          <h3 style={{ fontSize: "1.2rem", fontWeight: 800, margin: "4px 0 16px" }}>Select Consultation Slot</h3>

          {/* Date Selector */}
          <div style={{ marginBottom: "20px" }}>
            <label style={{ fontSize: "0.82rem", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", display: "block", marginBottom: "8px" }}>
              1. Choose a Date
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "8px" }}>
              {days.map((d) => {
                const isSelected = selectedDate === d.isoDate;
                return (
                  <button
                    key={d.isoDate}
                    type="button"
                    onClick={() => handleSelectDate(d.isoDate)}
                    style={{
                      padding: "10px 6px",
                      borderRadius: "var(--radius-md)",
                      border: `1.5px solid ${isSelected ? "var(--primary)" : "var(--border-medium)"}`,
                      background: isSelected ? "var(--primary-light)" : "var(--bg-input)",
                      color: isSelected ? "var(--primary)" : "var(--text-primary)",
                      textAlign: "center",
                      cursor: "pointer",
                      transition: "all 150ms ease",
                    }}
                  >
                    <span style={{ display: "block", fontSize: "0.72rem", fontWeight: 600, textTransform: "uppercase" }}>
                      {d.dayName}
                    </span>
                    <span style={{ display: "block", fontSize: "1.15rem", fontWeight: 800, marginTop: "2px" }}>
                      {d.dayNum}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Slot Selector */}
          <div style={{ marginBottom: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "8px" }}>
              <label style={{ fontSize: "0.82rem", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)" }}>
                2. Available Times ({displayFormattedDate})
              </label>
              {loadingSlots && <span style={{ fontSize: "0.75rem", color: "var(--primary)" }}>Checking slots…</span>}
            </div>

            {loadingSlots ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <div
                    key={n}
                    style={{
                      height: "40px",
                      background: "var(--bg-input)",
                      borderRadius: "var(--radius-md)",
                      animation: "pulse 1.2s infinite",
                    }}
                  />
                ))}
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(88px, 1fr))", gap: "8px" }}>
                {slots.map((s) => {
                  const isSelected = selectedSlot === s.time;
                  return (
                    <button
                      key={s.time}
                      type="button"
                      disabled={!s.available}
                      onClick={() => setSelectedSlot(s.time)}
                      style={{
                        padding: "10px 8px",
                        borderRadius: "var(--radius-md)",
                        border: `1.5px solid ${
                          isSelected
                            ? "var(--primary)"
                            : s.available
                            ? "var(--border-medium)"
                            : "var(--border-subtle)"
                        }`,
                        background: isSelected
                          ? "var(--primary-glow-strong)"
                          : s.available
                          ? "var(--bg-input)"
                          : "rgba(0,0,0,0.2)",
                        color: isSelected
                          ? "#ffffff"
                          : s.available
                          ? "var(--text-primary)"
                          : "var(--text-muted)",
                        fontWeight: isSelected ? 800 : 600,
                        fontSize: "0.88rem",
                        cursor: s.available ? "pointer" : "not-allowed",
                        opacity: s.available ? 1 : 0.45,
                        textDecoration: s.available ? "none" : "line-through",
                        transition: "all 150ms ease",
                      }}
                    >
                      {s.time}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Optional notes */}
          <div style={{ marginBottom: "22px" }}>
            <label
              htmlFor="consult-notes"
              style={{ fontSize: "0.82rem", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", display: "block", marginBottom: "6px" }}
            >
              3. Notes for Doctor (Optional)
            </label>
            <textarea
              id="consult-notes"
              className="chat-input"
              rows={2}
              placeholder="e.g. Discussing operational fatigue, sleep restoration..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                fontSize: "0.85rem",
                borderRadius: "var(--radius-md)",
                resize: "none",
                background: "var(--bg-input)",
                border: "1px solid var(--border-medium)",
                color: "var(--text-primary)",
              }}
            />
          </div>

          {/* Selection Preview & Compact Consultation Summary Card */}
          {selectedSlot && (
            <div
              style={{
                padding: "16px",
                background: "var(--bg-surface-elevated)",
                border: "1.5px solid var(--primary-dim)",
                borderRadius: "var(--radius-lg)",
                marginBottom: "20px",
                animation: "fadeIn 200ms ease",
              }}
            >
              {consultationProfile ? (
                <div style={{ marginBottom: "14px", paddingBottom: "12px", borderBottom: "1px solid var(--border-subtle)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <span style={{ fontSize: "0.78rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--primary)" }}>
                      Consultation Profile
                    </span>
                    {onEditProfile && (
                      <button
                        type="button"
                        onClick={onEditProfile}
                        style={{
                          background: "none",
                          border: "none",
                          color: "var(--primary)",
                          fontSize: "0.76rem",
                          fontWeight: 700,
                          cursor: "pointer",
                          padding: 0,
                          textDecoration: "underline",
                        }}
                      >
                        Edit Profile
                      </button>
                    )}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "6px 12px", fontSize: "0.84rem" }}>
                    <div>
                      <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", display: "block" }}>Age</span>
                      <strong style={{ color: "var(--text-primary)" }}>{consultationProfile.age} yrs</strong>
                    </div>
                    <div>
                      <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", display: "block" }}>Gender</span>
                      <strong style={{ color: "var(--text-primary)" }}>{consultationProfile.gender || "—"}</strong>
                    </div>
                    <div>
                      <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", display: "block" }}>Role</span>
                      <strong style={{ color: "var(--text-primary)" }}>{consultationProfile.role}</strong>
                    </div>
                    {consultationProfile.years_of_service !== null && consultationProfile.years_of_service !== undefined && (
                      <div>
                        <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", display: "block" }}>Years of Service</span>
                        <strong style={{ color: "var(--text-primary)" }}>{consultationProfile.years_of_service} yrs</strong>
                      </div>
                    )}
                    {consultationProfile.posting_unit && (
                      <div style={{ gridColumn: "1 / -1" }}>
                        <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", display: "block" }}>Unit</span>
                        <strong style={{ color: "var(--text-primary)" }}>{consultationProfile.posting_unit}</strong>
                      </div>
                    )}
                  </div>
                </div>
              ) : null}

              <div>
                <span style={{ fontSize: "0.78rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--primary)", display: "block", marginBottom: "8px" }}>
                  Appointment
                </span>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "6px 12px", fontSize: "0.84rem" }}>
                  <div>
                    <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", display: "block" }}>Doctor</span>
                    <strong style={{ color: "var(--text-primary)" }}>{doctor.name}</strong>
                  </div>
                  <div>
                    <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", display: "block" }}>Date</span>
                    <strong style={{ color: "var(--text-primary)" }}>{displayFormattedDate}</strong>
                  </div>
                  <div>
                    <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", display: "block" }}>Time</span>
                    <strong style={{ color: "var(--primary)" }}>{selectedSlot}</strong>
                  </div>
                  <div>
                    <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", display: "block" }}>Type</span>
                    <strong style={{ color: "var(--text-primary)" }}>Tele-consultation</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error display */}
          {error && (
            <div className="error-alert" role="alert" style={{ marginBottom: "16px", fontSize: "0.84rem" }}>
              {error}
            </div>
          )}

          {/* Primary CTA */}
          <button
            type="button"
            className="btn btn-primary"
            disabled={!selectedSlot || bookingLoading}
            onClick={handleBook}
            style={{
              width: "100%",
              padding: "14px",
              fontSize: "0.95rem",
              fontWeight: 800,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "8px",
            }}
          >
            {bookingLoading ? (
              <>
                <span className="spinner-ring" style={{ width: "16px", height: "16px", borderWidth: "2px" }} />
                Confirming Appointment…
              </>
            ) : (
              "Confirm Appointment"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
