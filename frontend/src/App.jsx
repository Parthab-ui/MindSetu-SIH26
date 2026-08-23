/* eslint-disable react-refresh/only-export-components */
import { useEffect, useState } from "react";
import "./App.css";

const API = "http://127.0.0.1:8000";

const PHQ9_QUESTIONS = [
  "Little interest or pleasure in doing things",
  "Feeling down, depressed, or hopeless",
  "Trouble falling or staying asleep, or sleeping too much",
  "Feeling tired or having little energy",
  "Poor appetite or overeating",
  "Feeling bad about yourself — or that you are a failure or have let yourself or your family down",
  "Trouble concentrating on things, such as reading or watching television",
  "Moving or speaking so slowly that other people could have noticed, or the opposite — being unusually fidgety or restless",
  "Thoughts that you would be better off dead, or of hurting yourself in some way",
];

const GAD7_QUESTIONS = [
  "Feeling nervous, anxious, or on edge",
  "Not being able to stop or control worrying",
  "Worrying too much about different things",
  "Trouble relaxing",
  "Being so restless that it is hard to sit still",
  "Becoming easily annoyed or irritable",
  "Feeling afraid, as if something awful might happen",
];

const OPTIONS = [
  "Not at all",
  "Several days",
  "More than half the days",
  "Nearly every day",
];

const MOODS = [
  { value: 1, emoji: "😞", label: "Very low" },
  { value: 2, emoji: "😕", label: "Low" },
  { value: 3, emoji: "😐", label: "Okay" },
  { value: 4, emoji: "🙂", label: "Good" },
  { value: 5, emoji: "😄", label: "Great" },
];

