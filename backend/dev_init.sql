-- MindSetu development database initialisation.
-- These tables match the schemas created by ensure_core_tables() and
-- ensure_sih26186_tables() in the backend.  Run once on a fresh database.

CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY,
    anonymous BOOLEAN NOT NULL DEFAULT TRUE,
    consent_given BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mood_entries (
    id UUID PRIMARY KEY,
    session_id UUID REFERENCES sessions(id),
    mood INT,
    note TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sih26186_wellness (
    id UUID PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES sessions(id),
    answers JSONB NOT NULL,
    stress_score NUMERIC(6,2) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sih26186_workload (
    id UUID PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES sessions(id),
    role VARCHAR(120) NOT NULL,
    unit VARCHAR(120),
    duty_hours NUMERIC(5,2) NOT NULL,
    night_duties INTEGER NOT NULL,
    rest_hours NUMERIC(5,2) NOT NULL,
    days_since_leave INTEGER NOT NULL,
    workload_level INTEGER NOT NULL,
    high_pressure_assignment BOOLEAN NOT NULL DEFAULT FALSE,
    duty_change_frequency INTEGER NOT NULL DEFAULT 0,
    workload_score NUMERIC(6,2) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sih26186_analysis (
    id UUID PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES sessions(id),
    wellness_score NUMERIC(6,2) NOT NULL,
    workload_score NUMERIC(6,2) NOT NULL,
    combined_score NUMERIC(6,2) NOT NULL,
    risk_level VARCHAR(20) NOT NULL,
    recommendation TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
