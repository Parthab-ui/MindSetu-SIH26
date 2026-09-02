import { useState } from "react";
import { ProgressBar } from "../common/ProgressBar";
import { InfoTooltip } from "../common/InfoTooltip";

export const UNIFORMED_WELLNESS_QUESTIONS = [
  {
    domain: "Operational Energy (Depression Dimension)",
    tag: "Depressive Fatigue",
    text: "Persistent physical or mental exhaustion that remains heavy even after designated rest blocks between duties.",
    subtext: "Evaluates persistent low energy, physical depletion, and chronic duty fatigue.",
  },
  {
    domain: "Tactical Hyperarousal (PTSD Dimension)",
    tag: "Hypervigilance",
    text: "Difficulty stepping down from a high-alert or 'on-guard' mindset when returning off-duty or attempting to rest.",
    subtext: "Captures inability to decompress, hyper-alertness, and lingering duty vigilance.",
  },
  {
    domain: "Emotional Regulation (PTSD / Trauma Response)",
    tag: "Emotional Numbing",
    text: "Feeling emotionally disconnected from peers or family, or experiencing sudden irritability under routine daily demands.",
    subtext: "Evaluates emotional detachment, withdrawal from support networks, and affective strain.",
  },
  {
    domain: "Cognitive Clarity (Depression Dimension)",
    tag: "Cognitive Fog",
    text: "Mental fatigue making it noticeably harder to maintain operational concentration, situational clarity, or make routine duty decisions.",
    subtext: "Assesses cognitive slowing, focus disruption, and decision fatigue in operational tasks.",
  },
  {
    domain: "Trauma Intrusion (PTSD Dimension)",
    tag: "Intrusive Recall",
    text: "Troubling recollections, vivid dreams, or disturbed sleep connected to stressful operational incidents or critical duty events.",
    subtext: "Screens for operational incident distress, intrusive memories, and nocturnal disruption.",
  },
  {
    domain: "Service Stigma & Burden (Depression / Help-Seeking)",
    tag: "Duty Burden",
    text: "Feeling overwhelmed by accumulated duty demands while feeling pressured to conceal personal strain to avoid appearing compromised.",
    subtext: "Captures service-related isolation, perceived burden, and help-seeking hesitation.",
  },
];

const RESPONSE_OPTIONS = [
  { label: "Never", value: 0, sublabel: "No impact" },
  { label: "Some days", value: 1, sublabel: "Mild / Occasional" },
  { label: "Often", value: 2, sublabel: "Moderate / Regular" },
  { label: "Nearly every day", value: 3, sublabel: "Elevated / Persistent" },
];

const WELLNESS_PRESETS = [
  { label: "Low Concern (Baseline)", answers: [0, 1, 0, 1, 0, 0] },
  { label: "Moderate Operational Strain", answers: [2, 2, 1, 2, 1, 1] },
  { label: "High Trauma & Depressive Strain", answers: [3, 3, 2, 3, 3, 2] },
];

