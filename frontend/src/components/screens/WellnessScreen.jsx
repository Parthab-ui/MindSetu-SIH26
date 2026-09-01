import { useState } from "react";
import { ProgressBar } from "../common/ProgressBar";

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
    const updated = [...answers];
    updated[questionIndex] = value;
    setAnswers(updated);
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
        <span className="eyebrow">STEP 02 · WELLBEING PULSE</span>
        <h1 className="page-title">Recent Wellbeing Check-in</h1>
        <p className="page-subtitle">
          Over the past 2–4 weeks, how often have you experienced the following?
        </p>

        <ProgressBar percent={progressPercent} />
      </div>

      <div className="question-list">
        {WELLNESS_QUESTIONS.map((question, qIdx) => {
          const selectedValue = answers[qIdx];
          return (
            <div
              key={qIdx}
              className="question-card"
              style={{ animationDelay: `${qIdx * 40}ms` }}
            >
              <div className="question-header">
                <div className="question-num">{String(qIdx + 1).padStart(2, "0")}</div>
                <h3 className="question-text">{question}</h3>
              </div>

              <div className="likert-grid">
                {RESPONSE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`likert-btn ${selectedValue === opt.value ? "selected" : ""}`}
                    onClick={() => handleSelect(qIdx, opt.value)}
                    aria-pressed={selectedValue === opt.value}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
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
