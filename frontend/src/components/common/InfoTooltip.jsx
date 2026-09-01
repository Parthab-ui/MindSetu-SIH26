import { useState, useRef, useEffect } from "react";

/**
 * Accessible, responsive popover for Layer 2 progressive disclosure.
 * Allows users to tap/click for a concise, plain-language explanation
 * with optional technical/research metadata without leaving the page.
 */
export function InfoTooltip({
  title,
  text,
  techDetail = null,
  label = "More information",
  align = "right", // "left" | "right" | "center"
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close on outside click or Escape key
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(e) {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="info-tooltip-wrapper" ref={containerRef}>
      <button
        type="button"
        className={`info-tooltip-trigger ${isOpen ? "active" : ""}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-label={label}
        title={label}
      >
        <span aria-hidden="true">ⓘ</span>
      </button>

      {isOpen && (
        <div
          className={`info-tooltip-popover align-${align}`}
          role="region"
          aria-label={title || label}
        >
          <div className="info-tooltip-header">
            <span className="info-tooltip-title">{title}</span>
            <button
              type="button"
              className="info-tooltip-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close information dialog"
            >
              ✕
            </button>
          </div>
          <p className="info-tooltip-text">{text}</p>
          {techDetail && (
            <div className="info-tooltip-tech">
              <span className="info-tooltip-tech-label">TECHNICAL DETAIL</span>
              <span className="info-tooltip-tech-text">{techDetail}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
