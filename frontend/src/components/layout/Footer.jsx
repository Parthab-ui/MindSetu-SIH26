export function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid var(--border-subtle)",
        padding: "26px 20px",
        marginTop: "auto",
        textAlign: "center",
        fontSize: "0.82rem",
        color: "var(--text-muted)",
        position: "relative",
        zIndex: 1,
      }}
    >
      <div style={{ maxWidth: "820px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "8px" }}>
        <p style={{ margin: 0, color: "var(--text-secondary)", fontWeight: 600 }}>
          <strong>MindSetu Personnel Welfare Support</strong> · Smart India Hackathon 2026 (SIH26186)
        </p>
        <p style={{ margin: 0, opacity: 0.85, lineHeight: "1.5" }}>
          MindSetu generates supportive welfare triage signals and practical coping steps. It does not diagnose medical
          conditions or make automated personnel or disciplinary decisions.
        </p>
      </div>
    </footer>
  );
}
