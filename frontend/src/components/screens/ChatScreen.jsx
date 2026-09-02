import { useEffect, useRef, useState, useId } from "react";
import { CrisisBanner } from "../common/CrisisBanner";

const SUGGESTION_CARDS = [
  {
    id: "tactical-decompression",
    title: "Tactical Decompression",
    subtitle: "Stepping down from high-alert state",
    prompt: "I feel hyper-alert and find it difficult to step down or 'switch off' my guard after returning from duty.",
    tag: "PTSD / Arousal",
  },
  {
    id: "sleep-recovery",
    title: "Night Watch Sleep Recovery",
    subtitle: "Circadian pacing & sleep architecture",
    prompt: "What are practical ways to manage sleep recovery and counter circadian disruption during frequent night watches?",
    tag: "Recovery",
  },
  {
    id: "cognitive-fatigue",
    title: "Operational Mental Fatigue",
    subtitle: "Decision fatigue & cognitive clarity",
    prompt: "I'm experiencing persistent mental fatigue making it harder to concentrate on duty tasks. What can I do today?",
    tag: "Depression / Focus",
  },
  {
    id: "stigma-barriers",
    title: "Navigating Support Without Stigma",
    subtitle: "Confidential unit check-in guidance",
    prompt: "How can I talk to a unit welfare officer or squad lead about duty pacing without feeling like I'm letting my team down?",
    tag: "Welfare & Stigma",
  },
];


/* Custom SVG Icons */
function SparkIcon({ size = 18, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 2L14.2 9.8L22 12L14.2 14.2L12 22L9.8 14.2L2 12L9.8 9.8L12 2Z" />
    </svg>
  );
}

function ArrowUpIcon({ size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="12" y1="19" x2="12" y2="5" />
      <polyline points="5 12 12 5 19 12" />
    </svg>
  );
}

