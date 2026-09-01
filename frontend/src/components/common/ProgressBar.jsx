export function ProgressBar({ percent }) {
  const safePercent = Math.min(Math.max(Number(percent) || 0, 0), 100);

  return (
    <div className="progress-container" role="progressbar" aria-valuenow={safePercent} aria-valuemin="0" aria-valuemax="100">
      <div className="progress-bar-fill" style={{ width: `${safePercent}%` }} />
    </div>
  );
}
