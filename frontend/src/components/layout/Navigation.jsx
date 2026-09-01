export function Navigation({ screen, setScreen, hasAnalysis }) {
  const steps = [
    { id: "wellness", label: "01 Wellbeing Pulse" },
    { id: "workload", label: "02 Duty & Context" },
    { id: "analysis", label: "03 Welfare Summary", disabled: !hasAnalysis },
    { id: "chat", label: "04 AI Companion", disabled: !hasAnalysis },
    { id: "mood", label: "05 Mood Check-in" },
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
