import { useState } from "react";
import { ProgressBar } from "../common/ProgressBar";
import { InfoTooltip } from "../common/InfoTooltip";

const UNIFORMED_WELLNESS_QUESTIONS = [
  {
    domain: "Depression Dimension",
    tag: "Exhaustion",
    text: "Feeling physically or mentally drained even after rest periods?",
    subtext: "Evaluates persistent low energy and duty fatigue.",
  },
  {
    domain: "PTSD Dimension",
    tag: "Hypervigilance",
    text: "Difficulty switching off or stepping down your guard off-duty?",
    subtext: "Captures inability to decompress and lingering duty alert.",
  },
  {
    domain: "PTSD Dimension",
    tag: "Detachment",
    text: "Feeling emotionally disconnected from peers or family?",
    subtext: "Evaluates emotional detachment and withdrawal from support.",
  },
  {
    domain: "Depression Dimension",
    tag: "Focus & Fog",
    text: "Hard to concentrate or make routine duty decisions?",
    subtext: "Assesses cognitive fatigue and decision strain.",
  },
  {
    domain: "PTSD Dimension",
    tag: "Disturbed Sleep",
    text: "Duty memories or incident thoughts disturbing sleep?",
    subtext: "Screens for operational incident distress and sleep disruption.",
  },
  {
    domain: "Depression Dimension",
    tag: "Duty Burden",
    text: "Feeling overwhelmed while feeling pressured to push through?",
    subtext: "Captures accumulated duty burden and help-seeking hesitation.",
  },
];

const RESPONSE_OPTIONS = [
  { label: "Never", value: 0, sublabel: "No noticeable occurrence" },
  { label: "A few days", value: 1, sublabel: "Occasional" },
  { label: "Most days", value: 2, sublabel: "Recurring" },
  { label: "Nearly every day", value: 3, sublabel: "Persistent" },
];


const WELLNESS_PRESETS = [
  { label: "Low Baseline", answers: [0, 1, 0, 1, 0, 0] },
  { label: "Moderate Strain", answers: [2, 2, 1, 2, 1, 1] },
  { label: "High Strain", answers: [3, 3, 2, 3, 3, 2] },
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
      setLocalError("Please answer all 6 questions to continue.");
      return;
    }
    setLocalError("");
    onNext();
  }

  const activeError = localError || error;

  return (
    <div className="page-container narrow">
      <div style={{ marginBottom: "18px", animation: "slideUp 280ms cubic-bezier(0.2,0.8,0.2,1) both" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <span className="eyebrow">STEP 02 · WELLBEING</span>
            <h1 className="page-title">Wellbeing Check-In</h1>
          </div>
          <InfoTooltip
            title="Wellbeing Screening"
            text="Evaluates Depression (exhaustion, fog, burden) and PTSD (hypervigilance, detachment, intrusion) in operational contexts."
            techDetail="6 items (0–3). Stress Score = (Sum / 18) × 100."
            label="Information about Wellbeing Screening"
          />
        </div>
        <p className="page-subtitle">
          How often have you felt these over the past 2–4 weeks?
        </p>

        {/* Quick Demo Presets */}
        <div className="preset-container" style={{ margin: "10px 0 14px" }}>
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
            {answeredCount} / {UNIFORMED_WELLNESS_QUESTIONS.length} answered
          </span>
          <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
            {progressPercent}%
          </span>
        </div>
        <ProgressBar percent={progressPercent} />
      </div>

      <div className="question-list">
        {UNIFORMED_WELLNESS_QUESTIONS.map((qObj, qIdx) => {
          const isAnswered = answers[qIdx] !== null;
          return (
            <div
              key={qIdx}
              className={`question-card ${isAnswered ? "answered" : ""}`}
              style={{ animationDelay: `${qIdx * 40}ms` }}
            >
              <div className="question-header">
                <span className="question-num">0{qIdx + 1}</span>
                <span className="dimension-badge">{qObj.tag}</span>
              </div>

              <p className="question-text">{qObj.text}</p>

              <div
                className="options-grid"
                role="radiogroup"
                aria-label={`Rating for question ${qIdx + 1}: ${qObj.text}`}
              >
                {RESPONSE_OPTIONS.map((opt) => {
                  const isSelected = answers[qIdx] === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      role="radio"
                      className={`option-tile ${isSelected ? "selected" : ""}`}
                      onClick={() => handleSelect(qIdx, opt.value)}
                      disabled={loading}
                      aria-checked={isSelected}
                      aria-label={`${opt.label}: ${opt.sublabel}`}
                    >
                      <span className="option-indicator" aria-hidden="true" />
                      <span className="option-label">{opt.label}</span>
                      <span className="option-sublabel">{opt.sublabel}</span>
                    </button>
                  );
                })}
              </div>

            </div>
          );
        })}
      </div>

      {activeError && (
        <div className="error-alert" role="alert" style={{ marginTop: "16px" }}>
          {activeError}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "24px" }}>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={onBack}
          disabled={loading}
        >
          ← Back
        </button>
        <button
          id="wellness-submit-btn"
          type="button"
          className="btn btn-primary"
          onClick={handleContinue}
          disabled={loading}
        >
          {loading ? "Saving…" : "Continue →"}
        </button>
      </div>
    </div>
  );
}
