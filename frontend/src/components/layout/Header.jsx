export function Header({ darkMode, setDarkMode, sessionId, onResetSession }) {
  function handleKeyDown(e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onResetSession();
    }
  }

  return (
    <header className="topbar">
      <div
        className="brand-wrapper"
        onClick={onResetSession}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        title="MindSetu Home"
        aria-label="MindSetu home, reset session"
      >
        <div className="brand-logo">✦</div>
        <div className="brand-text">
          Mind<span>Setu</span>
        </div>
      </div>

      <div className="topbar-actions">
        {sessionId && (
          <div className="session-indicator" title="Protected anonymous session active">
            <span className="session-pulse" />
            <span>Protected Session</span>
          </div>
        )}

        <button
          className="btn-icon"
          onClick={() => setDarkMode((prev) => !prev)}
          aria-label={darkMode ? "Switch to light theme" : "Switch to dark theme"}
          title={darkMode ? "Switch to light theme" : "Switch to dark theme"}
        >
          {darkMode ? "☀" : "☾"}
        </button>
      </div>
    </header>
  );
}
