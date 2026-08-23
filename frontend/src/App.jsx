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
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  let data;
  try { data = await response.json(); }
  catch { throw new Error("Invalid response from MindSetu server."); }
  if (!response.ok) throw new Error(data.detail || "Something went wrong.");
  return data;
}

function Header({ darkMode, setDarkMode }) {
  return (
    <header className="topbar">
      <div className="logo">Mind<span>Setu</span></div>
      <div className="topbar-right">
        <div className="topbar-text">Student Wellbeing Platform</div>
        <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)} aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"} title={darkMode ? "Switch to light mode" : "Switch to dark mode"}>
          {darkMode ? "☀" : "☾"}
        </button>
      </div>
    </header>
  );
}

function App() {
  const [screen, setScreen] = useState("home");
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("mindsetu-theme") === "dark");
  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? "dark" : "light";
    localStorage.setItem("mindsetu-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const [sessionId, setSessionId] = useState(null);
  const [phqAnswers, setPhqAnswers] = useState(Array(PHQ9_QUESTIONS.length).fill(null));
  const [gadAnswers, setGadAnswers] = useState(Array(GAD7_QUESTIONS.length).fill(null));
  const [phqResult, setPhqResult] = useState(null);
  const [gadResult, setGadResult] = useState(null);
  const [riskResult, setRiskResult] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [selectedMood, setSelectedMood] = useState(null);
  const [moodNote, setMoodNote] = useState("");
  const [moodHistory, setMoodHistory] = useState([]);
  const [counsellors, setCounsellors] = useState([]);
  const [selectedCounsellor, setSelectedCounsellor] = useState(null);
  const [appointmentTime, setAppointmentTime] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [bookingResult, setBookingResult] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [moodTrend, setMoodTrend] = useState([]);
  const [dashboardAssessments, setDashboardAssessments] = useState(null);
  const [loading, setLoading] = useState(false);

  async function startSession() {
    try { setLoading(true); const data = await apiRequest("/api/sessions", { method: "POST", body: JSON.stringify({ consent_given: true }) }); setSessionId(data.session_id); setScreen("phq9"); }
    catch (error) { alert(error.message); } finally { setLoading(false); }
  }

  async function submitPHQ9() {
    if (phqAnswers.some((answer) => answer === null)) { alert("Please answer every question."); return; }
    try { setLoading(true); const data = await apiRequest("/api/assessments/phq9", { method: "POST", body: JSON.stringify({ session_id: sessionId, answers: phqAnswers }) }); setPhqResult(data); setScreen("gad7"); }
    catch (error) { alert(error.message); } finally { setLoading(false); }
  }

  async function submitGAD7() {
    if (gadAnswers.some((answer) => answer === null)) { alert("Please answer every question."); return; }
    try { setLoading(true); const data = await apiRequest("/api/assessments/gad7", { method: "POST", body: JSON.stringify({ session_id: sessionId, answers: gadAnswers }) }); setGadResult(data); setScreen("results"); }
    catch (error) { alert(error.message); } finally { setLoading(false); }
  }

  async function getRiskResult() {
    try { setLoading(true); const data = await apiRequest(`/api/risk/${sessionId}`, { method: "POST" }); setRiskResult(data); setScreen("support"); }
    catch (error) { alert(error.message); } finally { setLoading(false); }
  }

  async function sendMessage() {
    const message = chatInput.trim();
    if (!message || loading) return;
    setChatMessages((previous) => [...previous, { sender: "user", text: message }, { sender: "ai", text: "", streaming: true }]);
    setChatInput(""); setLoading(true);
    const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
    async function appendStreamText(textToAppend) {
      for (const character of textToAppend) {
        setChatMessages((previous) => previous.map((chatMessage, index) => index === previous.length - 1 && chatMessage.sender === "ai" && chatMessage.streaming ? { ...chatMessage, text: chatMessage.text + character } : chatMessage));
        await sleep(14);
      }
    }
    try {
      const response = await fetch(`${API}/api/chat`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ session_id: sessionId, message }) });
      if (!response.ok) { let detail = `AI server returned ${response.status}.`; try { const errorData = await response.json(); detail = errorData.detail || errorData.message || detail; } catch {} throw new Error(detail); }
      if (!response.body) throw new Error("Streaming is not supported by this browser.");
      const reader = response.body.getReader(); const decoder = new TextDecoder("utf-8"); let buffer = "";
      while (true) {
        const { value, done } = await reader.read(); if (done) break;
        buffer += decoder.decode(value, { stream: true }); const lines = buffer.split("\n"); buffer = lines.pop() || "";
        for (const rawLine of lines) {
          const line = rawLine.trim(); if (!line) continue; let chunk; try { chunk = JSON.parse(line); } catch { continue; }
          if (chunk.type === "token" && chunk.content) await appendStreamText(chunk.content);
          if (chunk.type === "error") throw new Error(chunk.message || "MindSetu AI returned an error.");
          if (chunk.type === "done") setChatMessages((previous) => previous.map((chatMessage, index) => index === previous.length - 1 && chatMessage.sender === "ai" ? { ...chatMessage, streaming: false } : chatMessage));
        }
      }
      buffer += decoder.decode();
      if (buffer.trim()) { try { const chunk = JSON.parse(buffer.trim()); if (chunk.type === "token" && chunk.content) await appendStreamText(chunk.content); } catch {} }
      setChatMessages((previous) => previous.map((chatMessage, index) => index === previous.length - 1 && chatMessage.sender === "ai" ? { ...chatMessage, streaming: false } : chatMessage));
    } catch (error) {
      setChatMessages((previous) => previous.map((chatMessage, index) => index === previous.length - 1 && chatMessage.sender === "ai" ? { sender: "ai", text: `Unable to connect to MindSetu AI: ${error.message}`, streaming: false } : chatMessage));
    } finally { setLoading(false); }
  }

  async function saveMood() {
    if (!selectedMood) { alert("Please select your mood."); return; }
    if (!sessionId) { alert("No active MindSetu session."); return; }
    try { setLoading(true); await apiRequest("/api/mood", { method: "POST", body: JSON.stringify({ session_id: sessionId, mood: selectedMood, note: moodNote.trim() || null }) }); setMoodNote(""); setSelectedMood(null); await loadMoodHistory(); alert("Mood saved successfully."); }
    catch (error) { alert(error.message); } finally { setLoading(false); }
  }
  async function loadMoodHistory() { if (!sessionId) return; try { const data = await apiRequest(`/api/mood/${sessionId}`); setMoodHistory(data.entries || []); } catch (error) { console.error(error); } }

  async function openCounsellors() {
    try { setLoading(true); const data = await apiRequest("/api/counsellors"); setCounsellors(data.counsellors || data || []); setScreen("counsellors"); }
    catch (error) { alert(error.message); } finally { setLoading(false); }
  }
  async function loadAppointments() { if (!sessionId) return; try { const data = await apiRequest(`/api/appointments/${sessionId}`); setAppointments(data.appointments || data || []); } catch (error) { console.error(error); } }
  async function bookAppointment() {
    if (!selectedCounsellor || !appointmentTime) { alert("Select a counsellor and appointment time."); return; }
    try { setLoading(true); const data = await apiRequest("/api/appointments", { method: "POST", body: JSON.stringify({ session_id: sessionId, counsellor_id: selectedCounsellor.id, appointment_time: appointmentTime }) }); setBookingResult(data); await loadAppointments(); alert("Appointment booked successfully."); }
    catch (error) { alert(error.message); } finally { setLoading(false); }
  }

  async function openDashboard() {
    try { setLoading(true); const data = await apiRequest("/api/dashboard"); setDashboard(data); setScreen("dashboard"); }
    catch (error) { alert(error.message); } finally { setLoading(false); }
  }
  async function loadDashboardAssessments() { try { const data = await apiRequest("/api/dashboard/assessments"); setDashboardAssessments(data); } catch (error) { console.error(error); } }
  async function loadMoodTrend() { try { const data = await apiRequest("/api/dashboard/mood-trend"); setMoodTrend(data.entries || data || []); } catch (error) { console.error(error); } }

  function resetAssessment(type) {
    if (type === "phq9") setPhqAnswers(Array(PHQ9_QUESTIONS.length).fill(null));
    if (type === "gad7") setGadAnswers(Array(GAD7_QUESTIONS.length).fill(null));
  }

  function goTo(nextScreen) {
    if (nextScreen === "gad7") resetAssessment("gad7");
    setScreen(nextScreen);
  }

  useEffect(() => {
    if (screen === "mood") loadMoodHistory();
    if (screen === "counsellors") loadAppointments();
    if (screen === "dashboard") { loadDashboardAssessments(); loadMoodTrend(); }
  }, [screen, sessionId]);

  return (
    <div className="mindsetu-app">
      <Header darkMode={darkMode} setDarkMode={setDarkMode} />
      {screen === "home" && <HomeScreen startSession={startSession} loading={loading} openDashboard={openDashboard} />}
      {screen === "phq9" && <AssessmentScreen title="PHQ-9" subtitle="Over the last 2 weeks, how often have you been bothered by the following?" questions={PHQ9_QUESTIONS} answers={phqAnswers} setAnswers={setPhqAnswers} onSubmit={submitPHQ9} loading={loading} />}
      {screen === "gad7" && <AssessmentScreen title="GAD-7" subtitle="Over the last 2 weeks, how often have you been bothered by the following?" questions={GAD7_QUESTIONS} answers={gadAnswers} setAnswers={setGadAnswers} onSubmit={submitGAD7} loading={loading} />}
      {screen === "results" && <ResultsScreen phqResult={phqResult} gadResult={gadResult} getRiskResult={getRiskResult} loading={loading} />}
      {screen === "support" && <SupportScreen riskResult={riskResult} openChat={() => setScreen("chat")} openCounsellors={openCounsellors} />}
      {screen === "chat" && <ChatScreen messages={chatMessages} input={chatInput} setInput={setChatInput} sendMessage={sendMessage} loading={loading} />}
      {screen === "mood" && <MoodScreen selectedMood={selectedMood} setSelectedMood={setSelectedMood} note={moodNote} setNote={setMoodNote} saveMood={saveMood} history={moodHistory} loading={loading} />}
      {screen === "counsellors" && <CounsellorScreen counsellors={counsellors} selected={selectedCounsellor} setSelected={setSelectedCounsellor} appointmentTime={appointmentTime} setAppointmentTime={setAppointmentTime} book={bookAppointment} bookingResult={bookingResult} appointments={appointments} loading={loading} />}
      {screen === "dashboard" && <DashboardScreen dashboard={dashboard} assessments={dashboardAssessments} moodTrend={moodTrend} />}
    </div>
  );
}

