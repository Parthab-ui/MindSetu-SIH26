import { useState, useEffect } from "react";
import { api } from "../../services/api";

const SPECIALIZATION_FILTERS = [
  { id: "all", label: "All Specializations" },
  { id: "operational", label: "Operational Stress" },
  { id: "trauma", label: "Trauma & PTSD" },
  { id: "shift", label: "Shift & Sleep Recovery" },
];

const AVAILABILITY_FILTERS = [
  { id: "all", label: "All Availability" },
  { id: "today", label: "Available Today" },
];

export function DoctorDirectoryScreen({
  onSelectDoctor,
  onNavigateToAppointments,
  consultationProfile = null,
  onEditProfile = null,
  onBack,
  hasAppointments = false,
}) {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSpec, setSelectedSpec] = useState("all");
  const [selectedAvail, setSelectedAvail] = useState("all");

  useEffect(() => {
    let isMounted = true;

    const specParam = selectedSpec === "all" ? "" : selectedSpec === "operational" ? "Operational" : selectedSpec === "trauma" ? "Trauma" : "Shift";
    const availParam = selectedAvail === "today" ? "today" : "";

    api
      .getDoctors({ specialization: specParam, availability: availParam })
      .then((data) => {
        if (isMounted) {
          setDoctors(data || []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || "Unable to load doctors. Please try again.");
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [selectedSpec, selectedAvail]);

  return (
    <div className="page-container" style={{ maxWidth: "1080px", margin: "0 auto", padding: "0 16px 40px" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px", animation: "slideUp 280ms cubic-bezier(0.2,0.8,0.2,1) both" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "8px" }}>
          <div>
            <span className="eyebrow" style={{ color: "var(--primary)" }}>CONFIDENTIAL HUMAN SUPPORT</span>
            <h1 className="page-title" style={{ margin: "4px 0 6px" }}>Connect With a Doctor</h1>
            <p className="page-subtitle" style={{ maxWidth: "680px", margin: 0 }}>
              Find the right professional for a confidential, one-on-one welfare consultation.
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            {consultationProfile && (
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "6px 12px",
                  borderRadius: "var(--radius-full)",
                  background: "var(--primary-light)",
                  border: "1px solid var(--primary-dim)",
                  fontSize: "0.82rem",
                  color: "var(--text-primary)",
                }}
              >
                <span style={{ color: "var(--primary)", fontWeight: 700 }}>✓ Profile Attached:</span>
                <span>{consultationProfile.role} ({consultationProfile.age} yrs)</span>
                {onEditProfile && (
                  <button
                    type="button"
                    onClick={onEditProfile}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--primary)",
                      fontWeight: 700,
                      cursor: "pointer",
                      fontSize: "0.8rem",
                      textDecoration: "underline",
                      padding: "0 2px",
                    }}
                  >
                    Edit
                  </button>
                )}
              </div>
            )}
            {hasAppointments && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onNavigateToAppointments}
                style={{ fontSize: "0.85rem", padding: "8px 16px" }}
              >
                📅 My Appointments →
              </button>
            )}
          </div>
        </div>

        {/* Trust Indicators */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "16px",
            marginTop: "16px",
            padding: "10px 16px",
            background: "var(--bg-surface-elevated)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-md)",
            fontSize: "0.82rem",
            color: "var(--text-secondary)",
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ color: "var(--primary)" }}>🛡️</span> Confidential & Protected
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ color: "var(--primary)" }}>🩺</span> Welfare Specialists (Demo Directory)
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ color: "var(--primary)" }}>🔒</span> Direct Video Consultation
          </span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "12px",
          marginBottom: "24px",
          paddingBottom: "16px",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        {/* Specialization pills */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", marginRight: "4px" }}>
            Specialty:
          </span>
          {SPECIALIZATION_FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              className={`preset-chip-btn ${selectedSpec === f.id ? "active" : ""}`}
              onClick={() => setSelectedSpec(f.id)}
              style={{
                fontSize: "0.80rem",
                padding: "6px 12px",
                borderColor: selectedSpec === f.id ? "var(--primary)" : "var(--border-medium)",
                background: selectedSpec === f.id ? "var(--primary-light)" : "var(--bg-input)",
                color: selectedSpec === f.id ? "var(--primary)" : "var(--text-secondary)",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Availability toggle */}
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <span style={{ fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", marginRight: "4px" }}>
            Status:
          </span>
          {AVAILABILITY_FILTERS.map((a) => (
            <button
              key={a.id}
              type="button"
              className={`preset-chip-btn ${selectedAvail === a.id ? "active" : ""}`}
              onClick={() => setSelectedAvail(a.id)}
              style={{
                fontSize: "0.80rem",
                padding: "6px 12px",
                borderColor: selectedAvail === a.id ? "var(--primary)" : "var(--border-medium)",
                background: selectedAvail === a.id ? "var(--primary-light)" : "var(--bg-input)",
                color: selectedAvail === a.id ? "var(--primary)" : "var(--text-secondary)",
              }}
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="error-alert" role="alert" style={{ marginBottom: "20px" }}>
          {error}
        </div>
      )}

      {/* Loading Skeletons */}
      {loading && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="card"
              style={{
                height: "280px",
                background: "var(--bg-surface)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-lg)",
                animation: "pulse 1.5s infinite",
              }}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && doctors.length === 0 && !error && (
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
          <span style={{ fontSize: "2rem", display: "block", marginBottom: "8px" }}>🩺</span>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "6px" }}>No specialists found</h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", maxWidth: "420px", margin: "0 auto 16px" }}>
            No practitioners matched your selected filters. Try broadening your specialty or availability criteria.
          </p>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              setSelectedSpec("all");
              setSelectedAvail("all");
            }}
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Doctor Cards Grid */}
      {!loading && doctors.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "20px",
          }}
        >
          {doctors.map((doc) => {
            const initials = doc.name
              .replace("Dr. ", "")
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2);

            const isAvailToday = doc.availability_status.toLowerCase().includes("today");

            return (
              <div
                key={doc.id}
                className="card card-elevated"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  padding: "22px",
                  background: "var(--bg-surface-elevated)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-lg)",
                  transition: "transform 200ms ease, box-shadow 200ms ease, border-color 200ms ease",
                }}
              >
                <div>
                  {/* Top Doctor Info */}
                  <div style={{ display: "flex", gap: "14px", alignItems: "flex-start", marginBottom: "14px" }}>
                    <div
                      style={{
                        width: "52px",
                        height: "52px",
                        borderRadius: "50%",
                        background: doc.avatar_color || "var(--primary)",
                        color: "#ffffff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 800,
                        fontSize: "1.15rem",
                        flexShrink: 0,
                        boxShadow: "var(--shadow-sm)",
                      }}
                    >
                      {initials}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: "4px" }}>
                        <h3 style={{ fontSize: "1.05rem", fontWeight: 800, margin: 0, color: "var(--text-primary)" }}>
                          {doc.name}
                        </h3>
                        <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--signal-mod)" }}>
                          ★ {doc.rating} <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>({doc.review_count})</span>
                        </span>
                      </div>
                      <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--primary)", display: "block", marginTop: "2px" }}>
                        {doc.specialization}
                      </span>
                      <span style={{ fontSize: "0.74rem", color: "var(--text-muted)", display: "block" }}>
                        {doc.qualification} · {doc.experience_years} yrs exp.
                      </span>
                    </div>
                  </div>

                  {/* Bio */}
                  <p
                    style={{
                      fontSize: "0.83rem",
                      color: "var(--text-secondary)",
                      lineHeight: "1.45",
                      margin: "0 0 14px 0",
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {doc.bio}
                  </p>

                  {/* Focus Tags */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "16px" }}>
                    {doc.focus_areas.map((tag, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: "0.70rem",
                          fontWeight: 600,
                          padding: "3px 8px",
                          borderRadius: "var(--radius-sm)",
                          background: "var(--bg-input)",
                          border: "1px solid var(--border-subtle)",
                          color: "var(--text-secondary)",
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div
                  style={{
                    paddingTop: "14px",
                    borderTop: "1px solid var(--border-subtle)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.76rem",
                      fontWeight: 600,
                      color: isAvailToday ? "var(--signal-low)" : "var(--signal-mod)",
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                    }}
                  >
                    <span
                      style={{
                        width: "7px",
                        height: "7px",
                        borderRadius: "50%",
                        backgroundColor: isAvailToday ? "var(--signal-low)" : "var(--signal-mod)",
                        display: "inline-block",
                      }}
                    />
                    {doc.availability_status}
                  </span>

                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => onSelectDoctor(doc, "profile")}
                      style={{ fontSize: "0.80rem", padding: "6px 12px" }}
                    >
                      Profile
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => onSelectDoctor(doc, "book")}
                      style={{ fontSize: "0.80rem", padding: "6px 14px" }}
                    >
                      Book Slot →
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Back Button */}
      <div style={{ marginTop: "32px", display: "flex", justifyContent: "flex-start" }}>
        <button type="button" className="btn btn-ghost" onClick={onBack}>
          ← Back to Summary
        </button>
      </div>
    </div>
  );
}
