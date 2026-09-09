-- ==========================================================
-- CUMPLITY AI - ESQUEMA NATIVO POSTGRESQL / SUPABASE (FASE 2)
-- ==========================================================

-- Extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de Consultores / Especialistas SST
CREATE TABLE IF NOT EXISTS consultants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(150) NOT NULL,
    license_number VARCHAR(50) NOT NULL UNIQUE, -- Licencia SST MinTrabajo
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL DEFAULT '$2a$10$defaultHash',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Empresas Cliente (Tenants)
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    consultant_id UUID REFERENCES consultants(id) ON DELETE RESTRICT,
    company_name VARCHAR(200) NOT NULL,
    nit VARCHAR(20) NOT NULL UNIQUE,
    arl_risk_level INT CHECK (arl_risk_level BETWEEN 1 AND 5),
    worker_count INT NOT NULL DEFAULT 1,
    required_standards INT CHECK (required_standards IN (7, 21, 60)),
    economic_sector VARCHAR(150),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Registro de Trabajadores por Empresa
CREATE TABLE IF NOT EXISTS workers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    full_name VARCHAR(150) NOT NULL,
    document_number VARCHAR(20) NOT NULL,
    job_position VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    medical_exam_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(company_id, document_number)
);

-- Evaluación de Estándares Mínimos (Res. 0312 de 2019)
CREATE TABLE IF NOT EXISTS standard_evaluations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    standard_code VARCHAR(10) NOT NULL,
    standard_title TEXT NOT NULL,
    cycle_phase VARCHAR(20) NOT NULL DEFAULT 'PLANEAR',
    weight_percent NUMERIC(5,2) DEFAULT 0,
    status VARCHAR(20) CHECK (status IN ('CUMPLE', 'NO_CUMPLE', 'NO_APLICA')) DEFAULT 'NO_CUMPLE',
    evidence_url TEXT,
    notes TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inspecciones de Riesgo GTC 45 por Voz (Alimentado por n8n / Whisper)
CREATE TABLE IF NOT EXISTS "GTC45_findings" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    zone_area VARCHAR(100),
    risk_type VARCHAR(50),
    danger_description TEXT,
    deficiency_level INT,
    exposure_level INT,
    risk_level INT,
    control_measure TEXT,
    audio_transcript TEXT,
    status VARCHAR(20) DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'CLOSED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bóveda Digital con Retención Legal de 20 Años (Art. 2.2.4.6.13 Decreto 1072)
CREATE TABLE IF NOT EXISTS vault_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    worker_id UUID REFERENCES workers(id) ON DELETE SET NULL,
    document_type VARCHAR(50) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    retention_years INT DEFAULT 20,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Investigación de Accidentes Graves / Mortales (15 días hábiles - Res. 1401/2007)
CREATE TABLE IF NOT EXISTS accident_investigations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    worker_id UUID REFERENCES workers(id) ON DELETE SET NULL,
    event_date TIMESTAMP WITH TIME ZONE NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('GRAVE', 'MORTAL', 'LEVE')),
    legal_deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDIENTE' CHECK (status IN ('PENDIENTE', 'ENVIADO_ARL', 'CERRADO')),
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