function HomeScreen({ startSession, loading, openDashboard }) {
  return <main className="hero"><section className="hero-content"><span className="badge">PRIVATE · STUDENT-FIRST · SUPPORTIVE</span><h1>A calmer way to understand your wellbeing.</h1><p>MindSetu gives students a private space to check in, reflect, understand patterns, and find the right support without judgement.</p><div><button className="primary-button" onClick={startSession} disabled={loading}>{loading ? "Starting…" : "Start anonymously"}</button><button className="secondary-button dashboard-home-button" onClick={openDashboard}>Institutional dashboard</button></div><div className="privacy-note">Your wellbeing information is handled with privacy in mind.</div></section><aside className="hero-card"><div className="hero-card-icon">✦</div><h3>A simple support journey</h3><div className="flow-item"><span>01</span>Check in with yourself</div><div className="flow-item"><span>02</span>Understand your wellbeing</div><div className="flow-item"><span>03</span>Explore personalised support</div><div className="flow-item"><span>04</span>Keep checking in over time</div></aside></main>;
}

function AssessmentScreen({ title, subtitle, questions, answers, setAnswers, onSubmit, loading }) {
  const [index, setIndex] = useState(0);
  useEffect(() => { setIndex(0); }, [title]);
  const selected = answers[index];
  const isLast = index === questions.length - 1;
  const choose = (value) => setAnswers((previous) => previous.map((answer, i) => i === index ? value : answer));
  const next = () => { if (selected === null) { alert("Please select an answer."); return; } if (!isLast) setIndex((value) => value + 1); else onSubmit(); };
  const back = () => { if (index > 0) setIndex((value) => value - 1); };
  return <main className="assessment-page"><div className="assessment-top"><div><span className="badge">WELLBEING CHECK-IN</span><h1>{title}</h1><p>{subtitle}</p></div><div className="progress-info">{index + 1}/{questions.length}</div></div><div className="progress-bar"><div style={{ width: `${((index + 1) / questions.length) * 100}%` }} /></div><div className="question-list"><article className="question-card"><div className="question-number">{String(index + 1).padStart(2, "0")}</div><div className="question-content"><h3>{questions[index]}</h3><div className="answer-options">{OPTIONS.map((option, optionIndex) => <button key={option} className={`answer ${selected === optionIndex ? "active" : ""}`} onClick={() => choose(optionIndex)}><span className="answer-number">{optionIndex + 1}</span>{option}</button>)}</div></div></article></div><div className="assessment-footer"><button className="secondary-button" onClick={back} disabled={index === 0}>Back</button><p>{answers.filter((answer) => answer !== null).length} of {questions.length} answered</p><button className="primary-button" onClick={next} disabled={loading}>{loading ? "Saving…" : isLast ? "Finish" : "Continue"}</button></div></main>;
}

