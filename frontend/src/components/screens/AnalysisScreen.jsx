import { useState } from "react";
import { Badge } from "../common/Badge";
import { InfoTooltip } from "../common/InfoTooltip";

function ScoreBar({ value, level }) {
  const pct = Math.min(Math.max(Number(value) || 0, 0), 100);
  const cls = level === "high" ? "high" : level === "moderate" ? "mod" : "low";
  return (
    <div className="score-bar-track" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <div
        className={`score-bar-fill ${cls}`}
        style={{ width: `${pct}%`, transition: "width 700ms cubic-bezier(0.2,0.8,0.2,1)" }}
      />
    </div>
  );
}

export function AnalysisScreen({ analysis, onNavigateToChat, onNavigateToMood, onOpenResearchModal }) {
  const level = String(analysis?.risk_level || "unknown").toLowerCase();

  // Layer 1 — Plain language interpretation
  const heroSubtitle =
    level === "high"
      ? "Your check-in suggests notable cumulative pressure and fatigue. Prioritising recovery time and connecting with a welfare officer or support specialist is strongly recommended."
      : level === "moderate"
      ? "You may be experiencing some signs of cumulative strain or fatigue. A brief recovery check-in and reviewing your workload pacing may help."
      : level === "low"
      ? "Your current check-in indicators reflect steady balance and manageable operational strain. Keep maintaining healthy rest and pacing."
      : "Complete the check-in to generate your personalised wellbeing summary.";

  const whatWeAreSeeing =
    level === "high"
      ? "Both duty intensity and reported stress indicators are elevated, which can lead to rapid burnout if unaddressed."
      : level === "moderate"
      ? "Operational demands or fatigue are beginning to build up, though routine functioning remains intact."
      : "Current duty demands and wellbeing responses are within a healthy, sustainable range.";

  const whatYouCanDo =
    analysis?.recommendation ||
    (level === "high"
      ? "Protect at least 7–8 hours for sleep, take short mental pauses between shifts, and consider speaking with a unit welfare officer."
      : level === "moderate"
      ? "Schedule protected rest after demanding shifts, maintain hydration, and talk through workload pacing with your team."
      : "Continue your current rest habits and pacing routines.");

  const whenToCheckAgain =
    level === "high"
      ? "Check in again within 24–48 hours, or sooner if operational pressures increase."
      : level === "moderate"
      ? "Check in again in 3–5 days to monitor your recovery trend."
      : "Check in again in 1–2 weeks, or after any major shift or duty change.";

  // Score levels for bars & contextual labels
  const wellnessVal = analysis?.wellness_score ?? null;
  const workloadVal = analysis?.workload_score ?? null;
  const combinedVal = analysis?.combined_score ?? null;

  const wellnessLevel =
    wellnessVal === null
      ? "low"
      : wellnessVal >= 80
      ? "high"
      : wellnessVal >= 50
      ? "moderate"
      : "low";

  const workloadLevel =
    workloadVal === null
      ? "low"
      : workloadVal >= 85
      ? "high"
      : workloadVal >= 60
      ? "moderate"
      : "low";

  const wellnessInterpretation =
    wellnessVal === null
      ? "Pending check-in"
      : wellnessVal >= 80
      ? "Elevated fatigue or strain reported across multiple areas."
      : wellnessVal >= 50
      ? "Mild to moderate strain; manageable with regular rest."
      : "Steady emotional balance and low reported distress.";

  const workloadInterpretation =
    workloadVal === null
      ? "Pending check-in"
      : workloadVal >= 85
      ? "Heavy operational demand with limited rest buffers."
      : workloadVal >= 60
      ? "Moderate duty load; ensure dedicated sleep hours."
      : "Balanced schedule with adequate recovery time.";

  const combinedInterpretation =
    combinedVal === null
      ? "Pending check-in"
      : level === "high"
      ? "Higher support priority — active recovery and human check-in recommended."
      : level === "moderate"
      ? "Moderate support priority — pacing and rest adjustments advised."
      : "Low support priority — maintain current healthy rhythms.";

  return (
    <div className="page-container">
      {/* Page Heading */}
      <div style={{ marginBottom: "28px", animation: "slideUp 280ms cubic-bezier(0.2,0.8,0.2,1) both" }}>
        <span className="eyebrow">STEP 04 · CONFIDENTIAL WELFARE SUMMARY</span>
        <h1 className="page-title">Your Wellbeing & Support Summary</h1>
        <p className="page-subtitle">
          A clear, confidential summary of your recent check-in, designed to help guide practical recovery and workload pacing.
        </p>
      </div>

      {/* Layer 1 Hero Takeaway Card */}
      <div className={`triage-hero-card ${level}`}>
        <div className="triage-header-row">
          <div className="triage-title-group">
            <span className="eyebrow" style={{ color: "var(--text-secondary)" }}>
              CURRENT WELFARE SIGNAL
            </span>
            <h2>{level.charAt(0).toUpperCase() + level.slice(1)} Support Signal</h2>
          </div>
          <Badge level={level}>{level.toUpperCase()} PRIORITY</Badge>
        </div>

        <p className="triage-meaning-text">{heroSubtitle}</p>

        {/* Structured 3-Part Takeaway */}
        <div className="triage-breakdown-grid">
          <div className="triage-breakdown-box">
            <span className="breakdown-label">WHAT WE'RE SEEING</span>
            <p className="breakdown-text">{whatWeAreSeeing}</p>
          </div>
          <div className="triage-breakdown-box">
            <span className="breakdown-label">WHAT YOU CAN DO NOW</span>
            <p className="breakdown-text">{whatYouCanDo}</p>
          </div>
          <div className="triage-breakdown-box">
            <span className="breakdown-label">WHEN TO CHECK AGAIN</span>
            <p className="breakdown-text">{whenToCheckAgain}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="triage-actions-wrap">
          <button id="analysis-chat-btn" className="btn btn-primary" onClick={onNavigateToChat}>
            Talk with MindSetu AI Companion →
          </button>
          <button className="btn btn-secondary" onClick={onNavigateToMood}>
            Record Daily Mood
          </button>
          <button
            className="btn btn-research-trigger"
            onClick={onOpenResearchModal}
            title="Open Explainable ML Research Lab (LightGBM + SHAP)"
          >
            <span className="research-btn-primary">Explore How AI Reached This Result</span>
            <span className="research-btn-secondary">Explainable ML Research Lab 🔬</span>
          </button>
        </div>
      </div>

      {/* Metrics Grid with 2-Layer Information Model */}
      <div className="metrics-grid">
        {/* Metric 1: Wellbeing Pulse */}
        <div className="metric-card">
          <div className="metric-card-top">
            <div className="metric-card-title-wrap">
              <span className="metric-card-label">Wellbeing Pulse</span>
              <span className="metric-card-badge">Self-Report</span>
            </div>
            <InfoTooltip
              title="Wellbeing Pulse Score"
              text="Reflects your recent energy, concentration, and emotional strain over the past 2–4 weeks. A lower score indicates greater stability."
              techDetail="Derived from 6 wellbeing questions (each scored 0–3), scaled from 0 to 100: Score = (Sum / 18) × 100."
              label="Information about Wellbeing Pulse"
            />
          </div>

          <div className="metric-value-row">
            <span className="metric-card-value">{wellnessVal !== null ? Math.round(wellnessVal) : "—"}</span>
            <span className="metric-value-scale">/ 100</span>
          </div>

          <p className="metric-interpretation">{wellnessInterpretation}</p>

          {analysis && <ScoreBar value={wellnessVal} level={wellnessLevel} />}

          <details className="score-disclosure">
            <summary>How this score is calculated</summary>
            <div className="score-disclosure-content">
              <p>Based on your 6 answers regarding fatigue, duty focus, irritability, and recovery:</p>
              <ul>
                <li>0–49: Steady balance / low strain</li>
                <li>50–79: Moderate strain</li>
                <li>80–100: High strain / elevated priority</li>
              </ul>
            </div>
          </details>
        </div>

        {/* Metric 2: Duty & Workload */}
        <div className="metric-card">
          <div className="metric-card-top">
            <div className="metric-card-title-wrap">
              <span className="metric-card-label">Duty & Workload</span>
              <span className="metric-card-badge">Operational</span>
            </div>
            <InfoTooltip
              title="Duty & Workload Index"
              text="Measures cumulative operational pressure from shift length, sleep recovery, night shifts, and leave intervals."
              techDetail="Weighted formula: Shift hours (max 25pts) + Night shifts (max 15pts) + Sleep deficit (max 15pts) + Days since leave (max 10pts) + Intensity rating (max 20pts) + High-pressure assignment (10pts) + Shift changes (max 5pts)."
              label="Information about Duty & Workload"
            />
          </div>

          <div className="metric-value-row">
            <span className="metric-card-value">{workloadVal !== null ? Math.round(workloadVal) : "—"}</span>
            <span className="metric-value-scale">/ 100</span>
          </div>

          <p className="metric-interpretation">{workloadInterpretation}</p>

          {analysis && <ScoreBar value={workloadVal} level={workloadLevel} />}

          <details className="score-disclosure">
            <summary>How this score is calculated</summary>
            <div className="score-disclosure-content">
              <p>Combines 7 operational parameters:</p>
              <ul>
                <li>Duty shift hours & night shifts</li>
                <li>Rest hours deficit (below 8 hrs)</li>
                <li>Days since last leave & intensity level</li>
                <li>High-pressure emergency tasks</li>
              </ul>
            </div>
          </details>
        </div>

        {/* Metric 3: Overall Support Score */}
        <div className="metric-card">
          <div className="metric-card-top">
            <div className="metric-card-title-wrap">
              <span className="metric-card-label">Overall Support Score</span>
              <span className="metric-card-badge">Composite</span>
            </div>
            <InfoTooltip
              title="Combined Support Score"
              text="Combines your personal wellbeing check-in with duty workload context to determine the overall level of support recommended."
              techDetail="Formula: (55% × Wellbeing Score) + (45% × Workload Score). Priority Bands: High ≥ 70 (or individual threshold), Moderate ≥ 45, Low < 45. Technical name: Combined Triage Score."
              label="Information about Overall Support Score"
            />
          </div>

          <div className="metric-value-row">
            <span className="metric-card-value">{combinedVal !== null ? Math.round(combinedVal) : "—"}</span>
            <span className="metric-value-scale">/ 100</span>
          </div>

          <p className="metric-interpretation">{combinedInterpretation}</p>

          {analysis && <ScoreBar value={combinedVal} level={level} />}

          <details className="score-disclosure">
            <summary>How this score is calculated</summary>
            <div className="score-disclosure-content">
              <p>
                <strong>55% Wellbeing Pulse + 45% Duty Workload</strong>
              </p>
              <p style={{ marginTop: "4px", fontSize: "0.80rem", color: "var(--text-muted)" }}>
                Technical label: Combined Triage Score. Used for welfare decision-support, never for disciplinary action.
              </p>
            </div>
          </details>
        </div>
      </div>

      {/* Reassuring Context Cards */}
      <div className="context-grid">
        <div className="card card-enter">
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <span style={{ fontSize: "1.2rem" }}>🛡</span>
            <span className="eyebrow" style={{ margin: 0 }}>SUPPORTIVE DECISION-AID</span>
          </div>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "4px 0 8px" }}>
            Human-Centred Welfare Support
          </h3>
          <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", lineHeight: "1.6", margin: 0 }}>
            MindSetu provides supportive guidance for proactive recovery. It does not diagnose medical conditions,
            determine fitness for duty, or execute automated decisions. Any formal support plan is always decided
            collaboratively with human welfare professionals.
          </p>
        </div>

        <div className="card card-enter" style={{ animationDelay: "60ms" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <span style={{ fontSize: "1.2rem" }}>🔒</span>
            <span className="eyebrow" style={{ margin: 0 }}>CONFIDENTIALITY GUARANTEE</span>
          </div>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "4px 0 8px" }}>
            Protected & Anonymous Session
          </h3>
          <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", lineHeight: "1.6", margin: 0 }}>
            Your responses are processed under a temporary session token. No personnel identifiers, biometric files, or
            evaluative ratings are shared with external records or command logs.
          </p>
        </div>
      </div>
    </div>
  );
}
