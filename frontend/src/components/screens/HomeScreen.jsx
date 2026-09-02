export function HomeScreen({ onStart }) {
  const pillars = [
    {
      num: "01",
      name: "LightGBM",
      role: "Supervised Research",
      desc: "Trained on military research data for multi-symptom strain analysis.",
    },
    {
      num: "02",
      name: "TreeSHAP",
      role: "Explainability",
      desc: "Exact mathematical attribution for every operational input.",
    },
    {
      num: "03",
      name: "Gemini",
      role: "Supportive AI",
      desc: "Empathetic recovery and tactical decompression guidance.",
    },
    {
      num: "04",
      name: "Human Officer",
      role: "Welfare Decision",
      desc: "Welfare actions and clinical support remain strictly human-led.",
    },
  ];

  const differentiators = [
    {
      icon: "🎯",
      title: "Uniformed Context",
      desc: "Screens for operational exhaustion, hypervigilance, and duty strain.",
    },
    {
      icon: "🧠",
      title: "Depression & Trauma",
      desc: "Separates affective fatigue from trauma arousal and intrusion.",
    },
    {
      icon: "🎙️",
      title: "Voice Paralinguistics",
      desc: "In-memory acoustic ML signals with zero audio stored.",
    },
    {
      icon: "🔒",
      title: "Anonymous & Private",
      desc: "Protected sessions with zero service numbers or personnel records.",
    },
  ];

  return (
    <div className="page-container">
      <div className="hero-grid">
        {/* Left — Hero */}
        <div style={{ animation: "slideUp 400ms cubic-bezier(0.2,0.8,0.2,1) both" }}>
          <span className="eyebrow">SIH26186 · PERSONNEL WELFARE SUPPORT</span>
          <h1
            className="page-title"
            style={{ fontSize: "clamp(2.3rem, 4.5vw, 3.6rem)", marginBottom: "16px", lineHeight: 1.15 }}
          >
            Support for your <br />
            <span style={{ color: "var(--primary)" }}>wellbeing.</span>
          </h1>
          <p
            className="page-subtitle"
            style={{ fontSize: "1.05rem", maxWidth: "560px", marginBottom: "24px", lineHeight: "1.6" }}
          >
            Confidential screening and multimodal decision support built for armed forces, paramilitary, police, and emergency personnel.
          </p>

          <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "28px" }}>
            <button
              id="home-start-btn"
              className="btn btn-primary"
              style={{ padding: "14px 28px", fontSize: "1rem" }}
              onClick={onStart}
            >
              Start Check-In →
            </button>
            <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
              Private • Secure • Anonymous
            </span>
          </div>

          {/* Differentiator Highlights */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px", marginTop: "12px" }}>
            {differentiators.map((d, i) => (
              <div
                key={i}
                className="card card-enter"
                style={{
                  padding: "14px 16px",
                  background: "var(--bg-surface-elevated)",
                  border: "1px solid var(--border-subtle)",
                  animationDelay: `${300 + i * 50}ms`,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <span style={{ fontSize: "1.15rem" }}>{d.icon}</span>
                  <strong style={{ fontSize: "0.90rem", color: "var(--text-primary)" }}>{d.title}</strong>
                </div>
                <p style={{ margin: 0, fontSize: "0.80rem", color: "var(--text-secondary)", lineHeight: "1.4" }}>
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
              padding: "26px",
              background: "var(--bg-surface-card)",
              backdropFilter: "blur(20px)",
            }}
          >
            <span className="eyebrow">FOUR-PILLAR ARCHITECTURE</span>
            <h2
              style={{
                fontSize: "1.20rem",
                fontWeight: 800,
                marginTop: "4px",
                marginBottom: "16px",
                letterSpacing: "-0.01em",
              }}
            >
              AI-Assisted Welfare System
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {pillars.map((p, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: "12px",
                    alignItems: "flex-start",
                    padding: "10px 12px",
                    background: "var(--bg-surface-elevated)",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.75rem",
                      fontWeight: 800,
                      color: "var(--primary)",
                      background: "rgba(16, 185, 129, 0.1)",
                      padding: "2px 6px",
                      borderRadius: "4px",
                      marginTop: "2px",
                    }}
                  >
                    {p.num}
                  </span>
                  <div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
                      <strong style={{ fontSize: "0.88rem" }}>{p.name}</strong>
                      <span style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>({p.role})</span>
                    </div>
                    <p style={{ margin: "2px 0 0", fontSize: "0.78rem", color: "var(--text-secondary)", lineHeight: "1.35" }}>
                      {p.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Non-Diagnostic Boundary Notice */}
            <div
              style={{
                marginTop: "16px",
                padding: "10px 12px",
                background: "rgba(59, 130, 246, 0.08)",
                border: "1px solid rgba(59, 130, 246, 0.25)",
                borderRadius: "var(--radius-md)",
                display: "flex",
                gap: "8px",
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: "0.95rem" }}>🛡️</span>
              <p style={{ margin: 0, fontSize: "0.74rem", color: "var(--text-secondary)", lineHeight: "1.35" }}>
                <strong>Non-Diagnostic Aid:</strong> Screening and decision support only. Clinical diagnoses and personnel decisions are human-led.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
