export function HomeScreen({ onStart }) {
  const pillars = [
    {
      num: "01",
      name: "LightGBM",
      role: "Supervised Research Model",
      desc: "Computes welfare-risk indicators from duty and wellbeing signals.",
    },
    {
      num: "02",
      name: "SHAP",
      role: "Model Explainability",
      desc: "Highlights the exact contributing factors behind each research signal.",
    },
    {
      num: "03",
      name: "Gemini",
      role: "Supportive AI Layer",
      desc: "Translates findings into empathetic, practical recovery guidance.",
    },
    {
      num: "04",
      name: "Human",
      role: "Welfare Decision",
      desc: "All welfare interventions and decisions remain strictly human-driven.",
    },
  ];

  const trustItems = [
    { icon: "🔒", text: "Anonymous sessions — no personal IDs stored" },
    { icon: "⚡", text: "Real-time AI companion powered by Gemini" },
    { icon: "🔬", text: "Explainable ML with SHAP factor analysis" },
    { icon: "🛡", text: "Human welfare officer always in the loop" },
  ];

  return (
    <div className="page-container">
      <div className="hero-grid">
        {/* Left — Hero Copy */}
        <div style={{ animation: "slideUp 400ms cubic-bezier(0.2,0.8,0.2,1) both" }}>
          <span className="eyebrow">SIH26186 · PERSONNEL WELFARE SUPPORT</span>
          <h1
            className="page-title"
            style={{ fontSize: "clamp(2.3rem, 4.5vw, 3.8rem)", marginBottom: "20px", lineHeight: 1.1 }}
          >
            Understand what matters.
            <br />
            <span style={{ color: "var(--primary)" }}>Choose support earlier.</span>
          </h1>
          <p
            className="page-subtitle"
            style={{ fontSize: "1.1rem", maxWidth: "580px", marginBottom: "36px" }}
          >
            MindSetu provides a calm, confidential space for personnel to complete a
            brief wellbeing pulse, contextualise operational strain, and access
            structured, actionable welfare guidance.
          </p>

          <button
            id="home-start-btn"
            className="btn btn-primary"
            style={{ padding: "15px 32px", fontSize: "1.02rem", marginBottom: "32px" }}
            onClick={onStart}
          >
            Start a Protected Session →
          </button>

          {/* Trust chips */}
          <div className="trust-grid">
            {trustItems.map((item, i) => (
              <div
                key={i}
                className="trust-card"
                style={{
                  animation: `slideUp ${360 + i * 60}ms cubic-bezier(0.2,0.8,0.2,1) both`,
                }}
              >
                <span className="trust-icon">{item.icon}</span>
                <span className="trust-text">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Architecture Card */}
        <div style={{ animation: "slideUp 480ms cubic-bezier(0.2,0.8,0.2,1) both" }}>
          <div
            className="card card-elevated"
            style={{
              padding: "30px",
              background: "var(--bg-surface-card)",
              backdropFilter: "blur(20px)",
            }}
          >
            <span className="eyebrow">SYSTEM ARCHITECTURE</span>
            <h2
              style={{
                fontSize: "1.28rem",
                fontWeight: 700,
                margin: "6px 0 22px",
                color: "var(--text-primary)",
              }}
            >
              Clear Responsibilities at Every Layer
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
              {pillars.map((p) => (
                <div key={p.num} className="pillar-row">
                  <span className="pillar-num">{p.num}</span>
                  <div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "baseline",
                        flexWrap: "wrap",
                        gap: "4px",
                        marginBottom: "4px",
                      }}
                    >
                      <strong style={{ fontSize: "0.96rem", color: "var(--text-primary)" }}>
                        {p.name}
                      </strong>
                      <span
                        style={{
                          fontSize: "0.70rem",
                          color: "var(--text-muted)",
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          fontWeight: 700,
                        }}
                      >
                        {p.role}
                      </span>
                    </div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "0.84rem",
                        color: "var(--text-secondary)",
                        lineHeight: "1.5",
                      }}
                    >
                      {p.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                marginTop: "20px",
                paddingTop: "18px",
                borderTop: "1px solid var(--border-subtle)",
                fontSize: "0.78rem",
                color: "var(--text-muted)",
                lineHeight: "1.5",
              }}
            >
              🔒 <strong>Research prototype.</strong> MindSetu generates welfare-support signals, not clinical
              diagnoses or disciplinary recommendations.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