function ArrowRightIcon({ size = 15 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function CopyIcon({ size = 14 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon({ size = 14 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

/**
 * Format inline text (e.g. **bold**, `code`) safely into React elements
 */
function formatInlineText(text) {
  if (!text) return null;
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="ai-bold-highlight">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={i} className="ai-inline-code">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

/**
 * Editorial Formatter for AI responses supporting headings, paragraphs,
 * bullet lists, numbered lists, and bold highlights.
 */
function FormattedAIResponse({ content }) {
  if (!content) return null;

  const lines = content.split("\n");
  const blocks = [];
  let currentList = null;

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) {
      if (currentList) {
        blocks.push(currentList);
        currentList = null;
      }
      return;
    }

    const isH3 = /^###\s+/.test(trimmed);
    const isH2 = /^##\s+/.test(trimmed);
    const isH1 = /^#\s+/.test(trimmed);
    const isBullet = /^[-*•]\s+/.test(trimmed);
    const isNumber = /^\d+\.\s+/.test(trimmed);

    if (isH1 || isH2 || isH3) {
      if (currentList) {
        blocks.push(currentList);
        currentList = null;
      }
      const title = trimmed.replace(/^#+\s+/, "");
      blocks.push({ type: "heading", content: title });
    } else if (isBullet) {
      const itemText = trimmed.replace(/^[-*•]\s+/, "");
      if (!currentList || currentList.type !== "bullet") {
        if (currentList) blocks.push(currentList);
        currentList = { type: "bullet", items: [] };
      }
      currentList.items.push(itemText);
    } else if (isNumber) {
      const itemText = trimmed.replace(/^\d+\.\s+/, "");
      if (!currentList || currentList.type !== "number") {
        if (currentList) blocks.push(currentList);
        currentList = { type: "number", items: [] };
      }
      currentList.items.push(itemText);
    } else {
      if (currentList) {
        blocks.push(currentList);
        currentList = null;
      }
      blocks.push({ type: "paragraph", content: trimmed });
    }
  });

  if (currentList) {
    blocks.push(currentList);
  }

  return (
    <div className="ai-editorial-content">
      {blocks.map((block, bIdx) => {
        if (block.type === "heading") {
          return (
            <h4 key={bIdx} className="ai-editorial-heading">
              {formatInlineText(block.content)}
            </h4>
          );
        }
        if (block.type === "paragraph") {
          return (
            <p key={bIdx} className="ai-editorial-p">
              {formatInlineText(block.content)}
            </p>
          );
        }
        if (block.type === "bullet") {
          return (
            <ul key={bIdx} className="ai-editorial-ul">
              {block.items.map((item, iIdx) => (
                <li key={iIdx} className="ai-editorial-li">
                  {formatInlineText(item)}
                </li>
              ))}
            </ul>
          );
        }
        if (block.type === "number") {
          return (
            <ol key={bIdx} className="ai-editorial-ol">
              {block.items.map((item, iIdx) => (
                <li key={iIdx} className="ai-editorial-li">
                  {formatInlineText(item)}
                </li>
              ))}
            </ol>
          );
        }
        return null;
      })}
    </div>
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
  const inputId = useId();
  const [copiedIdx, setCopiedIdx] = useState(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (canSend) {
        onSendMessage();
        if (textareaRef.current) {
          textareaRef.current.style.height = "48px";
        }
      }
    }
  }

  function handleInput(e) {
    setInputMessage(e.target.value);
    const el = e.target;
    el.style.height = "48px";
    el.style.height = Math.min(el.scrollHeight, 140) + "px";
  }

  function handleSelectSuggestion(promptText) {
    setInputMessage(promptText);
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.style.height = "48px";
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 140) + "px";
        }
      }, 20);
    }
  }

  async function handleCopyResponse(text, idx) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 2000);
    } catch {
      // ignore
    }
  }

  const canSend = !loading && inputMessage.trim().length > 0;
  const isWelcomeState = messages.length === 0;

  return (
    <div className="chat-workspace-page">
      {/* Top Header Eyebrow */}
      <div className="chat-header-section">
        <span className="eyebrow">STEP 05 · SUPPORTIVE AI COMPANION</span>
        <h1 className="page-title" style={{ margin: "4px 0 6px" }}>MindSetu AI Companion</h1>
        <p className="page-subtitle" style={{ margin: 0 }}>
          A confidential, empathetic conversation space powered by Gemini. Designed to explore practical recovery steps.
        </p>
      </div>

      {isCrisis && <CrisisBanner onDismiss={onDismissCrisis} />}

      <div className="chat-workspace-container">
        {/* Messages / Welcome Viewport */}
        <div
          className="chat-viewport"
          role="log"
          aria-live="polite"
          aria-label="MindSetu AI conversation history"
        >
          {/* STATE A — EMPTY / WELCOME */}
          {isWelcomeState ? (
            <div className="chat-welcome-box">
              <div className="chat-welcome-badge" aria-hidden="true">
                <SparkIcon size={24} />
              </div>
              <h2 className="chat-welcome-title">How can I support you today?</h2>
              <p className="chat-welcome-subtitle">
                Talk through what is on your mind, understand workload pressure, or find practical, immediate recovery steps.
              </p>

              <div className="suggestion-cards-grid" role="group" aria-label="Suggested starter prompts">
                {SUGGESTION_CARDS.map((card) => (
                  <button
                    key={card.id}
                    type="button"
                    className="suggestion-card"
                    onClick={() => handleSelectSuggestion(card.prompt)}
                    aria-label={`Suggested prompt: ${card.title}. ${card.prompt}`}
                  >
                    <div className="suggestion-card-header">
                      <span className="suggestion-tag">{card.tag}</span>
                      <span className="suggestion-arrow" aria-hidden="true">
                        <ArrowRightIcon size={14} />
                      </span>
                    </div>
                    <strong className="suggestion-title">{card.title}</strong>
                    <span className="suggestion-prompt-text">{card.prompt}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* STATE B — ACTIVE CONVERSATION */
            <div className="chat-conversation-flow">
              {messages.map((msg, idx) => {
                const isAI = msg.sender === "ai";
                const isLatestAI = idx === messages.length - 1 && isAI;
                const isStreamingThis = msg.isStreaming || (isLatestAI && loading);
                const isStreamingWaiting = isStreamingThis && !msg.text;

                return (
                  <div
                    key={msg.id || idx}
                    className={`conversation-entry ${isAI ? "assistant-entry" : "user-entry"}`}
                  >
                    {isAI && (
                      <div className="assistant-header-meta">
                        <div className="assistant-badge" aria-hidden="true">
                          <SparkIcon size={14} />
                        </div>
                        <span className="assistant-name">MindSetu AI</span>
                      </div>
                    )}

                    <div className={isAI ? "assistant-message-body" : "user-message-capsule"}>
                      <span className="sr-only">{isAI ? "MindSetu AI says: " : "You said: "}</span>

                      {isAI ? (
                        isStreamingWaiting ? (
                          /* STATE C — THINKING STATE */
                          <div
                            className="thinking-state-row"
                            role="status"
                            aria-label="MindSetu is thinking"
                          >
                            <span className="thinking-spark-pulse" aria-hidden="true">
                              <SparkIcon size={16} />
                            </span>
                            <span className="thinking-text">MindSetu is thinking</span>
                            <span className="thinking-wave" aria-hidden="true">
                              <span className="thinking-dot" />
                              <span className="thinking-dot" />
                              <span className="thinking-dot" />
                            </span>
                          </div>
                        ) : (
                          <>
                            <FormattedAIResponse content={msg.text} />
                            {/* Message Actions — ONLY rendered after streaming is complete */}
                            {!isStreamingThis && !loading && msg.text && (
                              <div className="message-action-bar">
                                <button
                                  type="button"
                                  className="action-copy-btn"
                                  onClick={() => handleCopyResponse(msg.text, idx)}
                                  aria-label={copiedIdx === idx ? "Copied response to clipboard" : "Copy response"}
                                  title="Copy response"
                                >
                                  {copiedIdx === idx ? (
                                    <>
                                      <CheckIcon size={13} />
                                      <span>Copied</span>
                                    </>
                                  ) : (
                                    <>
                                      <CopyIcon size={13} />
                                      <span>Copy</span>
                                    </>
                                  )}
                                </button>

                                {isLatestAI && (
                                  <button
                                    type="button"
                                    className="action-go-on-btn"
                                    onClick={() => onSendMessage("Go on, please tell me more about this.")}
                                    aria-label="Ask MindSetu AI to continue or elaborate"
                                    title="Continue and elaborate on this topic"
                                  >
                                    <span>Go on →</span>
                                  </button>
                                )}
                              </div>
                            )}
                          </>
                        )
                      ) : (
                        <div className="user-text">{msg.text}</div>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* INTEGRATED PROMPT COMPOSER */}
        <div className="composer-wrapper">
          <div className={`integrated-composer ${canSend ? "has-input" : ""}`}>
            <label htmlFor={inputId} className="sr-only">
              Type your message to MindSetu AI Companion
            </label>
            <textarea
              ref={textareaRef}
              id={inputId}
              className="composer-textarea"
              placeholder="Ask anything about your workload, sleep, or recovery…"
              value={inputMessage}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              disabled={loading}
              rows={1}
              aria-label="Type your message to MindSetu AI Companion"
            />

            <button
              id="chat-send-btn"
              type="button"
              className="composer-send-btn"
              onClick={onSendMessage}
              disabled={!canSend}
              aria-label={loading ? "Generating response…" : "Send message"}
              title={loading ? "Generating response…" : canSend ? "Send (Enter)" : "Type a message to send"}
            >
              {loading ? (
                <span className="composer-spinner" aria-hidden="true" />
              ) : (
                <ArrowUpIcon size={18} />
              )}
            </button>
          </div>

          <div className="composer-footer-hint">
            <span className="keyboard-hint">
              Press <kbd>Enter</kbd> to send · <kbd>Shift</kbd> + <kbd>Enter</kbd> for newline
            </span>
          </div>
        </div>
      </div>

      {/* Safety & Crisis Helpline Disclaimer */}
      <p className="chat-safety-disclaimer">
        MindSetu AI is an assistive welfare companion, not a clinical or crisis service. In an emergency, contact Tele-MANAS&nbsp;<strong>14416</strong> or KIRAN&nbsp;<strong>1800-599-0019</strong>.
      </p>
    </div>
  );
}

