import { useEffect, useState } from "react";
import { Header } from "./components/layout/Header";
import { Navigation } from "./components/layout/Navigation";
import { Footer } from "./components/layout/Footer";
import { HomeScreen } from "./components/screens/HomeScreen";
import { StartScreen } from "./components/screens/StartScreen";
import { WellnessScreen } from "./components/screens/WellnessScreen";
import { WorkloadScreen } from "./components/screens/WorkloadScreen";
import { VoiceScreen } from "./components/screens/VoiceScreen";
import { AnalysisScreen } from "./components/screens/AnalysisScreen";
import { ResearchLabModal } from "./components/screens/ResearchLabModal";
import { ChatScreen } from "./components/screens/ChatScreen";
import { MoodScreen } from "./components/screens/MoodScreen";
import { DoctorDirectoryScreen } from "./components/screens/DoctorDirectoryScreen";
import { DoctorProfileScreen } from "./components/screens/DoctorProfileScreen";
import { AppointmentsScreen } from "./components/screens/AppointmentsScreen";
import { ConsultationScreen } from "./components/screens/ConsultationScreen";
import { BookingConfirmationModal } from "./components/screens/BookingConfirmationModal";
import { PreCallCheckModal } from "./components/screens/PreCallCheckModal";
import { api } from "./services/api";

const SESSION_STORAGE_KEY = "mindsetu_session_id";
const SCREEN_STORAGE_KEY = "mindsetu_active_screen";

