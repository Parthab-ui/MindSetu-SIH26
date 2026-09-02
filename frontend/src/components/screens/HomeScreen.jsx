export function HomeScreen({ onStart }) {
  const pillars = [
    {
      num: "01",
      name: "LightGBM",
      role: "Supervised Research Model",
      desc: "Trained on military personnel research data to predict multi-symptom strain from operational exposure.",
    },
    {
      num: "02",
      name: "TreeSHAP",
      role: "Model Explainability",
      desc: "Provides exact, mathematical feature attribution for every trauma, stress, and physical role input.",
    },
    {
      num: "03",
      name: "Gemini",
      role: "Supportive AI Companion",
      desc: "Synthesizes multi-turn recovery pacing and tactical decompression guidance with strict safety guardrails.",
    },
    {
      num: "04",
      name: "Human Officer",
      role: "Welfare Intervention",
      desc: "All welfare decisions, duty adjustments, and formal referrals remain strictly human-driven.",
    },
  ];

  const differentiators = [
    {
      icon: "🎯",
      title: "Purpose-Built for Uniformed Personnel",
      desc: "Screens for operational exhaustion, tactical hypervigilance, and critical incident trauma rather than generic workplace stress.",
    },
    {
      icon: "🧠",
      title: "Depression & PTSD/Trauma Dimensions",
      desc: "Separates affective depressive fatigue from tactical hyperarousal and intrusive recall for granular support triage.",
    },
    {
      icon: "⚖️",
      title: "Objective Duty & Recovery Balancing",
      desc: "Integrates shift duration, sleep deficit, night watches, and leave intervals to evaluate cumulative duty burden.",
    },
    {
      icon: "🔒",
      title: "Protected & Non-Stigmatizing",
      desc: "Protected anonymous sessions with zero personnel identifiers stored, removing fear of career consequences.",
    },
  ];

  return (
    <div className="page-container">
      <div className="hero-grid">
        {/* Left — Hero Copy */}
        <div style={{ animation: "slideUp 400ms cubic-bezier(0.2,0.8,0.2,1) both" }}>
          <span className="eyebrow">SIH26186 · UNIFORMED PERSONNEL WELFARE SUPPORT</span>
          <h1
            className="page-title"
            style={{ fontSize: "clamp(2.3rem, 4.5vw, 3.8rem)", marginBottom: "20px", lineHeight: 1.1 }}
          >
            Specialized Welfare Triage.
            <br />
            <span style={{ color: "var(--primary)" }}>Built for Service Contexts.</span>
          </h1>
          <p
            className="page-subtitle"
            style={{ fontSize: "1.08rem", maxWidth: "580px", marginBottom: "32px", lineHeight: "1.6" }}
          >
            MindSetu is a dedicated digital mental health screening and decision-support platform designed around the operational, trauma, shift work, and reintegration realities experienced by armed forces, paramilitary, police, and emergency personnel.
          </p>

          <button
            id="home-start-btn"
            className="btn btn-primary"
            style={{ padding: "15px 32px", fontSize: "1.02rem", marginBottom: "32px" }}
            onClick={onStart}
          >
            Start Protected Session →
          </button>

          {/* Differentiator Highlights */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "14px", marginTop: "12px" }}>
            {differentiators.map((d, i) => (
              <div
                key={i}
                className="card card-enter"
                style={{
                  padding: "16px",
                  background: "var(--bg-surface-elevated)",
                  border: "1px solid var(--border-subtle)",
                  animationDelay: `${300 + i * 50}ms`,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <span style={{ fontSize: "1.2rem" }}>{d.icon}</span>
                  <strong style={{ fontSize: "0.92rem", color: "var(--text-primary)" }}>{d.title}</strong>
                </div>
                <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: "1.5" }}>
                  {d.desc}
                </p>
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
            <span className="eyebrow">FOUR-PILLAR ARCHITECTURE</span>
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

            <div style={{ marginTop: "24px", padding: "12px 16px", background: "var(--bg-input)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
              <span style={{ fontSize: "0.76rem", color: "var(--text-muted)", fontWeight: 600, display: "block" }}>
                🔒 ETHICAL PROTOCOL
              </span>
              <p style={{ margin: "4px 0 0", fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: "1.5" }}>
                MindSetu is a welfare triage aid. It never makes automatic personnel decisions, determines fitness ratings, or replaces medical clinicians.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
