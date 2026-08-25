CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY,
    anonymous BOOLEAN NOT NULL DEFAULT TRUE,
    consent_given BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS assessments (
    id UUID PRIMARY KEY,
    session_id UUID REFERENCES sessions(id),
    assessment_type VARCHAR(20),
    total_score INT,
    risk_level VARCHAR(40),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS assessment_responses (
    id UUID PRIMARY KEY,
    assessment_id UUID REFERENCES assessments(id),
    question_number INT,
    answer INT
);

CREATE TABLE IF NOT EXISTS mood_entries (
    id UUID PRIMARY KEY,
    session_id UUID REFERENCES sessions(id),
    mood INT,
    note TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS counsellors (
    id UUID PRIMARY KEY,
    name VARCHAR(255),
    specialization VARCHAR(255),
    available BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY,
    session_id UUID REFERENCES sessions(id),
    counsellor_id UUID REFERENCES counsellors(id),
    appointment_time TIMESTAMP,
    status VARCHAR(30)
);
