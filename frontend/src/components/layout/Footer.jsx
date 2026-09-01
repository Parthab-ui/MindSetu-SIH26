export function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid var(--border-subtle)",
        padding: "24px 20px",
        marginTop: "auto",
        textAlign: "center",
        fontSize: "0.82rem",
        color: "var(--text-muted)",
      }}
    >
      <div style={{ maxWidth: "800px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "8px" }}>
        <p style={{ margin: 0 }}>
          <strong>MindSetu Personnel Welfare Support</strong> · SIH 2026 Prototype (SIH26186)
        </p>
        <p style={{ margin: 0, opacity: 0.85 }}>
          MindSetu generates supportive welfare triage signals and practical coping steps. It does not diagnose medical
          conditions or make automated personnel or disciplinary decisions.
        </p>
      </div>
    </footer>
  );
}
