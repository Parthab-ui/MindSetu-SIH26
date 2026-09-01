import { useEffect, useState } from "react";
import { Header } from "./components/layout/Header";
import { Navigation } from "./components/layout/Navigation";
import { Footer } from "./components/layout/Footer";
import { HomeScreen } from "./components/screens/HomeScreen";
import { StartScreen } from "./components/screens/StartScreen";
import { WellnessScreen } from "./components/screens/WellnessScreen";
import { WorkloadScreen } from "./components/screens/WorkloadScreen";
import { AnalysisScreen } from "./components/screens/AnalysisScreen";
import { ResearchLabModal } from "./components/screens/ResearchLabModal";
import { ChatScreen } from "./components/screens/ChatScreen";
import { MoodScreen } from "./components/screens/MoodScreen";
import { api } from "./services/api";

export default function App() {
  const [screen, setScreen] = useState("home");
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("mindsetu-theme") === "dark");
  const [sessionId, setSessionId] = useState(null);

  // Workflow state
  const [role, setRole] = useState("Field Operations Personnel");
  const [unit, setUnit] = useState("Sector Unit Bravo");
  const [answers, setAnswers] = useState(Array(6).fill(null));
  const [workload, setWorkload] = useState({
    duty_hours: 8,
    night_duties: 1,
    rest_hours: 8,
    days_since_leave: 7,
    workload_level: 3,
    high_pressure_assignment: false,
    duty_change_frequency: 1,
  });
  const [analysis, setAnalysis] = useState(null);

  // ML Lab State
  const [isResearchModalOpen, setIsResearchModalOpen] = useState(false);
  const [mlInputs, setMlInputs] = useState({
    Q29_Total: 17,
    Q12_weapon: 0,
    Q13_feltdie: 0,
    Q23a_cutdowntime: 0,
    Q23b_Accomplished_less: 0,
    Q23c_limited_work: 0,
    Q23d_difficulty_performing: 0,
  });
  const [mlResult, setMlResult] = useState(null);
  const [mlLoading, setMlLoading] = useState(false);

  // Chat State
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [isCrisis, setIsCrisis] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);

  // Mood State
  const [selectedMood, setSelectedMood] = useState(null);
  const [moodNote, setMoodNote] = useState("");
  const [moodHistory, setMoodHistory] = useState([]);
  const [moodTrend, setMoodTrend] = useState([]);

  // Global UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Sync theme
  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? "dark" : "light";
    localStorage.setItem("mindsetu-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  // Reset or Start Session
  function handleResetSession() {
    setScreen("home");
    setSessionId(null);
    setAnswers(Array(6).fill(null));
    setAnalysis(null);
    setChatMessages([]);
    setSelectedMood(null);
    setMoodNote("");
    setError("");
  }

  async function handleStartSession(contextData) {
    setError("");
    setLoading(true);
    setRole(contextData.role);
    setUnit(contextData.unit);
    try {
      const res = await api.createSession(true);
      setSessionId(res.session_id);
      setScreen("wellness");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Save Wellness
  async function handleSaveWellness() {
    setError("");
    setLoading(true);
    try {
      await api.submitWellness(sessionId, answers);
      setScreen("workload");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Run Main SIH26186 Triage Analysis
  async function handleRunAnalysis() {
    setError("");
    setLoading(true);
    try {
      await api.submitWorkload(sessionId, { role, unit, ...workload });
      const result = await api.runAnalysis(sessionId);
      setAnalysis(result);
      setScreen("analysis");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Run ML Explainable Model
  async function handleRunML() {
    setMlLoading(true);
    try {
      const res = await api.runMLAnalyze({ ...mlInputs, generate_response: true });
      setMlResult(res);
    } catch (err) {
      setMlResult({ error: err.message });
    } finally {
      setMlLoading(false);
    }
  }

  // Send Chat Message with Streaming
  async function handleSendMessage() {
    const text = chatInput.trim();
    if (!text || !sessionId || chatLoading) return;

    setChatMessages((prev) => [
      ...prev,
      { sender: "user", text },
      { sender: "ai", text: "" },
    ]);
    setChatInput("");
    setChatLoading(true);

    try {
      await api.streamChat({
        sessionId,
        message: text,
        history: chatMessages,
        wellbeingContext: {
          risk_level: analysis?.risk_level ?? null,
          wellness_summary: analysis?.recommendation ?? null,
        },
        onToken: (token) => {
          setChatMessages((prev) => {
            const next = [...prev];
            const lastIdx = next.length - 1;
            if (lastIdx >= 0 && next[lastIdx].sender === "ai") {
              next[lastIdx] = {
                ...next[lastIdx],
                text: (next[lastIdx].text || "") + token,
              };
            }
            return next;
          });
        },
        onComplete: ({ text: replyText, isSafety }) => {
          setChatMessages((prev) => {
            const next = [...prev];
            const lastIdx = next.length - 1;
            if (lastIdx >= 0 && next[lastIdx].sender === "ai") {
              next[lastIdx] = { sender: "ai", text: replyText || next[lastIdx].text };
            }
            return next;
          });
          if (isSafety) setIsCrisis(true);
        },
        onError: (err) => {
          setChatMessages((prev) => {
            const next = [...prev];
            const lastIdx = next.length - 1;
            const fallbackText =
              err.name === "AbortError"
                ? "MindSetu AI took too long to respond. Take a short pause and consider connecting with a trusted colleague or welfare officer."
                : "MindSetu AI is momentarily reconnecting. You can still use your wellbeing summary and recovery guidance.";
            if (lastIdx >= 0 && next[lastIdx].sender === "ai") {
              next[lastIdx] = { sender: "ai", text: fallbackText };
            }
            return next;
          });
        },
      });
    } catch (err) {
      console.error("Chat error:", err);
    } finally {
      setChatLoading(false);
    }
  }

  // Save Mood Check-in
  async function handleSaveMood() {
    if (!selectedMood || !sessionId) return;
    setLoading(true);
    try {
      await api.submitMood(sessionId, selectedMood, moodNote);
      const hist = await api.getMoodHistory(sessionId);
      setMoodHistory(hist.history || []);
      const trend = await api.getMoodTrend();
      setMoodTrend(trend.trend || []);
      setMoodNote("");
      setSelectedMood(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Fetch initial mood trend on mount
  useEffect(() => {
    api
      .getMoodTrend()
      .then((t) => setMoodTrend(t.trend || []))
      .catch(() => {});
  }, []);

  return (
    <div className="app-shell">
      <Header
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        sessionId={sessionId}
        onResetSession={handleResetSession}
      />

      {sessionId && (
        <Navigation
          screen={screen}
          setScreen={setScreen}
          hasAnalysis={Boolean(analysis)}
        />
      )}

      <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {screen === "home" && <HomeScreen onStart={() => (sessionId ? setScreen("wellness") : setScreen("start"))} />}

        {screen === "start" && (
          <StartScreen
            onStartSession={handleStartSession}
            onCancel={() => setScreen("home")}
            loading={loading}
            error={error}
          />
        )}

        {screen === "wellness" && (
          <WellnessScreen
            answers={answers}
            setAnswers={setAnswers}
            onNext={handleSaveWellness}
            onBack={() => setScreen("start")}
            loading={loading}
            error={error}
          />
        )}

        {screen === "workload" && (
          <WorkloadScreen
            workload={workload}
            setWorkload={setWorkload}
            onAnalyze={handleRunAnalysis}
            onBack={() => setScreen("wellness")}
            loading={loading}
            error={error}
          />
        )}

        {screen === "analysis" && (
          <AnalysisScreen
            analysis={analysis}
            onNavigateToChat={() => setScreen("chat")}
            onNavigateToMood={() => setScreen("mood")}
            onOpenResearchModal={() => setIsResearchModalOpen(true)}
          />
        )}

        {screen === "chat" && (
          <ChatScreen
            messages={chatMessages}
            inputMessage={chatInput}
            setInputMessage={setChatInput}
            onSendMessage={handleSendMessage}
            loading={chatLoading}
            isCrisis={isCrisis}
            onDismissCrisis={() => setIsCrisis(false)}
          />
        )}

        {screen === "mood" && (
          <MoodScreen
            selectedMood={selectedMood}
            setSelectedMood={setSelectedMood}
            moodNote={moodNote}
            setMoodNote={setMoodNote}
            onSaveMood={handleSaveMood}
            moodHistory={moodHistory}
            moodTrend={moodTrend}
            loading={loading}
          />
        )}
      </main>

      <ResearchLabModal
        isOpen={isResearchModalOpen}
        onClose={() => setIsResearchModalOpen(false)}
        onRunML={handleRunML}
        mlInputs={mlInputs}
        setMlInputs={setMlInputs}
        mlResult={mlResult}
        loading={mlLoading}
      />

      <Footer />
    </div>
  );
}
