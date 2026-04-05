-- CRM v2 Migration
-- Run in Supabase SQL Editor after the base schema

-- Fix: change assigned_to from UUID to TEXT (we store email, not auth UUID)
ALTER TABLE public.leads
  DROP COLUMN IF EXISTS assigned_to;
ALTER TABLE public.leads
  ADD COLUMN assigned_to TEXT;

-- ─── ACTIVITIES / TASKS ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.activities (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id      UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  type         TEXT NOT NULL DEFAULT 'task' CHECK (type IN ('call','email','meeting','note','task','renewal')),
  title        TEXT NOT NULL,
  description  TEXT,
  due_date     TIMESTAMPTZ,
  completed    BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  assigned_to  TEXT,
  created_by   TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activities_lead_id  ON public.activities(lead_id);
CREATE INDEX IF NOT EXISTS idx_activities_due_date ON public.activities(due_date) WHERE completed = FALSE;
CREATE INDEX IF NOT EXISTS idx_activities_completed ON public.activities(completed);

-- ─── DEALS / OPPORTUNITIES ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.deals (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id        UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  title          TEXT NOT NULL,
  value          NUMERIC(10,2) DEFAULT 0,
  stage          TEXT NOT NULL DEFAULT 'prospect'
                   CHECK (stage IN ('prospect','qualified','proposal','negotiation','won','lost')),
  probability    INTEGER DEFAULT 50 CHECK (probability BETWEEN 0 AND 100),
  expected_close DATE,
  provider       TEXT,
  plan_name      TEXT,
  service_type   TEXT CHECK (service_type IN ('residential','commercial')),
  notes          TEXT,
  assigned_to    TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_deals_stage     ON public.deals(stage);
CREATE INDEX IF NOT EXISTS idx_deals_lead_id   ON public.deals(lead_id);
CREATE INDEX IF NOT EXISTS idx_deals_close     ON public.deals(expected_close);

CREATE TRIGGER deals_updated_at BEFORE UPDATE ON public.deals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS: allow agents/admins to manage
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals      ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agents manage activities" ON public.activities FOR ALL
  USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Agents manage deals" ON public.deals FOR ALL
  USING (TRUE) WITH CHECK (TRUE);
