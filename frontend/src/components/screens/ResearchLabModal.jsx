import { useState, useRef, useEffect } from "react";
import { SliderField } from "../common/SliderField";
import { InfoTooltip } from "../common/InfoTooltip";

/* Step progress pips at the top of the modal */
function StepPips({ current, total }) {
  return (
    <div
      className="ml-step-pips"
      role="progressbar"
      aria-label={`Research Lab Step ${current} of ${total}`}
      aria-valuenow={current}
      aria-valuemin={1}
      aria-valuemax={total}
    >
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`ml-pip ${i + 1 < current ? "done" : i + 1 === current ? "current" : ""}`}
        />
      ))}
      <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginLeft: "6px", fontWeight: 600 }}>
        Step {current} of {total}
      </span>
    </div>
  );
}

const RESEARCH_PRESETS = [
  {
    label: "Special Forces Active Combat",
    desc: "Elevated PCL-M + Combat Engagement",
    data: {
      Q29_Total: 58,
      Q12_weapon: 1,
      Q13_feltdie: 1,
      Q23a_cutdowntime: 1,
      Q23b_Accomplished_less: 1,
      Q23c_limited_work: 1,
      Q23d_difficulty_performing: 1,
    },
  },
  {
    label: "Regular Force Logistics & Base",
    desc: "Low PCL-M + No Direct Threat",
    data: {
      Q29_Total: 20,
      Q12_weapon: 0,
      Q13_feltdie: 0,
      Q23a_cutdowntime: 0,
      Q23b_Accomplished_less: 0,
      Q23c_limited_work: 0,
      Q23d_difficulty_performing: 0,
    },
  },
  {
    label: "Acute Role Strain & Recovery",
    desc: "Moderate PCL-M + High Work Fatigue",
    data: {
      Q29_Total: 42,
      Q12_weapon: 0,
      Q13_feltdie: 1,
      Q23a_cutdowntime: 1,
      Q23b_Accomplished_less: 1,
      Q23c_limited_work: 0,
      Q23d_difficulty_performing: 1,
    },
  },
];

