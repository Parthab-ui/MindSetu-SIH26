import { useState } from "react";
import { Badge } from "../common/Badge";
import { InfoTooltip } from "../common/InfoTooltip";

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
  workload = {},
  onNavigateToChat,
  onNavigateToMood,
  onOpenResearchModal,
}) {
  const level = String(analysis?.risk_level || "unknown").toLowerCase();

  // Compute subscale clinical indicators if answers exist
  const validAnswers = Array.isArray(answers) && answers.length === 6 && answers.every((a) => a !== null);
  
  // Depression Subscale: Q1 (Exhaustion), Q4 (Cognitive Fog), Q6 (Duty Burden)
  const depressionScore = validAnswers
    ? Math.round(((answers[0] + answers[3] + answers[5]) / 9) * 100)
    : analysis?.wellness_score !== undefined
    ? Math.round(analysis.wellness_score * 0.95)
    : null;

  // PTSD / Trauma Subscale: Q2 (Hypervigilance), Q3 (Detachment/Irritability), Q5 (Intrusive Recall)
  const traumaScore = validAnswers
    ? Math.round(((answers[1] + answers[2] + answers[4]) / 9) * 100)
    : analysis?.wellness_score !== undefined
    ? Math.round(analysis.wellness_score * 1.05 > 100 ? 100 : analysis.wellness_score * 1.05)
    : null;

  const depressionLevel =
    depressionScore === null ? "low" : depressionScore >= 70 ? "high" : depressionScore >= 40 ? "moderate" : "low";

  const traumaLevel =
    traumaScore === null ? "low" : traumaScore >= 70 ? "high" : traumaScore >= 40 ? "moderate" : "low";

  // Plain language interpretations
  const heroSubtitle =
    level === "high"
      ? "Your check-in suggests significant cumulative operational strain and fatigue. Prioritising recovery time and connecting with a unit welfare officer or support specialist is strongly recommended."
      : level === "moderate"
      ? "You are experiencing early indicators of operational fatigue or stress buildup. A proactive recovery check-in and duty pacing adjustments will help prevent escalation."
      : level === "low"
      ? "Your current check-in indicators reflect steady operational resilience and manageable strain. Maintain healthy rest rhythms and unit peer support."
      : "Complete the check-in to generate your personalised wellbeing summary.";

  const whatWeAreSeeing =
    level === "high"
      ? "Both duty intensity and reported distress signals (fatigue, hypervigilance, or sleep disruption) are elevated, indicating urgent need for recovery buffers."
      : level === "moderate"
      ? "Duty demands or stress indicators are accumulating, though core functional capacity remains steady."
      : "Current duty demands and mental health responses are within a balanced, sustainable range.";

  const whatYouCanDo =
    analysis?.recommendation ||
    (level === "high"
      ? "Protect at least 7–8 hours of recovery sleep, practice tactical decompression, and consider a confidential check-in with a welfare specialist."
      : level === "moderate"
      ? "Schedule protected rest blocks after high-tempo shifts, stay hydrated, and discuss duty pacing with your squad lead."
      : "Continue your current rest rhythms and peer check-in habits.");

  const whenToCheckAgain =
    level === "high"
      ? "Check in again within 24–48 hours, or sooner if operational pressures escalate."
      : level === "moderate"
      ? "Check in again in 3–5 days to monitor your recovery trajectory."
      : "Check in again in 1–2 weeks, or after any major deployment or shift rotation.";

  const wellnessVal = analysis?.wellness_score ?? null;
  const workloadVal = analysis?.workload_score ?? null;
  const combinedVal = analysis?.combined_score ?? null;

  const wellnessLevel =
    wellnessVal === null ? "low" : wellnessVal >= 80 ? "high" : wellnessVal >= 50 ? "moderate" : "low";

  const workloadLevel =
    workloadVal === null ? "low" : workloadVal >= 85 ? "high" : workloadVal >= 60 ? "moderate" : "low";

  return (
    <div className="page-container">
      {/* Page Heading */}
      <div style={{ marginBottom: "28px", animation: "slideUp 280ms cubic-bezier(0.2,0.8,0.2,1) both" }}>
        <span className="eyebrow">STEP 04 · CONFIDENTIAL WELFARE SUMMARY</span>
        <h1 className="page-title">Operational Wellbeing & Support Summary</h1>
        <p className="page-subtitle">
          A confidential multi-dimensional assessment evaluating Depression indicators, PTSD/Trauma strain, and Duty Workload.
        </p>
      </div>

      {/* Layer 1 Hero Takeaway Card */}
      <div className={`triage-hero-card ${level}`}>
        <div className="triage-header-row">
          <div className="triage-title-group">
            <span className="eyebrow" style={{ color: "var(--text-secondary)" }}>
              CURRENT WELFARE SIGNAL
            </span>
            <h2>{level.charAt(0).toUpperCase() + level.slice(1)} Priority Welfare Signal</h2>
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
            Record Daily Mood & Trends
          </button>
          <button
            className="btn btn-research-trigger"
            onClick={onOpenResearchModal}
            title="Open Explainable ML Research Lab (LightGBM + TreeSHAP)"
          >
            <span className="research-btn-primary">Explore How AI Reached This Result</span>
            <span className="research-btn-secondary">Explainable ML Research Lab 🔬</span>
          </button>
        </div>
      </div>

      {/* Flagship Section: Clinical & Operational Symptom Breakdown */}
      <div style={{ marginTop: "32px", marginBottom: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <div>
            <span className="eyebrow">DIAGNOSTIC CONTEXT · CLINICAL SUBSCALE INDICATORS</span>
            <h2 style={{ fontSize: "1.35rem", fontWeight: 800, margin: "4px 0 6px" }}>
              Depression & PTSD/Trauma Dimensional Breakdown
            </h2>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", margin: 0 }}>
              Evaluates targeted psychological symptom clusters to provide granular, non-stigmatizing insights.
            </p>
          </div>
          <InfoTooltip
            title="Clinical Subscale Mapping"
            text="The 6 screening items map directly into Depression (exhaustion, cognitive fog, duty burden) and PTSD/Trauma (hypervigilance, detachment, intrusive recall) dimensions for personnel triage."
            techDetail="Depression Subscale: (Q1 + Q4 + Q6)/9 × 100. PTSD Subscale: (Q2 + Q3 + Q5)/9 × 100. Operational Stress: Computed from duty hours, night shifts, and sleep deficit."
            label="Learn about clinical subscales"
          />
        </div>
      </div>

      <div className="metrics-grid">
        {/* Metric 1: Depression Symptom Indicator */}
        <div className="metric-card">
          <div className="metric-card-top">
            <div className="metric-card-title-wrap">
              <span className="metric-card-label">Depression Indicators</span>
              <span className="metric-card-badge" style={{ background: "rgba(59, 130, 246, 0.15)", color: "var(--accent-blue)" }}>
                Affective & Cognitive
              </span>
            </div>
            <InfoTooltip
              title="Depression Dimension"
              text="Assesses persistent exhaustion, cognitive slowing in operational tasks, and feelings of duty burden or isolation."
              techDetail="Derived from items Q1 (Operational Exhaustion), Q4 (Cognitive Focus/Decision Fatigue), and Q6 (Duty Burden / Help-Seeking Stigma)."
              label="Information about Depression Indicators"
            />
          </div>

          <div className="metric-value-row">
            <span className="metric-card-value">{depressionScore !== null ? depressionScore : "—"}</span>
            <span className="metric-value-scale">/ 100</span>
          </div>

          <p className="metric-interpretation">
            {depressionScore === null
              ? "Pending check-in"
              : depressionScore >= 70
              ? "Elevated depressive fatigue and cognitive load. Structured rest and welfare consultation recommended."
              : depressionScore >= 40
              ? "Mild to moderate energy drain; manageable with active pacing and sleep recovery."
              : "Low depressive indicator; steady cognitive clarity and emotional motivation."}
          </p>

          {depressionScore !== null && <ScoreBar value={depressionScore} level={depressionLevel} label="Depression Indicator" />}

          <details className="score-disclosure">
            <summary>Clinical Subscale Details</summary>
            <div className="score-disclosure-content">
              <p>Key indicators measured:</p>
              <ul>
                <li>Operational Exhaustion & Energy Depletion</li>
                <li>Decision Fatigue & Mental Focus</li>
                <li>Duty Isolation & Help-Seeking Barrier</li>
              </ul>
            </div>
          </details>
        </div>

        {/* Metric 2: PTSD / Trauma Symptom Indicator */}
        <div className="metric-card">
          <div className="metric-card-top">
            <div className="metric-card-title-wrap">
              <span className="metric-card-label">PTSD & Trauma Indicators</span>
              <span className="metric-card-badge" style={{ background: "rgba(245, 158, 11, 0.15)", color: "var(--warning)" }}>
                Arousal & Intrusion
              </span>
            </div>
            <InfoTooltip
              title="PTSD & Trauma Dimension"
              text="Assesses tactical hypervigilance (difficulty dropping guard off-duty), emotional detachment, and intrusive memories or sleep disturbance from critical incidents."
              techDetail="Derived from items Q2 (Tactical Hypervigilance), Q3 (Emotional Detachment/Irritability), and Q5 (Intrusive Recall & Night Disruption)."
              label="Information about PTSD & Trauma Indicators"
            />
          </div>

          <div className="metric-value-row">
            <span className="metric-card-value">{traumaScore !== null ? traumaScore : "—"}</span>
            <span className="metric-value-scale">/ 100</span>
          </div>

          <p className="metric-interpretation">
            {traumaScore === null
              ? "Pending check-in"
              : traumaScore >= 70
              ? "Elevated hyperarousal and intrusive recall signals. Trauma-informed welfare support advised."
              : traumaScore >= 40
              ? "Moderate tactical alert retention; grounding and off-duty decompression recommended."
              : "Low trauma strain; effective transition between duty alert and off-duty rest."}
          </p>

          {traumaScore !== null && <ScoreBar value={traumaScore} level={traumaLevel} label="PTSD & Trauma Indicator" />}

          <details className="score-disclosure">
            <summary>Clinical Subscale Details</summary>
            <div className="score-disclosure-content">
              <p>Key indicators measured:</p>
              <ul>
                <li>Tactical Hypervigilance & Decompression</li>
                <li>Emotional Numbing & Irritability</li>
                <li>Intrusive Duty Memories & Night Disruption</li>
              </ul>
            </div>
          </details>
        </div>

        {/* Metric 3: Duty & Workload Index */}
        <div className="metric-card">
          <div className="metric-card-top">
            <div className="metric-card-title-wrap">
              <span className="metric-card-label">Operational Workload Index</span>
              <span className="metric-card-badge" style={{ background: "rgba(16, 185, 129, 0.15)", color: "var(--success)" }}>
                Duty Context
              </span>
            </div>
            <InfoTooltip
              title="Duty Workload Index"
              text="Measures cumulative operational pressure from shift length, sleep recovery deficit, night shifts, and leave intervals."
              techDetail="Weighted formula: Shift hours (25%) + Night duties (15%) + Sleep deficit (15%) + Leave gap (10%) + Intensity (20%) + High-risk duty (10%) + Shift changes (5%)."
              label="Information about Duty Workload"
            />
          </div>

          <div className="metric-value-row">
            <span className="metric-card-value">{workloadVal !== null ? Math.round(workloadVal) : "—"}</span>
            <span className="metric-value-scale">/ 100</span>
          </div>

          <p className="metric-interpretation">
            {workloadVal === null
              ? "Pending check-in"
              : workloadVal >= 85
              ? "High operational demand with severe sleep deficit. Immediate rest buffer needed."
              : workloadVal >= 60
              ? "Moderate operational tempo; protect uninterrupted sleep hours."
              : "Sustainable duty schedule with adequate recovery time."}
          </p>

          {analysis && <ScoreBar value={workloadVal} level={workloadLevel} label="Operational Workload score" />}

          <details className="score-disclosure">
            <summary>Operational Factors</summary>
            <div className="score-disclosure-content">
              <p>Combines 7 operational parameters:</p>
              <ul>
                <li>Duty shift duration & night duties</li>
                <li>Rest & sleep hours deficit (below 8 hrs)</li>
                <li>Days since dedicated leave & tempo rating</li>
                <li>High-risk / emergency assignment status</li>
              </ul>
            </div>
          </details>
        </div>
      </div>

      {/* Multi-Dimensional Tailored Action Pathways */}
      <div style={{ marginTop: "32px", marginBottom: "16px" }}>
        <span className="eyebrow">ACTIONABLE WELFARE SUPPORT</span>
        <h2 style={{ fontSize: "1.35rem", fontWeight: 800, margin: "4px 0 6px" }}>
          Tailored Operational Recovery Pathways
        </h2>
      </div>

      <div className="context-grid">
        {/* Pathway 1: Tactical Decompression (Trauma/PTSD) */}
        <div className="card card-enter">
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <span style={{ fontSize: "1.3rem" }}>🧘‍♂️</span>
            <span className="eyebrow" style={{ margin: 0, color: "var(--accent)" }}>TACTICAL DECOMPRESSION</span>
          </div>
          <h3 style={{ fontSize: "1.05rem", fontWeight: 700, margin: "4px 0 8px" }}>
            Post-Duty Down-Regulation & Grounding
          </h3>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: "1.6", margin: 0 }}>
            {traumaScore && traumaScore >= 50
              ? "Incorporate 10 minutes of box-breathing (4s inhale, 4s hold, 4s exhale, 4s hold) immediately after shift handover to signal the nervous system to disengage from high-threat vigilance."
              : "Maintain clear transitional routines between duty watch and personal rest to sustain long-term operational resilience."}
          </p>
        </div>

        {/* Pathway 2: Sleep & Energy Architecture (Depression) */}
        <div className="card card-enter" style={{ animationDelay: "60ms" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <span style={{ fontSize: "1.3rem" }}>🌙</span>
            <span className="eyebrow" style={{ margin: 0, color: "var(--primary)" }}>REST & SLEEP ARCHITECTURE</span>
          </div>
          <h3 style={{ fontSize: "1.05rem", fontWeight: 700, margin: "4px 0 8px" }}>
            Restorative Sleep Buffering
          </h3>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: "1.6", margin: 0 }}>
            {depressionScore && depressionScore >= 50
              ? "Prioritise dark, quiet sleep blocks with minimal screen exposure before bed. Split rest into anchor sleep periods if continuous 8 hours is constrained by shift rotations."
              : "Keep consistent sleep and hydration habits, particularly following overnight watch rotations."}
          </p>
        </div>

        {/* Pathway 3: Peer & Welfare Connection */}
        <div className="card card-enter" style={{ animationDelay: "120ms" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <span style={{ fontSize: "1.3rem" }}>🤝</span>
            <span className="eyebrow" style={{ margin: 0, color: "var(--success)" }}>PEER & WELFARE CHANNEL</span>
          </div>
          <h3 style={{ fontSize: "1.05rem", fontWeight: 700, margin: "4px 0 8px" }}>
            Confidential Human Support
          </h3>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: "1.6", margin: 0 }}>
            {level === "high"
              ? "Connecting with a trusted buddy, unit medical officer, or welfare counselor provides an objective, confidential sounding board. Early check-ins protect your career longevity and mission readiness."
              : "Check in with your squad mates regularly. Mutual debriefing after demanding shifts strengthens unit cohesion."}
          </p>
        </div>
      </div>

      {/* Verified Crisis & Confidential Escalation Banner */}
      <div className="card card-elevated" style={{ marginTop: "32px", border: "1px solid var(--border-medium)", background: "var(--bg-surface-card)" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "1.6rem" }}>🛡️</span>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: "1.05rem", fontWeight: 800, margin: "0 0 4px" }}>
              Verified Confidential Welfare & Emergency Support Channels
            </h3>
            <p style={{ fontSize: "0.84rem", color: "var(--text-secondary)", margin: "0 0 12px", lineHeight: "1.5" }}>
              If you or a colleague are experiencing severe distress, overwhelming thoughts, or critical duty strain, free and confidential support is available 24/7.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              <div className="helpline-badge">
                <strong>Tele-MANAS (Govt of India):</strong> <span>14416</span> or <span>1800-891-4416</span> (24/7 Toll-free)
              </div>
              <div className="helpline-badge">
                <strong>Vandrevala Foundation:</strong> <span>9999 666 555</span> (24/7 Confidential Crisis Support)
              </div>
              <div className="helpline-badge">
                <strong>Unit Support:</strong> Contact Unit Medical Officer / Designated Welfare Representative
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
