export function CrisisBanner({ onDismiss }) {
  return (
    <div className="crisis-banner" role="alert">
      <div className="crisis-banner-icon">⚠</div>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1 }}>
        <strong style={{ fontSize: "1rem" }}>Immediate Support & Safety Resources</strong>
        <p style={{ margin: 0, fontSize: "0.9rem", lineHeight: "1.5" }}>
          If you or someone you know is in immediate danger or experiencing overwhelming distress, please connect with
          a trusted person or reach out directly to emergency support services.
        </p>
        <div style={{ display: "flex", gap: "12px", marginTop: "6px", flexWrap: "wrap" }}>
          <span style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--signal-high)" }}>
            Tele-MANAS (Govt of India): 14416 / 1800 891 4416
          </span>
          <span style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--signal-high)" }}>
            KIRAN Mental Health: 1800-599-0019
          </span>
        </div>
      </div>
      {onDismiss && (
        <button
          className="btn-ghost"
          style={{ padding: "4px 8px", alignSelf: "flex-start" }}
          onClick={onDismiss}
          aria-label="Dismiss banner"
        >
          ✕
        </button>
      )}
    </div>
  );
}
