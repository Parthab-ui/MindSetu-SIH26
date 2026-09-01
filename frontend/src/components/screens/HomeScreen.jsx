export function HomeScreen({ onStart }) {
  const pillars = [
    {
      num: "01",
      name: "LightGBM",
      role: "Supervised Research Model",
      desc: "Computes risk indicators from operational duty and wellbeing signals.",
    },
    {
      num: "02",
      name: "SHAP",
      role: "Model Explainability",
      desc: "Highlights exact contributing factors behind the research signal.",
    },
    {
      num: "03",
      name: "Gemini",
      role: "Supportive AI Layer",
      desc: "Translates complex findings into empathetic, practical recovery guidance.",
    },
    {
      num: "04",
      name: "Human",
      role: "Welfare Decision",
      desc: "All welfare interventions and decisions remain strictly human-driven.",
    },
  ];

  return (
    <div className="page-container">
      <div className="hero-grid">
        <div>
          <span className="eyebrow">SIH26186 · PERSONNEL WELFARE SUPPORT</span>
          <h1 className="page-title" style={{ fontSize: "clamp(2.4rem, 5vw, 4rem)", marginBottom: "16px" }}>
            Understand what matters.<br />
            <span style={{ color: "var(--primary)" }}>Choose support earlier.</span>
          </h1>
          <p className="page-subtitle" style={{ fontSize: "1.15rem", maxWidth: "600px", marginBottom: "32px" }}>
            MindSetu provides a calm, confidential space for personnel to complete a brief wellbeing pulse, contextualize
            workload strain, and access actionable next steps.
          </p>

          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center" }}>
            <button className="btn btn-primary" style={{ padding: "14px 28px", fontSize: "1.05rem" }} onClick={onStart}>
              Start a Protected Session →
            </button>
          </div>

          <p style={{ marginTop: "24px", fontSize: "0.85rem", color: "var(--text-muted)", maxWidth: "560px", lineHeight: "1.5" }}>
            🔒 <strong>Confidential & Demo-Safe:</strong> Sessions are generated anonymously. Outputs represent supportive
            triage signals, not clinical diagnoses or disciplinary actions.
          </p>
        </div>

        <div>
          <div className="card card-elevated" style={{ padding: "32px" }}>
            <span className="eyebrow">SYSTEM ARCHITECTURE</span>
            <h2 style={{ fontSize: "1.35rem", fontWeight: 700, margin: "4px 0 20px" }}>
              Clear Responsibilities at Every Layer
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {pillars.map((p) => (
                <div
                  key={p.num}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "36px 1fr",
                    gap: "14px",
                    paddingBottom: "14px",
                    borderBottom: "1px solid var(--border-subtle)",
                  }}
                >
                  <span style={{ fontWeight: 800, color: "var(--primary)", fontSize: "1rem" }}>{p.num}</span>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "3px" }}>
                      <strong style={{ fontSize: "0.98rem", color: "var(--text-primary)" }}>{p.name}</strong>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        {p.role}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: "0.86rem", color: "var(--text-secondary)", lineHeight: "1.45" }}>
                      {p.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
