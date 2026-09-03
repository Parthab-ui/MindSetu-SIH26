import { Badge } from "../common/Badge";

function ScoreBar({ value, level, label = "Score progress" }) {
  const pct = Math.min(Math.max(Number(value) || 0, 0), 100);
  const cls = level === "high" ? "high" : level === "moderate" ? "mod" : "low";
  return (
    <div
      className="score-bar-track"
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`${label}: ${pct}%`}
    >
      <div
        className={`score-bar-fill ${cls}`}
        style={{ width: `${pct}%`, transition: "width 700ms cubic-bezier(0.2,0.8,0.2,1)" }}
      />
    </div>
  );
}

export function AnalysisScreen({
  analysis,
  answers = [],
  voiceResult = null,
  onNavigateToChat,
  onNavigateToMood,
  onOpenResearchModal,
  onNavigateToDoctors,
}) {
  const level = String(analysis?.risk_level || "unknown").toLowerCase();

  // Compute subscales
  const validAnswers = Array.isArray(answers) && answers.length === 6 && answers.every((a) => a !== null);
  
  // Depression Subscale: Q1 (Exhaustion), Q4 (Cognitive Fog), Q6 (Duty Burden)
  const depressionScore = validAnswers
    ? Math.round(((answers[0] + answers[3] + answers[5]) / 9) * 100)
    : analysis?.wellness_score !== undefined
    ? Math.round(analysis.wellness_score * 0.95)
    : null;

  // PTSD / Trauma Subscale: Q2 (Hypervigilance), Q3 (Detachment), Q5 (Disturbed Sleep)
  const traumaScore = validAnswers
    ? Math.round(((answers[1] + answers[2] + answers[4]) / 9) * 100)
    : analysis?.wellness_score !== undefined
    ? Math.round(analysis.wellness_score * 1.05 > 100 ? 100 : analysis.wellness_score * 1.05)
    : null;

  const depressionLevel =
    depressionScore === null ? "low" : depressionScore >= 70 ? "high" : depressionScore >= 40 ? "moderate" : "low";

  const traumaLevel =
    traumaScore === null ? "low" : traumaScore >= 70 ? "high" : traumaScore >= 40 ? "moderate" : "low";

  // Concise interpretations
  const heroSubtitle =
    level === "high"
      ? "Elevated operational strain and fatigue. Prioritising recovery time and connecting with support is recommended."
      : level === "moderate"
      ? "Moderate duty strain buildup. Proactive rest adjustments will help prevent escalation."
      : level === "low"
      ? "Steady operational resilience. Maintain healthy rest rhythms and peer check-in habits."
      : "Complete the check-in to generate your wellbeing summary.";

  const whatWeAreSeeing =
    level === "high"
      ? "Elevated duty demands and fatigue signals indicate need for recovery buffers."
      : level === "moderate"
      ? "Duty demands are accumulating; core capacity remains steady."
      : "Duty demands and wellbeing responses are within a balanced range.";

  const whatYouCanDo =
    analysis?.recommendation ||
    (level === "high"
      ? "Protect 7–8 hours of recovery sleep, practice decompression, and consider support check-in."
      : level === "moderate"
      ? "Schedule protected rest blocks after high-tempo shifts and stay hydrated."
      : "Continue your current rest rhythms and peer habits.");

  const whenToCheckAgain =
    level === "high"
      ? "Check in again within 24–48 hours."
      : level === "moderate"
      ? "Check in again in 3–5 days."
      : "Check in again in 1–2 weeks.";

  const workloadVal = analysis?.workload_score ?? null;

  const workloadLevel =
    workloadVal === null ? "low" : workloadVal >= 85 ? "high" : workloadVal >= 60 ? "moderate" : "low";

  return (
    <div className="page-container">
      {/* Page Heading */}
      <div style={{ marginBottom: "20px", animation: "slideUp 280ms cubic-bezier(0.2,0.8,0.2,1) both" }}>
        <span className="eyebrow">CONFIDENTIAL SUMMARY</span>
        <h1 className="page-title">Wellbeing Summary</h1>
        <p className="page-subtitle">
          Multi-dimensional assessment evaluating Depression, Trauma strain, and Duty Workload.
        </p>
      </div>

      {/* Hero Takeaway Card */}
      <div className={`triage-hero-card ${level}`}>
        <div className="triage-header-row">
          <div className="triage-title-group">
            <span className="eyebrow" style={{ color: "var(--text-secondary)" }}>
              CURRENT SIGNAL
            </span>
            <h2>{level.charAt(0).toUpperCase() + level.slice(1)} Priority</h2>
          </div>
          <Badge level={level}>{level.toUpperCase()} PRIORITY</Badge>
        </div>

        <p className="triage-meaning-text">{heroSubtitle}</p>

        {/* Structured 3-Part Takeaway */}
        <div className="triage-breakdown-grid">
          <div className="triage-breakdown-box">
            <span className="breakdown-label">WHAT WE SEE</span>
            <p className="breakdown-text">{whatWeAreSeeing}</p>
          </div>
          <div className="triage-breakdown-box">
            <span className="breakdown-label">NEXT STEP</span>
            <p className="breakdown-text">{whatYouCanDo}</p>
          </div>
          <div className="triage-breakdown-box">
            <span className="breakdown-label">FOLLOW-UP</span>
            <p className="breakdown-text">{whenToCheckAgain}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="triage-actions-wrap">
          <button id="analysis-doctor-btn" className="btn btn-primary" onClick={onNavigateToDoctors}>
            Connect With a Doctor →
          </button>
          <button id="analysis-chat-btn" className="btn btn-secondary" onClick={onNavigateToChat}>
            Talk to AI Companion
          </button>
          <button className="btn btn-secondary" onClick={onNavigateToMood}>
            Record Mood
          </button>
          <button
            className="btn btn-research-trigger"
            onClick={onOpenResearchModal}
            title="Open Explainable ML Research Lab (LightGBM + TreeSHAP)"
          >
            <span className="research-btn-primary">Why this result?</span>
            <span className="research-btn-secondary">Explainable ML Lab 🔬</span>
          </button>
        </div>
      </div>

      {/* Supportive Next Step: Professional Consultation */}
      <div
        className="card card-elevated"
        style={{
          marginTop: "20px",
          padding: "20px 24px",
          background: "linear-gradient(135deg, rgba(20, 184, 166, 0.08) 0%, var(--bg-surface-elevated) 100%)",
          border: "1.5px solid var(--primary-dim)",
          borderRadius: "var(--radius-lg)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div style={{ flex: 1, minWidth: "260px" }}>
          <span className="eyebrow" style={{ color: "var(--primary)", letterSpacing: "0.06em" }}>
            YOUR NEXT STEP
          </span>
          <h3 style={{ fontSize: "1.15rem", fontWeight: 800, margin: "2px 0 6px", color: "var(--text-primary)" }}>
            Connect With a Qualified Doctor
          </h3>
          <p style={{ margin: 0, fontSize: "0.88rem", color: "var(--text-secondary)", lineHeight: "1.5", maxWidth: "560px" }}>
            Talking with a qualified professional can help you better understand your results and decide what to do next in complete confidentiality.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={onNavigateToDoctors}
          style={{ padding: "12px 22px", fontSize: "0.92rem", fontWeight: 800, whiteSpace: "nowrap" }}
        >
          Connect With a Doctor →
        </button>
      </div>

      {/* Metrics Section */}
      <div style={{ marginTop: "24px", marginBottom: "12px" }}>
        <span className="eyebrow">KEY INDICATORS</span>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 800, margin: "2px 0 4px" }}>
          Dimensional Breakdown
        </h2>
      </div>

      <div className="metrics-grid">
        {/* Metric 1: Depression */}
        <div className="metric-card">
          <div className="metric-card-top">
            <div className="metric-card-title-wrap">
              <span className="metric-card-label">Depression</span>
              <span className="metric-card-badge" style={{ background: "rgba(59, 130, 246, 0.15)", color: "var(--accent-blue)" }}>
                Affective & Focus
              </span>
            </div>
          </div>

          <div className="metric-value-row">
            <span className="metric-card-value">{depressionScore !== null ? depressionScore : "—"}</span>
            <span className="metric-value-scale">/ 100</span>
          </div>

          <p className="metric-interpretation">
            {depressionScore === null
              ? "Pending check-in"
              : depressionScore >= 70
              ? "Elevated fatigue and cognitive load. Structured rest recommended."
              : depressionScore >= 40
              ? "Mild to moderate energy drain; manageable with active pacing."
              : "Low depressive indicator; steady cognitive clarity."}
          </p>

          {depressionScore !== null && <ScoreBar value={depressionScore} level={depressionLevel} label="Depression Indicator" />}
        </div>

        {/* Metric 2: PTSD / Trauma */}
        <div className="metric-card">
          <div className="metric-card-top">
            <div className="metric-card-title-wrap">
              <span className="metric-card-label">Trauma & Arousal</span>
              <span className="metric-card-badge" style={{ background: "rgba(245, 158, 11, 0.15)", color: "var(--warning)" }}>
                Arousal & Sleep
              </span>
            </div>
          </div>

          <div className="metric-value-row">
            <span className="metric-card-value">{traumaScore !== null ? traumaScore : "—"}</span>
            <span className="metric-value-scale">/ 100</span>
          </div>

          <p className="metric-interpretation">
            {traumaScore === null
              ? "Pending check-in"
              : traumaScore >= 70
              ? "Elevated hyperarousal and sleep disruption signals."
              : traumaScore >= 40
              ? "Moderate alert retention; grounding recommended."
              : "Low trauma strain; steady recovery."}
          </p>

          {traumaScore !== null && <ScoreBar value={traumaScore} level={traumaLevel} label="Trauma Indicator" />}
        </div>

        {/* Metric 3: Duty Workload */}
        <div className="metric-card">
          <div className="metric-card-top">
            <div className="metric-card-title-wrap">
              <span className="metric-card-label">Duty Workload</span>
              <span className="metric-card-badge" style={{ background: "rgba(16, 185, 129, 0.15)", color: "var(--success)" }}>
                Operational
              </span>
            </div>
          </div>

          <div className="metric-value-row">
            <span className="metric-card-value">{workloadVal !== null ? Math.round(workloadVal) : "—"}</span>
            <span className="metric-value-scale">/ 100</span>
          </div>

          <p className="metric-interpretation">
            {workloadVal === null
              ? "Pending check-in"
              : workloadVal >= 85
              ? "High operational demand with sleep deficit. Rest needed."
              : workloadVal >= 60
              ? "Moderate tempo; protect sleep hours."
              : "Sustainable schedule with adequate recovery."}
          </p>

          {analysis && <ScoreBar value={workloadVal} level={workloadLevel} label="Workload score" />}
        </div>
      </div>

      {/* Multimodal Box */}
      {voiceResult ? (
        <div className="card" style={{ marginTop: "24px", border: "1px solid var(--border-medium)", background: "var(--bg-surface-elevated)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "1.3rem" }}>🎙️</span>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 800, margin: 0 }}>
                Multimodal Comparison
              </h3>
            </div>
            <span className="badge" style={{ fontSize: "0.72rem" }}>
              Voice Quality: {voiceResult.audio_quality?.toUpperCase()}
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "12px", marginBottom: "12px" }}>
            <div style={{ padding: "10px 14px", background: "var(--bg-input)", borderRadius: "var(--radius-sm)" }}>
              <span style={{ fontSize: "0.74rem", fontWeight: 700, textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
                Depression
              </span>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                <span>Self-Report: <strong>{depressionScore}%</strong></span>
                <span>Voice ML: <strong>{voiceResult.depression_signal}%</strong></span>
              </div>
            </div>

            <div style={{ padding: "10px 14px", background: "var(--bg-input)", borderRadius: "var(--radius-sm)" }}>
              <span style={{ fontSize: "0.74rem", fontWeight: 700, textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
                Trauma & Stress
              </span>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                <span>Self-Report: <strong>{traumaScore}%</strong></span>
                <span>Voice Proxy: <strong>{voiceResult.trauma_signal}%</strong></span>
              </div>
            </div>
          </div>

          <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", margin: 0, lineHeight: 1.4 }}>
            {Math.abs((depressionScore || 50) - (voiceResult.depression_signal || 50)) <= 20
              ? "Signals align: Both self-reported responses and vocal paralinguistics reflect consistent levels."
              : (depressionScore || 50) > (voiceResult.depression_signal || 50)
              ? "Signals differ: Self-reported fatigue is elevated while vocal prosody remains steady."
              : "Signals differ: Speech acoustic markers show hesitation despite lower self-reported scores."}
          </p>
        </div>
      ) : null}

      {/* Recovery Pathways */}
      <div style={{ marginTop: "24px", marginBottom: "12px" }}>
        <span className="eyebrow">RECOVERY</span>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 800, margin: "2px 0 4px" }}>
          Tailored Recovery Pathways
        </h2>
      </div>

      <div className="context-grid">
        <div className="card card-enter">
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <span style={{ fontSize: "1.2rem" }}>🧘‍♂️</span>
            <strong style={{ fontSize: "0.92rem" }}>Tactical Decompression</strong>
          </div>
          <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: "1.5", margin: 0 }}>
            Practice 10 minutes of box-breathing (4s in, 4s hold, 4s out, 4s hold) post-duty to help disengage high-threat alertness.
          </p>
        </div>

        <div className="card card-enter">
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <span style={{ fontSize: "1.2rem" }}>🌙</span>
            <strong style={{ fontSize: "0.92rem" }}>Sleep Architecture</strong>
          </div>
          <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: "1.5", margin: 0 }}>
            Protect an uninterrupted 7-hour rest window post-watch and minimize blue light exposure during recovery periods.
          </p>
        </div>

        <div className="card card-enter">
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <span style={{ fontSize: "1.2rem" }}>👥</span>
            <strong style={{ fontSize: "0.92rem" }}>Peer & Welfare Support</strong>
          </div>
          <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: "1.5", margin: 0 }}>
            Conduct a confidential check-in with your unit welfare officer or squad buddy to discuss duty pacing.
          </p>
        </div>
      </div>
    </div>
  );
}