function ResultsScreen({ phqResult, gadResult, getRiskResult, loading }) {
  return <main className="page"><div className="page-heading"><span className="badge">YOUR WELLBEING SNAPSHOT</span><h1>Thanks for checking in.</h1><p>Your responses give you a starting point for understanding how you have been feeling. This is not a diagnosis.</p></div><section className="result-card"><div className="success-icon">✓</div><h1>Assessment complete</h1><p className="muted">Your PHQ-9 and GAD-7 responses have been recorded for this session.</p><div className="score-grid"><div className="score-box"><span className="label">PHQ-9</span><strong>{phqResult?.score ?? "—"}</strong><span>{phqResult?.severity ?? "Completed"}</span></div><div className="score-box"><span className="label">GAD-7</span><strong>{gadResult?.score ?? "—"}</strong><span>{gadResult?.severity ?? "Completed"}</span></div></div><button className="primary-button" onClick={getRiskResult} disabled={loading}>{loading ? "Preparing support…" : "See support options"}</button></section></main>;
}

function SupportScreen({ riskResult, openChat, openCounsellors }) {
  return <main className="page"><div className="page-heading"><span className="badge">PERSONALISED SUPPORT</span><h1>You don't have to figure it out alone.</h1><p>{riskResult?.message || "Choose the kind of support that feels right for you today."}</p></div><div className="support-layout"><section className="support-main-card"><div className="support-option" onClick={openChat}><strong>Talk to MindSetu AI</strong><span>Have a private conversation and explore what is on your mind.</span></div><div className="support-option" onClick={openCounsellors}><strong>Find a counsellor</strong><span>Explore available counsellors and request a session.</span></div><div className="support-option"><strong>Keep checking in</strong><span>Use mood tracking to notice changes over time.</span></div></section><aside className="support-side-card"><span className="label">IMPORTANT</span><p>If you feel you may hurt yourself or someone else, seek immediate help from local emergency services or a trusted person.</p></aside></div></main>;
}

