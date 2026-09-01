import { useId } from "react";

export function SliderField({ label, helper, value, min, max, step = 1, unit = "", onChange }) {
  const numValue = Number(value);
  const inputId = useId();
  const helperId = useId();

  return (
    <div className="slider-group">
      <div className="slider-header">
        <label htmlFor={inputId} style={{ cursor: "pointer", fontWeight: 600, fontSize: "0.88rem", color: "var(--text-primary)" }}>
          {label}
        </label>
        <span className="slider-val-badge" aria-hidden="true">
          {numValue} {unit}
        </span>
      </div>
      {helper && (
        <small id={helperId} style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
          {helper}
        </small>
      )}
      <input
        id={inputId}
        type="range"
        className="slider-input-range"
        min={min}
        max={max}
        step={step}
        value={numValue}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        aria-describedby={helper ? helperId : undefined}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={numValue}
        aria-valuetext={`${numValue} ${unit}`.trim()}
      />
    </div>
  );
}

