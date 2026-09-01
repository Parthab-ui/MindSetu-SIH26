import { Badge } from "../common/Badge";

function ScoreBar({ value, level }) {
  const pct = Math.min(Math.max(Number(value) || 0, 0), 100);
  const cls = level === "high" ? "high" : level === "moderate" ? "mod" : "low";
  return (
    <div className="score-bar-track">
      <div
        className={`score-bar-fill ${cls}`}
        style={{ width: `${pct}%`, transition: "width 700ms cubic-bezier(0.2,0.8,0.2,1)" }}
      />
    </div>
  );
}

export function AnalysisScreen({ analysis, onNavigateToChat, onNavigateToMood, onOpenResearchModal }) {
  const level = String(analysis?.risk_level || "unknown").toLowerCase();

  const meaning =
    level === "high"
      ? "Your responses suggest notable cumulative pressure and strain. Early recovery steps and reaching out to a welfare officer or support specialist are strongly recommended."
      : level === "moderate"
      ? "Some signs of operational strain or fatigue are apparent. Scheduling protected recovery and a timely check-in can help prevent further burnout."
      : level === "low"
      ? "Current indicators show steady balance and manageable strain. Continue maintaining healthy rest and workload pacing."
      : "Complete the check-in to generate your personalised wellbeing summary.";

  const recommendation =
    analysis?.recommendation ||
    "Use this check-in as an anchor for practical recovery conversations and workload adjustments.";

  // Score colour logic for bars
  const wellnessLevel =
    (analysis?.wellness_score ?? 0) >= 80
      ? "high"
      : (analysis?.wellness_score ?? 0) >= 50
      ? "moderate"
      : "low";
  const workloadLevel =
    (analysis?.workload_score ?? 0) >= 85
      ? "high"
      : (analysis?.workload_score ?? 0) >= 60
      ? "moderate"
      : "low";

  return (
    <div className="page-container">
      {/* Page heading */}
      <div style={{ marginBottom: "28px", animation: "slideUp 280ms cubic-bezier(0.2,0.8,0.2,1) both" }}>
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

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "4px" }}>
          <button id="analysis-chat-btn" className="btn btn-primary" onClick={onNavigateToChat}>
            Talk with MindSetu AI Companion →
          </button>
          <button className="btn btn-secondary" onClick={onNavigateToMood}>
            Record Daily Mood
          </button>
          <button className="btn btn-ghost" onClick={onOpenResearchModal}>
            🔬 Explainable ML Research Lab
          </button>
        </div>
      </div>

      {/* Metrics Grid — with score bars */}
      <div className="metrics-grid">
        <div className="metric-card">
          <span className="metric-card-label">Wellbeing Pulse Score</span>
          <span className="metric-card-value">{analysis?.wellness_score ?? "—"}</span>
          <span className="metric-card-sub">Out of 100 · 6 wellbeing questions</span>
          {analysis && <ScoreBar value={analysis.wellness_score} level={wellnessLevel} />}
        </div>

        <div className="metric-card">
          <span className="metric-card-label">Duty & Workload Index</span>
          <span className="metric-card-value">{analysis?.workload_score ?? "—"}</span>
          <span className="metric-card-sub">Out of 100 · shift hours, rest & schedule</span>
          {analysis && <ScoreBar value={analysis.workload_score} level={workloadLevel} />}
        </div>

        <div className="metric-card">
          <span className="metric-card-label">Combined Triage Score</span>
          <span className="metric-card-value">{analysis?.combined_score ?? "—"}</span>
          <span className="metric-card-sub">55% Wellbeing + 45% Workload</span>
          {analysis && <ScoreBar value={analysis.combined_score} level={level} />}
        </div>
      </div>

      {/* Context Cards */}
      <div className="context-grid">
        <div className="card card-enter">
          <span className="eyebrow">PERSPECTIVE</span>
          <h3 style={{ fontSize: "1.15rem", fontWeight: 700, margin: "6px 0 10px" }}>
            Human-Centred Welfare
          </h3>
          <p style={{ fontSize: "0.90rem", color: "var(--text-secondary)", lineHeight: "1.65", margin: 0 }}>
            MindSetu provides decision-support context. It cannot diagnose psychological disorders, determine
            fitness for duty, or execute disciplinary decisions. Final support plans are always decided by
            qualified personnel.
          </p>
        </div>

        <div className="card card-enter" style={{ animationDelay: "60ms" }}>
          <span className="eyebrow">CONFIDENTIALITY</span>
          <h3 style={{ fontSize: "1.15rem", fontWeight: 700, margin: "6px 0 10px" }}>
            Protected Data Handling
          </h3>
          <p style={{ fontSize: "0.90rem", color: "var(--text-secondary)", lineHeight: "1.65", margin: 0 }}>
            All entries are linked to anonymous temporary session tokens. No identifiable biometric or
            personnel files are stored in public indexes.
          </p>
        </div>
      </div>
    </div>
  );
}
