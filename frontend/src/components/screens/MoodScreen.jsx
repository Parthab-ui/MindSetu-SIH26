const MOODS = [
  { value: 1, emoji: "😞", label: "Very Low" },
  { value: 2, emoji: "😕", label: "Low" },
  { value: 3, emoji: "😐", label: "Steady" },
  { value: 4, emoji: "🙂", label: "Good" },
  { value: 5, emoji: "😄", label: "Great" },
];

export function MoodScreen({
  selectedMood,
  setSelectedMood,
  moodNote,
  setMoodNote,
  onSaveMood,
  moodHistory,
  moodTrend,
  loading,
}) {
  return (
    <div className="page-container narrow">
      <div style={{ marginBottom: "28px" }}>
        <span className="eyebrow">STEP 06 · MOOD TRACKING</span>
        <h1 className="page-title">Daily Mood Check-in</h1>
        <p className="page-subtitle">
          Logging simple check-ins helps you observe recovery patterns and emotional rhythms over time.
        </p>
      </div>

      <div className="card card-elevated" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div>
          <label style={{ fontSize: "0.85rem", fontWeight: 700, textTransform: "uppercase", color: "var(--text-secondary)" }}>
            How do you feel today?
          </label>
          <div className="mood-cards-row">
            {MOODS.map((m) => (
              <button
                key={m.value}
                type="button"
                className={`mood-select-btn ${selectedMood === m.value ? "selected" : ""}`}
                onClick={() => setSelectedMood(m.value)}
                aria-pressed={selectedMood === m.value}
              >
                <span className="mood-emoji">{m.emoji}</span>
                <span className="mood-label">{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="input-field">
          <label htmlFor="mood-note">Optional Note or Reflection</label>
          <textarea
            id="mood-note"
            className="textarea-input"
            placeholder="Add brief thoughts about today's duty, energy levels, or recovery..."
            value={moodNote}
            onChange={(e) => setMoodNote(e.target.value)}
            maxLength={1000}
            rows={3}
          />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button className="btn btn-primary" onClick={onSaveMood} disabled={loading || !selectedMood}>
            {loading ? "Recording..." : "Save Mood Check-in →"}
          </button>
        </div>
      </div>

      {/* Mood Trend Visualization */}
      {moodTrend && moodTrend.length > 1 && (
        <div className="mood-chart-box">
          <span className="eyebrow">TREND ANALYSIS</span>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "4px 0 16px" }}>30-Day Average Mood Pattern</h3>
          <div style={{ height: "120px", display: "flex", alignItems: "flex-end", gap: "8px", padding: "10px 0" }}>
            {moodTrend.slice(-14).map((pt, i) => {
              const heightPercent = Math.round((pt.average_mood / 5) * 100);
              return (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{pt.average_mood}</span>
                  <div
                    style={{
                      width: "100%",
                      maxWidth: "28px",
                      height: `${heightPercent}%`,
                      background: "linear-gradient(180deg, var(--primary), var(--primary-light))",
                      borderRadius: "var(--radius-sm)",
                    }}
                    title={`${pt.date}: ${pt.average_mood}/5 (${pt.entries} check-ins)`}
                  />
                  <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                    {pt.date.split("-").slice(1).join("/")}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent History */}
      {moodHistory && moodHistory.length > 0 && (
        <div style={{ marginTop: "32px" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "16px" }}>Recent Check-ins</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {moodHistory.slice(0, 5).map((entry, idx) => {
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
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "14px 18px",
                    background: "var(--bg-surface-elevated)",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ fontSize: "1.5rem" }}>{item?.emoji || "😐"}</span>
                    <div>
                      <strong style={{ display: "block", fontSize: "0.95rem" }}>{item?.label || "Check-in"}</strong>
                      {entry.note && (
                        <p style={{ margin: "2px 0 0", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                          {entry.note}
                        </p>
                      )}
                    </div>
                  </div>
                  <small style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{dateStr}</small>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
