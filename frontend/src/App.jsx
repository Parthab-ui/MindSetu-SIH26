import { useEffect, useMemo, useState } from "react";
import "./App.css";

const API = import.meta.env.VITE_API_BASE_URL || "";

const WELLNESS_QUESTIONS = [
  "I feel exhausted even after having time to rest.",
  "I find it difficult to switch off after duty.",
  "I feel irritable or emotionally strained.",
  "Stress makes it harder for me to concentrate.",
  "My responsibilities feel difficult to manage.",
  "I continue worrying about duty when I am off duty.",
];

const RESPONSE_OPTIONS = ["Never", "Some days", "Often", "Nearly every day"];
const MOODS = [
  { value: 1, emoji: "😞", label: "Very low" },
  { value: 2, emoji: "😕", label: "Low" },
  { value: 3, emoji: "😐", label: "Okay" },
  { value: 4, emoji: "🙂", label: "Good" },
  { value: 5, emoji: "😄", label: "Great" },
];

async function apiRequest(endpoint, options = {}) {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetch(`${API}${endpoint}`, {
      ...options,
      signal: controller.signal,
      headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    });
    const text = await response.text();
    let data = {};
    try { data = text ? JSON.parse(text) : {}; } catch { data = { detail: text }; }
    if (!response.ok) throw new Error(data.detail || `Request failed (${response.status})`);
    return data;
  } finally {
    window.clearTimeout(timer);
  }
}

function Header({ darkMode, setDarkMode }) {
  return (
    <header className="topbar">
      <div className="brand">Mind<span>Setu</span></div>
      <div className="topbar-actions">
        <span className="topbar-caption">Personnel wellbeing support</span>
        <button className="icon-button" onClick={() => setDarkMode((value) => !value)} aria-label="Toggle theme">
          {darkMode ? "☀" : "☾"}
        </button>
      </div>
    </header>
  );
}

