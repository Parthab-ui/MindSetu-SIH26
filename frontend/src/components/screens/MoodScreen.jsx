import { useState } from "react";
import { InfoTooltip } from "../common/InfoTooltip";
import { Badge } from "../common/Badge";

const MOODS = [
  { value: 1, emoji: "😞", label: "Very Low", desc: "Exhausted or high distress" },
  { value: 2, emoji: "😕", label: "Low", desc: "Strained or low energy" },
  { value: 3, emoji: "😐", label: "Steady", desc: "Manageable and balanced" },
  { value: 4, emoji: "🙂", label: "Good", desc: "Energised and positive" },
  { value: 5, emoji: "😄", label: "Great", desc: "Fully rested and strong" },
];

export function MoodScreen({
  selectedMood,
  setSelectedMood,
  moodNote,
  setMoodNote,
  onSaveMood,
  moodHistory,
  moodTrend,
  assessmentHistory = [],
  loading,
}) {
  const [activeTab, setActiveTab] = useState("mood"); // "mood" | "assessments"
  const trendEntries = moodTrend || [];
  const historyEntries = moodHistory || [];

  // Calculate average if trend points exist
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
      <div style={{ marginBottom: "20px", animation: "slideUp 280ms cubic-bezier(0.2,0.8,0.2,1) both" }}>
        <span className="eyebrow">STEP 06 · LONGITUDINAL MONITORING & HISTORY</span>
        <h1 className="page-title">Mood Tracking & Assessment Journey</h1>
        <p className="page-subtitle">
          Observe your personal recovery rhythms, track daily mood patterns, and review previous mental health screening milestones.
        </p>
      </div>

      {/* Tab Switcher */}
      <div className="history-tab-bar" style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <button
          type="button"
          className={`btn ${activeTab === "mood" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("mood")}
          style={{ flex: 1, padding: "10px 16px" }}
        >
          <span>Daily Mood Check-in & Trends</span>
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
            style={{ display: "flex", flexDirection: "column", gap: "24px", animation: "slideUp 340ms cubic-bezier(0.2,0.8,0.2,1) both" }}
          >
            <fieldset style={{ border: "none", padding: 0, margin: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <legend style={{ fontSize: "0.82rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-secondary)" }}>
                  How do you feel today?
                </legend>
                <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Select one option</span>
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
                <p style={{ marginTop: "8px", fontSize: "0.82rem", color: "var(--primary-hover)", textAlign: "center", fontWeight: 500 }} aria-live="polite">
                  Selected: <strong>{MOODS.find((m) => m.value === selectedMood)?.label}</strong> — {MOODS.find((m) => m.value === selectedMood)?.desc}
                </p>
              )}
            </fieldset>

            <div className="input-field">
              <label htmlFor="mood-note">Optional Note or Duty Reflection</label>
              <textarea
                id="mood-note"
                className="textarea-input"
                placeholder="e.g. Note shift duration, sleep quality, operational tempo, or tactical decompression..."
                value={moodNote}
                onChange={(e) => setMoodNote(e.target.value)}
                maxLength={1000}
                rows={3}
                aria-label="Optional note or duty reflection"
              />
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px", display: "block" }}>
                Confidential · Protected within your anonymous session token.
              </span>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
              <button
                className="btn btn-primary"
                onClick={onSaveMood}
                disabled={loading || !selectedMood}
                title={!selectedMood ? "Select a mood rating to save" : "Save this check-in"}
                aria-label={loading ? "Recording Check-in..." : "Save Mood Check-in"}
              >
                {loading ? "Recording Check-in..." : "Save Mood Check-in →"}
              </button>
            </div>
          </div>

          {/* Mood Trend Visualization Section */}
          <div className="mood-chart-box" style={{ marginTop: "32px", animation: "slideUp 400ms cubic-bezier(0.2,0.8,0.2,1) both" }} role="region" aria-label="Mood and recovery trend summary">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
              <div>
                <span className="eyebrow" style={{ margin: 0 }}>LONGITUDINAL PATTERNS</span>
                <h3 style={{ fontSize: "1.15rem", fontWeight: 700, margin: "4px 0 2px" }}>
                  Mood & Recovery Trend
                </h3>
                <p style={{ fontSize: "0.84rem", color: "var(--text-secondary)", margin: 0 }}>
                  {trendEntries.length > 1
                    ? `Based on ${totalEntries} check-in${totalEntries === 1 ? "" : "s"} across ${trendEntries.length} days.`
                    : "Observes your wellbeing rhythm over consecutive duty periods."}
                </p>
              </div>

              <InfoTooltip
                title="Mood Trend Analysis"
                text="Tracks daily mood logs (1 = Very Low to 5 = Great) over time to help you identify periods of sustained strain or positive recovery."
                techDetail="Values show daily aggregated arithmetic averages (1.0 to 5.0 scale). Trend chart renders active days."
                label="Information about Mood Trend"
              />
            </div>

            {/* State 1: Zero Entries */}
            {trendEntries.length === 0 && historyEntries.length === 0 && (
              <div style={{ padding: "32px 16px", textAlign: "center", background: "var(--bg-input)", borderRadius: "var(--radius-md)", border: "1px dashed var(--border-medium)" }}>
                <span style={{ fontSize: "1.8rem", display: "block", marginBottom: "8px" }} aria-hidden="true">📊</span>
                <strong style={{ display: "block", fontSize: "0.95rem", color: "var(--text-primary)" }}>
                  No mood check-ins recorded yet
                </strong>
                <p style={{ fontSize: "0.84rem", color: "var(--text-secondary)", maxWidth: "360px", margin: "4px auto 0" }}>
                  Select how you feel above and save your first check-in to begin tracking patterns over time.
                </p>
              </div>
            )}

            {/* State 2: One Entry */}
            {trendEntries.length === 1 && (
              <div style={{ padding: "24px 16px", textAlign: "center", background: "var(--bg-input)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
                <span style={{ fontSize: "1.5rem", display: "block", marginBottom: "6px" }} aria-hidden="true">🌱</span>
                <strong style={{ display: "block", fontSize: "0.95rem", color: "var(--text-primary)" }}>
                  1 Check-in Recorded · Pattern Initialized
                </strong>
                <p style={{ fontSize: "0.84rem", color: "var(--text-secondary)", maxWidth: "380px", margin: "4px auto 0" }}>
                  Your recovery trajectory will emerge as you log additional daily check-ins over your duty rotation.
                </p>
              </div>
            )}

            {/* State 3: Multiple Entries Chart */}
            {trendEntries.length > 1 && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", padding: "10px 14px", background: "var(--bg-surface-elevated)", borderRadius: "var(--radius-sm)" }}>
                  <span style={{ fontSize: "0.84rem", color: "var(--text-secondary)" }}>Recent Average Mood</span>
                  <strong style={{ fontSize: "1.05rem", color: "var(--primary-hover)" }}>
                    {avgMood} / 5.0
                  </strong>
                </div>

                <div className="mood-bar-chart" role="group" aria-label={`Mood trend bar chart: ${trendEntries.length} days recorded, average ${avgMood} out of 5.0`}>
                  {trendEntries.slice(-14).map((pt, i) => {
                    const heightPercent = Math.min(Math.max(Math.round((pt.average_mood / 5) * 100), 10), 100);
                    return (
                      <div key={i} className="mood-bar-item">
                        <span style={{ fontSize: "0.72rem", color: "var(--text-secondary)", fontWeight: 700 }} aria-hidden="true">
                          {pt.average_mood}
                        </span>
                        <div
                          className="mood-bar-fill"
                          style={{ height: `${heightPercent}%` }}
                          title={`${pt.date}: ${pt.average_mood}/5 (${pt.entries} check-in${pt.entries === 1 ? "" : "s"})`}
                          role="img"
                          aria-label={`${pt.date}: ${pt.average_mood} out of 5 (${pt.entries} check-ins)`}
                        />
                        <span style={{ fontSize: "0.68rem", color: "var(--text-muted)", whiteSpace: "nowrap" }} aria-hidden="true">
                          {pt.date.split("-").slice(1).join("/")}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Recent Mood History List */}
          {historyEntries.length > 0 && (
            <div style={{ marginTop: "32px", animation: "slideUp 440ms cubic-bezier(0.2,0.8,0.2,1) both" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>Recent Check-in Logs</h3>
                <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                  Showing last {Math.min(historyEntries.length, 5)} entries
                </span>
              </div>

              <div className="history-list" role="list" aria-label="Recent mood check-in history">
                {historyEntries.slice(0, 5).map((entry, idx) => {
                  const item = MOODS.find((m) => m.value === entry.mood);
                  const dateStr = entry.created_at
                    ? new Date(entry.created_at).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Recent";
                  return (
                    <div
                      key={idx}
                      role="listitem"
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "14px 18px",
                        background: "var(--bg-surface-elevated)",
                        borderRadius: "var(--radius-md)",
                        border: "1px solid var(--border-subtle)",
                        gap: "12px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <span style={{ fontSize: "1.6rem", lineHeight: 1 }} aria-hidden="true">
                          {item?.emoji || "😐"}
                        </span>
                        <div>
                          <strong style={{ display: "block", fontSize: "0.95rem" }}>
                            {item?.label || "Check-in"}
                          </strong>
                          {entry.note ? (
                            <p style={{ margin: "2px 0 0", fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: "1.4" }}>
                              {entry.note}
                            </p>
                          ) : (
                            <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>No note attached</span>
                          )}
                        </div>
                      </div>
                      <small style={{ color: "var(--text-muted)", fontSize: "0.8rem", whiteSpace: "nowrap" }}>
                        {dateStr}
                      </small>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* Tab 2: Assessment History & Longitudinal Comparison */}
      {activeTab === "assessments" && (
        <div style={{ animation: "slideUp 340ms cubic-bezier(0.2,0.8,0.2,1) both" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
            <div>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 700, margin: "0 0 4px" }}>
                Assessment Milestones Timeline
              </h3>
              <p style={{ fontSize: "0.84rem", color: "var(--text-secondary)", margin: 0 }}>
                Chronological record of completed SIH26186 welfare assessments within this protected session.
              </p>
            </div>
            <InfoTooltip
              title="Assessment History Tracking"
              text="Shows previous wellbeing pulses and duty workload scores. Comparing assessments helps personnel and welfare officers identify whether recovery actions are reducing operational strain."
              techDetail="Records saved in PostgreSQL sih26186_analysis table, keyed to your protected session."
              label="Learn about Assessment History"
            />
          </div>

          {assessmentHistory.length === 0 ? (
            <div style={{ padding: "36px 16px", textAlign: "center", background: "var(--bg-input)", borderRadius: "var(--radius-md)", border: "1px dashed var(--border-medium)" }}>
              <span style={{ fontSize: "1.8rem", display: "block", marginBottom: "8px" }} aria-hidden="true">📋</span>
              <strong style={{ display: "block", fontSize: "0.95rem", color: "var(--text-primary)" }}>
                No completed assessments yet
              </strong>
              <p style={{ fontSize: "0.84rem", color: "var(--text-secondary)", maxWidth: "380px", margin: "4px auto 0" }}>
                Complete your first Wellbeing Pulse and Duty Context to generate a welfare summary and track long-term progression.
              </p>
            </div>
          ) : (
            <div className="history-list" role="list" aria-label="Assessment history list">
              {assessmentHistory.map((item, idx) => {
                const dateStr = item.created_at
                  ? new Date(item.created_at).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Recent";
                const lvl = String(item.risk_level || "low").toLowerCase();
                return (
                  <div
                    key={item.id || idx}
                    role="listitem"
                    className="card"
                    style={{
                      padding: "16px 20px",
                      background: "var(--bg-surface-elevated)",
                      border: "1px solid var(--border-subtle)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-muted)" }}>
                          #{assessmentHistory.length - idx}
                        </span>
                        <Badge level={lvl}>{lvl.toUpperCase()} PRIORITY</Badge>
                      </div>
                      <span style={{ fontSize: "0.80rem", color: "var(--text-muted)" }}>{dateStr}</span>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: "10px", padding: "10px 14px", background: "var(--bg-input)", borderRadius: "var(--radius-sm)" }}>
                      <div>
                        <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", display: "block" }}>Wellbeing Score</span>
                        <strong style={{ fontSize: "1.05rem" }}>{Math.round(item.wellness_score)}/100</strong>
                      </div>
                      <div>
                        <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", display: "block" }}>Workload Score</span>
                        <strong style={{ fontSize: "1.05rem" }}>{Math.round(item.workload_score)}/100</strong>
                      </div>
                      <div>
                        <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", display: "block" }}>Combined Triage</span>
                        <strong style={{ fontSize: "1.05rem", color: "var(--primary-hover)" }}>{Math.round(item.combined_score)}/100</strong>
                      </div>
                    </div>

                    <p style={{ margin: 0, fontSize: "0.84rem", color: "var(--text-secondary)", lineHeight: "1.5" }}>
                      {item.recommendation}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
