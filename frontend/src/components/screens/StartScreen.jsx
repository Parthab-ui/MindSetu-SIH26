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
      <div style={{ marginBottom: "28px" }}>
        <span className="eyebrow">STEP 01 · PROTECTED INITIALIZATION</span>
        <h1 className="page-title">Session Context</h1>
        <p className="page-subtitle">
          Provide operational context for this session. Use fictional demo designations if preferred.
        </p>
      </div>

      <div className="card card-elevated">
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
            />
          </div>

          <label
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "12px",
              cursor: "pointer",
              padding: "14px",
              background: "var(--bg-input)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <input
              type="checkbox"
              style={{ marginTop: "3px", width: "18px", height: "18px", accentColor: "var(--primary)" }}
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
            />
            <span style={{ fontSize: "0.88rem", color: "var(--text-secondary)", lineHeight: "1.4" }}>
              I understand this session is anonymous, confidential, and used strictly for supportive welfare triage.
            </span>
          </label>

          {activeError && (
            <div style={{ color: "var(--signal-high)", background: "var(--signal-high-bg)", padding: "12px 16px", borderRadius: "var(--radius-md)", fontSize: "0.9rem", border: "1px solid var(--signal-high-border)" }}>
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
