export function Navigation({ screen, setScreen, hasAnalysis }) {
  const steps = [
    { id: "wellness", label: "Wellbeing Pulse" },
    { id: "workload", label: "Duty & Context" },
    { id: "analysis", label: "Welfare Summary", disabled: !hasAnalysis },
    { id: "doctors",  label: "Doctor Connect",  disabled: !hasAnalysis },
    { id: "chat",     label: "AI Companion",   disabled: !hasAnalysis },
    { id: "mood",     label: "Mood Check-in" },
  ];

  return (
    <nav className="stepper-nav" aria-label="Workflow progress">
      {steps.map((step, index) => {
        const isDoctorGroup = step.id === "doctors" && (
          screen === "doctors" ||
          screen === "doctor-profile" ||
          screen === "appointments" ||
          screen === "consultation"
        );
        const isActive = isDoctorGroup || screen === step.id;
        return (
          <button
            key={step.id}
            className={`stepper-tab ${isActive ? "active" : ""}`}
            disabled={step.disabled}
            onClick={() => setScreen(step.id)}
            aria-current={isActive ? "step" : undefined}
          >
            <span className="stepper-step-num">{index + 1}</span>
            <span>{step.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
