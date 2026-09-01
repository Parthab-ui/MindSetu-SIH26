export function Navigation({ screen, setScreen, hasAnalysis }) {
  const steps = [
    { id: "wellness", label: "Wellbeing Pulse" },
    { id: "workload", label: "Duty & Context" },
    { id: "analysis", label: "Welfare Summary", disabled: !hasAnalysis },
    { id: "chat",     label: "AI Companion",   disabled: !hasAnalysis },
    { id: "mood",     label: "Mood Check-in" },
  ];

  return (
    <nav className="stepper-nav" aria-label="Workflow progress">
      {steps.map((step, index) => {
        const isActive = screen === step.id;
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