export default function App() {
  const [screen, setScreenState] = useState(() => {
    return sessionStorage.getItem(SCREEN_STORAGE_KEY) || "home";
  });
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("mindsetu-theme") === "dark");
  const [sessionId, setSessionId] = useState(null);

  function setScreen(newScreen) {
    setScreenState(newScreen);
    sessionStorage.setItem(SCREEN_STORAGE_KEY, newScreen);
  }

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
  const [voiceResult, setVoiceResult] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [assessmentHistory, setAssessmentHistory] = useState([]);

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

  // Doctor & Appointment State
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [confirmedAppointment, setConfirmedAppointment] = useState(null);
  const [activeAppointment, setActiveAppointment] = useState(null);
  const [initialConsultationDevices, setInitialConsultationDevices] = useState({ cameraOn: true, micOn: true });
  const [showPreCallModal, setShowPreCallModal] = useState(false);
  const [hasAppointments, setHasAppointments] = useState(false);

  // Global UI State
  const [loading, setLoading] = useState(false);
  const [loadingLabel, setLoadingLabel] = useState("Processing…");
  const [error, setError] = useState("");

  // Sync theme
  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? "dark" : "light";
    localStorage.setItem("mindsetu-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  // Restore active session across accidental page refresh
  useEffect(() => {
    const savedSessionId = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!savedSessionId) return;

    let isMounted = true;
    async function restoreSession() {
      try {
        const historyRes = await api.getAssessmentHistory(savedSessionId);
        if (!isMounted) return;

        setSessionId(savedSessionId);

        // Check for completed assessment analysis
        if (historyRes?.history && historyRes.history.length > 0) {
          setAssessmentHistory(historyRes.history);
          try {
            const dashRes = await api.getDashboard(savedSessionId);
            if (isMounted && dashRes) {
              const currentSavedScreen = sessionStorage.getItem(SCREEN_STORAGE_KEY) || "home";
              const isScreeningInProgress = ["start", "wellness", "workload", "voice"].includes(currentSavedScreen);

              // Only restore analysis into active state if not in an incomplete screening flow
              if (!isScreeningInProgress) {
                setAnalysis(dashRes);
              }
            }
          } catch {
            // Non-fatal
          }
        }

        // Check if any appointments exist for this session
        try {
          const apts = await api.getAppointments(savedSessionId);
          if (
            isMounted &&
            apts &&
            ((apts.upcoming && apts.upcoming.length > 0) || (apts.past && apts.past.length > 0))
          ) {
            setHasAppointments(true);
          }
        } catch {
          // Non-fatal
        }
      } catch {
        // Stale, malformed, or rejected session ID
        if (isMounted) {
          sessionStorage.removeItem(SESSION_STORAGE_KEY);
          sessionStorage.removeItem(SCREEN_STORAGE_KEY);
          setSessionId(null);
          setScreenState("home");
        }
      }
    }

    restoreSession();
    return () => {
      isMounted = false;
    };
  }, []);

  // Reset or Start Session
  function handleResetSession() {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    sessionStorage.removeItem(SCREEN_STORAGE_KEY);
    setScreenState("home");
    setSessionId(null);
    setAnswers(Array(6).fill(null));
    setVoiceResult(null);
    setAnalysis(null);
    setAssessmentHistory([]);
    setChatMessages([]);
    setSelectedMood(null);
    setMoodNote("");
    setSelectedDoctor(null);
    setConfirmedAppointment(null);
    setActiveAppointment(null);
    setShowPreCallModal(false);
    setError("");
  }

  async function handleStartSession(contextData) {
    setError("");
    setLoading(true);
    setLoadingLabel("Creating protected session…");
    setRole(contextData.role);
    setUnit(contextData.unit);
    setAnswers(Array(6).fill(null));
    setAnalysis(null);
    setVoiceResult(null);
    try {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
      sessionStorage.removeItem(SCREEN_STORAGE_KEY);
      const res = await api.createSession(true);
      sessionStorage.setItem(SESSION_STORAGE_KEY, res.session_id);
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
    setLoadingLabel("Saving wellbeing pulse…");
    try {
      await api.submitWellness(sessionId, answers);
      setScreen("workload");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Transition from Workload to Voice Check
  async function handleProceedToVoice() {
    setError("");
    setLoading(true);
    setLoadingLabel("Saving duty context…");
    try {
      await api.submitWorkload(sessionId, { role, unit, ...workload });
      setScreen("voice");
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
    setLoadingLabel("Generating your multimodal triage analysis…");
    try {
      const result = await api.runAnalysis(sessionId);
      setAnalysis(result);

      // Refresh assessment history
      try {
        const histRes = await api.getAssessmentHistory(sessionId);
        setAssessmentHistory(histRes.history || []);
      } catch {
        // Non-fatal
      }

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
  async function handleSendMessage(customText = null) {
    const text = (typeof customText === "string" ? customText : chatInput).trim();
    if (!text || !sessionId || chatLoading) return;

    const userMsgId = `user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const aiMsgId = `ai-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    setChatMessages((prev) => [
      ...prev,
      { id: userMsgId, sender: "user", text, timestamp: new Date().toISOString() },
      { id: aiMsgId, sender: "ai", text: "", isStreaming: true, timestamp: new Date().toISOString() },
    ]);
    if (!customText) {
      setChatInput("");
    }
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
          setChatMessages((prev) =>
            prev.map((msg) =>
              msg.id === aiMsgId
                ? {
                    ...msg,
                    text: (msg.text || "") + token,
                    isStreaming: true,
                  }
                : msg
            )
          );
        },
        onComplete: ({ text: replyText, isSafety }) => {
          setChatMessages((prev) =>
            prev.map((msg) =>
              msg.id === aiMsgId
                ? {
                    ...msg,
                    text: replyText || msg.text,
                    isStreaming: false,
                  }
                : msg
            )
          );
          if (isSafety) setIsCrisis(true);
        },
        onError: (err) => {
          setChatMessages((prev) => {
            const fallbackText =
              err.name === "AbortError"
                ? "MindSetu AI took too long to respond. Take a short pause and consider connecting with a trusted colleague or welfare officer."
                : "MindSetu AI is momentarily reconnecting. You can still use your wellbeing summary and recovery guidance.";
            return prev.map((msg) =>
              msg.id === aiMsgId
                ? { ...msg, text: msg.text || fallbackText, isStreaming: false, isError: true }
                : msg
            );
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
    setLoadingLabel("Saving mood check-in…");
    try {
      await api.submitMood(sessionId, selectedMood, moodNote);
      const hist = await api.getMoodHistory(sessionId);
      setMoodHistory(hist.history || []);
      const trend = await api.getMoodTrend();
      setMoodTrend(trend.trend || []);
      const assessHist = await api.getAssessmentHistory(sessionId);
      setAssessmentHistory(assessHist.history || []);
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

  function handleSelectDoctor(doc) {
    setSelectedDoctor(doc);
    setScreen("doctor-profile");
  }

  function handleBookingSuccess(appointment) {
    setConfirmedAppointment(appointment);
    setHasAppointments(true);
  }

  function handleStartJoinAppointment(apt) {
    setActiveAppointment(apt);
    setShowPreCallModal(true);
  }

  function handleConfirmJoinConsultation(apt, deviceSettings) {
    setShowPreCallModal(false);
    setActiveAppointment(apt);
    setInitialConsultationDevices(deviceSettings);
    setScreen("consultation");
  }

  return (
    <div className="app-shell">
      {loading && (
        <div className="global-loading-overlay" role="status" aria-live="polite">
          <div className="spinner-ring" />
          <p>{loadingLabel}</p>
        </div>
      )}

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
          hasAnalysis={Boolean(analysis) && screen !== "wellness" && screen !== "start"}
        />
      )}

      <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {screen === "home" && (
          <HomeScreen
            onStart={() => {
              if (sessionId) {
                setAnswers(Array(6).fill(null));
                setAnalysis(null);
                setVoiceResult(null);
                setScreen("wellness");
              } else {
                setScreen("start");
              }
            }}
          />
        )}

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
            onAnalyze={handleProceedToVoice}
            onBack={() => setScreen("wellness")}
            loading={loading}
            error={error}
          />
        )}

        {screen === "voice" && (
          <VoiceScreen
            sessionId={sessionId}
            onNext={handleRunAnalysis}
            onBack={() => setScreen("workload")}
            voiceResult={voiceResult}
            setVoiceResult={setVoiceResult}
            loading={loading}
            error={error}
            setError={setError}
          />
        )}

        {screen === "analysis" && (
          analysis ? (
            <AnalysisScreen
              analysis={analysis}
              answers={answers}
              workload={workload}
              voiceResult={voiceResult}
              onNavigateToChat={() => setScreen("chat")}
              onNavigateToMood={() => setScreen("mood")}
              onOpenResearchModal={() => setIsResearchModalOpen(true)}
              onNavigateToDoctors={() => setScreen("doctors")}
            />
          ) : (
            <WellnessScreen
              answers={answers}
              setAnswers={setAnswers}
              onNext={handleSaveWellness}
              onBack={() => setScreen("start")}
              loading={loading}
              error="Please complete your wellbeing check-in first."
            />
          )
        )}

        {screen === "doctors" && (
          <DoctorDirectoryScreen
            onSelectDoctor={handleSelectDoctor}
            onNavigateToAppointments={() => setScreen("appointments")}
            onBack={() => setScreen(analysis ? "analysis" : "home")}
            hasAppointments={hasAppointments}
          />
        )}

        {screen === "doctor-profile" && selectedDoctor && (
          <DoctorProfileScreen
            doctor={selectedDoctor}
            sessionId={sessionId}
            onBookingSuccess={handleBookingSuccess}
            onBack={() => setScreen("doctors")}
          />
        )}

        {screen === "appointments" && (
          <AppointmentsScreen
            sessionId={sessionId}
            onJoinAppointment={handleStartJoinAppointment}
            onNavigateToDoctors={() => setScreen("doctors")}
            onBack={() => setScreen(analysis ? "analysis" : "home")}
          />
        )}

        {screen === "consultation" && activeAppointment && (
          <ConsultationScreen
            appointment={activeAppointment}
            initialDevices={initialConsultationDevices}
            onEndCall={() => setScreen("appointments")}
            onNavigateToSummary={() => setScreen("analysis")}
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
            assessmentHistory={assessmentHistory}
            loading={loading}
          />
        )}
      </main>

      {confirmedAppointment && (
        <BookingConfirmationModal
          appointment={confirmedAppointment}
          onViewAppointments={() => {
            setConfirmedAppointment(null);
            setScreen("appointments");
          }}
          onClose={() => setConfirmedAppointment(null)}
        />
      )}

      {showPreCallModal && activeAppointment && (
        <PreCallCheckModal
          appointment={activeAppointment}
          onJoin={handleConfirmJoinConsultation}
          onClose={() => setShowPreCallModal(false)}
        />
      )}

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
