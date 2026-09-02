import { SliderField } from "../common/SliderField";
import { InfoTooltip } from "../common/InfoTooltip";

const OPERATIONAL_DUTY_PRESETS = [
  {
    label: "Field Deployment",
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
    label: "Watch Rotation",
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
    label: "Base Recovery",
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
    label: "Reintegration",
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
      <div style={{ marginBottom: "18px", animation: "slideUp 280ms cubic-bezier(0.2,0.8,0.2,1) both" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <span className="eyebrow">STEP 03 · DUTY CONTEXT</span>
            <h1 className="page-title">Duty Demands</h1>
          </div>
          <InfoTooltip
            title="Duty Context Scoring"
            text="Integrates shift duration, sleep deficit, night watches, and leave intervals to evaluate cumulative duty burden."
            techDetail="Factors: Shift Hours (25%), Night Shifts (15%), Sleep Deficit (15%), Leave Gap (10%), Tempo (20%), High-Risk Duty (10%), Changes (5%). Max = 100."
            label="Information about Duty Context Scoring"
          />
        </div>
        <p className="page-subtitle">
          Objective shift demands and sleep recovery.
        </p>

        {/* Operational Presets */}
        <div className="preset-container" style={{ margin: "10px 0 14px" }}>
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

      <div className="card card-elevated" style={{ display: "flex", flexDirection: "column", gap: "20px", animation: "slideUp 340ms cubic-bezier(0.2,0.8,0.2,1) both" }}>
        <div className="form-section">
          <SliderField
            label="Daily Duty Hours"
            helper="Active duty per 24-hour cycle"
            value={workload.duty_hours}
            min={0}
            max={24}
            unit="hrs"
            onChange={(val) => updateField("duty_hours", val)}
          />

          <SliderField
            label="Daily Sleep Hours"
            helper="Uninterrupted sleep recovery"
            value={workload.rest_hours}
            min={0}
            max={24}
            unit="hrs"
            onChange={(val) => updateField("rest_hours", val)}
          />

          <SliderField
            label="Night Shifts (Past 2 Wks)"
            helper="Overnight watch shifts"
            value={workload.night_duties}
            min={0}
            max={14}
            unit="shifts"
            onChange={(val) => updateField("night_duties", val)}
          />

          <SliderField
            label="Days Since Leave"
            helper="Days since last off-duty leave"
            value={workload.days_since_leave}
            min={0}
            max={180}
            unit="days"
            onChange={(val) => updateField("days_since_leave", val)}
          />

          <SliderField
            label="Duty Intensity Tempo"
            helper="1 = Low Tempo, 5 = Peak Operational Alert"
            value={workload.workload_level}
            min={1}
            max={5}
            unit="/ 5"
            onChange={(val) => updateField("workload_level", val)}
          />

          <SliderField
            label="Schedule Changes (Past 2 Wks)"
            helper="Unscheduled duty rotations"
            value={workload.duty_change_frequency}
            min={0}
            max={10}
            unit="changes"
            onChange={(val) => updateField("duty_change_frequency", val)}
          />

          {/* High-Risk Assignment Toggle */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", background: "var(--bg-input)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
            <div>
              <strong style={{ fontSize: "0.88rem", display: "block", color: "var(--text-primary)" }}>
                High-Risk Assignment
              </strong>
              <span style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}>
                Active field operations or high-threat area
              </span>
            </div>
            <button
              type="button"
              className={`btn ${workload.high_pressure_assignment ? "btn-primary" : "btn-secondary"}`}
              style={{ padding: "6px 16px", fontSize: "0.84rem" }}
              onClick={() => updateField("high_pressure_assignment", !workload.high_pressure_assignment)}
              disabled={loading}
              aria-pressed={workload.high_pressure_assignment}
            >
              {workload.high_pressure_assignment ? "Yes" : "No"}
            </button>
          </div>
        </div>

        {error && (
          <div className="error-alert" role="alert">
            {error}
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onBack}
            disabled={loading}
          >
            ← Back
          </button>
          <button
            id="workload-submit-btn"
            type="button"
            className="btn btn-primary"
            onClick={onAnalyze}
            disabled={loading}
          >
            {loading ? "Analyzing…" : "Continue to Voice Check →"}
          </button>
        </div>
      </div>
    </div>
  );
}
