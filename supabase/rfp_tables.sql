-- ============================================================
-- SAIGON POWER CRM — RFP (Request for Proposal) Tables
-- Run in Supabase SQL Editor after crm_complete.sql
-- ============================================================

-- ─── RFP REQUESTS ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.rfp_requests (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id      UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  title        TEXT NOT NULL,
  service_type TEXT NOT NULL DEFAULT 'residential' CHECK (service_type IN ('residential','commercial')),
  usage_kwh    INTEGER NOT NULL DEFAULT 1200,
  zip          TEXT,
  status       TEXT NOT NULL DEFAULT 'draft'
                 CHECK (status IN ('draft','sent','received','closed')),
  notes        TEXT,
  created_by   TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rfp_requests_status  ON public.rfp_requests(status);
CREATE INDEX IF NOT EXISTS idx_rfp_requests_lead_id ON public.rfp_requests(lead_id);

DROP TRIGGER IF EXISTS rfp_requests_updated_at ON public.rfp_requests;
CREATE TRIGGER rfp_requests_updated_at BEFORE UPDATE ON public.rfp_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE public.rfp_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Agents manage rfp_requests" ON public.rfp_requests;
CREATE POLICY "Agents manage rfp_requests" ON public.rfp_requests FOR ALL USING (TRUE) WITH CHECK (TRUE);

-- ─── RFP RESPONSES ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.rfp_responses (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rfp_id           UUID NOT NULL REFERENCES public.rfp_requests(id) ON DELETE CASCADE,
  provider_name    TEXT NOT NULL,
  plan_name        TEXT,
  rate_kwh         NUMERIC(6,4),
  term_months      INTEGER,
  cancellation_fee NUMERIC(10,2),
  renewable        BOOLEAN NOT NULL DEFAULT FALSE,
  notes            TEXT,
  status           TEXT NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending','received','declined')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rfp_responses_rfp_id ON public.rfp_responses(rfp_id);

ALTER TABLE public.rfp_responses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Agents manage rfp_responses" ON public.rfp_responses;
CREATE POLICY "Agents manage rfp_responses" ON public.rfp_responses FOR ALL USING (TRUE) WITH CHECK (TRUE);

-- ─── Add customer_name to contracts (if missing) ───────────────────────────
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS customer_name TEXT;
