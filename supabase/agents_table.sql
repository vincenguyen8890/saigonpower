-- ============================================================
-- SAIGON POWER CRM — Sales Agents Table
-- Run in Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS public.crm_agents (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  role       TEXT NOT NULL DEFAULT 'agent' CHECK (role IN ('admin', 'agent')),
  phone      TEXT,
  active     BOOLEAN NOT NULL DEFAULT TRUE,
  notes      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS crm_agents_email_idx ON public.crm_agents(email);

ALTER TABLE public.crm_agents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Agents manage crm_agents" ON public.crm_agents;
CREATE POLICY "Agents manage crm_agents" ON public.crm_agents FOR ALL USING (TRUE) WITH CHECK (TRUE);

-- Seed initial agents
INSERT INTO public.crm_agents (name, email, role, phone, active) VALUES
  ('Admin',       'admin@saigonllc.com',  'admin', '(832) 937-9999', true),
  ('Sales Agent', 'agent@saigonllc.com',  'agent', '(832) 937-9998', true)
ON CONFLICT DO NOTHING;
