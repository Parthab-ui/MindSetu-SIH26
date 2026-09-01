import { useEffect, useRef } from "react";
import { CrisisBanner } from "../common/CrisisBanner";

const STARTER_PROMPTS = [
  "I feel overwhelmed by my workload and cannot switch off after duty.",
  "What are practical ways to manage sleep recovery during night shifts?",
  "How can I set realistic boundaries when duty pressure is continuous?",
  "I need help organising one actionable recovery step for today.",
];

/* High-contrast paper-plane send icon */
function SendIcon({ size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: "block", flexShrink: 0 }}
      aria-hidden="true"
    >
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" fill="currentColor" fillOpacity="0.2" />
    </svg>
  );
}

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
  const textareaRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  }

  // Auto-grow textarea
  function handleInput(e) {
    setInputMessage(e.target.value);
    const el = e.target;
    el.style.height = "44px";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  }

  const canSend = !loading && inputMessage.trim().length > 0;

  return (
    <div className="page-container narrow">
      <div style={{ marginBottom: "20px", animation: "slideUp 280ms cubic-bezier(0.2,0.8,0.2,1) both" }}>
        <span className="eyebrow">STEP 05 · SUPPORTIVE AI COMPANION</span>
        <h1 className="page-title">MindSetu AI Companion</h1>
        <p className="page-subtitle">
          A confidential, empathetic conversation space powered by Gemini. Designed to explore practical recovery steps.
        </p>
      </div>

      {isCrisis && <CrisisBanner onDismiss={onDismissCrisis} />}

      <div className="chat-window-card" style={{ animation: "slideUp 340ms cubic-bezier(0.2,0.8,0.2,1) both" }}>
        <div className="chat-messages-pane">
          {/* Empty state */}
          {messages.length === 0 && (
            <div className="chat-empty-state">
              <div className="chat-empty-avatar">✦</div>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0 }}>
                How can I support you today?
              </h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.93rem", maxWidth: "400px", margin: 0, lineHeight: "1.6" }}>
                Share what is on your mind, explore workload pacing, or ask for simple recovery recommendations.
              </p>
            </div>
          )}

          {/* Messages */}
          {messages.map((msg, idx) => {
            const isLatestAI = idx === messages.length - 1 && msg.sender === "ai";
            const isStreamingThis = isLatestAI && loading;

            return (
              <div key={idx} className={`message-row ${msg.sender}`}>
                <div className="message-avatar">
                  {msg.sender === "ai" ? "✦" : "👤"}
                </div>
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

        {/* Starter chips — shown only when empty */}
        {messages.length === 0 && (
          <div className="starters-wrap">
            {STARTER_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                className="starter-chip"
                onClick={() => {
                  setInputMessage(prompt);
                  textareaRef.current?.focus();
                }}
                title={prompt}
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        {/* Input bar */}
        <div className="chat-input-bar">
          <textarea
            ref={textareaRef}
            id="chat-message-input"
            placeholder="Share what is happening (Shift + Enter for new line)…"
            value={inputMessage}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            disabled={loading}
            rows={1}
            aria-label="Chat message"
          />
          <button
            id="chat-send-btn"
            type="button"
            className="chat-send-btn"
            onClick={onSendMessage}
            disabled={!canSend}
            aria-label="Send message"
            title={loading ? "Generating AI response..." : canSend ? "Send message (Enter)" : "Type a message to send"}
          >
            <SendIcon size={18} />
          </button>
        </div>
      </div>

      <p style={{
        marginTop: "14px",
        fontSize: "0.78rem",
        color: "var(--text-muted)",
        textAlign: "center",
        lineHeight: "1.5",
      }}>
        MindSetu AI is not a crisis service. In an emergency, contact Tele-MANAS&nbsp;<strong>14416</strong> or KIRAN&nbsp;<strong>1800-599-0019</strong>.
      </p>
    </div>
  );
}