function ChatScreen({ messages, input, setInput, sendMessage, loading }) {
  const starters = ["I feel overwhelmed with college.", "I have been feeling anxious lately.", "I just want to talk."];
  return <main className="page"><div className="page-heading"><span className="badge">MINDSETU AI</span><h1>A space to talk things through.</h1><p>Supportive conversation, reflection, and practical next steps — not a replacement for professional care.</p></div><section className="chat-container"><div className="chat-header"><div className="ai-icon">✦</div><div><h1>MindSetu AI</h1><span>Supportive companion</span></div></div>{messages.length === 0 && <div className="chat-starters">{starters.map((starter) => <button key={starter} className="secondary-button" onClick={() => { setInput(starter); }}>{starter}</button>)}</div>}<div className="message-list">{messages.map((message, index) => <div key={`${index}-${message.sender}`} className={`message ${message.sender === "user" ? "user-message" : "ai-message"}`}>{message.text || (message.streaming ? "Thinking…" : "")}</div>)}</div><div className="chat-input-area"><input value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") sendMessage(); }} placeholder="Write what is on your mind…" /><button className="primary-button" onClick={sendMessage} disabled={loading || !input.trim()}>Send</button></div></section></main>;
}

function MoodScreen({ selectedMood, setSelectedMood, note, setNote, saveMood, history, loading }) {
  return <main className="page"><div className="page-heading"><span className="badge">DAILY CHECK-IN</span><h1>How are you feeling today?</h1><p>A quick check-in can help you notice patterns without needing to explain everything.</p></div><div className="mood-grid">{MOODS.map((mood) => <button key={mood.value} className={`mood-card ${selectedMood === mood.value ? "active" : ""}`} onClick={() => setSelectedMood(mood.value)}><span className="mood-emoji">{mood.emoji}</span><strong>{mood.label}</strong></button>)}</div><div className="mood-note-card"><textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Want to add a note? (optional)" /><button className="primary-button" onClick={saveMood} disabled={loading}>{loading ? "Saving…" : "Save check-in"}</button></div><div className="history-card"><span className="label">RECENT CHECK-INS</span>{history.length ? history.slice(-7).map((entry, index) => <div className="history-row" key={index}><span>{entry.mood}</span><span>{entry.note || "No note"}</span></div>) : <p className="muted">No check-ins yet.</p>}</div></main>;
}

