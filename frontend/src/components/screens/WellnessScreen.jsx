import { useState } from "react";
import { ProgressBar } from "../common/ProgressBar";
import { InfoTooltip } from "../common/InfoTooltip";

const WELLNESS_QUESTIONS = [
  "I feel exhausted even after having time to rest.",
  "I find it difficult to switch off after duty.",
  "I feel irritable or emotionally strained.",
  "Stress makes it harder for me to concentrate.",
  "My responsibilities feel difficult to manage.",
  "I continue worrying about duty when I am off duty.",
];

const RESPONSE_OPTIONS = [
  { label: "Never", value: 0 },
  { label: "Some days", value: 1 },
  { label: "Often", value: 2 },
  { label: "Nearly every day", value: 3 },
];

export function WellnessScreen({ answers, setAnswers, onNext, onBack, loading, error }) {
  const [localError, setLocalError] = useState("");

  const answeredCount = answers.filter((a) => a !== null).length;
  const progressPercent = Math.round((answeredCount / WELLNESS_QUESTIONS.length) * 100);

  function handleSelect(questionIndex, value) {
    setAnswers((prev) => {
      const updated = [...prev];
      updated[questionIndex] = value;
      return updated;
    });
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
            <span className="eyebrow">STEP 02 · WELLBEING PULSE</span>
            <h1 className="page-title">Recent Wellbeing Check-in</h1>
          </div>
          <InfoTooltip
            title="About Wellbeing Pulse"
            text="These 6 brief check-in questions capture your emotional, cognitive, and fatigue levels over the past 2–4 weeks."
            techDetail="Scored 0–3 per question (Total 0–18). Scaled to a 0–100 baseline: Stress Score = (Sum / 18) × 100."
            label="Information about Wellbeing Pulse"
          />
        </div>
        <p className="page-subtitle">
          Over the past 2–4 weeks, how often have you experienced the following?
        </p>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
          <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)", fontWeight: 600 }}>
            {answeredCount} of {WELLNESS_QUESTIONS.length} answered
          </span>
          <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
            {progressPercent}% complete
          </span>
        </div>
        <ProgressBar percent={progressPercent} />
      </div>

      <div className="question-list">
        {WELLNESS_QUESTIONS.map((question, qIdx) => {
          const selectedValue = answers[qIdx];
          const questionId = `wellness-q-${qIdx}`;
          return (
            <fieldset
              key={qIdx}
              className="question-card"
              style={{ animationDelay: `${qIdx * 40}ms`, border: "1px solid var(--border-subtle)", margin: 0 }}
              aria-labelledby={questionId}
            >
              <legend className="sr-only">Question {qIdx + 1} of {WELLNESS_QUESTIONS.length}</legend>
              <div className="question-header">
                <div className="question-num" aria-hidden="true">{String(qIdx + 1).padStart(2, "0")}</div>
                <h2 id={questionId} className="question-text" style={{ fontSize: "1rem", margin: 0 }}>{question}</h2>
              </div>

              <div className="likert-grid" role="radiogroup" aria-labelledby={questionId}>
                {RESPONSE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`likert-btn ${selectedValue === opt.value ? "selected" : ""}`}
                    onClick={() => handleSelect(qIdx, opt.value)}
                    aria-pressed={selectedValue === opt.value}
                    aria-label={`Question ${qIdx + 1}: ${question} — ${opt.label}`}
                  >
                    {opt.label}
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

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "32px" }}>
        <button type="button" className="btn btn-ghost" onClick={onBack} disabled={loading}>
          ← Back
        </button>
        <button type="button" className="btn btn-primary" onClick={handleContinue} disabled={loading}>
          {loading ? "Recording..." : "Continue to Duty Context →"}
        </button>
      </div>
    </div>
  );
}
