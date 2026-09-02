import { useState } from "react";

const SERVICE_BRANCHES = [
  "Armed Forces (Army / Navy / Air Force)",
  "Paramilitary & CAPF (CRPF / BSF / CISF / ITBP / SSB)",
  "Police & Law Enforcement Services",
  "Emergency & Disaster Response (NDRF / SDRF)",
  "Defense & Strategic Support Personnel",
];

const OPERATIONAL_ENVIRONMENTS = [
  "Forward Field Operations / High-Threat Zone",
  "Tactical Watch & Base Shift Rotation",
  "Strategic Operations & Command HQ",
  "Post-Deployment / Routine Reintegration",
];

const ROLE_PRESETS = [
  { label: "Field Patrol / Operations", branch: "Armed Forces (Army / Navy / Air Force)", env: "Forward Field Operations / High-Threat Zone", role: "Field Operations Personnel", unit: "Sector Unit Bravo" },
  { label: "High-Alert Watch Rotation", branch: "Paramilitary & CAPF (CRPF / BSF / CISF / ITBP / SSB)", env: "Tactical Watch & Base Shift Rotation", role: "Tactical Watch Officer", unit: "CAPF Rapid Wing" },
  { label: "Post-Deployment Unit", branch: "Armed Forces (Army / Navy / Air Force)", env: "Post-Deployment / Routine Reintegration", role: "Reintegrating Service Member", unit: "3rd Battalion Support" },
  { label: "Disaster / Emergency Lead", branch: "Emergency & Disaster Response (NDRF / SDRF)", env: "Forward Field Operations / High-Threat Zone", role: "Disaster Response Specialist", unit: "NDRF Response Unit 7" },
];

export function StartScreen({ onStartSession, onCancel, loading, error }) {
  const [branch, setBranch] = useState(SERVICE_BRANCHES[0]);
  const [environment, setEnvironment] = useState(OPERATIONAL_ENVIRONMENTS[0]);
  const [role, setRole] = useState("Field Operations Personnel");
  const [unit, setUnit] = useState("Sector Unit Bravo");
  const [consent, setConsent] = useState(true);
  const [localError, setLocalError] = useState("");

  function handlePreset(p) {
    setBranch(p.branch);
    setEnvironment(p.env);
    setRole(p.role);
    setUnit(p.unit);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!role.trim()) {
      setLocalError("Please specify a role or designation to provide operational context.");
      return;
    }
    if (!consent) {
      setLocalError("Please confirm consent to begin the confidential check-in.");
      return;
    }
    setLocalError("");
    onStartSession({
      branch,
      environment,
      role: role.trim(),
      unit: unit.trim(),
    });
  }

  const activeError = localError || error;

  return (
    <div className="page-container narrow">
      <div style={{ marginBottom: "28px", animation: "slideUp 280ms cubic-bezier(0.2,0.8,0.2,1) both" }}>
        <span className="eyebrow">STEP 01 · PROTECTED INITIALIZATION</span>
        <h1 className="page-title">Operational Context & Service Profile</h1>
        <p className="page-subtitle">
          Provide contextual service details to personalize your mental health screening. Sessions are anonymous and protected from service records.
        </p>
      </div>

      {/* Quick Context Presets */}
      <div className="preset-container" style={{ marginBottom: "20px" }}>
        <span style={{ fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-secondary)", display: "block", marginBottom: "8px" }}>
          Quick Demo Presets:
        </span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {ROLE_PRESETS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              className="preset-chip-btn"
              onClick={() => handlePreset(p)}
              disabled={loading}
              title={`Load profile: ${p.label}`}
            >
              ✦ {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="card card-elevated" style={{ animation: "slideUp 340ms cubic-bezier(0.2,0.8,0.2,1) both" }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div className="input-field">
            <label htmlFor="branch-select">Service Branch / Category</label>
            <select
              id="branch-select"
              className="select-input"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              disabled={loading}
            >
              {SERVICE_BRANCHES.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <div className="input-field">
            <label htmlFor="env-select">Current Operational Environment</label>
            <select
              id="env-select"
              className="select-input"
              value={environment}
              onChange={(e) => setEnvironment(e.target.value)}
              disabled={loading}
            >
              {OPERATIONAL_ENVIRONMENTS.map((env) => (
                <option key={env} value={env}>{env}</option>
              ))}
            </select>
          </div>

          <div className="input-field">
            <label htmlFor="role-input">Role / Functional Designation</label>
            <input
              id="role-input"
              type="text"
              className="text-input"
              placeholder="e.g. Field Operations Personnel / Watch Officer"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="input-field">
            <label htmlFor="unit-input">Unit / Sector Reference (Optional demo label)</label>
            <input
              id="unit-input"
              type="text"
              className="text-input"
              placeholder="e.g. Sector Unit Bravo / Response Wing"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              disabled={loading}
            />
          </div>

          <label
            htmlFor="consent-check"
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "12px",
              cursor: "pointer",
              padding: "16px",
              background: "var(--bg-input)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-subtle)",
              transition: "border-color var(--transition-fast)",
            }}
          >
            <input
              id="consent-check"
              type="checkbox"
              style={{ marginTop: "3px", width: "18px", height: "18px", accentColor: "var(--primary)", cursor: "pointer" }}
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              disabled={loading}
              aria-label="I understand this session is anonymous, confidential, and used strictly for supportive welfare triage."
            />
            <span style={{ fontSize: "0.88rem", color: "var(--text-secondary)", lineHeight: "1.5" }}>
              <strong>Confidentiality Assurance:</strong> I understand this session is strictly anonymous, protected by a temporary session token, and used solely for proactive welfare support. It does not affect fitness records or service logs.
            </span>
          </label>

          {activeError && (
            <div className="inline-error" role="alert">
              {activeError}
            </div>
          )}

          <div className="screen-actions-wrap">
            <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={loading}>
              ← Back
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Starting Protected Session..." : "Continue to Wellbeing Pulse →"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