function CounsellorScreen({ counsellors, selected, setSelected, appointmentTime, setAppointmentTime, book, bookingResult, appointments, loading }) {
  return <main className="page"><div className="page-heading"><span className="badge">COUNSELLOR SUPPORT</span><h1>Find someone you can talk to.</h1><p>Choose a counsellor and request a convenient appointment time.</p></div><div className="counsellor-grid">{counsellors.map((counsellor) => <button key={counsellor.id} className={`counsellor-card ${selected?.id === counsellor.id ? "active" : ""}`} onClick={() => setSelected(counsellor)}><div className="counsellor-avatar">{(counsellor.name || "C").charAt(0)}</div><strong>{counsellor.name}</strong><span>{counsellor.specialization || counsellor.specialty || "Student wellbeing"}</span></button>)}</div>{selected && <div className="booking-card"><h3>Book with {selected.name}</h3><input type="datetime-local" value={appointmentTime} onChange={(event) => setAppointmentTime(event.target.value)} /><button className="primary-button" onClick={book} disabled={loading}>{loading ? "Booking…" : "Request appointment"}</button></div>}{bookingResult && <div className="booking-success">Appointment requested successfully.</div>}{appointments.length > 0 && <div className="appointments-card"><span className="label">YOUR APPOINTMENTS</span>{appointments.map((appointment, index) => <div className="appointment-card" key={index}>{appointment.appointment_time || appointment.time || "Scheduled appointment"}</div>)}</div>}</main>;
}

function DashboardScreen({ dashboard, assessments, moodTrend }) {
  return <main className="page dashboard-page"><div className="page-heading"><span className="badge">INSTITUTIONAL VIEW</span><h1>Student wellbeing overview.</h1><p>Aggregated wellbeing signals for authorised institutional support teams. No individual identification is shown here.</p></div><div className="privacy-banner">Privacy-first reporting · aggregated data only</div><div className="dashboard-grid">{dashboard && Object.entries(dashboard).slice(0, 6).map(([key, value]) => <div className="dashboard-stat" key={key}><span className="label">{key.replaceAll("_", " ")}</span><strong>{typeof value === "object" ? JSON.stringify(value) : String(value)}</strong></div>)}</div><div className="dashboard-card"><span className="label">ASSESSMENT OVERVIEW</span><pre>{JSON.stringify(assessments || {}, null, 2)}</pre></div><div className="dashboard-card"><span className="label">MOOD TREND</span><div className="trend-list">{moodTrend.map((entry, index) => <div className="trend-bar" key={index}><div style={{ width: `${Math.min(100, Number(entry.mood || entry.value || 0) * 20)}%` }} /></div>)}</div></div></main>;
}

export default App;
