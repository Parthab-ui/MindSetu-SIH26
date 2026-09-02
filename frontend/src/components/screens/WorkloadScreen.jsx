import { SliderField } from "../common/SliderField";
import { InfoTooltip } from "../common/InfoTooltip";

const OPERATIONAL_DUTY_PRESETS = [
  {
    label: "Forward Field Deployment",
    icon: "⚔️",
    data: {
      duty_hours: 14,
      night_duties: 4,
      rest_hours: 4.5,
      days_since_leave: 45,
      workload_level: 5,
      high_pressure_assignment: true,
      duty_change_frequency: 4,
    },
  },
  {
    label: "High-Intensity Watch Rotation",
    icon: "🚨",
    data: {
      duty_hours: 12,
      night_duties: 6,
      rest_hours: 5.5,
      days_since_leave: 21,
      workload_level: 4,
      high_pressure_assignment: true,
      duty_change_frequency: 3,
    },
  },
  {
    label: "Routine Base & Recovery Pacing",
    icon: "🛡️",
    data: {
      duty_hours: 8,
      night_duties: 1,
      rest_hours: 7.5,
      days_since_leave: 7,
      workload_level: 2,
      high_pressure_assignment: false,
      duty_change_frequency: 0,
    },
  },
  {
    label: "Post-Deployment Reintegration",
    icon: "🔄",
    data: {
      duty_hours: 9,
      night_duties: 2,
      rest_hours: 6.0,
      days_since_leave: 30,
      workload_level: 3,
      high_pressure_assignment: false,
      duty_change_frequency: 2,
    },
  },
];

export function WorkloadScreen({ workload, setWorkload, onAnalyze, onBack, loading, error }) {
  function updateField(key, value) {
    setWorkload((prev) => ({ ...prev, [key]: value }));
  }

  function handleApplyPreset(presetData) {
    setWorkload((prev) => ({
      ...prev,
      ...presetData,
    }));
  }

  return (
    <div className="page-container narrow">
      <div style={{ marginBottom: "24px", animation: "slideUp 280ms cubic-bezier(0.2,0.8,0.2,1) both" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <span className="eyebrow">STEP 03 · OPERATIONAL & RECOVERY CONTEXT</span>
            <h1 className="page-title">Duty Demands & Sleep Recovery</h1>
          </div>
          <InfoTooltip
            title="Operational Context Scoring Architecture"
            text="Duty hours, shift rotations, and sleep deficit provide objective context to your self-reported stress, ensuring recommendations address root duty pressures."
            techDetail="Factors: Shift Duration (25%), Night Watches (15%), Rest Deficit (15%), Days Since Leave (10%), Workload Tempo (20%), High-Pressure Task (10%), Schedule Changes (5%). Max Score = 100."
            label="Learn why operational context is needed"
          />
        </div>
        <p className="page-subtitle">
          Capturing operational realities enables MindSetu to separate transient fatigue from sustained trauma or burnout risk.
        </p>

        {/* Operational Presets */}
        <div className="preset-container" style={{ margin: "14px 0" }}>
          <span style={{ fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
            Operational Scenario Presets:
          </span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {OPERATIONAL_DUTY_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                className="preset-chip-btn"
                onClick={() => handleApplyPreset(preset.data)}
                disabled={loading}
                title={`Apply scenario: ${preset.label}`}
              >
                <span>{preset.icon}</span> {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="card card-elevated" style={{ display: "flex", flexDirection: "column", gap: "24px", animation: "slideUp 340ms cubic-bezier(0.2,0.8,0.2,1) both" }}>
        <div className="form-section">
          <SliderField
            label="Duty Hours / Day"
            helper="Typical active duty or shift duration per 24-hour cycle"
            value={workload.duty_hours}
            min={0}
            max={24}
            unit="hrs"
            onChange={(val) => updateField("duty_hours", val)}
          />

          <SliderField
            label="Rest & Sleep Hours / Day"
            helper="Dedicated uninterrupted recovery and sleep time"
            value={workload.rest_hours}
            min={0}
            max={24}
            unit="hrs"
            onChange={(val) => updateField("rest_hours", val)}
          />

          <SliderField
            label="Night Duties / Past 2 Weeks"
            helper="Overnight watch shifts or nighttime tactical deployments"
            value={workload.night_duties}
            min={0}
            max={14}
            unit="shifts"
            onChange={(val) => updateField("night_duties", val)}
          />

          <SliderField
            label="Days Since Last Dedicated Leave"
            helper="Consecutive days on active duty without formal leave or rest block"
            value={workload.days_since_leave}
            min={0}
            max={90}
            unit="days"
            onChange={(val) => updateField("days_since_leave", val)}
          />

          <SliderField
            label="Unplanned Duty Schedule Changes"
            helper="Short-notice shift reassignments or emergency rotations in past 7 days"
            value={workload.duty_change_frequency}
            min={0}
            max={7}
            unit="times"
            onChange={(val) => updateField("duty_change_frequency", val)}
          />

          <div className="input-field">
            <label htmlFor="intensity-select">Operational Intensity / Tempo</label>
            <select
              id="intensity-select"
              className="select-input"
              value={workload.workload_level}
              onChange={(e) => updateField("workload_level", Number(e.target.value))}
            >
              <option value={1}>1 · Very Light / Low-demand maintenance</option>
              <option value={2}>2 · Light / Routine steady pacing</option>
              <option value={3}>3 · Moderate Load / Standard active duty tempo</option>
              <option value={4}>4 · Heavy Demand / High operational tempo</option>
              <option value={5}>5 · Critical / Maximum sustained tactical exertion</option>
            </select>
          </div>
        </div>

        <label htmlFor="high-pressure-check" className="toggle-switch-row">
          <div>
            <strong style={{ display: "block", fontSize: "0.95rem", color: "var(--text-primary)" }}>
              High-Risk / Critical Incident Duty
            </strong>
            <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>
              Check if currently handling emergency response, high-threat operations, or critical incident assignments
            </span>
          </div>
          <input
            id="high-pressure-check"
            type="checkbox"
            style={{ width: "20px", height: "20px", accentColor: "var(--primary)", cursor: "pointer" }}
            checked={workload.high_pressure_assignment}
            onChange={(e) => updateField("high_pressure_assignment", e.target.checked)}
            aria-label="High-Risk or Critical Incident Duty Assignment"
          />
        </label>

        {error && (
          <div className="inline-error" role="alert">
            {error}
          </div>
        )}

        <div className="screen-actions-wrap">
          <button type="button" className="btn btn-ghost" onClick={onBack} disabled={loading}>
            ← Back
          </button>
          <button type="button" className="btn btn-primary" onClick={onAnalyze} disabled={loading}>
            {loading ? "Generating Analysis..." : "Generate Welfare Summary →"}
          </button>
        </div>
      </div>
    </div>
  );
}