export function ResearchLabModal({ isOpen, onClose, onRunML, mlInputs, setMlInputs, mlResult, loading }) {
  const [step, setStep] = useState(1);
  const modalRef = useRef(null);
  const closeBtnRef = useRef(null);
  const openerRef = useRef(null);

  // Focus trap, Escape key handling, and focus restoration
  useEffect(() => {
    if (!isOpen) return;

    openerRef.current = document.activeElement;
    document.body.style.overflow = "hidden";

    const timer = setTimeout(() => {
      closeBtnRef.current?.focus();
    }, 50);

    function handleKeyDown(e) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === "Tab" && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const firstElement = focusable[0];
        const lastElement = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
      if (openerRef.current && typeof openerRef.current.focus === "function") {
        openerRef.current.focus();
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  function updateInput(key, val) {
    setMlInputs((prev) => ({ ...prev, [key]: val }));
  }

  function handleApplyPreset(preset) {
    setMlInputs(preset.data);
    setStep(4);
    setTimeout(() => {
      onRunML();
    }, 50);
  }

  function handleRunAssessment() {
    setStep(4);
    onRunML();
  }

  function handleReset() {
    setStep(1);
    setMlInputs({
      Q29_Total: 17,
      Q12_weapon: 0,
      Q13_feltdie: 0,
      Q23a_cutdowntime: 0,
      Q23b_Accomplished_less: 0,
      Q23c_limited_work: 0,
      Q23d_difficulty_performing: 0,
    });
  }

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="modal-content" ref={modalRef} onClick={(e) => e.stopPropagation()}>
        {/* Modal Top Bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <span className="eyebrow" style={{ color: "var(--accent)", margin: 0 }}>
                EXPLAINABLE AI RESEARCH LAB
              </span>
              <span className="badge-subtle">LightGBM + TreeSHAP</span>
            </div>
            <h2 id="modal-title" style={{ fontSize: "1.35rem", fontWeight: 800, margin: "4px 0 2px" }}>
              Explainable ML Decision Support Layer
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", margin: 0 }}>
              Investigate how supervised TreeSHAP factor attributions influence the research model's welfare signal.
            </p>
          </div>
          <button
            ref={closeBtnRef}
            className="btn-icon"
            onClick={onClose}
            aria-label="Close Research Lab modal"
            title="Close modal (Escape)"
          >
            ✕
          </button>
        </div>

        {/* Research Dataset Attribution Citation */}
        <div style={{ padding: "10px 14px", background: "var(--bg-surface-elevated)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)", marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "6px" }}>
            <span style={{ fontSize: "0.76rem", color: "var(--text-muted)", fontWeight: 600 }}>
              🔬 Research Source: Sri Lanka Navy Follow-Up Study (220 Special Forces + 275 Regular Forces)
            </span>
            <span style={{ fontSize: "0.72rem", color: "var(--primary)", fontFamily: "monospace" }}>
              DOI: 10.5061/dryad.j1r30
            </span>
          </div>
        </div>

        {/* 1-Click Research Presets */}
        {step !== 4 && (
          <div className="preset-container" style={{ marginBottom: "18px" }}>
            <span style={{ fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
              Instant Research Presets:
            </span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {RESEARCH_PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="preset-chip-btn"
                  onClick={() => handleApplyPreset(p)}
                  disabled={loading}
                  title={p.desc}
                >
                  ⚡ {p.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 1: Stress & Trauma Symptoms (PCL-M) */}
        {step === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div className="research-step-header">
              <StepPips current={1} total={3} />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "8px" }}>
                <h3 style={{ fontSize: "1.15rem", fontWeight: 700, margin: 0 }}>
                  Stress & Trauma Symptoms (PCL-M)
                </h3>
                <InfoTooltip
                  title="What is PCL-M?"
                  text="PCL-M (PTSD Checklist - Military Version) is a validated 17-item research scale used in psychological studies to measure trauma reactions and operational stress over the past month."
                  techDetail="Composite score range: 17 (no distress reported) to 85 (frequent distress reported). Evaluated by the LightGBM classifier."
                  label="Learn about PCL-M"
                />
              </div>
              <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 600, display: "block", marginTop: "2px" }}>
                Research scale: PCL-M (Posttraumatic Stress Disorder Checklist - Military Version)
              </span>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.90rem", lineHeight: "1.5", marginTop: "6px" }}>
                Rate recent operational stress reactions or emotional strain over the past month.
              </p>
            </div>

            <SliderField
              label="PCL-M Military Trauma & Stress Score"
              helper="17 = Minimum / No distress reported · 85 = Severe symptoms reported"
              value={mlInputs.Q29_Total}
              min={17}
              max={85}
              unit="pts"
              onChange={(val) => updateInput("Q29_Total", val)}
            />

            <details className="score-disclosure">
              <summary>Why is this feature critical?</summary>
              <div className="score-disclosure-content">
                <p>
                  In the military dataset, PCL-M total score is the single strongest predictor of post-combat multiple symptoms case classification.
                </p>
              </div>
            </details>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "12px" }}>
              <button className="btn btn-ghost" onClick={onClose}>
                Cancel
              </button>
              <button id="modal-step1-next" className="btn btn-primary" onClick={() => setStep(2)}>
                Next: Combat & Critical Events →
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Combat Exposure Scale (CES) */}
        {step === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div className="research-step-header">
              <StepPips current={2} total={3} />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "8px" }}>
                <h3 style={{ fontSize: "1.15rem", fontWeight: 700, margin: 0 }}>
                  Combat & High-Risk Exposure (CES)
                </h3>
                <InfoTooltip
                  title="What is CES?"
                  text="These questions capture high-stress tactical or life-safety events from the Combat Exposure Scale (CES) to help the model account for acute operational strain."
                  techDetail="Binary indicators: Q12_weapon (tactical weapon discharge) and Q13_feltdie (perceived danger of being killed)."
                  label="Learn about Operational Experiences"
                />
              </div>
              <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 600, display: "block", marginTop: "2px" }}>
                Research measure: Combat Exposure Scale (CES) context
              </span>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.90rem", lineHeight: "1.5", marginTop: "6px" }}>
                These questions capture experiences that help the research model evaluate life-threat and weapon exposure.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Question 1: Weapon / Tactical */}
              <div className="card" style={{ padding: "18px", background: "var(--bg-surface-elevated)" }}>
                <p style={{ fontWeight: 600, fontSize: "0.92rem", marginBottom: "12px", color: "var(--text-primary)" }}>
                  Discharged weapon or engaged in direct tactical combat? (Q12_weapon)
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <button
                    type="button"
                    className={`btn ${mlInputs.Q12_weapon === 1 ? "btn-primary" : "btn-secondary"}`}
                    onClick={() => updateInput("Q12_weapon", 1)}
                    aria-pressed={mlInputs.Q12_weapon === 1}
                    aria-label="Discharged weapon or direct tactical combat: Yes"
                  >
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <span style={{ fontWeight: 700 }}>YES</span>
                      <span style={{ fontSize: "0.72rem", opacity: 0.85 }}>Direct weapon engagement</span>
                    </div>
                  </button>
                  <button
                    type="button"
                    className={`btn ${mlInputs.Q12_weapon === 0 ? "btn-primary" : "btn-secondary"}`}
                    onClick={() => updateInput("Q12_weapon", 0)}
                    aria-pressed={mlInputs.Q12_weapon === 0}
                    aria-label="Discharged weapon or direct tactical combat: No"
                  >
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <span style={{ fontWeight: 700 }}>NO</span>
                      <span style={{ fontSize: "0.72rem", opacity: 0.85 }}>No direct weapon engagement</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Question 2: Life Threat */}
              <div className="card" style={{ padding: "18px", background: "var(--bg-surface-elevated)" }}>
                <p style={{ fontWeight: 600, fontSize: "0.92rem", marginBottom: "12px", color: "var(--text-primary)" }}>
                  Felt in great danger of being killed or severely injured? (Q13_feltdie)
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <button
                    type="button"
                    className={`btn ${mlInputs.Q13_feltdie === 1 ? "btn-primary" : "btn-secondary"}`}
                    onClick={() => updateInput("Q13_feltdie", 1)}
                    aria-pressed={mlInputs.Q13_feltdie === 1}
                    aria-label="Severe personal danger of injury or death: Yes"
                  >
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <span style={{ fontWeight: 700 }}>YES</span>
                      <span style={{ fontSize: "0.72rem", opacity: 0.85 }}>Severe danger exposure</span>
                    </div>
                  </button>
                  <button
                    type="button"
                    className={`btn ${mlInputs.Q13_feltdie === 0 ? "btn-primary" : "btn-secondary"}`}
                    onClick={() => updateInput("Q13_feltdie", 0)}
                    aria-pressed={mlInputs.Q13_feltdie === 0}
                    aria-label="Severe personal danger of injury or death: No"
                  >
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <span style={{ fontWeight: 700 }}>NO</span>
                      <span style={{ fontSize: "0.72rem", opacity: 0.85 }}>No severe life-threat</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "12px" }}>
              <button className="btn btn-ghost" onClick={() => setStep(1)}>
                ← Back
              </button>
              <button id="modal-step2-next" className="btn btn-primary" onClick={() => setStep(3)}>
                Next: Role & Work Impairment →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Role-Physical Scale (SF-36 RP) */}
        {step === 3 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div className="research-step-header">
              <StepPips current={3} total={3} />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "8px" }}>
                <h3 style={{ fontSize: "1.15rem", fontWeight: 700, margin: 0 }}>
                  Duty Impairment & Physical Role Scale (SF-36 RP)
                </h3>
                <InfoTooltip
                  title="What is SF-36 RP?"
                  text="SF-36 Role-Physical evaluates how health or operational stress has interfered with regular duty execution."
                  techDetail="Measures 4 binary items: cut down work time (Q23a), accomplished less (Q23b), limited work type (Q23c), and extra effort required (Q23d)."
                  label="Learn about Daily Duty Impact"
                />
              </div>
              <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 600, display: "block", marginTop: "2px" }}>
                Research measure: SF-36 Role-Physical (RP)
              </span>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.90rem", lineHeight: "1.5", marginTop: "6px" }}>
                Have physical or operational stress factors impacted your daily duty execution?
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                { key: "Q23a_cutdowntime", label: "Had to cut down the amount of time spent on duties" },
                { key: "Q23b_Accomplished_less", label: "Accomplished less work than you usually would like" },
                { key: "Q23c_limited_work", label: "Were limited in the kind of work or duty tasks performed" },
                { key: "Q23d_difficulty_performing", label: "Had difficulty performing regular tasks (took extra effort)" },
              ].map((item) => (
                <div
                  key={item.key}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px 16px",
                    background: "var(--bg-input)",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-subtle)",
                    gap: "12px",
                  }}
                >
                  <span style={{ fontSize: "0.88rem", fontWeight: 500, flex: 1 }}>
                    {item.label}
                  </span>
                  <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                    <button
                      type="button"
                      className={`btn ${mlInputs[item.key] === 1 ? "btn-primary" : "btn-secondary"}`}
                      style={{ padding: "6px 14px", fontSize: "0.82rem", minWidth: "50px" }}
                      onClick={() => updateInput(item.key, 1)}
                      aria-pressed={mlInputs[item.key] === 1}
                      aria-label={`${item.label}: Yes`}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      className={`btn ${mlInputs[item.key] === 0 ? "btn-primary" : "btn-secondary"}`}
                      style={{ padding: "6px 14px", fontSize: "0.82rem", minWidth: "50px" }}
                      onClick={() => updateInput(item.key, 0)}
                      aria-pressed={mlInputs[item.key] === 0}
                      aria-label={`${item.label}: No`}
                    >
                      No
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px" }}>
              <button className="btn btn-ghost" onClick={() => setStep(2)}>
                ← Back
              </button>
              <button
                id="btn-compute-insights"
                className="btn btn-primary"
                onClick={handleRunAssessment}
                disabled={loading}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "10px 24px" }}
              >
                <span>{loading ? "Computing Insights..." : "Compute Supervised ML & TreeSHAP →"}</span>
                <span style={{ fontSize: "0.72rem", opacity: 0.85, fontWeight: 500 }}>
                  LightGBM Decision Ensemble + TreeSHAP Attributions
                </span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Results, Confidence, SHAP Values & Gemini Synthesis */}
        {step === 4 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }} role="status" aria-live="polite">
            {loading && (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <div className="session-pulse" style={{ width: "28px", height: "28px", margin: "0 auto 16px" }} />
                <h3 style={{ fontSize: "1.2rem", fontWeight: 700, margin: "0 0 8px" }}>
                  Computing Supervised TreeSHAP Explanations...
                </h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.90rem", maxWidth: "480px", margin: "0 auto" }}>
                  Evaluating LightGBM tree ensemble, computing exact SHAP feature attributions, and generating supportive synthesis with Gemini.
                </p>
              </div>
            )}

            {!loading && mlResult && !mlResult.error && (
              <>
                {/* Result Hero Banner */}
                <div
                  className={`card ${mlResult.signal === "elevated" ? "badge-high" : "badge-low"}`}
                  style={{
                    padding: "20px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "16px",
                  }}
                >
                  <div>
                    <span className="eyebrow" style={{ color: "inherit", opacity: 0.9 }}>
                      RESEARCH MODEL CLASSIFICATION (LIGHTGBM)
                    </span>
                    <h3 style={{ fontSize: "1.35rem", margin: "4px 0 2px", textTransform: "capitalize", fontWeight: 800 }}>
                      {mlResult.signal === "elevated" ? "Elevated Welfare Support Signal" : "Lower Welfare Support Signal"}
                    </h3>
                    <p style={{ margin: 0, fontSize: "0.82rem", opacity: 0.85 }}>
                      Research model output · Supervised Multi-Symptom Classifier · Not a clinical diagnosis
                    </p>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", justifyContent: "flex-end" }}>
                      <span style={{ fontSize: "0.80rem", color: "inherit", opacity: 0.9, fontWeight: 600 }}>
                        Model Probability
                      </span>
                      <InfoTooltip
                        title="Supervised Classification Probability"
                        text="Calculated probability from the supervised decision-tree ensemble. The classification threshold is calibrated at 0.45 based on research study specificity requirements."
                        techDetail="LightGBM gradient boosting decision trees trained on the Sri Lanka Navy dataset (DOI: 10.5061/dryad.j1r30)."
                        label="Learn about Model Probability"
                      />
                    </div>
                    <div style={{ fontSize: "1.8rem", fontWeight: 800, lineHeight: 1.1 }}>
                      {Math.round((mlResult.probability || 0) * 100)}%
                    </div>
                    <span style={{ fontSize: "0.72rem", opacity: 0.8 }}>
                      Threshold: 45% (0.45)
                    </span>
                  </div>
                </div>

                {/* TreeSHAP Influencing Factors */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                    <div>
                      <h4 style={{ fontSize: "1.05rem", fontWeight: 700, margin: 0 }}>
                        TreeSHAP Factor Attributions (Feature Importances)
                      </h4>
                      <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", margin: "2px 0 0" }}>
                        How individual operational and trauma factors shifted the prediction relative to the population baseline.
                      </p>
                    </div>
                    <InfoTooltip
                      title="What are SHAP values?"
                      text="SHAP (SHapley Additive exPlanations) mathematically attributes the model outcome to individual features, ensuring complete transparency into why the model predicted an elevated or lower signal."
                      techDetail="Calculated using TreeExplainer on the trained LightGBM booster. Positive SHAP (+ values) increases risk signal; negative SHAP (- values) decreases risk signal."
                      label="Learn about SHAP values"
                    />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {(mlResult.contributors || []).slice(0, 5).map((c, i) => {
                      const isUp = c.direction === "increases signal" || c.shap_value > 0;
                      return (
                        <div
                          key={i}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "12px 16px",
                            background: "var(--bg-surface-elevated)",
                            borderRadius: "var(--radius-md)",
                            border: `1px solid ${isUp ? "var(--signal-high-border)" : "var(--signal-low-border)"}`,
                            gap: "12px",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <span
                              style={{
                                color: isUp ? "var(--signal-high)" : "var(--signal-low)",
                                fontWeight: 800,
                                fontSize: "1.2rem",
                                lineHeight: 1,
                              }}
                            >
                              {isUp ? "↑" : "↓"}
                            </span>
                            <div>
                              <strong style={{ fontSize: "0.90rem", display: "block", textTransform: "capitalize" }}>
                                {c.label}
                              </strong>
                              <span style={{ fontSize: "0.76rem", color: isUp ? "var(--signal-high)" : "var(--signal-low)" }}>
                                {isUp ? "Increased model signal (+ contribution)" : "Lowered model signal (- contribution)"}
                              </span>
                            </div>
                          </div>

                          <div style={{ textAlign: "right" }}>
                            <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontFamily: "monospace", fontWeight: 600 }}>
                              SHAP: {c.shap_value > 0 ? `+${c.shap_value}` : c.shap_value}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Gemini Supportive Synthesis */}
                {mlResult.supportive_response && (
                  <div className="recommendation-panel">
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                      <span style={{ fontSize: "1rem" }}>✦</span>
                      <span className="panel-tag" style={{ margin: 0 }}>SUPPORTIVE SYNTHESIS (GEMINI)</span>
                    </div>
                    <p style={{ fontSize: "0.90rem", lineHeight: "1.6", margin: 0 }}>
                      {mlResult.supportive_response}
                    </p>
                  </div>
                )}

                {/* Research Note */}
                <div style={{ padding: "10px 14px", background: "var(--bg-input)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)" }}>
                  <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", margin: 0, lineHeight: "1.5" }}>
                    🔒 <strong>Research Prototype Notice:</strong> Demonstrates explainable AI for defense/uniformed personnel welfare support. Not a clinical diagnostic instrument. Final welfare decisions remain strictly human-driven.
                  </p>
                </div>

                {/* Action Buttons */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px", flexWrap: "wrap", gap: "10px" }}>
                  <button className="btn btn-secondary" onClick={handleReset}>
                    Start New Evaluation
                  </button>
                  <button className="btn btn-primary" onClick={onClose}>
                    Done / Return to Summary
                  </button>
                </div>
              </>
            )}

            {!loading && mlResult?.error && (
              <div style={{ color: "var(--signal-high)", background: "var(--signal-high-bg)", padding: "16px", borderRadius: "var(--radius-md)" }}>
                <p style={{ margin: 0, fontWeight: 600 }}>Error computing model insights:</p>
                <p style={{ margin: "4px 0 0", fontSize: "0.9rem" }}>{mlResult.error}</p>
                <button className="btn btn-secondary" style={{ marginTop: "12px" }} onClick={() => setStep(1)}>
                  Try Again
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
