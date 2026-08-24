-- Phase 3: Core Lead Management Engine Schema Migration

-- 1. Courses Table
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(50),
    description TEXT,
    duration VARCHAR(100),
    fee NUMERIC(12, 2),
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT uk_courses_org_name UNIQUE (organization_id, name)
);

CREATE INDEX IF NOT EXISTS idx_courses_org_active ON courses(organization_id, active);

-- 2. Leads Table
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    normalized_phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
    source VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'NEW',
    priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    assigned_to_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT,
    deleted BOOLEAN NOT NULL DEFAULT false,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_leads_org_status ON leads(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_leads_org_assigned ON leads(organization_id, assigned_to_user_id);
CREATE INDEX IF NOT EXISTS idx_leads_org_created ON leads(organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_org_course ON leads(organization_id, course_id);
CREATE INDEX IF NOT EXISTS idx_leads_org_norm_phone ON leads(organization_id, normalized_phone);
CREATE INDEX IF NOT EXISTS idx_leads_org_deleted ON leads(organization_id, deleted);

-- 3. Lead Activities Table
CREATE TABLE IF NOT EXISTS lead_activities (
    id UUID PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    performed_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    type VARCHAR(50) NOT NULL,
    summary VARCHAR(255) NOT NULL,
    details TEXT,
    metadata TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_activities_org_lead_created ON lead_activities(organization_id, lead_id, created_at DESC);

-- 4. Follow-ups Table
CREATE TABLE IF NOT EXISTS follow_ups (
    id UUID PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    assigned_to_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    notes TEXT,
    outcome_notes TEXT,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_followups_org_status_sched ON follow_ups(organization_id, status, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_followups_org_assigned ON follow_ups(organization_id, assigned_to_user_id, status);
CREATE INDEX IF NOT EXISTS idx_followups_org_lead ON follow_ups(organization_id, lead_id);
