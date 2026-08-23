import "./Onboarding.css";

function Onboarding({ onBack, onContinue }) {
  return (
    <div className="onboarding-page">
      <header className="onboarding-header">
        <button className="back-button" onClick={onBack}>
          ← Back
        </button>

        <div className="onboarding-logo">
          <div className="logo-mark">M</div>
          <span>MindSetu</span>
        </div>

        <div className="privacy-label">
          🔒 Private & confidential
        </div>
      </header>

      <main className="onboarding-container">
        <div className="onboarding-icon">
          🔒
        </div>

        <span className="onboarding-label">
          CONFIDENTIAL ONBOARDING
        </span>

        <h1>
          A safe space to
          <span> start.</span>
        </h1>

        <p className="onboarding-intro">
          MindSetu is designed to give students a private,
          stigma-free place to understand how they are feeling
          and find appropriate support.
        </p>

        <div className="privacy-card">
          <h2>Your privacy comes first</h2>

          <div className="privacy-item">
            <div>👤</div>
            <div>
              <h3>Anonymous by default</h3>
              <p>
                You can use MindSetu without providing your
                identity.
              </p>
            </div>
          </div>

          <div className="privacy-item">
            <div>🔐</div>
            <div>
              <h3>Your information is protected</h3>
              <p>
                We only collect information needed to provide
                support.
              </p>
            </div>
          </div>

          <div className="privacy-item">
            <div>🤝</div>
            <div>
              <h3>You are in control</h3>
              <p>
                You decide what you share and can stop at any
                time.
              </p>
            </div>
          </div>
        </div>

        <div className="consent-box">
          <input type="checkbox" id="consent" />

          <label htmlFor="consent">
            I understand that MindSetu provides digital
            wellbeing support and screening, and is not a
            replacement for a qualified mental-health
            professional.
          </label>
        </div>

        <button
          className="continue-button"
          onClick={onContinue}
        >
          I understand, continue →
        </button>

        <p className="onboarding-note">
          You can continue anonymously. No personal identity is
          required.
        </p>
      </main>
    </div>
  );
}

export default Onboarding;