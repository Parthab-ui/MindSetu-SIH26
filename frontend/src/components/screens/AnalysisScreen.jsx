import { Badge } from "../common/Badge";

export function AnalysisScreen({ analysis, onNavigateToChat, onNavigateToMood, onOpenResearchModal }) {

  const level = String(analysis?.risk_level || "unknown").toLowerCase();

  const meaning =
    level === "high"
      ? "Your responses suggest notable cumulative pressure and strain. Early recovery steps and reaching out to a welfare officer or support specialist are strongly recommended."
      : level === "moderate"
      ? "Some signs of operational strain or fatigue are apparent. Scheduling protected recovery and a timely check-in can help prevent further burnout."
      : level === "low"
      ? "Current indicators show steady balance and manageable strain. Continue maintaining healthy rest and workload pacing."
      : "Complete the check-in to generate your personalized wellbeing summary.";

  const recommendation =
    analysis?.recommendation ||
    "Use this check-in as an anchor for practical recovery conversations and workload adjustments.";

  return (
    <div className="page-container">
      <div style={{ marginBottom: "28px" }}>
        <span className="eyebrow">STEP 04 · WELFARE TRIAGE SUMMARY</span>
        <h1 className="page-title">Your Wellbeing Summary</h1>
        <p className="page-subtitle">
          A responsible support signal based on your recent check-in, designed to help guide practical recovery.
        </p>
      </div>

      {/* Hero Takeaway Card */}
      <div className={`triage-hero-card ${level}`}>
        <div className="triage-header-row">
          <div className="triage-title-group">
            <span className="eyebrow" style={{ color: "var(--text-secondary)" }}>
              CURRENT WELFARE SIGNAL
            </span>
            <h2>{level} Support Signal</h2>
          </div>
          <Badge level={level}>{level} Priority</Badge>
        </div>

        <p className="triage-meaning-text">{meaning}</p>

        <div className="recommendation-panel">
          <span className="panel-tag">PRACTICAL GUIDANCE & NEXT STEPS</span>
          <p>{recommendation}</p>
        </div>

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "8px" }}>
          <button className="btn btn-primary" onClick={onNavigateToChat}>
            Talk with MindSetu AI Companion →
          </button>
          <button className="btn btn-secondary" onClick={onNavigateToMood}>
            Record Daily Mood
          </button>
          <button className="btn btn-ghost" onClick={onOpenResearchModal}>
            🔬 Open Explainable ML Research Lab
          </button>
        </div>
      </div>

      {/* Metrics Breakdown Grid */}
      <div className="metrics-grid">
        <div className="metric-card">
          <span className="metric-card-label">Wellbeing Pulse Score</span>
          <span className="metric-card-value">{analysis?.wellness_score ?? "—"}</span>
          <small style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>Mapped from 6 wellbeing questions</small>
        </div>

        <div className="metric-card">
          <span className="metric-card-label">Duty & Workload Index</span>
          <span className="metric-card-value">{analysis?.workload_score ?? "—"}</span>
          <small style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>Shift hours, rest & schedule strain</small>
        </div>

        <div className="metric-card">
          <span className="metric-card-label">Combined Triage Score</span>
          <span className="metric-card-value">{analysis?.combined_score ?? "—"}</span>
          <small style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>55% Wellbeing + 45% Workload</small>
        </div>
      </div>

      {/* Context Information Cards */}
      <div className="context-grid">
        <div className="card">
          <span className="eyebrow">PERSPECTIVE</span>
          <h3 style={{ fontSize: "1.2rem", fontWeight: 700, margin: "4px 0 10px" }}>Human-Centered Welfare</h3>
          <p style={{ fontSize: "0.92rem", color: "var(--text-secondary)", lineHeight: "1.6", margin: 0 }}>
            MindSetu provides decision-support context. It cannot diagnose psychological disorders, determine fitness
            for duty, or execute disciplinary decisions. Final support plans are always decided by qualified personnel.
          </p>
        </div>

        <div className="card">
          <span className="eyebrow">CONFIDENTIALITY</span>
          <h3 style={{ fontSize: "1.2rem", fontWeight: 700, margin: "4px 0 10px" }}>Protected Data Handling</h3>
          <p style={{ fontSize: "0.92rem", color: "var(--text-secondary)", lineHeight: "1.6", margin: 0 }}>
            All entries are linked to anonymous temporary session tokens. No identifiable biometric or personnel files
            are stored in public indexes.
          </p>
        </div>
      </div>
    </div>
  );
}
