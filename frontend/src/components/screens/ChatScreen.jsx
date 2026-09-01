import { useEffect, useRef } from "react";
import { CrisisBanner } from "../common/CrisisBanner";

const STARTER_PROMPTS = [
  "I feel overwhelmed by my workload and cannot switch off after duty.",
  "What are practical ways to manage sleep recovery during night shifts?",
  "How can I set realistic boundaries when duty pressure is continuous?",
  "I need help organizing one actionable recovery step for today.",
];

export function ChatScreen({
  messages,
  inputMessage,
  setInputMessage,
  onSendMessage,
  loading,
  isCrisis,
  onDismissCrisis,
}) {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  }

  return (
    <div className="page-container narrow">
      <div style={{ marginBottom: "20px" }}>
        <span className="eyebrow">STEP 05 · SUPPORTIVE AI COMPANION</span>
        <h1 className="page-title">MindSetu AI Companion</h1>
        <p className="page-subtitle">
          A confidential, empathetic conversation space powered by Gemini. Designed to help explore practical recovery steps.
        </p>
      </div>

      {isCrisis && <CrisisBanner onDismiss={onDismissCrisis} />}

      <div className="chat-window-card">
        <div className="chat-messages-pane">
          {messages.length === 0 && (
            <div style={{ textAlign: "center", margin: "auto 0", padding: "32px 16px" }}>
              <div className="brand-logo" style={{ margin: "0 auto 16px", width: "48px", height: "48px", fontSize: "1.5rem" }}>
                ✦
              </div>
              <h2 style={{ fontSize: "1.3rem", fontWeight: 700, margin: "0 0 8px" }}>How can I support you today?</h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", maxWidth: "440px", margin: "0 auto 20px" }}>
                Share what is on your mind, explore workload pacing, or ask for simple recovery recommendations.
              </p>
            </div>
          )}

          {messages.map((msg, idx) => {
            const isLatestAI = idx === messages.length - 1 && msg.sender === "ai";
            const isStreamingThis = isLatestAI && loading;

            return (
              <div key={idx} className={`message-row ${msg.sender}`}>
                <div className="message-avatar">{msg.sender === "ai" ? "✦" : "👤"}</div>
                <div className="message-bubble" style={{ whiteSpace: "pre-wrap" }}>
                  {msg.text || (isStreamingThis ? (
                    <div className="typing-indicator" style={{ padding: "4px 0" }}>
                      <span className="typing-dot" />
                      <span className="typing-dot" />
                      <span className="typing-dot" />
                    </div>
                  ) : "")}
                </div>
              </div>
            );
          })}

          <div ref={messagesEndRef} />
        </div>

        {messages.length === 0 && (
          <div className="starters-wrap">
            {STARTER_PROMPTS.map((prompt, i) => (
              <button key={i} className="starter-chip" onClick={() => setInputMessage(prompt)}>
                {prompt}
              </button>
            ))}
          </div>
        )}

        <div className="chat-input-bar">
          <textarea
            placeholder="Share what is happening (Shift + Enter for new line)..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            rows={1}
          />
          <button className="btn btn-primary" onClick={onSendMessage} disabled={loading || !inputMessage.trim()}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
