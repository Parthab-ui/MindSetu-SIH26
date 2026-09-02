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
  { label: "Field Deployment", branch: "Armed Forces (Army / Navy / Air Force)", env: "Forward Field Operations / High-Threat Zone", role: "Field Operations Personnel", unit: "Sector Unit Bravo" },
  { label: "Watch Rotation", branch: "Paramilitary & CAPF (CRPF / BSF / CISF / ITBP / SSB)", env: "Tactical Watch & Base Shift Rotation", role: "Tactical Watch Officer", unit: "CAPF Rapid Wing" },
  { label: "Base Support", branch: "Armed Forces (Army / Navy / Air Force)", env: "Post-Deployment / Routine Reintegration", role: "Reintegrating Service Member", unit: "3rd Battalion Support" },
  { label: "Emergency Lead", branch: "Emergency & Disaster Response (NDRF / SDRF)", env: "Forward Field Operations / High-Threat Zone", role: "Disaster Response Specialist", unit: "NDRF Response Unit 7" },
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
      setLocalError("Please enter a role or designation.");
      return;
    }
    if (!consent) {
      setLocalError("Consent is required to begin.");
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
      <div style={{ marginBottom: "20px", animation: "slideUp 280ms cubic-bezier(0.2,0.8,0.2,1) both" }}>
        <span className="eyebrow">STEP 01 · CONTEXT</span>
        <h1 className="page-title">Service Context</h1>
        <p className="page-subtitle">
          Anonymous session. Not linked to personnel records.
        </p>
      </div>

      {/* Quick Setup Presets */}
      <div className="preset-container" style={{ marginBottom: "16px" }}>
        <span style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>
          Quick Setup:
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
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div className="input-field">
            <label htmlFor="branch-select">Service</label>
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
            <label htmlFor="env-select">Current Setting</label>
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
            <label htmlFor="role-input">Role / Designation</label>
            <input
              id="role-input"
              type="text"
              className="text-input"
              placeholder="e.g. Field Operations Personnel"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="input-field">
            <label htmlFor="unit-input">Unit (Optional)</label>
            <input
              id="unit-input"
              type="text"
              className="text-input"
              placeholder="e.g. Sector Unit Bravo"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Consent Checkbox */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginTop: "4px" }}>
            <input
              type="checkbox"
              id="consent-check"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              style={{ width: "16px", height: "16px", marginTop: "2px", accentColor: "var(--primary)" }}
            />
            <label htmlFor="consent-check" style={{ fontSize: "0.80rem", color: "var(--text-secondary)", cursor: "pointer", margin: 0 }}>
              I agree to proceed with this anonymous check-in.
            </label>
          </div>

          {activeError && (
            <div className="error-alert" role="alert">
              {activeError}
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px" }}>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onCancel}
              disabled={loading}
            >
              ← Cancel
            </button>
            <button
              id="start-submit-btn"
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Starting…" : "Continue →"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