function App() {
  const [screen, setScreen] = useState("home");
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("mindsetu-theme") === "dark");
  const [sessionId, setSessionId] = useState(null);
  const [role, setRole] = useState("");
  const [unit, setUnit] = useState("");
  const [answers, setAnswers] = useState(Array(WELLNESS_QUESTIONS.length).fill(null));
  const [analysis, setAnalysis] = useState(null);
  const [mlResult, setMlResult] = useState(null);
  const [mlInputs, setMlInputs] = useState({ Q29_Total: 0, Q12_weapon: 0, Q13_feltdie: 0, Q23a_cutdowntime: 0, Q23b_Accomplished_less: 0, Q23c_limited_work: 0, Q23d_difficulty_performing: 0 });
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [mood, setMood] = useState(null);
  const [moodNote, setMoodNote] = useState("");
  const [moodHistory, setMoodHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [workload, setWorkload] = useState({ duty_hours: 8, night_duties: 1, rest_hours: 8, days_since_leave: 7, workload_level: 3, high_pressure_assignment: false, duty_change_frequency: 1 });

  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? "dark" : "light";
    localStorage.setItem("mindsetu-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const progress = useMemo(() => ({ home: 0, wellness: 25, workload: 50, analysis: 75, chat: 100, mood: 100 }[screen] ?? 0), [screen]);

  function clearError() { if (error) setError(""); }

  async function startSession() {
    clearError();
    if (role.trim().length < 2) { setError("Enter a role or designation to continue."); return; }
    try {
      setLoading(true);
      const data = await apiRequest("/api/sessions", { method: "POST", body: JSON.stringify({ consent_given: true }) });
      setSessionId(data.session_id);
      setScreen("wellness");
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  async function saveWellness() {
    clearError();
    if (answers.some((answer) => answer === null)) { setError("Please answer every wellbeing statement."); return; }
    try {
      setLoading(true);
      await apiRequest("/api/sih26186/wellness", { method: "POST", body: JSON.stringify({ session_id: sessionId, answers }) });
      setScreen("workload");
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  async function runAnalysis() {
    clearError();
    try {
      setLoading(true);
      await apiRequest("/api/sih26186/workload", { method: "POST", body: JSON.stringify({ session_id: sessionId, role, unit, ...workload }) });
      const result = await apiRequest(`/api/sih26186/analyze/${sessionId}`, { method: "POST" });
      setAnalysis(result);
      setScreen("analysis");
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  async function loadDashboard() {
    clearError();
    try {
      setLoading(true);
      const result = await apiRequest(`/api/sih26186/dashboard/${sessionId}`);
      setAnalysis(result);
      setScreen("analysis");
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  async function checkModel() {
    try {
      setLoading(true);
      const result = await apiRequest("/api/sih26186/ml/health");
      setMlResult({ health: result });
    } catch (err) { setMlResult({ error: err.message }); }
    finally { setLoading(false); }
  }

  async function runResearchModel() {
    clearError();
    try {
      setLoading(true);
      const result = await apiRequest("/api/sih26186/ml/analyze", {
        method: "POST",
        body: JSON.stringify({ ...mlInputs, generate_response: true }),
      });
      setMlResult(result);
    } catch (err) { setMlResult({ error: err.message }); }
    finally { setLoading(false); }
  }

  async function sendMessage() {
    const message = chatInput.trim();
    if (!message || !sessionId || loading) return;
    setChatMessages((previous) => [...previous, { sender: "user", text: message }]);
    setChatInput("");
    setLoading(true);
    try {
      const response = await fetch(`${API}/api/chat`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ session_id: sessionId, message }) });
      const text = await response.text();
      if (!response.ok) throw new Error((() => { try { const data = JSON.parse(text); return data.detail || `AI server returned ${response.status}.`; } catch { return `AI server returned ${response.status}.`; } })());
      const lines = text.split("\n").filter(Boolean);
      let combined = "";
      for (const line of lines) {
        try { const chunk = JSON.parse(line); if (chunk.type === "token") combined += chunk.content || ""; } catch { /* ignore malformed line */ }
      }
      if (!combined) throw new Error("MindSetu AI returned an empty response.");
      setChatMessages((previous) => [...previous, { sender: "ai", text: combined }]);
    } catch (err) {
      setChatMessages((previous) => [...previous, { sender: "ai", text: `MindSetu AI is unavailable right now: ${err.message}` }]);
    } finally { setLoading(false); }
  }

  async function saveMood() {
    if (!mood || !sessionId) return;
    try {
      setLoading(true);
      await apiRequest("/api/mood", { method: "POST", body: JSON.stringify({ session_id: sessionId, mood, note: moodNote.trim() || null }) });
      const history = await apiRequest(`/api/mood/${sessionId}`);
      setMoodHistory(history.history || history || []);
      setMoodNote("");
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  const nav = sessionId ? (
    <nav className="session-nav">
      {analysis && <button className={screen === "analysis" ? "active" : ""} onClick={loadDashboard}>Analysis</button>}
      {analysis && <button className={screen === "chat" ? "active" : ""} onClick={() => setScreen("chat")}>AI companion</button>}
      <button className={screen === "mood" ? "active" : ""} onClick={() => setScreen("mood")}>Mood check-in</button>
    </nav>
  ) : null;

  if (screen === "home") return (
    <div className="app-shell">
      <Header darkMode={darkMode} setDarkMode={setDarkMode} />
      <main className="hero page">
        <section className="hero-copy">
          <span className="eyebrow">PERSONNEL WELLBEING SUPPORT</span>
          <h1>See the signal.<br /><span>Support earlier.</span></h1>
          <p>MindSetu brings structured wellbeing check-ins, workload context, explainable research ML and a supportive Gemini companion into one focused welfare workflow.</p>
          <div className="hero-actions">
            <button className="primary-button" onClick={() => setScreen("start")}>Start a protected session →</button>
          </div>
          <p className="privacy-note">Designed for fictional demo data. Welfare signals are not clinical diagnoses or disciplinary decisions.</p>
        </section>
        <section className="hero-card">
          <div className="hero-icon">✦</div>
          <h2>One clear responsibility at every layer</h2>
          {[["01", "LightGBM", "prediction"], ["02", "SHAP", "explanation"], ["03", "Gemini", "communication"], ["04", "Human", "intervention"]].map(([n, a, b]) => <div className="flow-item" key={n}><b>{n}</b><span>{a}</span><small>{b}</small></div>)}
        </section>
      </main>
    </div>
  );

  if (screen === "start") return (
    <div className="app-shell"><Header darkMode={darkMode} setDarkMode={setDarkMode} /><main className="page narrow"><span className="eyebrow">01 · PROTECTED SESSION</span><h1>Start with context.</h1><p className="lead">Use fictional personnel details for the demonstration. The session is created without requiring a personal identity.</p><div className="card form-card"><div className="field"><label>ROLE / DESIGNATION</label><input value={role} onChange={(event) => setRole(event.target.value)} placeholder="Field Operations Personnel" /></div><div className="field"><label>UNIT / DEPARTMENT</label><input value={unit} onChange={(event) => setUnit(event.target.value)} placeholder="Operations Unit" /></div>{error && <div className="error">{error}</div>}<button className="primary-button" disabled={loading} onClick={startSession}>{loading ? "Starting…" : "Continue to wellbeing →"}</button></div></main></div>
  );

  if (screen === "wellness") return (
    <div className="app-shell"><Header darkMode={darkMode} setDarkMode={setDarkMode} />{nav}<main className="page narrow"><span className="eyebrow">02 · WELLBEING PULSE</span><h1>How has the recent period felt?</h1><p className="lead">Choose the response that best matches your experience.</p><div className="progress"><span style={{ width: `${progress}%` }} /></div><div className="question-list">{WELLNESS_QUESTIONS.map((question, index) => <div className="question-card" key={question}><div className="question-index">{String(index + 1).padStart(2, "0")}</div><div><h3>{question}</h3><div className="answer-grid">{RESPONSE_OPTIONS.map((label, value) => <button className={`answer ${answers[index] === value ? "selected" : ""}`} key={label} onClick={() => setAnswers((previous) => previous.map((item, itemIndex) => itemIndex === index ? value : item))}>{label}</button>)}</div></div></div>)}</div>{error && <div className="error">{error}</div>}<div className="action-row"><button className="secondary-button" onClick={() => setScreen("start")}>← Back</button><button className="primary-button" disabled={loading} onClick={saveWellness}>{loading ? "Saving…" : "Save & continue →"}</button></div></main></div>
  );

  if (screen === "workload") return (
    <div className="app-shell"><Header darkMode={darkMode} setDarkMode={setDarkMode} />{nav}<main className="page narrow"><span className="eyebrow">03 · DUTY & RECOVERY</span><h1>Add the operational context.</h1><p className="lead">These inputs support welfare planning and do not make personnel decisions.</p><div className="progress"><span style={{ width: `${progress}%` }} /></div><div className="card form-grid">
      {[['duty_hours','Duty hours / day',0,24,8],['night_duties','Night duties / recent period',0,14,1],['rest_hours','Rest / recovery hours',0,24,8],['days_since_leave','Days since last leave',0,90,7],['duty_change_frequency','Duty changes / recent period',0,7,1]].map(([key,label,min,max,defaultValue]) => <div className="field" key={key}><label>{label}</label><input type="number" min={min} max={max} value={workload[key] ?? defaultValue} onChange={(event) => setWorkload((current) => ({ ...current, [key]: Number(event.target.value) }))} /></div>)}
      <div className="field"><label>WORKLOAD INTENSITY</label><select value={workload.workload_level} onChange={(event) => setWorkload((current) => ({ ...current, workload_level: Number(event.target.value) }))}><option value={1}>1 · Very manageable</option><option value={2}>2 · Manageable</option><option value={3}>3 · Moderate</option><option value={4}>4 · Heavy</option><option value={5}>5 · Very heavy</option></select></div>
      <label className="check-row"><input type="checkbox" checked={workload.high_pressure_assignment} onChange={(event) => setWorkload((current) => ({ ...current, high_pressure_assignment: event.target.checked }))} /> Recent high-pressure assignment</label>
    </div>{error && <div className="error">{error}</div>}<div className="action-row"><button className="secondary-button" onClick={() => setScreen("wellness")}>← Back</button><button className="primary-button" disabled={loading} onClick={runAnalysis}>{loading ? "Analysing…" : "Generate welfare signal →"}</button></div></main></div>
  );

  if (screen === "analysis") return (
    <div className="app-shell"><Header darkMode={darkMode} setDarkMode={setDarkMode} />{nav}<main className="page"><div className="page-heading"><span className="eyebrow">04 · WELFARE ANALYSIS</span><h1>Explain the signal, not the person.</h1><p>Deterministic welfare triage is shown separately from the research ML layer.</p></div><div className="metric-grid"><div className="metric-card"><span>Wellness stress</span><strong>{analysis?.wellness_score ?? "—"}</strong></div><div className="metric-card"><span>Duty load</span><strong>{analysis?.workload_score ?? "—"}</strong></div><div className="metric-card"><span>Combined</span><strong>{analysis?.combined_score ?? "—"}</strong></div></div><div className="split-grid"><section className={`card risk-card ${analysis?.risk_level || "low"}`}><span className="eyebrow">WELFARE SIGNAL</span><div className="risk-value">{analysis?.risk_level || "unknown"}</div><p>{analysis?.recommendation || "Complete the workflow to generate a signal."}</p></section><section className="card architecture-card"><span className="eyebrow">SYSTEM CONTRACT</span><h2>Four clear responsibilities</h2><div className="contract"><div><b>LightGBM</b><span>prediction</span></div><div><b>SHAP</b><span>explanation</span></div><div><b>Gemini</b><span>communication</span></div><div><b>Human</b><span>intervention</span></div></div></section><section className="card human-next-step"><span className="eyebrow">HUMAN NEXT STEP</span><h2>Support decisions stay with people.</h2><p>Use this welfare signal to guide an appropriate human check-in, practical recovery support, or referral to qualified support when needed. MindSetu does not diagnose, discipline, or make employment decisions.</p></section></div><div className="card research-card"><div className="card-header"><div><span className="eyebrow">RESEARCH ONLY</span><h2>LightGBM + SHAP</h2><p>Run the validated research model separately so its output is never confused with the operational welfare triage score. These inputs are a fictional research demo profile, not values inferred from the operational welfare questionnaire.</p></div><button className="secondary-button" onClick={checkModel} disabled={loading}>Check model</button></div>{mlResult?.health && <div className={`status-line ${mlResult.health.status === "ready" ? "" : "error"}`}>{mlResult.health.model} · {mlResult.health.status} · threshold {mlResult.health.threshold} · artifact present {String(mlResult.health.model_present)}</div>}{mlResult?.error && <div className="error">{mlResult.error}</div>}<div className="ml-grid">{[
['Q29_Total','Overall research wellbeing score'],
['Q12_weapon','Research exposure indicator'],
['Q13_feltdie','Research life-threat indicator'],
['Q23a_cutdowntime','Reduced work time'],
['Q23b_Accomplished_less','Accomplished less work'],
['Q23c_limited_work','Limited work capacity'],
['Q23d_difficulty_performing','Difficulty performing duties']
].map(([key,label]) => <div className="field" key={key}><label>{label}</label><input type="number" value={mlInputs[key]} onChange={(event) => setMlInputs((current) => ({ ...current, [key]: Number(event.target.value) }))} /></div>)}</div><button className="primary-button" disabled={loading} onClick={runResearchModel}>Run explainable model →</button>{mlResult?.probability !== undefined && <div className="ml-output"><div className={`signal ${mlResult.signal}`}>{mlResult.signal} · {mlResult.probability.toFixed(3)}</div><p>This research output is not a clinical diagnosis and does not determine employment or disciplinary action.</p><div className="contributors">{(mlResult.contributors || []).slice(0, 5).map((item) => <div className="contributor" key={item.feature}><span>{item.label}</span><b>{item.direction} · {Math.abs(item.shap_value ?? 0).toFixed(3)}</b></div>)}</div>{mlResult.supportive_response && <div className="gemini-box"><span className="eyebrow">GEMINI COMMUNICATION</span><p>{mlResult.supportive_response}</p><small>Response source: {mlResult.response_source || "not available"}</small></div>}</div>}</div></main></div>
  );

  if (screen === "chat") return (
    <div className="app-shell"><Header darkMode={darkMode} setDarkMode={setDarkMode} />{nav}<main className="page chat-page"><div className="page-heading"><span className="eyebrow">MINDSETU AI COMPANION</span><h1>A private place to talk.</h1><p>Gemini provides supportive communication. It does not diagnose or replace qualified human care.</p></div><div className="chat-window">{chatMessages.length === 0 && <div className="empty-chat"><div className="hero-icon">✦</div><h2>What is on your mind?</h2><p>Try: “I feel overwhelmed by my workload and I can't switch off after duty.”</p></div>}{chatMessages.map((message, index) => <div className={`message-row ${message.sender}`} key={`${message.sender}-${index}`}><div className="message-bubble">{message.text}</div></div>)}{loading && <div className="message-row ai"><div className="message-bubble typing">Gemini is thinking…</div></div>}</div><div className="chat-compose"><textarea value={chatInput} onChange={(event) => setChatInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); sendMessage(); } }} placeholder="Share what's happening…" /><button className="primary-button" onClick={sendMessage} disabled={loading || !chatInput.trim()}>Send</button></div></main></div>
  );

  return (
    <div className="app-shell"><Header darkMode={darkMode} setDarkMode={setDarkMode} />{nav}<main className="page narrow"><div className="page-heading"><span className="eyebrow">MOOD CHECK-IN</span><h1>Notice patterns over time.</h1><p>Record a simple mood check-in alongside the welfare workflow.</p></div><div className="mood-grid">{MOODS.map((item) => <button key={item.value} className={`mood-card ${mood === item.value ? "selected" : ""}`} onClick={() => setMood(item.value)}><span>{item.emoji}</span><b>{item.label}</b></button>)}</div><div className="card form-card"><div className="field"><label>OPTIONAL NOTE</label><textarea value={moodNote} onChange={(event) => setMoodNote(event.target.value)} maxLength={1000} placeholder="A few words about today…" /></div><button className="primary-button" onClick={saveMood} disabled={loading || !mood}>{loading ? "Saving…" : "Save mood check-in"}</button>{moodHistory.length > 0 && <div className="history"><h3>Recent check-ins</h3>{moodHistory.slice(-5).reverse().map((entry, index) => <div className="history-row" key={index}><span>{entry.mood}</span><small>{entry.created_at || entry.date || "Recent"}</small></div>)}</div>}</div></main></div>
  );
}

export default App;
