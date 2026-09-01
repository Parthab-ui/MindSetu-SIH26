export function SliderField({ label, helper, value, min, max, step = 1, unit = "", onChange }) {
  const numValue = Number(value);

  return (
    <div className="slider-group">
      <div className="slider-header">
        <span>{label}</span>
        <span className="slider-val-badge">
          {numValue} {unit}
        </span>
      </div>
      {helper && <small style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{helper}</small>}
      <input
        type="range"
        className="slider-input-range"
        min={min}
        max={max}
        step={step}
        value={numValue}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={numValue}
      />
    </div>
  );
}
