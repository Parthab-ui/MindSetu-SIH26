import { useState } from "react";
import { Badge } from "../common/Badge";

const MOODS = [
  { value: 1, emoji: "😞", label: "Very Low", desc: "High exhaustion" },
  { value: 2, emoji: "😕", label: "Low", desc: "Strained" },
  { value: 3, emoji: "😐", label: "Steady", desc: "Balanced" },
  { value: 4, emoji: "🙂", label: "Good", desc: "Rested" },
  { value: 5, emoji: "😄", label: "Great", desc: "High energy" },
];

export function MoodScreen({
  selectedMood,
  setSelectedMood,
  moodNote,
  setMoodNote,
  onSaveMood,
  moodTrend,
  assessmentHistory = [],
  loading,
}) {
  const [activeTab, setActiveTab] = useState("mood");
  const trendEntries = moodTrend || [];

  const totalEntries = trendEntries.reduce((acc, curr) => acc + (curr.entries || 1), 0);
  const avgMood =
    trendEntries.length > 0
      ? (
          trendEntries.reduce((acc, curr) => acc + curr.average_mood * (curr.entries || 1), 0) /
          Math.max(totalEntries, 1)
        ).toFixed(1)
      : null;

  return (
    <div className="page-container narrow">
      {/* Header */}
      <div style={{ marginBottom: "18px", animation: "slideUp 280ms cubic-bezier(0.2,0.8,0.2,1) both" }}>
        <span className="eyebrow">STEP 05 · TRACKING</span>
        <h1 className="page-title">Mood & History</h1>
        <p className="page-subtitle">
          Track recovery rhythms and review check-in milestones.
        </p>
      </div>

      {/* Tab Switcher */}
      <div className="history-tab-bar" style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
        <button
          type="button"
          className={`btn ${activeTab === "mood" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("mood")}
          style={{ flex: 1, padding: "10px 16px" }}
        >
          <span>Daily Mood & Trends</span>
        </button>
        <button
          type="button"
          className={`btn ${activeTab === "assessments" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("assessments")}
          style={{ flex: 1, padding: "10px 16px" }}
        >
          <span>Assessment History ({assessmentHistory.length})</span>
        </button>
      </div>

      {activeTab === "mood" && (
        <>
          {/* Check-in Form Card */}
          <div
            className="card card-elevated"
            style={{ display: "flex", flexDirection: "column", gap: "18px", animation: "slideUp 340ms cubic-bezier(0.2,0.8,0.2,1) both" }}
          >
            <fieldset style={{ border: "none", padding: 0, margin: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <legend style={{ fontSize: "0.80rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)" }}>
                  How do you feel today?
                </legend>
              </div>

              <div className="mood-cards-row" role="radiogroup" aria-label="Daily mood selection">
                {MOODS.map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    className={`mood-select-btn ${selectedMood === m.value ? "selected" : ""}`}
                    onClick={() => setSelectedMood(m.value)}
                    aria-pressed={selectedMood === m.value}
                    aria-label={`${m.label}: ${m.desc}`}
                    title={`${m.label}: ${m.desc}`}
                  >
                    <span className="mood-emoji" aria-hidden="true">{m.emoji}</span>
                    <span className="mood-label">{m.label}</span>
                  </button>
                ))}
              </div>

              {selectedMood && (
                <p style={{ marginTop: "8px", fontSize: "0.80rem", color: "var(--primary-hover)", textAlign: "center", fontWeight: 600 }} aria-live="polite">
                  Selected: {MOODS.find((m) => m.value === selectedMood)?.label}
                </p>
              )}
            </fieldset>

            <div className="input-field">
              <label htmlFor="mood-note">Optional Note</label>
              <textarea
                id="mood-note"
                className="textarea-input"
                placeholder="Note sleep, shift hours, or recovery thoughts…"
                value={moodNote}
                onChange={(e) => setMoodNote(e.target.value)}
                maxLength={1000}
                rows={2}
                aria-label="Optional note"
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
              <button
                className="btn btn-primary"
                onClick={onSaveMood}
                disabled={loading || !selectedMood}
                title={!selectedMood ? "Select a mood rating to save" : "Save this check-in"}
              >
                {loading ? "Saving…" : "Save Mood →"}
              </button>
            </div>
          </div>

          {/* Trend Summary */}
          <div className="mood-chart-box" style={{ marginTop: "24px", animation: "slideUp 400ms cubic-bezier(0.2,0.8,0.2,1) both" }} role="region" aria-label="Mood trend">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <div>
                <span className="eyebrow">7-DAY RECOVERY PATTERN</span>
                <h2 style={{ fontSize: "1.05rem", fontWeight: 700, margin: "2px 0 0" }}>
                  Mood Trend
                </h2>
              </div>
              {avgMood && (
                <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
                  <span style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--primary)" }}>{avgMood}</span>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>/ 5.0 avg</span>
                </div>
              )}
            </div>

            {trendEntries.length === 0 ? (
              <div style={{ textAlign: "center", padding: "20px 0", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                No check-ins yet. Log your first mood above.
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", height: "120px", padding: "10px 0" }}>
                {trendEntries.map((t, idx) => {
                  const heightPct = Math.max(Math.round((t.average_mood / 5) * 100), 15);
                  return (
                    <div key={idx} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                      <span style={{ fontSize: "0.70rem", fontWeight: 700 }}>{t.average_mood.toFixed(1)}</span>
                      <div
                        style={{
                          width: "100%",
                          height: `${heightPct}%`,
                          background: "var(--primary)",
                          borderRadius: "4px 4px 0 0",
                          transition: "height 400ms ease",
                        }}
                      />
                      <span style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>
                        {new Date(t.date).toLocaleDateString("en-US", { weekday: "short" })}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === "assessments" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", animation: "slideUp 340ms cubic-bezier(0.2,0.8,0.2,1) both" }}>
          {assessmentHistory.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: "30px 20px", color: "var(--text-muted)" }}>
              No previous assessments in this session. Complete a check-in to start tracking milestones.
            </div>
          ) : (
            assessmentHistory.map((item, idx) => (
              <div key={idx} className="card" style={{ padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <Badge level={item.risk_level}>{item.risk_level.toUpperCase()}</Badge>
                    <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                      {new Date(item.created_at).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                    Wellness: {Math.round(item.wellness_score)}% • Workload: {Math.round(item.workload_score)}% • Combined: {Math.round(item.combined_score)}%
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