export function WellnessScreen({ answers, setAnswers, onNext, onBack, loading, error }) {
  const [localError, setLocalError] = useState("");

  const answeredCount = answers.filter((a) => a !== null).length;
  const progressPercent = Math.round((answeredCount / UNIFORMED_WELLNESS_QUESTIONS.length) * 100);

  function handleSelect(questionIndex, value) {
    setAnswers((prev) => {
      const updated = [...prev];
      updated[questionIndex] = value;
      return updated;
    });
    setLocalError("");
  }

  function handleApplyPreset(presetAnswers) {
    setAnswers(presetAnswers);
    setLocalError("");
  }

  function handleContinue() {
    if (answers.some((a) => a === null)) {
      setLocalError("Please answer all 6 questions to complete your wellbeing pulse.");
      return;
    }
    setLocalError("");
    onNext();
  }

  const activeError = localError || error;

  return (
    <div className="page-container narrow">
      <div style={{ marginBottom: "20px", animation: "slideUp 280ms cubic-bezier(0.2,0.8,0.2,1) both" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <span className="eyebrow">STEP 02 · SPECIALIZED WELLBEING PULSE</span>
            <h1 className="page-title">Uniformed Personnel Mental Health Screening</h1>
          </div>
          <InfoTooltip
            title="Uniformed Personnel Assessment Matrix"
            text="These 6 clinically contextualized questions evaluate Depression (anhedonia, exhaustion, cognitive fog) and PTSD/Trauma (hypervigilance, emotional numbing, intrusive recall) in operational service contexts."
            techDetail="Scored 0–3 per question (Total 0–18). Deterministic formula: Stress Score = (Sum / 18) × 100. Subscale metrics for Depression and PTSD are computed transparently."
            label="Information about Uniformed Personnel Assessment"
          />
        </div>
        <p className="page-subtitle">
          Over the past 2–4 weeks, how often have you experienced the following operational and personal strain indicators?
        </p>

        {/* Quick Demo Presets */}
        <div className="preset-container" style={{ margin: "14px 0" }}>
          <span style={{ fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
            Demo Score Presets:
          </span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {WELLNESS_PRESETS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                className="preset-chip-btn"
                onClick={() => handleApplyPreset(p.answers)}
                disabled={loading}
                title={`Load preset: ${p.label}`}
              >
                ⚡ {p.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
          <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)", fontWeight: 600 }}>
            {answeredCount} of {UNIFORMED_WELLNESS_QUESTIONS.length} answered
          </span>
          <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
            {progressPercent}% complete
          </span>
        </div>
        <ProgressBar percent={progressPercent} />
      </div>

      <div className="question-list">
        {UNIFORMED_WELLNESS_QUESTIONS.map((qObj, qIdx) => {
          const selectedValue = answers[qIdx];
          const questionId = `wellness-q-${qIdx}`;
          return (
            <fieldset
              key={qIdx}
              className="question-card"
              style={{ animationDelay: `${qIdx * 40}ms`, border: "1px solid var(--border-subtle)", margin: 0 }}
              aria-labelledby={questionId}
            >
              <legend className="sr-only">Question {qIdx + 1} of {UNIFORMED_WELLNESS_QUESTIONS.length}</legend>
              <div className="question-header" style={{ display: "flex", flexDirection: "column", gap: "6px", alignItems: "flex-start" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div className="question-num" aria-hidden="true">{String(qIdx + 1).padStart(2, "0")}</div>
                  <span className="dimension-badge">{qObj.tag}</span>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 500 }}>{qObj.domain}</span>
                </div>
                <h2 id={questionId} className="question-text" style={{ fontSize: "1rem", margin: "4px 0 2px" }}>
                  {qObj.text}
                </h2>
                <p style={{ fontSize: "0.80rem", color: "var(--text-secondary)", margin: 0 }}>
                  {qObj.subtext}
                </p>
              </div>

              <div className="likert-grid" role="radiogroup" aria-labelledby={questionId} style={{ marginTop: "12px" }}>
                {RESPONSE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`likert-btn ${selectedValue === opt.value ? "selected" : ""}`}
                    onClick={() => handleSelect(qIdx, opt.value)}
                    aria-pressed={selectedValue === opt.value}
                    aria-label={`Question ${qIdx + 1}: ${qObj.text} — ${opt.label}`}
                  >
                    <span style={{ fontWeight: 600 }}>{opt.label}</span>
                    <span style={{ fontSize: "0.72rem", opacity: 0.8, display: "block" }}>{opt.sublabel}</span>
                  </button>
                ))}
              </div>
            </fieldset>
          );
        })}
      </div>

      {activeError && (
        <div className="inline-error" style={{ marginTop: "20px" }} role="alert">
          {activeError}
        </div>
      )}

      <div className="screen-actions-wrap">
        <button type="button" className="btn btn-ghost" onClick={onBack} disabled={loading}>
          ← Back
        </button>
        <button type="button" className="btn btn-primary" onClick={handleContinue} disabled={loading}>
          {loading ? "Recording..." : "Continue to Duty & Recovery Context →"}
        </button>
      </div>
    </div>
  );
}
