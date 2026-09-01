import { SliderField } from "../common/SliderField";
import { InfoTooltip } from "../common/InfoTooltip";

export function WorkloadScreen({ workload, setWorkload, onAnalyze, onBack, loading, error }) {
  function updateField(key, value) {
    setWorkload((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="page-container narrow">
      <div style={{ marginBottom: "28px", animation: "slideUp 280ms cubic-bezier(0.2,0.8,0.2,1) both" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <span className="eyebrow">STEP 03 · OPERATIONAL CONTEXT</span>
            <h1 className="page-title">Duty & Recovery Context</h1>
          </div>
          <InfoTooltip
            title="Why Operational Context Matters"
            text="Duty hours, shift changes, and sleep recovery provide objective context to your self-reported stress, helping generate accurate recovery guidance."
            techDetail="Factors: Duty hours (25%), Night duties (15%), Rest deficit (15%), Leave gap (10%), Intensity (20%), High-pressure (10%), Shift changes (5%)."
            label="Learn why operational context is needed"
          />
        </div>
        <p className="page-subtitle">
          Operational factors provide vital context to your wellbeing summary without influencing service records.
        </p>
      </div>

      <div className="card card-elevated" style={{ display: "flex", flexDirection: "column", gap: "24px", animation: "slideUp 340ms cubic-bezier(0.2,0.8,0.2,1) both" }}>
        <div className="form-section">
          <SliderField
            label="Duty Hours / Day"
            helper="Typical shift or active duty duration per day"
            value={workload.duty_hours}
            min={0}
            max={24}
            unit="hrs"
            onChange={(val) => updateField("duty_hours", val)}
          />

          <SliderField
            label="Rest & Sleep Hours / Day"
            helper="Dedicated recovery and uninterrupted sleep time"
            value={workload.rest_hours}
            min={0}
            max={24}
            unit="hrs"
            onChange={(val) => updateField("rest_hours", val)}
          />

          <SliderField
            label="Night Shifts / Recent Period"
            helper="Overnight deployments or watch duties in past 2 weeks"
            value={workload.night_duties}
            min={0}
            max={14}
            unit="shifts"
            onChange={(val) => updateField("night_duties", val)}
          />

          <SliderField
            label="Days Since Last Leave / Rest"
            helper="Consecutive days on duty without dedicated rest block"
            value={workload.days_since_leave}
            min={0}
            max={90}
            unit="days"
            onChange={(val) => updateField("days_since_leave", val)}
          />

          <SliderField
            label="Duty Schedule Changes"
            helper="Unplanned shift rotations or short-notice assignment changes"
            value={workload.duty_change_frequency}
            min={0}
            max={7}
            unit="times"
            onChange={(val) => updateField("duty_change_frequency", val)}
          />

          <div className="input-field">
            <label htmlFor="intensity-select">Workload Intensity Rating</label>
            <select
              id="intensity-select"
              className="select-input"
              value={workload.workload_level}
              onChange={(e) => updateField("workload_level", Number(e.target.value))}
            >
              <option value={1}>1 · Very Light / Manageable demand</option>
              <option value={2}>2 · Light / Routine steady demand</option>
              <option value={3}>3 · Moderate Load / Steady tempo</option>
              <option value={4}>4 · Heavy Demand / High tempo</option>
              <option value={5}>5 · Critical / Maximum sustained effort</option>
            </select>
          </div>
        </div>

        <label className="toggle-switch-row">
          <div>
            <strong style={{ display: "block", fontSize: "0.95rem", color: "var(--text-primary)" }}>
              High-Pressure / Emergency Duty
            </strong>
            <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>
              Check if currently handling emergency response, high-risk assignments, or time-critical duties
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
          <div className="inline-error" role="alert">
            {error}
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px" }}>
          <button type="button" className="btn btn-ghost" onClick={onBack} disabled={loading}>
            ← Back
          </button>
          <button type="button" className="btn btn-primary" onClick={onAnalyze} disabled={loading}>
            {loading ? "Generating Analysis..." : "Generate Wellbeing Summary →"}
          </button>
        </div>
      </div>
    </div>
  );
}
