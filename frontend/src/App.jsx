import "./App.css";

function App() {
  return (
    <div className="app">
      <nav className="navbar">
        <div className="logo">
          <div className="logo-mark">M</div>
          <span>MindSetu</span>
        </div>

        <div className="nav-links">
          <a href="#how">How it works</a>
          <a href="#support">Support</a>
          <button className="nav-button">Sign in</button>
        </div>
      </nav>

      <main>
        <section className="hero">
          <div className="hero-content">
            <div className="badge">
              ✦ Student Mental Health Support
            </div>

            <h1>
              Your mental health
              <span> matters.</span>
            </h1>

            <p>
              A confidential digital support platform designed for
              students. Talk, reflect, understand how you're feeling,
              and find the right support when you need it.
            </p>

            <div className="hero-buttons">
              <button className="primary-button">
                Start anonymously →
              </button>

              <button className="secondary-button">
                Learn how it works
              </button>
            </div>

            <div className="trust">
              <span>🔒</span>
              Anonymous by default
              <span className="dot">•</span>
              Confidential
              <span className="dot">•</span>
              Available 24×7
            </div>
          </div>

          <div className="hero-visual">
            <div className="glow"></div>

            <div className="support-card">
              <div className="card-icon">🧠</div>

              <h3>How are you feeling today?</h3>

              <p>
                Take a moment to check in with yourself.
              </p>

              <div className="moods">
                <div>😊</div>
                <div>🙂</div>
                <div>😐</div>
                <div>🙁</div>
                <div>😔</div>
              </div>

              <div className="card-footer">
                <span>Private check-in</span>
                <span>→</span>
              </div>
            </div>
          </div>
        </section>

        <section className="features" id="support">
          <div className="section-heading">
            <span>SUPPORT WHEN YOU NEED IT</span>
            <h2>One platform. The right support.</h2>
          </div>

          <div className="feature-grid">
            <div className="feature-card">
              <div className="feature-icon">🧭</div>
              <h3>Understand yourself</h3>
              <p>
                Confidential self-assessments help you understand
                your current wellbeing.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">💬</div>
              <h3>AI support companion</h3>
              <p>
                Get a supportive first response whenever you need
                someone to talk to.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📈</div>
              <h3>Track your wellbeing</h3>
              <p>
                Track your mood and build healthier habits over
                time.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🤝</div>
              <h3>Connect with support</h3>
              <p>
                Find appropriate support and connect with
                counsellors when needed.
              </p>
            </div>
          </div>
        </section>

        <section className="how" id="how">
          <div className="section-heading">
            <span>HOW MINDSETU WORKS</span>
            <h2>Support at every step.</h2>
          </div>

          <div className="steps">
            <div className="step">
              <div className="step-number">01</div>
              <h3>Confidential onboarding</h3>
              <p>
                Start anonymously and choose what information you
                want to share.
              </p>
            </div>

            <div className="step">
              <div className="step-number">02</div>
              <h3>Self-assessment</h3>
              <p>
                Complete validated wellbeing screening tools.
              </p>
            </div>

            <div className="step">
              <div className="step-number">03</div>
              <h3>Risk-aware support</h3>
              <p>
                Your results help guide you toward appropriate
                support.
              </p>
            </div>

            <div className="step">
              <div className="step-number">04</div>
              <h3>Personalised support</h3>
              <p>
                Access the AI companion, activities and counsellor
                support.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="logo">
          <div className="logo-mark">M</div>
          <span>MindSetu</span>
        </div>

        <p>
          Digital mental health support for students.
        </p>
      </footer>
    </div>
  );
}

export default App;