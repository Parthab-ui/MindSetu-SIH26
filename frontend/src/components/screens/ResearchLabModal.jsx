import { useState } from "react";
import { SliderField } from "../common/SliderField";

export function ResearchLabModal({ isOpen, onClose, onRunML, mlInputs, setMlInputs, mlResult, loading }) {
  const [step, setStep] = useState(1);

  if (!isOpen) return null;

  function updateInput(key, val) {
    setMlInputs((prev) => ({ ...prev, [key]: val }));
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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div>
            <span className="eyebrow">SIH26186 RESEARCH DEMO</span>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 800, margin: "2px 0 0" }}>
              Explainable AI (LightGBM + SHAP) Lab
            </h2>
          </div>
          <button className="btn-icon" onClick={onClose} aria-label="Close modal">
            ✕
          </button>
        </div>

        {step === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <span className="badge badge-low" style={{ marginBottom: "8px" }}>
                Step 1 of 3
              </span>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 700, margin: "6px 0 8px" }}>
                Stress & Symptom Assessment (PCL-M)
              </h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", lineHeight: "1.5" }}>
                Rate recent trauma or stress symptom experiences over the past month. (Verified research scale: 17 to 85).
              </p>
            </div>

            <SliderField
              label="PCL-M Total Symptom Score"
              helper="17 = Minimum / No Distress, 85 = Severe Symptoms"
              value={mlInputs.Q29_Total}
              min={17}
              max={85}
              onChange={(val) => updateInput("Q29_Total", val)}
            />

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "12px" }}>
              <button className="btn btn-ghost" onClick={onClose}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={() => setStep(2)}>
                Next: Critical Events →
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <span className="badge badge-low" style={{ marginBottom: "8px" }}>
                Step 2 of 3
              </span>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 700, margin: "6px 0 8px" }}>
                Operational & Critical Experiences
              </h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", lineHeight: "1.5" }}>
                Combat Exposure Scale items used by the research baseline.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div className="card" style={{ padding: "16px" }}>
                <p style={{ fontWeight: 600, fontSize: "0.92rem", marginBottom: "12px" }}>
                  Discharged weapon or engaged in direct tactical combat?
                </p>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    className={`btn ${mlInputs.Q12_weapon === 1 ? "btn-primary" : "btn-secondary"}`}
                    style={{ flex: 1 }}
                    onClick={() => updateInput("Q12_weapon", 1)}
                  >
                    Yes (Active Combat)
                  </button>
                  <button
                    className={`btn ${mlInputs.Q12_weapon === 0 ? "btn-primary" : "btn-secondary"}`}
                    style={{ flex: 1 }}
                    onClick={() => updateInput("Q12_weapon", 0)}
                  >
                    No
                  </button>
                </div>
              </div>

              <div className="card" style={{ padding: "16px" }}>
                <p style={{ fontWeight: 600, fontSize: "0.92rem", marginBottom: "12px" }}>
                  Experienced a situation where you felt in severe personal danger of injury or death?
                </p>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    className={`btn ${mlInputs.Q13_feltdie === 1 ? "btn-primary" : "btn-secondary"}`}
                    style={{ flex: 1 }}
                    onClick={() => updateInput("Q13_feltdie", 1)}
                  >
                    Yes (Life Threat)
                  </button>
                  <button
                    className={`btn ${mlInputs.Q13_feltdie === 0 ? "btn-primary" : "btn-secondary"}`}
                    style={{ flex: 1 }}
                    onClick={() => updateInput("Q13_feltdie", 0)}
                  >
                    No
                  </button>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "12px" }}>
              <button className="btn btn-ghost" onClick={() => setStep(1)}>
                ← Back
              </button>
              <button className="btn btn-primary" onClick={() => setStep(3)}>
                Next: Daily Functioning →
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <span className="badge badge-low" style={{ marginBottom: "8px" }}>
                Step 3 of 3
              </span>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 700, margin: "6px 0 8px" }}>
                Daily Duty & Work Impact (SF-36 RP)
              </h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", lineHeight: "1.5" }}>
                Have physical or emotional factors affected your routine duties in the past month?
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {[
                { key: "Q23a_cutdowntime", label: "Had to cut down the amount of time spent on duties" },
                { key: "Q23b_Accomplished_less", label: "Accomplished less than you usually would like" },
                { key: "Q23c_limited_work", label: "Were limited in the kind of work or tasks performed" },
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
                  }}
                >
                  <span style={{ fontSize: "0.88rem", fontWeight: 500, flex: 1, paddingRight: "12px" }}>
                    {item.label}
                  </span>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button
                      className={`btn ${mlInputs[item.key] === 1 ? "btn-primary" : "btn-secondary"}`}
                      style={{ padding: "6px 14px", fontSize: "0.82rem" }}
                      onClick={() => updateInput(item.key, 1)}
                    >
                      Yes
                    </button>
                    <button
                      className={`btn ${mlInputs[item.key] === 0 ? "btn-primary" : "btn-secondary"}`}
                      style={{ padding: "6px 14px", fontSize: "0.82rem" }}
                      onClick={() => updateInput(item.key, 0)}
                    >
                      No
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "12px" }}>
              <button className="btn btn-ghost" onClick={() => setStep(2)}>
                ← Back
              </button>
              <button className="btn btn-primary" onClick={handleRunAssessment} disabled={loading}>
                {loading ? "Computing SHAP..." : "Compute Model Insights →"}
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {loading && (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <div className="session-pulse" style={{ width: "24px", height: "24px", margin: "0 auto 16px" }} />
                <h3 style={{ fontSize: "1.2rem", fontWeight: 700 }}>Computing TreeExplainer SHAP Values...</h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                  Evaluating LightGBM tree ensemble and generating Gemini supportive synthesis.
                </p>
              </div>
            )}

            {!loading && mlResult && (
              <>
                <div
                  className={`card ${mlResult.signal === "elevated" ? "badge-high" : "badge-low"}`}
                  style={{
                    padding: "20px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "12px",
                  }}
                >
                  <div>
                    <span className="eyebrow" style={{ color: "inherit" }}>
                      RESEARCH MODEL SIGNAL
                    </span>
                    <h3 style={{ fontSize: "1.4rem", margin: "4px 0 0", textTransform: "capitalize" }}>
                      {mlResult.signal} Research Signal
                    </h3>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: "0.82rem", color: "inherit", opacity: 0.85 }}>Model Probability</span>
                    <div style={{ fontSize: "1.6rem", fontWeight: 800 }}>
                      {Math.round((mlResult.probability || 0) * 100)}%
                    </div>
                  </div>
                </div>

                {/* SHAP Contributors List */}
                <div>
                  <h4 style={{ fontSize: "1rem", fontWeight: 700, margin: "0 0 10px" }}>
                    Key Influencing Factors (SHAP Values)
                  </h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {(mlResult.contributors || []).slice(0, 4).map((c, i) => {
                      const isUp = c.direction === "increases signal";
                      return (
                        <div
                          key={i}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "10px 14px",
                            background: "var(--bg-input)",
                            borderRadius: "var(--radius-md)",
                            border: "1px solid var(--border-subtle)",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <span
                              style={{
                                color: isUp ? "var(--signal-high)" : "var(--signal-low)",
                                fontWeight: 800,
                                fontSize: "1.1rem",
                              }}
                            >
                              {isUp ? "↗" : "↘"}
                            </span>
                            <span style={{ fontSize: "0.9rem", fontWeight: 500 }}>{c.label}</span>
                          </div>
                          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                            SHAP: {c.shap_value > 0 ? `+${c.shap_value}` : c.shap_value}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Gemini Supportive Guidance */}
                {mlResult.supportive_response && (
                  <div className="recommendation-panel">
                    <span className="panel-tag">SUPPORTIVE SYNTHESIS (GEMINI)</span>
                    <p style={{ fontSize: "0.92rem", lineHeight: "1.6" }}>{mlResult.supportive_response}</p>
                  </div>
                )}

                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: 0 }}>
                  🔒 <strong>Research-Only Note:</strong> SHAP values explain feature contributions in the supervised model;
                  they do not represent clinical diagnoses or causal relationships.
                </p>

                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px" }}>
                  <button className="btn btn-secondary" onClick={handleReset}>
                    Start New Evaluation
                  </button>
                  <button className="btn btn-primary" onClick={onClose}>
                    Done
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
