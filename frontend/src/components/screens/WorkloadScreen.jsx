import { SliderField } from "../common/SliderField";

export function WorkloadScreen({ workload, setWorkload, onAnalyze, onBack, loading, error }) {
  function updateField(key, value) {
    setWorkload((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="page-container">
      <div style={{ marginBottom: "28px" }}>
        <span className="eyebrow">STEP 03 · OPERATIONAL CONTEXT</span>
        <h1 className="page-title">Duty & Recovery Context</h1>
        <p className="page-subtitle">
          Operational factors help provide vital context to your wellbeing summary without influencing performance records.
        </p>
      </div>

      <div className="card card-elevated" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        <div className="form-section">
          <SliderField
            label="Duty Hours / Day"
            helper="Typical shift or active duty duration"
            value={workload.duty_hours}
            min={0}
            max={24}
            unit="hrs"
            onChange={(val) => updateField("duty_hours", val)}
          />

          <SliderField
            label="Rest & Sleep Hours / Day"
            helper="Dedicated recovery and sleep time"
            value={workload.rest_hours}
            min={0}
            max={24}
            unit="hrs"
            onChange={(val) => updateField("rest_hours", val)}
          />

          <SliderField
            label="Night Shifts / Recent Period"
            helper="Overnight deployments or watch duties"
            value={workload.night_duties}
            min={0}
            max={14}
            unit="shifts"
            onChange={(val) => updateField("night_duties", val)}
          />

          <SliderField
            label="Days Since Last Leave / Rest"
            helper="Continuous operational stretch"
            value={workload.days_since_leave}
            min={0}
            max={90}
            unit="days"
            onChange={(val) => updateField("days_since_leave", val)}
          />

          <SliderField
            label="Duty Schedule Changes"
            helper="Unplanned shift or assignment changes"
            value={workload.duty_change_frequency}
            min={0}
            max={7}
            unit="times"
            onChange={(val) => updateField("duty_change_frequency", val)}
          />

          <div className="input-field">
            <label htmlFor="intensity-select">Workload Intensity Level</label>
            <select
              id="intensity-select"
              className="select-input"
              value={workload.workload_level}
              onChange={(e) => updateField("workload_level", Number(e.target.value))}
            >
              <option value={1}>1 · Very Light / Manageable</option>
              <option value={2}>2 · Light / Steady</option>
              <option value={3}>3 · Moderate Load</option>
              <option value={4}>4 · Heavy Demand</option>
              <option value={5}>5 · Critical / Maximum Load</option>
            </select>
          </div>
        </div>

        <label className="toggle-switch-row">
          <div>
            <strong style={{ display: "block", fontSize: "0.95rem", color: "var(--text-primary)" }}>
              High-Pressure Assignment
            </strong>
            <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>
              Check if currently handling time-critical or high-risk emergency duties
            </span>
          </div>
          <input
            type="checkbox"
            style={{ width: "20px", height: "20px", accentColor: "var(--primary)" }}
            checked={workload.high_pressure_assignment}
            onChange={(e) => updateField("high_pressure_assignment", e.target.checked)}
          />
        </label>

        {error && (
          <div
            style={{
              color: "var(--signal-high)",
              background: "var(--signal-high-bg)",
              padding: "14px 18px",
              borderRadius: "var(--radius-md)",
              fontSize: "0.92rem",
              border: "1px solid var(--signal-high-border)",
            }}
          >
            {error}
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px" }}>
          <button type="button" className="btn btn-ghost" onClick={onBack} disabled={loading}>
            ← Back
          </button>
          <button type="button" className="btn btn-primary" onClick={onAnalyze} disabled={loading}>
            {loading ? "Generating Analysis..." : "View Wellbeing Summary →"}
          </button>
        </div>
      </div>
    </div>
  );
}
