export function Badge({ level, children }) {
  const norm = String(level || "").toLowerCase();
  let badgeClass = "badge-low";
  if (norm === "high") badgeClass = "badge-high";
  else if (norm === "moderate") badgeClass = "badge-moderate";

  return (
    <span className={`badge ${badgeClass}`}>
      <span style={{ fontSize: "0.6rem" }}>●</span>
      <span>{children || level}</span>
    </span>
  );
}
