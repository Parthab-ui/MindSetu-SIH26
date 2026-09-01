import { useState } from "react";

export function StartScreen({ onStartSession, onCancel, loading, error }) {
  const [role, setRole] = useState("Field Operations Personnel");
  const [unit, setUnit] = useState("Sector Unit Bravo");
  const [consent, setConsent] = useState(true);
  const [localError, setLocalError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!role.trim()) {
      setLocalError("Please specify a role or designation to provide context.");
      return;
    }
    if (!consent) {
      setLocalError("Please provide consent to begin the confidential check-in.");
      return;
    }
    setLocalError("");
    onStartSession({ role: role.trim(), unit: unit.trim() });
  }

  const activeError = localError || error;

  return (
    <div className="page-container narrow">
      <div style={{ marginBottom: "28px", animation: "slideUp 280ms cubic-bezier(0.2,0.8,0.2,1) both" }}>
        <span className="eyebrow">STEP 01 · PROTECTED INITIALIZATION</span>
        <h1 className="page-title">Session Context</h1>
        <p className="page-subtitle">
          Provide operational context for this session. Use fictional demo designations if preferred.
        </p>
      </div>

      <div className="card card-elevated" style={{ animation: "slideUp 340ms cubic-bezier(0.2,0.8,0.2,1) both" }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
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
            <label htmlFor="unit-input">Unit / Department (Optional)</label>
            <input
              id="unit-input"
              type="text"
              className="text-input"
              placeholder="e.g. Operations Sector 4"
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
              I understand this session is anonymous, confidential, and used strictly for supportive welfare triage.
            </span>
          </label>


          {activeError && (
            <div className="inline-error" role="alert">
              {activeError}
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px" }}>
            <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={loading}>
              ← Back
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Starting Session..." : "Continue to Wellbeing Pulse →"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
