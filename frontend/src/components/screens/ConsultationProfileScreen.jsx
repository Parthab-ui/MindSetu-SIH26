import { useState, useEffect } from "react";
import { api } from "../../services/api";

const ROLE_OPTIONS = [
  "Field Operations Personnel",
  "Tactical Watch Officer",
  "Officer",
  "Medical Staff",
  "Emergency Response Personnel",
  "Reintegrating Service Member",
  "Other",
];

const GENDER_OPTIONS = [
  "Prefer not to say",
  "Male",
  "Female",
  "Other",
];

export function ConsultationProfileScreen({
  sessionId,
  initialData = null,
  defaultRole = "Field Operations Personnel",
  defaultUnit = "Sector Unit Bravo",
  onContinue,
  onBack,
}) {
  const [age, setAge] = useState(initialData?.age ? String(initialData.age) : "");
  const [gender, setGender] = useState(initialData?.gender || "Prefer not to say");
  const [selectedRoleOption, setSelectedRoleOption] = useState(() => {
    if (initialData?.role) {
      return ROLE_OPTIONS.includes(initialData.role) ? initialData.role : "Other";
    }
    return ROLE_OPTIONS.includes(defaultRole) ? defaultRole : "Field Operations Personnel";
  });
  const [customRole, setCustomRole] = useState(() => {
    if (initialData?.role && !ROLE_OPTIONS.includes(initialData.role)) {
      return initialData.role;
    }
    return "";
  });
  const [yearsOfService, setYearsOfService] = useState(
    initialData?.years_of_service !== undefined && initialData?.years_of_service !== null
      ? String(initialData.years_of_service)
      : ""
  );
  const [postingUnit, setPostingUnit] = useState(initialData?.posting_unit || defaultUnit || "");
  const [consultationNote, setConsultationNote] = useState(initialData?.consultation_note || "");

  // Validation errors
  const [ageError, setAgeError] = useState("");
  const [roleError, setRoleError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync if initialData loads later
  useEffect(() => {
    if (initialData) {
      if (initialData.age) setAge(String(initialData.age));
      if (initialData.gender) setGender(initialData.gender);
      if (initialData.role) {
        if (ROLE_OPTIONS.includes(initialData.role)) {
          setSelectedRoleOption(initialData.role);
        } else {
          setSelectedRoleOption("Other");
          setCustomRole(initialData.role);
        }
      }
      if (initialData.years_of_service !== undefined && initialData.years_of_service !== null) {
        setYearsOfService(String(initialData.years_of_service));
      }
      if (initialData.posting_unit) setPostingUnit(initialData.posting_unit);
      if (initialData.consultation_note) setConsultationNote(initialData.consultation_note);
    }
  }, [initialData]);

  const effectiveRole = selectedRoleOption === "Other" ? customRole.trim() : selectedRoleOption;

  const validate = () => {
    let valid = true;

    // Age validation
    const trimmedAge = age.trim();
    if (!trimmedAge) {
      setAgeError("Please enter your age");
      valid = false;
    } else {
      const numAge = Number(trimmedAge);
      if (isNaN(numAge) || !Number.isInteger(numAge) || numAge < 18 || numAge > 100) {
        setAgeError("Please enter a valid age (18–100)");
        valid = false;
      } else {
        setAgeError("");
      }
    }

    // Role validation
    if (selectedRoleOption === "Other" && !customRole.trim()) {
      setRoleError("Please specify your role or designation");
      valid = false;
    } else if (!effectiveRole) {
      setRoleError("Please select your role");
      valid = false;
    } else {
      setRoleError("");
    }

    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    if (isSubmitting) return;

    if (!sessionId) {
      setSubmitError("No active protected session found. Please return to the check-in.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    const payload = {
      sessionId,
      age: Number(age.trim()),
      role: effectiveRole,
      gender,
      yearsOfService: yearsOfService.trim() ? Number(yearsOfService.trim()) : null,
      postingUnit: postingUnit.trim() || null,
      consultationNote: consultationNote.trim() || null,
    };

    try {
      const response = await api.saveConsultationProfile(payload);
      // Persist in session storage
      try {
        sessionStorage.setItem(`mindsetu_consultation_profile_${sessionId}`, JSON.stringify(response));
      } catch {
        // Safe fallback
      }
      setIsSubmitting(false);
      onContinue(response);
    } catch (err) {
      setIsSubmitting(false);
      setSubmitError(err.message || "Failed to save consultation profile. Please try again.");
    }
  };

  return (
    <div className="page-container narrow" style={{ maxWidth: "680px", margin: "0 auto", padding: "0 16px 48px" }}>
      {/* Compact Workflow Progress Bar */}
      <div
        className="consultation-workflow-tracker"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "8px",
          padding: "10px 16px",
          background: "var(--bg-surface-elevated)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-full)",
          marginBottom: "24px",
          fontSize: "0.82rem",
          animation: "slideUp 250ms ease both",
        }}
        aria-label="Workflow progress"
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <span style={{ color: "var(--signal-low)", fontWeight: 700 }}>Assessment ✓</span>
          <span style={{ color: "var(--text-muted)" }}>→</span>
          <span style={{ color: "var(--signal-low)", fontWeight: 700 }}>Analysis ✓</span>
          <span style={{ color: "var(--text-muted)" }}>→</span>
          <span style={{ color: "var(--signal-low)", fontWeight: 700 }}>Support ✓</span>
          <span style={{ color: "var(--text-muted)" }}>→</span>
          <span style={{ color: "var(--primary)", fontWeight: 800 }}>Consultation →</span>
        </div>
        <span
          style={{
            fontSize: "0.72rem",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            fontWeight: 800,
            color: "var(--primary)",
            background: "var(--primary-light)",
            padding: "3px 10px",
            borderRadius: "var(--radius-full)",
          }}
        >
          Stage: Consultation Intake
        </span>
      </div>

      {/* Screen Header */}
      <div style={{ marginBottom: "20px", animation: "slideUp 280ms cubic-bezier(0.2,0.8,0.2,1) both" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
          <span className="eyebrow" style={{ color: "var(--primary)" }}>STEP 04 · PROFESSIONAL CONSULTATION</span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              fontSize: "0.74rem",
              fontWeight: 700,
              padding: "2px 8px",
              background: "rgba(20, 184, 166, 0.12)",
              color: "var(--primary)",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--primary-glow)",
            }}
          >
            🔒 Private & Confidential
          </span>
        </div>

        <h1 className="page-title" style={{ fontSize: "1.65rem", margin: "4px 0 8px" }}>
          Complete Your Consultation Profile
        </h1>
        <p className="page-subtitle" style={{ fontSize: "0.92rem", margin: 0, color: "var(--text-secondary)" }}>
          A few basic details will help the medical professional understand your situation better.
        </p>

        {/* Subtle Privacy Clarification */}
        <p
          style={{
            fontSize: "0.8rem",
            color: "var(--text-muted)",
            margin: "8px 0 0",
            lineHeight: 1.45,
          }}
        >
          This information is used to support your consultation and is kept separate from your operational welfare assessment.
        </p>
      </div>

      {/* Main Intake Form Card */}
      <div
        className="card card-elevated"
        style={{
          padding: "24px 28px",
          borderRadius: "var(--radius-xl)",
          border: "1px solid var(--border-medium)",
          background: "var(--bg-surface-elevated)",
          animation: "slideUp 320ms cubic-bezier(0.2,0.8,0.2,1) both",
        }}
      >
        <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* Field 1: Age (Required) */}
          <div className="input-field">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "6px" }}>
              <label htmlFor="intake-age" style={{ fontWeight: 700, fontSize: "0.88rem", color: "var(--text-primary)" }}>
                1. Age <span style={{ color: "var(--signal-high)" }}>*</span>
              </label>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Required (18–100)</span>
            </div>
            <input
              id="intake-age"
              type="number"
              min="18"
              max="100"
              step="1"
              placeholder="Enter your age"
              value={age}
              onChange={(e) => {
                setAge(e.target.value);
                if (ageError) setAgeError("");
              }}
              className={`text-input ${ageError ? "input-error" : ""}`}
              style={{
                width: "100%",
                padding: "12px 14px",
                fontSize: "0.95rem",
                borderRadius: "var(--radius-md)",
                background: "var(--bg-input)",
                border: ageError ? "1.5px solid var(--signal-high)" : "1px solid var(--border-medium)",
                color: "var(--text-primary)",
              }}
              required
            />
            {ageError && (
              <span style={{ color: "var(--signal-high)", fontSize: "0.78rem", marginTop: "4px", display: "block" }}>
                ⚠️ {ageError}
              </span>
            )}
          </div>

          {/* Field 2: Gender (Optional) */}
          <div className="input-field">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "6px" }}>
              <label htmlFor="intake-gender" style={{ fontWeight: 700, fontSize: "0.88rem", color: "var(--text-primary)" }}>
                2. Gender
              </label>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Optional</span>
            </div>
            <select
              id="intake-gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="select-input"
              style={{
                width: "100%",
                padding: "12px 14px",
                fontSize: "0.92rem",
                borderRadius: "var(--radius-md)",
                background: "var(--bg-input)",
                border: "1px solid var(--border-medium)",
                color: "var(--text-primary)",
              }}
            >
              {GENDER_OPTIONS.map((g) => (
                <option key={g} value={g} style={{ background: "var(--bg-surface-elevated)", color: "var(--text-primary)" }}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          {/* Field 3: Role / Designation (Required) */}
          <div className="input-field">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "6px" }}>
              <label htmlFor="intake-role" style={{ fontWeight: 700, fontSize: "0.88rem", color: "var(--text-primary)" }}>
                3. Role / Designation <span style={{ color: "var(--signal-high)" }}>*</span>
              </label>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Required</span>
            </div>
            <select
              id="intake-role"
              value={selectedRoleOption}
              onChange={(e) => {
                setSelectedRoleOption(e.target.value);
                if (roleError) setRoleError("");
              }}
              className={`select-input ${roleError ? "input-error" : ""}`}
              style={{
                width: "100%",
                padding: "12px 14px",
                fontSize: "0.92rem",
                borderRadius: "var(--radius-md)",
                background: "var(--bg-input)",
                border: roleError ? "1.5px solid var(--signal-high)" : "1px solid var(--border-medium)",
                color: "var(--text-primary)",
              }}
              required
            >
              {ROLE_OPTIONS.map((r) => (
                <option key={r} value={r} style={{ background: "var(--bg-surface-elevated)", color: "var(--text-primary)" }}>
                  {r}
                </option>
              ))}
            </select>

            {/* Custom role input if 'Other' selected */}
            {selectedRoleOption === "Other" && (
              <div style={{ marginTop: "8px" }}>
                <input
                  type="text"
                  placeholder="Specify your role or designation"
                  value={customRole}
                  onChange={(e) => {
                    setCustomRole(e.target.value);
                    if (roleError) setRoleError("");
                  }}
                  className={`text-input ${roleError ? "input-error" : ""}`}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    fontSize: "0.9rem",
                    borderRadius: "var(--radius-md)",
                    background: "var(--bg-input)",
                    border: roleError ? "1.5px solid var(--signal-high)" : "1px solid var(--border-medium)",
                    color: "var(--text-primary)",
                  }}
                  maxLength={120}
                />
              </div>
            )}
            {roleError && (
              <span style={{ color: "var(--signal-high)", fontSize: "0.78rem", marginTop: "4px", display: "block" }}>
                ⚠️ {roleError}
              </span>
            )}
          </div>

          {/* Field 4: Years of Service (Optional) */}
          <div className="input-field">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "6px" }}>
              <label htmlFor="intake-yos" style={{ fontWeight: 700, fontSize: "0.88rem", color: "var(--text-primary)" }}>
                4. Years of Service
              </label>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Optional</span>
            </div>
            <input
              id="intake-yos"
              type="number"
              min="0"
              max="60"
              step="1"
              placeholder="e.g. 4"
              value={yearsOfService}
              onChange={(e) => setYearsOfService(e.target.value)}
              className="text-input"
              style={{
                width: "100%",
                padding: "12px 14px",
                fontSize: "0.95rem",
                borderRadius: "var(--radius-md)",
                background: "var(--bg-input)",
                border: "1px solid var(--border-medium)",
                color: "var(--text-primary)",
              }}
            />
          </div>

          {/* Field 5: Current Posting / Unit (Optional) */}
          <div className="input-field">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "6px" }}>
              <label htmlFor="intake-unit" style={{ fontWeight: 700, fontSize: "0.88rem", color: "var(--text-primary)" }}>
                5. Current Posting / Unit
              </label>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Optional</span>
            </div>
            <input
              id="intake-unit"
              type="text"
              placeholder="e.g. Sector Unit Bravo"
              value={postingUnit}
              onChange={(e) => setPostingUnit(e.target.value)}
              className="text-input"
              style={{
                width: "100%",
                padding: "12px 14px",
                fontSize: "0.95rem",
                borderRadius: "var(--radius-md)",
                background: "var(--bg-input)",
                border: "1px solid var(--border-medium)",
                color: "var(--text-primary)",
              }}
              maxLength={120}
            />
          </div>

          {/* Field 6: Consultation Note (Optional) */}
          <div className="input-field">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "6px" }}>
              <label htmlFor="intake-note" style={{ fontWeight: 700, fontSize: "0.88rem", color: "var(--text-primary)" }}>
                6. Anything you'd like the doctor to know?
              </label>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Optional Note</span>
            </div>
            <textarea
              id="intake-note"
              rows={3}
              placeholder="Briefly describe anything you would like the doctor to be aware of before the consultation..."
              value={consultationNote}
              onChange={(e) => setConsultationNote(e.target.value)}
              className="chat-input"
              style={{
                width: "100%",
                padding: "12px 14px",
                fontSize: "0.88rem",
                lineHeight: "1.45",
                borderRadius: "var(--radius-md)",
                background: "var(--bg-input)",
                border: "1px solid var(--border-medium)",
                color: "var(--text-primary)",
                resize: "vertical",
              }}
              maxLength={1000}
            />
            <span style={{ fontSize: "0.74rem", color: "var(--text-muted)", marginTop: "4px", display: "block" }}>
              Short consultation context only. This is not a diagnostic assessment.
            </span>
          </div>

          {/* Privacy Reassurance Card */}
          <div
            style={{
              padding: "14px 16px",
              background: "rgba(20, 184, 166, 0.07)",
              border: "1px solid rgba(20, 184, 166, 0.22)",
              borderRadius: "var(--radius-md)",
              display: "flex",
              gap: "12px",
              alignItems: "flex-start",
            }}
          >
            <span style={{ fontSize: "1.1rem", lineHeight: 1 }}>🔒</span>
            <div>
              <strong style={{ fontSize: "0.84rem", color: "var(--primary)", display: "block", marginBottom: "2px" }}>
                Your information is protected
              </strong>
              <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", margin: 0, lineHeight: 1.45 }}>
                MindSetu uses these details to provide better consultation context. Your welfare assessment remains separate from disciplinary or operational decision-making.
              </p>
            </div>
          </div>

          {/* Submit Error */}
          {submitError && (
            <div className="error-alert" role="alert" style={{ fontSize: "0.85rem", padding: "10px 14px" }}>
              ⚠️ {submitError}
            </div>
          )}

          {/* Actions */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "12px",
              flexWrap: "wrap",
              marginTop: "8px",
            }}
          >
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onBack}
              disabled={isSubmitting}
              style={{ fontSize: "0.9rem", padding: "10px 18px" }}
            >
              ← Back
            </button>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
              style={{
                fontSize: "0.94rem",
                fontWeight: 800,
                padding: "12px 24px",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                minWidth: "220px",
                justifyContent: "center",
              }}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-ring" style={{ width: "16px", height: "16px", borderWidth: "2px" }} />
                  Saving Profile…
                </>
              ) : (
                "Continue to Available Doctors →"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