async function apiRequest(endpoint, options = {}) {
  const response = await fetch(`${API}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });

  let data;

  try {
    data = await response.json();
  } catch {
    throw new Error("Invalid response from MindSetu server.");
  }

  if (!response.ok) {
    throw new Error(
      data.detail || "Something went wrong."
    );
  }

  return data;
}


// ========================================================
// HEADER
// ========================================================

function Header({ darkMode, setDarkMode }) {
  return (
    <header className="topbar">
      <div className="logo">
        Mind<span>Setu</span>
      </div>

      <div className="topbar-right">
        <div className="topbar-text">
          Student Wellbeing Platform
        </div>

        <button
          className="theme-toggle"
          onClick={() => setDarkMode(!darkMode)}
          aria-label={
            darkMode
              ? "Switch to light mode"
              : "Switch to dark mode"
          }
          title={
            darkMode
              ? "Switch to light mode"
              : "Switch to dark mode"
          }
        >
          {darkMode ? "☀" : "☾"}
        </button>
      </div>
    </header>
  );
}

function Toast({ toast, onClose }) {
  if (!toast) return null;

  return (
    <div className={`toast toast-${toast.type || "info"}`} role="status" aria-live="polite">
      <span className="toast-icon">{toast.type === "error" ? "!" : "✓"}</span>
      <span className="toast-message">{toast.message}</span>
      <button className="toast-close" onClick={onClose} aria-label="Dismiss notification">×</button>
    </div>
  );
}


// ========================================================
// APP
// ========================================================

function App() {
  const [screen, setScreen] = useState("home");

  const [darkMode, setDarkMode] = useState(() => {
    return (
      localStorage.getItem("mindsetu-theme") ===
      "dark"
    );
  });

  useEffect(() => {
    document.documentElement.dataset.theme =
      darkMode ? "dark" : "light";

    localStorage.setItem(
      "mindsetu-theme",
      darkMode ? "dark" : "light"
    );
  }, [darkMode]);

  const [sessionId, setSessionId] = useState(null);

  const [phqAnswers, setPhqAnswers] = useState(
    Array(PHQ9_QUESTIONS.length).fill(null)
  );

  const [gadAnswers, setGadAnswers] = useState(
    Array(GAD7_QUESTIONS.length).fill(null)
  );

  const [phqResult, setPhqResult] = useState(null);
  const [gadResult, setGadResult] = useState(null);
  const [riskResult, setRiskResult] = useState(null);

  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");

  const [selectedMood, setSelectedMood] =
    useState(null);

  const [moodNote, setMoodNote] =
    useState("");

  const [moodHistory, setMoodHistory] =
    useState([]);

  const [counsellors, setCounsellors] =
    useState([]);

  const [
    selectedCounsellor,
    setSelectedCounsellor,
  ] = useState(null);

  const [
    appointmentTime,
    setAppointmentTime,
  ] = useState("");

  const [
    appointments,
    setAppointments,
  ] = useState([]);

  const [
    bookingResult,
    setBookingResult,
  ] = useState(null);

  const [dashboard, setDashboard] =
    useState(null);

  const [moodTrend, setMoodTrend] =
    useState([]);

  const [
    dashboardAssessments,
    setDashboardAssessments,
  ] = useState(null);

  const [loading, setLoading] =
    useState(false);

  const [toast, setToast] = useState(null);

  function notify(message, type = "success") {
    setToast({ message, type });
    window.clearTimeout(window.__mindsetuToastTimer);
    window.__mindsetuToastTimer = window.setTimeout(() => {
      setToast(null);
    }, 3600);
  }


  // ======================================================
  // START SESSION
  // ======================================================

  async function startSession() {
    try {
      setLoading(true);

      const data = await apiRequest(
        "/api/sessions",
        {
          method: "POST",
          body: JSON.stringify({
            consent_given: true,
          }),
        }
      );

      setSessionId(data.session_id);
      setScreen("phq9");
    } catch (error) {
      notify(error.message);
    } finally {
      setLoading(false);
    }
  }


  // ======================================================
  // PHQ-9
  // ======================================================

  async function submitPHQ9() {
    if (
      phqAnswers.some(
        (answer) => answer === null
      )
    ) {
      notify(
        "Please answer every question."
      );
      return;
    }

    try {
      setLoading(true);

      const data = await apiRequest(
        "/api/assessments/phq9",
        {
          method: "POST",
          body: JSON.stringify({
            session_id: sessionId,
            answers: phqAnswers,
          }),
        }
      );

      setPhqResult(data);
      setScreen("gad7");
    } catch (error) {
      notify(error.message);
    } finally {
      setLoading(false);
    }
  }


  // ======================================================
  // GAD-7
  // ======================================================

  async function submitGAD7() {
    if (
      gadAnswers.some(
        (answer) => answer === null
      )
    ) {
      notify(
        "Please answer every question."
      );
      return;
    }

    try {
      setLoading(true);

      const data = await apiRequest(
        "/api/assessments/gad7",
        {
          method: "POST",
          body: JSON.stringify({
            session_id: sessionId,
            answers: gadAnswers,
          }),
        }
      );

      setGadResult(data);
      setScreen("results");
    } catch (error) {
      notify(error.message);
    } finally {
      setLoading(false);
    }
  }


  // ======================================================
  // RISK
  // ======================================================

  async function getRiskResult() {
    try {
      setLoading(true);

      const data = await apiRequest(
        `/api/risk/${sessionId}`,
        {
          method: "POST",
        }
      );

      setRiskResult(data);
      setScreen("support");
    } catch (error) {
      notify(error.message);
    } finally {
      setLoading(false);
    }
  }


  // ======================================================
  // CHAT
  // ======================================================

  async function sendMessage() {
    const message = chatInput.trim();

    if (!message || loading) {
      return;
    }

    setChatMessages((previous) => [
      ...previous,
      {
        sender: "user",
        text: message,
      },
    ]);

    setChatInput("");
    setLoading(true);

    // Create the AI bubble immediately.
    setChatMessages((previous) => [
      ...previous,
      {
        sender: "ai",
        text: "",
        streaming: true,
      },
    ]);

    // Small delay between displayed characters.
    // This makes the streaming visibly progressive even
    // when React/browser/network batching is aggressive.
    const sleep = (milliseconds) =>
      new Promise((resolve) =>
        setTimeout(resolve, milliseconds)
      );

    async function appendStreamText(textToAppend) {
      for (const character of textToAppend) {
        setChatMessages((previous) =>
          previous.map(
            (chatMessage, index) => {
              if (
                index ===
                  previous.length - 1 &&
                chatMessage.sender ===
                  "ai" &&
                chatMessage.streaming
              ) {
                return {
                  ...chatMessage,
                  text:
                    chatMessage.text +
                    character,
                };
              }

              return chatMessage;
            }
          )
        );

        // 14ms gives a fast but clearly visible
        // typewriter/streaming effect.
        await sleep(14);
      }
    }

    try {
      const response = await fetch(
        `${API}/api/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            session_id: sessionId,
            message,
          }),
        }
      );

      if (!response.ok) {
        let detail =
          `AI server returned ${response.status}.`;

        try {
          const errorData =
            await response.json();

          detail =
            errorData.detail ||
            errorData.message ||
            detail;
        } catch {
          // Keep HTTP-status fallback.
        }

        throw new Error(detail);
      }

      if (!response.body) {
        throw new Error(
          "Streaming is not supported by this browser."
        );
      }

      const reader =
        response.body.getReader();

      const decoder =
        new TextDecoder("utf-8");

      let buffer = "";

      while (true) {
        const {
          value,
          done,
        } = await reader.read();

        if (done) {
          break;
        }

        buffer += decoder.decode(
          value,
          { stream: true }
        );

        const lines =
          buffer.split("\n");

        // Preserve a partially received JSON line.
        buffer =
          lines.pop() || "";

        for (const rawLine of lines) {
          const line =
            rawLine.trim();

          if (!line) {
            continue;
          }

          let chunk;

          try {
            chunk =
              JSON.parse(line);
          } catch {
            continue;
          }

          if (
            chunk.type ===
            "token"
          ) {
            const token =
              chunk.content || "";

            if (!token) {
              continue;
            }

            // IMPORTANT:
            // Don't immediately call setState with the
            // whole token. Display it character-by-character
            // so the user can actually see the stream.
            await appendStreamText(
              token
            );
          }

          if (
            chunk.type ===
            "error"
          ) {
            throw new Error(
              chunk.message ||
                "MindSetu AI returned an error."
            );
          }

          if (
            chunk.type ===
            "done"
          ) {
            setChatMessages(
              (previous) =>
                previous.map(
                  (
                    chatMessage,
                    index
                  ) => {
                    if (
                      index ===
                        previous.length - 1 &&
                      chatMessage.sender ===
                        "ai"
                    ) {
                      return {
                        ...chatMessage,
                        streaming: false,
                      };
                    }

                    return chatMessage;
                  }
                )
            );
          }
        }
      }

      // Flush decoder remainder.
      buffer += decoder.decode();

      if (buffer.trim()) {
        try {
          const chunk =
            JSON.parse(
              buffer.trim()
            );

          if (
            chunk.type ===
              "token" &&
            chunk.content
          ) {
            await appendStreamText(
              chunk.content
            );
          }
        } catch {
          // Ignore incomplete final JSON.
        }
      }

      // If the backend closed without sending "done",
      // still remove the cursor.
      setChatMessages(
        (previous) =>
          previous.map(
            (
              chatMessage,
              index
            ) => {
              if (
                index ===
                  previous.length - 1 &&
                chatMessage.sender ===
                  "ai"
              ) {
                return {
                  ...chatMessage,
                  streaming: false,
                };
              }

              return chatMessage;
            }
          )
      );

    } catch (error) {
      setChatMessages(
        (previous) =>
          previous.map(
            (
              chatMessage,
              index
            ) => {
              if (
                index ===
                  previous.length - 1 &&
                chatMessage.sender ===
                  "ai"
              ) {
                return {
                  sender: "ai",
                  text:
                    `Unable to connect to MindSetu AI: ${error.message}`,
                  streaming: false,
                };
              }

              return chatMessage;
            }
          )
      );

    } finally {
      setLoading(false);
    }
  }


  // ======================================================
  // MOOD
  // ======================================================

  async function saveMood() {
    if (!selectedMood) {
      notify("Please select your mood.");
      return;
    }

    if (!sessionId) {
      notify(
        "No active MindSetu session."
      );
      return;
    }

    try {
      setLoading(true);

      await apiRequest(
        "/api/mood",
        {
          method: "POST",
          body: JSON.stringify({
            session_id: sessionId,
            mood: selectedMood,
            note:
              moodNote.trim() || null,
          }),
        }
      );

      setMoodNote("");
      setSelectedMood(null);

      await loadMoodHistory();

      notify(
        "Mood saved successfully."
      );
    } catch (error) {
      notify(error.message);
    } finally {
      setLoading(false);
    }
  }


  async function loadMoodHistory() {
    if (!sessionId) {
      return;
    }

    try {
      const data = await apiRequest(
        `/api/mood/${sessionId}`
      );

      setMoodHistory(
        data.entries || []
      );
    } catch (error) {
      console.error(error);
    }
  }


  // ======================================================
  // COUNSELLORS
  // ======================================================

  async function openCounsellors() {
    try {
      setLoading(true);

      const data = await apiRequest(
        "/api/counsellors"
      );

      setCounsellors(
        data.counsellors || []
      );

      setSelectedCounsellor(null);
      setBookingResult(null);

      await loadAppointments();

      setScreen("counsellors");
    } catch (error) {
      notify(error.message);
    } finally {
      setLoading(false);
    }
  }


  // ======================================================
  // APPOINTMENTS
  // ======================================================

  async function loadAppointments() {
    if (!sessionId) {
      return;
    }

    try {
      const data = await apiRequest(
        `/api/appointments/${sessionId}`
      );

      setAppointments(
        data.appointments || []
      );
    } catch (error) {
      console.error(error);
    }
  }


  async function bookAppointment() {
    if (!selectedCounsellor) {
      notify(
        "Please choose a counsellor."
      );
      return;
    }

    if (!appointmentTime) {
      notify(
        "Please choose a date and time."
      );
      return;
    }

    try {
      setLoading(true);

      const isoTime = new Date(
        appointmentTime
      ).toISOString();

      const data = await apiRequest(
        "/api/appointments",
        {
          method: "POST",
          body: JSON.stringify({
            session_id: sessionId,
            counsellor_id:
              selectedCounsellor.id,
            appointment_time:
              isoTime,
          }),
        }
      );

      setBookingResult(data);
      setAppointmentTime("");

      await loadAppointments();
    } catch (error) {
      notify(error.message);
    } finally {
      setLoading(false);
    }
  }


  // ======================================================
  // DASHBOARD
  // ======================================================

  async function openDashboard() {
    try {
      setLoading(true);

      const [
        overview,
        trend,
        assessments,
      ] = await Promise.all([
        apiRequest(
          "/api/dashboard/overview"
        ),
        apiRequest(
          "/api/dashboard/mood-trend"
        ),
        apiRequest(
          "/api/dashboard/assessments"
        ),
      ]);

      setDashboard(overview);

      setMoodTrend(
        trend.trend || []
      );

      setDashboardAssessments(
        assessments.assessments ||
          null
      );

      setScreen("dashboard");
    } catch (error) {
      notify(error.message);
    } finally {
      setLoading(false);
    }
  }


  // ======================================================
  // HOME
  // ======================================================

  if (screen === "home") {
    return (
      <div className="mindsetu-app">
        <Toast toast={toast} onClose={() => setToast(null)} />
        <Header darkMode={darkMode} setDarkMode={setDarkMode} />

        <main className="hero hero-enhanced">
          <div className="hero-content">
            <div className="badge">CONFIDENTIAL • STUDENT SUPPORT</div>

            <h1>
              A safer space
              <br />
              <span className="hero-highlight">to start.</span>
            </h1>

            <p>
              MindSetu helps students understand their wellbeing,
              access personalised support, and find the right pathway
              when they need additional help.
            </p>

            <div className="hero-actions">
              <button className="primary-button hero-primary" onClick={startSession} disabled={loading}>
                {loading ? "Starting..." : "Start anonymously →"}
              </button>

              <button
                className="secondary-button dashboard-home-button"
                onClick={openDashboard}
                disabled={loading}
              >
                Institutional Dashboard
              </button>
            </div>

            <div className="privacy-note">
              <span className="privacy-dot">✓</span>
              Anonymous by default · No personal profile required
            </div>

            <div className="hero-trust-row">
              <span>🔒 Private session</span>
              <span>•</span>
              <span>🧠 Screening + support</span>
              <span>•</span>
              <span>🤝 Human support when needed</span>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-card hero-card-modern">
              <div className="hero-card-top">
                <div>
                  <span className="label">MINDSETU CHECK-IN</span>
                  <h3>How are you feeling today?</h3>
                </div>
                <div className="hero-status">● Private</div>
              </div>

              <div className="mini-mood-row" aria-hidden="true">
                {MOODS.map((mood) => (
                  <div className="mini-mood" key={mood.value}>
                    <span>{mood.emoji}</span>
                    <small>{mood.label}</small>
                  </div>
                ))}
              </div>

              <div className="hero-preview-card">
                <div className="ai-icon small">✦</div>
                <div>
                  <strong>MindSetu Companion</strong>
                  <p>A calm place to talk through what's on your mind.</p>
                </div>
              </div>

              <div className="hero-flow">
                {[
                  ["01", "Check in", "Start privately"],
                  ["02", "Understand", "Screen wellbeing"],
                  ["03", "Support", "Choose your next step"],
                ].map(([number, title, text]) => (
                  <div className="hero-flow-item" key={number}>
                    <span>{number}</span>
                    <div>
                      <strong>{title}</strong>
                      <small>{text}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="hero-floating-card">
              <span className="floating-check">✓</span>
              <div>
                <strong>Your wellbeing matters.</strong>
                <small>Take the first step at your own pace.</small>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }


  // ======================================================
  // PHQ-9
  // ======================================================

  if (screen === "phq9") {
    return (
      <AssessmentScreen
        title="PHQ-9"
        subtitle="Depression wellbeing screening"
        questions={PHQ9_QUESTIONS}
        answers={phqAnswers}
        setAnswers={setPhqAnswers}
        onSubmit={submitPHQ9}
        loading={loading}
        step={1}
        totalSteps={4}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        toast={toast}
        onToastClose={() => setToast(null)}
      />
    );
  }


  // ======================================================
  // GAD-7
  // ======================================================

  if (screen === "gad7") {
    return (
      <AssessmentScreen
        title="GAD-7"
        subtitle="Anxiety wellbeing screening"
        questions={GAD7_QUESTIONS}
        answers={gadAnswers}
        setAnswers={setGadAnswers}
        onSubmit={submitGAD7}
        loading={loading}
        step={2}
        totalSteps={4}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        toast={toast}
        onToastClose={() => setToast(null)}
      />
    );
  }


  // ======================================================
  // RESULTS
  // ======================================================

  if (screen === "results") {
    return (
      <div className="mindsetu-app">
        <Toast toast={toast} onClose={() => setToast(null)} />
        <Header darkMode={darkMode} setDarkMode={setDarkMode} />

        <main className="page results-page">
          <div className="results-intro">
            <div className="success-icon">✓</div>
            <div className="badge">SCREENING COMPLETE</div>
            <h1>Your wellbeing snapshot</h1>
            <p>
              Your responses have been recorded in your anonymous MindSetu
              session. Here's a simple view of what your screening suggests.
            </p>
          </div>

          <div className="score-grid score-grid-enhanced">
            <div className="score-box score-box-large">
              <span>PHQ-9</span>
              <strong>{phqResult?.score}</strong>
              <small>{phqResult?.severity}</small>
              <div className="score-caption">Depression symptoms</div>
            </div>
            <div className="score-box score-box-large">
              <span>GAD-7</span>
              <strong>{gadResult?.score}</strong>
              <small>{gadResult?.severity}</small>
              <div className="score-caption">Anxiety symptoms</div>
            </div>
          </div>

          <div className="results-explanation">
            <div className="label">WHAT THIS MEANS</div>
            <h2>A starting point, not a diagnosis.</h2>
            <p>
              Screening can help you notice patterns that may deserve attention.
              You can choose what kind of support feels right for you next.
            </p>
          </div>

          <div className="results-next">
            <div>
              <div className="label">NEXT STEP</div>
              <h2>What would help right now?</h2>
              <p>Choose a path that matches what you need today.</p>
            </div>
            <button className="primary-button" onClick={getRiskResult} disabled={loading}>
              {loading ? "Preparing support..." : "Build my support pathway →"}
            </button>
          </div>

          <p className="disclaimer results-disclaimer">
            These screening results are not a diagnosis and should not replace
            professional mental-health care.
          </p>
        </main>
      </div>
    );
  }


  // ======================================================
  // SUPPORT
  // ======================================================

  // ======================================================
  // SUPPORT
  // ======================================================

  if (screen === "support") {
    const supportActions = [
      {
        icon: "✦",
        title: "Talk to MindSetu",
        text: "A private space to talk through what's happening.",
        action: () => setScreen("chat"),
        primary: true,
      },
      {
        icon: "🌱",
        title: "Track my wellbeing",
        text: "Record your mood and notice patterns over time.",
        action: () => {
          loadMoodHistory();
          setScreen("mood");
        },
      },
      {
        icon: "👥",
        title: "Find human support",
        text: "Explore available counsellors when you want additional support.",
        action: openCounsellors,
      },
    ];

    return (
      <div className="mindsetu-app">
        <Toast toast={toast} onClose={() => setToast(null)} />
        <Header darkMode={darkMode} setDarkMode={setDarkMode} />

        <main className="page support-page">
          <div className="page-heading support-heading">
            <div className="badge">YOUR SUPPORT PATHWAY</div>
            <h1>Let's take the<br />next step together.</h1>
            <p>
              Based on your screening, MindSetu has prepared a few support
              options. You stay in control of what you choose.
            </p>
          </div>

          <div className="support-summary">
            <div>
              <span className="label">SUPPORT PATHWAY</span>
              <strong>{riskResult?.support_path || "Personalised support"}</strong>
            </div>
            <div className="support-risk">
              <span className="label">SCREENING SIGNAL</span>
              <strong>{riskResult?.risk_level || "Available"}</strong>
            </div>
            <div className="support-scores">
              <span><b>PHQ-9</b> {riskResult?.phq9_score}</span>
              <span><b>GAD-7</b> {riskResult?.gad7_score}</span>
            </div>
          </div>

          <div className="support-section-title">
            <div>
              <div className="label">CHOOSE WHAT FEELS RIGHT</div>
              <h2>What would help right now?</h2>
            </div>
            <span className="support-note">You can change your mind anytime.</span>
          </div>

          <div className="support-action-grid">
            {supportActions.map((item) => (
              <button
                key={item.title}
                className={`support-action-card ${item.primary ? "primary-action" : ""}`}
                onClick={item.action}
              >
                <span className="support-action-icon">{item.icon}</span>
                <span className="support-action-copy">
                  <strong>{item.title}</strong>
                  <span>{item.text}</span>
                </span>
                <span className="support-action-arrow">→</span>
              </button>
            ))}
          </div>

          <div className="support-safety-card">
            <span className="support-safety-icon">🔒</span>
            <div>
              <strong>Your choices stay yours.</strong>
              <p>
                MindSetu is a wellbeing-support tool. If you feel you may be
                in immediate danger or need urgent help, seek local emergency
                or professional support.
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }


  // ======================================================
  // COUNSELLORS
  // ======================================================

  // ======================================================
  // COUNSELLORS
  // ======================================================

  if (screen === "counsellors") {
    return (
      <div className="mindsetu-app">
        <Toast toast={toast} onClose={() => setToast(null)} />
        <Header
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />

        <main className="page">

          <div className="page-heading">

            <div className="badge">
              PROFESSIONAL SUPPORT
            </div>

            <h1>
              Find the right
              <br />
              support for you.
            </h1>

            <p>
              Choose an available counsellor and
              request an appointment.
            </p>

          </div>

          {bookingResult && (
            <div className="booking-success">

              <div className="success-icon">
                ✓
              </div>

              <h2>
                Appointment booked.
              </h2>

              <p>
                Your appointment with{" "}
                <strong>
                  {bookingResult.counsellor_name}
                </strong>{" "}
                has been booked successfully.
              </p>

              <p>
                <strong>
                  {new Date(
                    bookingResult.appointment_time
                  ).toLocaleString()}
                </strong>
              </p>

            </div>
          )}

          <div className="counsellor-grid">

            {counsellors.map(
              (counsellor) => (
                <button
                  key={counsellor.id}
                  className={
                    selectedCounsellor?.id ===
                    counsellor.id
                      ? "counsellor-card active"
                      : "counsellor-card"
                  }
                  onClick={() =>
                    setSelectedCounsellor(
                      counsellor
                    )
                  }
                >

                  <div className="counsellor-avatar">
                    {counsellor.name
                      .replace("Dr. ", "")
                      .charAt(0)}
                  </div>

                  <div className="counsellor-info">

                    <h3>
                      {counsellor.name}
                    </h3>

                    <p>
                      {counsellor.specialization}
                    </p>

                    <span
                      className={
                        counsellor.available
                          ? "availability available"
                          : "availability"
                      }
                    >
                      {counsellor.available
                        ? "● Available"
                        : "● Unavailable"}
                    </span>

                  </div>

                </button>
              )
            )}

          </div>

          {selectedCounsellor && (
            <div className="appointment-card">

              <div>

                <span className="label">
                  SELECTED COUNSELLOR
                </span>

                <h2>
                  {selectedCounsellor.name}
                </h2>

                <p>
                  {selectedCounsellor.specialization}
                </p>

              </div>

              <div className="appointment-form">

                <label htmlFor="appointment-time">
                  Choose date and time
                </label>

                <input
                  id="appointment-time"
                  type="datetime-local"
                  value={appointmentTime}
                  min={
                    new Date()
                      .toISOString()
                      .slice(0, 16)
                  }
                  onChange={(event) =>
                    setAppointmentTime(
                      event.target.value
                    )
                  }
                />

                <button
                  className="primary-button"
                  onClick={bookAppointment}
                  disabled={loading}
                >
                  {loading
                    ? "Booking..."
                    : "Book appointment →"}
                </button>

              </div>

            </div>
          )}

          <div className="appointments-section">

            <div className="history-heading">

              <div>

                <div className="label">
                  YOUR SUPPORT
                </div>

                <h2>
                  Your appointments
                </h2>

              </div>

              <button
                className="secondary-button"
                onClick={loadAppointments}
              >
                Refresh
              </button>

            </div>

            {appointments.length === 0 ? (
              <p className="muted">
                You have no appointments yet.
              </p>
            ) : (
              <div className="history-list">

                {appointments.map(
                  (appointment) => (
                    <div
                      className="history-item"
                      key={
                        appointment.appointment_id
                      }
                    >

                      <div className="history-mood">
                        📅
                      </div>

                      <div>

                        <strong>
                          {
                            appointment.counsellor_name
                          }
                        </strong>

                        <p>
                          {
                            appointment.specialization
                          }
                        </p>

                        <small>
                          {new Date(
                            appointment.appointment_time
                          ).toLocaleString()}
                          {" • "}
                          {appointment.status}
                        </small>

                      </div>

                    </div>
                  )
                )}

              </div>
            )}

          </div>

          <button
            className="secondary-button"
            onClick={() =>
              setScreen("support")
            }
          >
            ← Back to support
          </button>

        </main>
      </div>
    );
  }


  // ======================================================
  // MOOD
  // ======================================================

  if (screen === "mood") {
    return (
      <div className="mindsetu-app">
        <Toast toast={toast} onClose={() => setToast(null)} />
        <Header
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />

        <main className="page">

          <div className="page-heading">

            <div className="badge">
              WELLBEING TRACKER
            </div>

            <h1>
              How are you
              <br />
              feeling today?
            </h1>

            <p>
              Recording your mood can help you
              notice patterns in your wellbeing
              over time.
            </p>

          </div>

          <div className="mood-grid">

            {MOODS.map((mood) => (
              <button
                key={mood.value}
                className={
                  selectedMood ===
                  mood.value
                    ? "mood-card active"
                    : "mood-card"
                }
                onClick={() =>
                  setSelectedMood(
                    mood.value
                  )
                }
              >

                <span className="mood-emoji">
                  {mood.emoji}
                </span>

                <strong>
                  {mood.label}
                </strong>

                <span>
                  {mood.value}/5
                </span>

              </button>
            ))}

          </div>

          <div className="mood-note-card">

            <div className="label">OPTIONAL REFLECTION</div>
            <h3>
              What's influencing your mood?
            </h3>

            <textarea
              value={moodNote}
              onChange={(event) =>
                setMoodNote(
                  event.target.value
                )
              }
              placeholder="What's affecting your mood today?"
              rows={4}
            />

            <div className="mood-actions">

              <button
                className="secondary-button"
                onClick={() =>
                  setScreen("support")
                }
              >
                ← Back
              </button>

              <button
                className="primary-button"
                onClick={saveMood}
                disabled={loading}
              >
                {loading
                  ? "Saving..."
                  : "Save today's mood"}
              </button>

            </div>

          </div>

          <div className="history-card">

            <div className="history-heading">

              <div>

                <div className="label">
                  YOUR HISTORY
                </div>

                <h2>
                  Recent mood entries
                </h2>

              </div>

              <button
                className="secondary-button"
                onClick={loadMoodHistory}
              >
                Refresh
              </button>

            </div>

            {moodHistory.length === 0 ? (
              <p className="muted">
                No mood entries yet.
              </p>
            ) : (
              <div className="history-list">

                {moodHistory.map(
                  (entry, index) => {

                    const mood =
                      MOODS.find(
                        (item) =>
                          item.value ===
                          entry.mood
                      );

                    return (
                      <div
                        className="history-item"
                        key={index}
                      >

                        <div className="history-mood">
                          {mood?.emoji}
                        </div>

                        <div>

                          <strong>
                            {mood?.label}
                          </strong>

                          {entry.note && (
                            <p>
                              {entry.note}
                            </p>
                          )}

                          <small>
                            {new Date(
                              entry.created_at
                            ).toLocaleString()}
                          </small>

                        </div>

                      </div>
                    );
                  }
                )}

              </div>
            )}

          </div>

        </main>
      </div>
    );
  }


  // ======================================================
  // CHAT
  // ======================================================

  if (screen === "chat") {
    return (
      <div className="mindsetu-app">
        <Toast toast={toast} onClose={() => setToast(null)} />
        <Header
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />

        <main className="chat-page">

          <div className="chat-header">

            <div>

              <div className="badge">
                MINDSETU COMPANION
              </div>

              <h1>
                What's on your mind?
              </h1>

            </div>

            <button
              className="secondary-button"
              onClick={() =>
                setScreen("support")
              }
            >
              ← Back
            </button>

          </div>

          <div className="chat-container">

            {chatMessages.length === 0 && (
              <div className="welcome-message">

                <div className="ai-icon">
                  ✦
                </div>

                <h2>
                  I'm here to listen.
                </h2>

                <p>
                  Tell me about what's been happening. You can start with
                  something simple — there's no need to find the perfect words.
                </p>

                <div className="chat-prompts">
                  {[
                    ["🎓", "I'm stressed about college"],
                    ["😰", "I'm feeling anxious"],
                    ["😴", "My sleep has been difficult"],
                    ["💬", "I just want to talk"],
                  ].map(([icon, prompt]) => (
                    <button
                      key={prompt}
                      className="chat-prompt"
                      onClick={() => {
                        setChatInput(prompt);
                        window.setTimeout(() => {
                          const sendButton = document.querySelector(".chat-send-button");
                          sendButton?.click();
                        }, 0);
                      }}
                    >
                      <span>{icon}</span>
                      {prompt}
                    </button>
                  ))}
                </div>

              </div>
            )}

            <div className="messages">

              {chatMessages.map(
                (message, index) => (
                  <div
                    key={index}
                    className={`message ${
                      message.sender === "user"
                        ? "user-message"
                        : `ai-message${
                            message.streaming
                              ? " streaming"
                              : ""
                          }`
                    }`}
                  >
                    {message.sender === "ai" && <span className="message-avatar">✦</span>}
                    <span>{message.text}</span>
                  </div>
                )
              )}

            </div>

            <div className="chat-input-area">

              <input
                value={chatInput}
                onChange={(event) =>
                  setChatInput(
                    event.target.value
                  )
                }
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" &&
                    !event.shiftKey
                  ) {
                    event.preventDefault();
                    sendMessage();
                  }
                }}
                maxLength={2000}
                placeholder="Tell me what's been going on..."
                disabled={loading}
              />

              <button
                className="primary-button chat-send-button"
                onClick={sendMessage}
                disabled={loading}
              >
                {loading ? "Sending..." : "Send →"}
              </button>

            </div>

            <p className="chat-disclaimer">
              MindSetu is a wellbeing-support
              prototype and not a substitute for
              professional mental-health care.
            </p>

          </div>

        </main>
      </div>
    );
  }


  // ======================================================
  // INSTITUTIONAL DASHBOARD
  // ======================================================

  if (screen === "dashboard") {

    const risk =
      dashboard?.risk_distribution ||
      {};

    const totalRisk =
      (risk.minimal || 0) +
      (risk.mild || 0) +
      (risk.moderate || 0) +
      (risk.moderately_severe || 0) +
      (risk.severe || 0);

    return (
      <div className="mindsetu-app">
        <Toast toast={toast} onClose={() => setToast(null)} />
        <Header
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />

        <main className="page dashboard-page">

          <div className="dashboard-header">

            <div>

              <div className="badge">
                INSTITUTIONAL VIEW
              </div>

              <h1>
                MindSetu
                <br />
                Wellbeing Dashboard
              </h1>

              <p>
                Aggregate wellbeing insights for
                institutional support planning.
              </p>

            </div>

            <div className="dashboard-actions">

              <button
                className="secondary-button"
                onClick={openDashboard}
                disabled={loading}
              >
                {loading
                  ? "Refreshing..."
                  : "Refresh"}
              </button>

              <button
                className="secondary-button"
                onClick={() =>
                  setScreen("home")
                }
              >
                ← Student view
              </button>

            </div>

          </div>

          <div className="privacy-banner">

            <span>
              🔒
            </span>

            <div>

              <strong>
                Privacy protected
              </strong>

              <p>
                This dashboard displays aggregate
                information only. Student names and
                individual profiles are not exposed.
              </p>

            </div>

          </div>

          {!dashboard ? (

            <div className="loading-card">
              Loading dashboard...
            </div>

          ) : (

            <>

              <div className="dashboard-stat-grid">

                <DashboardStat
                  label="Anonymous Sessions"
                  value={
                    dashboard.sessions
                      ?.total_anonymous_sessions ??
                    0
                  }
                  icon="👤"
                />

                <DashboardStat
                  label="PHQ-9 Assessments"
                  value={
                    dashboard.assessments
                      ?.phq9 ?? 0
                  }
                  icon="🧠"
                />

                <DashboardStat
                  label="GAD-7 Assessments"
                  value={
                    dashboard.assessments
                      ?.gad7 ?? 0
                  }
                  icon="💭"
                />

                <DashboardStat
                  label="Average Mood"
                  value={
                    dashboard.mood
                      ?.average_mood ?? 0
                  }
                  icon="🌱"
                />

                <DashboardStat
                  label="Appointments"
                  value={
                    dashboard.appointments
                      ?.total ?? 0
                  }
                  icon="📅"
                />

                <DashboardStat
                  label="Available Counsellors"
                  value={
                    dashboard.counsellors
                      ?.available ?? 0
                  }
                  icon="👥"
                />

              </div>


              <div className="dashboard-two-column">

                <div className="dashboard-card">

                  <div className="dashboard-card-heading">

                    <div>

                      <div className="label">
                        SCREENING INSIGHTS
                      </div>

                      <h2>
                        Risk distribution
                      </h2>

                    </div>

                    <span className="dashboard-total">
                      {totalRisk} assessments
                    </span>

                  </div>

                  <RiskBar
                    label="Minimal"
                    value={
                      risk.minimal || 0
                    }
                    total={totalRisk}
                  />

                  <RiskBar
                    label="Mild"
                    value={
                      risk.mild || 0
                    }
                    total={totalRisk}
                  />

                  <RiskBar
                    label="Moderate"
                    value={
                      risk.moderate || 0
                    }
                    total={totalRisk}
                  />

                  <RiskBar
                    label="Moderately severe"
                    value={
                      risk.moderately_severe ||
                      0
                    }
                    total={totalRisk}
                  />

                  <RiskBar
                    label="Severe"
                    value={
                      risk.severe || 0
                    }
                    total={totalRisk}
                  />

                </div>


                <div className="dashboard-card">

                  <div className="dashboard-card-heading">

                    <div>

                      <div className="label">
                        SUPPORT ACTIVITY
                      </div>

                      <h2>
                        Appointments
                      </h2>

                    </div>

                  </div>

                  <div className="appointment-stat">
                    <span>
                      Total appointments
                    </span>

                    <strong>
                      {
                        dashboard
                          .appointments
                          ?.total ?? 0
                      }
                    </strong>
                  </div>

                  <div className="appointment-stat">
                    <span>
                      Booked
                    </span>

                    <strong>
                      {
                        dashboard
                          .appointments
                          ?.booked ?? 0
                      }
                    </strong>
                  </div>

                  <div className="appointment-stat">
                    <span>
                      Available counsellors
                    </span>

                    <strong>
                      {
                        dashboard
                          .counsellors
                          ?.available ?? 0
                      }
                    </strong>
                  </div>

                </div>

              </div>


              <div className="dashboard-card">

                <div className="dashboard-card-heading">

                  <div>

                    <div className="label">
                      WELLBEING TREND
                    </div>

                    <h2>
                      Average mood over time
                    </h2>

                  </div>

                  <span className="dashboard-total">
                    1–5 scale
                  </span>

                </div>

                {moodTrend.length === 0 ? (

                  <div className="empty-dashboard">
                    No mood data available yet.
                  </div>

                ) : (

                  <div className="trend-list">

                    {moodTrend.map(
                      (item) => (
                        <div
                          className="trend-row"
                          key={item.date}
                        >

                          <span>
                            {new Date(
                              item.date
                            ).toLocaleDateString()}
                          </span>

                          <div className="trend-bar">

                            <div
                              style={{
                                width: `${
                                  (item.average_mood /
                                    5) *
                                  100
                                }%`,
                              }}
                            />

                          </div>

                          <strong>
                            {item.average_mood}
                          </strong>

                        </div>
                      )
                    )}

                  </div>
                )}

              </div>


              <div className="dashboard-card">

                <div className="dashboard-card-heading">

                  <div>

                    <div className="label">
                      ASSESSMENT BREAKDOWN
                    </div>

                    <h2>
                      Screening severity
                    </h2>

                  </div>

                </div>

                <div className="assessment-breakdown">

                  <AssessmentBreakdown
                    title="PHQ-9"
                    data={
                      dashboardAssessments?.[
                        "PHQ-9"
                      ] || {}
                    }
                  />

                  <AssessmentBreakdown
                    title="GAD-7"
                    data={
                      dashboardAssessments?.[
                        "GAD-7"
                      ] || {}
                    }
                  />

                </div>

              </div>

            </>
          )}

        </main>
      </div>
    );
  }

  return null;
}


// ========================================================
// DASHBOARD STAT
// ========================================================

function DashboardStat({
  label,
  value,
  icon,
}) {
  return (
    <div className="dashboard-stat">

      <div className="dashboard-stat-icon">
        {icon}
      </div>

      <div>

        <span>
          {label}
        </span>

        <strong>
          {value}
        </strong>

      </div>

    </div>
  );
}


// ========================================================
// RISK BAR
// ========================================================

function RiskBar({
  label,
  value,
  total,
}) {
  const percentage =
    total > 0
      ? (value / total) * 100
      : 0;

  return (
    <div className="risk-bar-row">

      <div className="risk-bar-label">

        <span>
          {label}
        </span>

        <strong>
          {value}
        </strong>

      </div>

      <div className="risk-bar">

        <div
          style={{
            width: `${percentage}%`,
          }}
        />

      </div>

    </div>
  );
}


// ========================================================
// ASSESSMENT BREAKDOWN
// ========================================================

function AssessmentBreakdown({
  title,
  data,
}) {
  const total =
    Object.values(data).reduce(
      (sum, value) =>
        sum + value,
      0
    );

  return (
    <div className="assessment-breakdown-card">

      <h3>
        {title}
      </h3>

      <strong className="assessment-total">
        {total}
      </strong>

      <div className="assessment-lines">

        {Object.entries(data).map(
          ([severity, count]) => (
            <div
              className="assessment-line"
              key={severity}
            >

              <span>
                {severity}
              </span>

              <strong>
                {count}
              </strong>

            </div>
          )
        )}

      </div>

    </div>
  );
}


// ========================================================
// ASSESSMENT SCREEN
// ========================================================

function AssessmentScreen({
  title,
  subtitle,
  questions,
  answers,
  setAnswers,
  onSubmit,
  loading,
  step,
  totalSteps,
  darkMode,
  setDarkMode,
  toast,
  onToastClose,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Reset the wizard when switching between PHQ-9 and GAD-7.
  // AssessmentScreen is reused for both screens, so React preserves
  // its local state unless we explicitly reset the question index.
  useEffect(() => {
    setCurrentIndex(0);
  }, [questions]);

  const currentQuestion = questions[currentIndex];
  const selectedAnswer = answers[currentIndex];
  const answered = answers.filter((answer) => answer !== null).length;
  const isLastQuestion = currentIndex === questions.length - 1;

  function selectAnswer(value) {
    const updated = [...answers];
    updated[currentIndex] = value;
    setAnswers(updated);
  }

  function continueAssessment() {
    if (selectedAnswer === null || selectedAnswer === undefined) {
      return;
    }

    if (isLastQuestion) {
      onSubmit();
      return;
    }

    setCurrentIndex((index) => index + 1);
  }

  function goBack() {
    if (currentIndex > 0) {
      setCurrentIndex((index) => index - 1);
    }
  }

  return (
    <div className="mindsetu-app">
      <Toast toast={toast} onClose={onToastClose} />
      <Header darkMode={darkMode} setDarkMode={setDarkMode} />

      <main className="assessment-page assessment-wizard-page">
        <div className="assessment-top">
          <div>
            <div className="badge">STEP {step} OF {totalSteps}</div>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>

          <div className="progress-info">
            <strong>{currentIndex + 1}</strong>/{questions.length}
            <span>questions</span>
          </div>
        </div>

        <div className="progress-bar" aria-label={`Question ${currentIndex + 1} of ${questions.length}`}>
          <div style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} />
        </div>

        <div className="assessment-wizard-card">
          <div className="wizard-question-meta">
            <span>QUESTION {String(currentIndex + 1).padStart(2, "0")}</span>
            {selectedAnswer !== null && selectedAnswer !== undefined && (
              <span className="wizard-answered">✓ Answer selected</span>
            )}
          </div>

          <h2>{currentQuestion}</h2>
          <p className="wizard-helper">
            Over the last 2 weeks, how often have you been bothered by this?
          </p>

          <div className="wizard-answer-options" role="radiogroup" aria-label={currentQuestion}>
            {OPTIONS.map((option, value) => (
              <button
                key={value}
                type="button"
                className={`wizard-answer ${selectedAnswer === value ? "active" : ""}`}
                onClick={() => selectAnswer(value)}
                aria-pressed={selectedAnswer === value}
              >
                <span className="wizard-answer-index">{value + 1}</span>
                <span>{option}</span>
                {selectedAnswer === value && <span className="wizard-check">✓</span>}
              </button>
            ))}
          </div>
        </div>

        <div className="assessment-wizard-footer">
          <div>
            <p>Your responses are stored under your anonymous session.</p>
            <span>{answered} of {questions.length} answered</span>
          </div>

          <div className="wizard-navigation">
            <button
              className="secondary-button"
              onClick={goBack}
              disabled={currentIndex === 0 || loading}
            >
              ← Back
            </button>
            <button
              className="primary-button"
              onClick={continueAssessment}
              disabled={selectedAnswer === null || selectedAnswer === undefined || loading}
            >
              {loading ? "Saving..." : isLastQuestion ? "Complete screening →" : "Continue →"}
            </button>
          </div>
        </div>

        <div className="assessment-trust">
          <span>🔒 Anonymous session</span>
          <span>•</span>
          <span>No diagnosis is made from this screening</span>
        </div>
      </main>
    </div>
  );
}

export default App;
