import { useState, useRef, useEffect, useId } from "react";

/**
 * Accessible, responsive popover for Layer 2 progressive disclosure.
 * Allows users to tap/click or use keyboard for a concise, plain-language explanation
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
  const triggerRef = useRef(null);
  const popoverId = useId();

  // Close on outside click or Escape key, and return focus to trigger
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(e) {
      if (e.key === "Escape") {
        e.stopPropagation();
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  function handleTriggerClick(e) {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  }

  function handleCloseClick(e) {
    e.stopPropagation();
    setIsOpen(false);
    triggerRef.current?.focus();
  }

  return (
    <div className="info-tooltip-wrapper" ref={containerRef}>
      <button
        ref={triggerRef}
        type="button"
        className={`info-tooltip-trigger ${isOpen ? "active" : ""}`}
        onClick={handleTriggerClick}
        aria-expanded={isOpen}
        aria-controls={isOpen ? popoverId : undefined}
        aria-label={label}
        title={label}
      >
        <span aria-hidden="true">ⓘ</span>
      </button>

      {isOpen && (
        <div
          id={popoverId}
          className={`info-tooltip-popover align-${align}`}
          role="region"
          aria-label={title || label}
        >
          <div className="info-tooltip-header">
            <span className="info-tooltip-title">{title}</span>
            <button
              type="button"
              className="info-tooltip-close"
              onClick={handleCloseClick}
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

