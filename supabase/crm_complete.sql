-- ============================================================
-- SAIGON POWER CRM — Complete Setup
-- Paste this entire file into Supabase SQL Editor and run.
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── UTILITY FUNCTION ─────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

-- ─── LEADS ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.leads (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name               TEXT NOT NULL,
  email              TEXT,
  phone              TEXT,
  zip                TEXT NOT NULL,
  service_type       TEXT NOT NULL DEFAULT 'residential' CHECK (service_type IN ('residential','commercial')),
  preferred_language TEXT NOT NULL DEFAULT 'vi' CHECK (preferred_language IN ('vi','en')),
  status             TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','contacted','quoted','enrolled','lost')),
  source             TEXT,
  notes              TEXT,
  assigned_to        TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leads_status     ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_zip        ON public.leads(zip);

DROP TRIGGER IF EXISTS leads_updated_at ON public.leads;
CREATE TRIGGER leads_updated_at BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Agents manage leads" ON public.leads;
CREATE POLICY "Agents manage leads" ON public.leads FOR ALL USING (TRUE) WITH CHECK (TRUE);

-- ─── QUOTE REQUESTS ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.quote_requests (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id            UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  name               TEXT NOT NULL,
  email              TEXT,
  phone              TEXT,
  zip                TEXT NOT NULL,
  service_type       TEXT NOT NULL DEFAULT 'residential' CHECK (service_type IN ('residential','commercial')),
  business_name      TEXT,
  monthly_usage_kwh  INTEGER,
  notes              TEXT,
  preferred_language TEXT NOT NULL DEFAULT 'vi' CHECK (preferred_language IN ('vi','en')),
  status             TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','reviewed','sent','accepted','rejected')),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quote_requests_status ON public.quote_requests(status);

ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can manage quotes" ON public.quote_requests;
CREATE POLICY "Anyone can manage quotes" ON public.quote_requests FOR ALL USING (TRUE) WITH CHECK (TRUE);

-- ─── ACTIVITIES ───────────────────────────────────────────────────────────────
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

CREATE INDEX IF NOT EXISTS idx_activities_lead_id   ON public.activities(lead_id);
CREATE INDEX IF NOT EXISTS idx_activities_due_date  ON public.activities(due_date) WHERE completed = FALSE;
CREATE INDEX IF NOT EXISTS idx_activities_completed ON public.activities(completed);

ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Agents manage activities" ON public.activities;
CREATE POLICY "Agents manage activities" ON public.activities FOR ALL USING (TRUE) WITH CHECK (TRUE);

-- ─── DEALS ────────────────────────────────────────────────────────────────────
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

CREATE INDEX IF NOT EXISTS idx_deals_stage   ON public.deals(stage);
CREATE INDEX IF NOT EXISTS idx_deals_lead_id ON public.deals(lead_id);
CREATE INDEX IF NOT EXISTS idx_deals_close   ON public.deals(expected_close);

DROP TRIGGER IF EXISTS deals_updated_at ON public.deals;
CREATE TRIGGER deals_updated_at BEFORE UPDATE ON public.deals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Agents manage deals" ON public.deals;
CREATE POLICY "Agents manage deals" ON public.deals FOR ALL USING (TRUE) WITH CHECK (TRUE);

-- ─── CONTRACTS ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.contracts (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id      UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  provider     TEXT NOT NULL,
  plan_name    TEXT,
  service_type TEXT NOT NULL DEFAULT 'residential' CHECK (service_type IN ('residential','commercial')),
  address      TEXT,
  zip          TEXT,
  esid         TEXT,
  start_date   DATE NOT NULL,
  end_date     DATE NOT NULL,
  rate_kwh     NUMERIC(6,4),
  term_months  INTEGER,
  status       TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','expired','cancelled','pending')),
  notes        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contracts_end_date   ON public.contracts(end_date);
CREATE INDEX IF NOT EXISTS idx_contracts_status     ON public.contracts(status);
CREATE INDEX IF NOT EXISTS idx_contracts_lead_id    ON public.contracts(lead_id);

DROP TRIGGER IF EXISTS contracts_updated_at ON public.contracts;
CREATE TRIGGER contracts_updated_at BEFORE UPDATE ON public.contracts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Agents manage contracts" ON public.contracts;
CREATE POLICY "Agents manage contracts" ON public.contracts FOR ALL USING (TRUE) WITH CHECK (TRUE);

-- ─── CRM PROVIDERS ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.crm_providers (
  id                     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                   TEXT NOT NULL,
  short_name             TEXT NOT NULL,
  website                TEXT NOT NULL DEFAULT '',
  phone                  TEXT NOT NULL DEFAULT '',
  commission_residential NUMERIC(10,2) NOT NULL DEFAULT 0,
  commission_commercial  NUMERIC(10,2) NOT NULL DEFAULT 0,
  active_plans           INTEGER NOT NULL DEFAULT 0,
  notes                  TEXT,
  status                 TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive'))
);

ALTER TABLE public.crm_providers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Agents manage crm_providers" ON public.crm_providers;
CREATE POLICY "Agents manage crm_providers" ON public.crm_providers FOR ALL USING (TRUE) WITH CHECK (TRUE);

INSERT INTO public.crm_providers (name, short_name, website, phone, commission_residential, commission_commercial, active_plans, notes, status) VALUES
  ('Gexa Energy',    'Gexa',    'gexaenergy.com',    '1-855-639-2727', 75,  150, 4, 'Best residential rates in Houston area.',    'active'),
  ('TXU Energy',     'TXU',     'txu.com',           '1-800-818-6132', 80,  175, 6, 'Large brand — good for EN-speaking clients.','active'),
  ('Reliant Energy', 'Reliant', 'reliant.com',        '1-866-222-7100', 70,  200, 5, 'Strong commercial pricing.',                 'active'),
  ('Green Mountain', 'GreenMtn','greenmountain.com',  '1-866-785-1885', 65,  120, 3, '100% renewable options.',                    'active'),
  ('Cirro Energy',   'Cirro',   'cirroenergy.com',    '1-888-600-0872', 60,  100, 3, 'Budget plans for price-sensitive customers.','active'),
  ('Payless Power',  'Payless', 'paylesspower.com',   '1-888-963-9363', 50,  0,   2, 'Prepaid only. Good for credit-challenged.',  'active')
ON CONFLICT DO NOTHING;

-- ─── CRM PLANS ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.crm_plans (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id      TEXT NOT NULL,
  provider_name    TEXT NOT NULL,
  name             TEXT NOT NULL,
  rate_kwh         NUMERIC(6,4) NOT NULL,
  term_months      INTEGER NOT NULL DEFAULT 12,
  service_type     TEXT NOT NULL DEFAULT 'residential' CHECK (service_type IN ('residential','commercial')),
  cancellation_fee NUMERIC(10,2),
  renewable        BOOLEAN NOT NULL DEFAULT FALSE,
  promo            TEXT,
  status           TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive'))
);

ALTER TABLE public.crm_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Agents manage crm_plans" ON public.crm_plans;
CREATE POLICY "Agents manage crm_plans" ON public.crm_plans FOR ALL USING (TRUE) WITH CHECK (TRUE);

INSERT INTO public.crm_plans (provider_id, provider_name, name, rate_kwh, term_months, service_type, cancellation_fee, renewable, promo, status) VALUES
  ('prv-001','Gexa Energy',    'Gexa Saver 12',       0.109, 12, 'residential', 150,  false, null,                 'active'),
  ('prv-001','Gexa Energy',    'Gexa Saver 24',       0.115, 24, 'residential', 200,  false, '$50 bill credit',    'active'),
  ('prv-001','Gexa Energy',    'Gexa Green 12',       0.118, 12, 'residential', 150,  true,  null,                 'active'),
  ('prv-002','TXU Energy',     'TXU Simple Rate 12',  0.121, 12, 'residential', 175,  false, null,                 'active'),
  ('prv-002','TXU Energy',     'TXU Energy Saver 24', 0.118, 24, 'residential', 200,  false, '$100 Visa gift card','active'),
  ('prv-002','TXU Energy',     'TXU Business 12',     0.128, 12, 'commercial',  300,  false, null,                 'active'),
  ('prv-003','Reliant Energy', 'Reliant Secure 12',   0.124, 12, 'residential', 150,  false, null,                 'active'),
  ('prv-003','Reliant Energy', 'Reliant Business 12', 0.132, 12, 'commercial',  350,  false, null,                 'active'),
  ('prv-004','Green Mountain', 'Green Simple 12',     0.125, 12, 'residential', 100,  true,  null,                 'active'),
  ('prv-005','Cirro Energy',   'Cirro Value 6',       0.114, 6,  'residential', 75,   false, null,                 'active'),
  ('prv-005','Cirro Energy',   'Cirro Value 12',      0.119, 12, 'residential', 100,  false, null,                 'active'),
  ('prv-006','Payless Power',  'Payless Prepaid',     0.138, 0,  'residential', null, false, 'No deposit required','active')
ON CONFLICT DO NOTHING;

-- ─── EMAIL TEMPLATES ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.email_templates (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT NOT NULL,
  trigger    TEXT NOT NULL,
  subject    TEXT NOT NULL,
  body       TEXT NOT NULL,
  active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS email_templates_updated_at ON public.email_templates;
CREATE TRIGGER email_templates_updated_at BEFORE UPDATE ON public.email_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Agents manage email_templates" ON public.email_templates;
CREATE POLICY "Agents manage email_templates" ON public.email_templates FOR ALL USING (TRUE) WITH CHECK (TRUE);

INSERT INTO public.email_templates (name, trigger, subject, body) VALUES
  ('New Lead Welcome',        'lead:new',              'Welcome to Saigon Power!',                                     'Hi {{name}}, thank you for reaching out...'),
  ('Quote Follow-up',         'lead:quoted',           '⚡ Your electricity quote is ready — {{name}}',                'Hi {{name}}, I''ve put together a personalized rate comparison...'),
  ('Renewal Reminder 60d',    'contract:expiring_60d', '📅 Your contract renews in 60 days — lock in a better rate',  'Hi {{name}}, your plan with {{provider}} expires on {{expiry_date}}...'),
  ('Renewal Reminder 30d',    'contract:expiring_30d', '🚨 30 days left — avoid rollover rates',                      'Hi {{name}}, this is your 30-day reminder...'),
  ('Enrollment Confirmation', 'lead:enrolled',         '✅ You''re enrolled with {{provider}}!',                      'Congratulations {{name}}! Your enrollment is confirmed...'),
  ('Lost Lead Recovery',      'lead:lost_30d',         'Still looking for a better electricity rate?',                 'Hi {{name}}, it''s been a while since we last spoke...')
ON CONFLICT DO NOTHING;

-- ─── AUTOMATION RULES ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.automation_rules (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         TEXT NOT NULL,
  trigger_type TEXT NOT NULL,
  trigger_val  TEXT,
  action_type  TEXT NOT NULL,
  action_data  JSONB NOT NULL,
  active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.automation_rules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Agents manage automation_rules" ON public.automation_rules;
CREATE POLICY "Agents manage automation_rules" ON public.automation_rules FOR ALL USING (TRUE) WITH CHECK (TRUE);

INSERT INTO public.automation_rules (name, trigger_type, trigger_val, action_type, action_data) VALUES
  ('Lead Contacted Follow-up', 'lead_status_change',     'contacted', 'create_activity', '{"type":"call","title":"Follow up after initial contact","daysOut":2}'),
  ('Quote Sent Follow-up',     'lead_status_change',     'quoted',    'create_activity', '{"type":"email","title":"Follow up on quote sent","daysOut":3}'),
  ('Deal Proposal Next Step',  'deal_stage_change',      'proposal',  'create_activity', '{"type":"email","title":"Send proposal and rate comparison","daysOut":1}'),
  ('Deal Won — LOA Task',      'deal_stage_change',      'won',       'create_activity', '{"type":"task","title":"Process enrollment and send LOA","daysOut":0}'),
  ('Renewal 60d Reminder',     'contract_expiry_window', '60',        'create_activity', '{"type":"call","title":"Schedule renewal call","daysOut":0}'),
  ('Renewal 30d Reminder',     'contract_expiry_window', '30',        'create_activity', '{"type":"email","title":"Send renewal quote","daysOut":0}'),
  ('Renewal 7d URGENT',        'contract_expiry_window', '7',         'create_activity', '{"type":"task","title":"URGENT — contract expiring","daysOut":0}')
ON CONFLICT DO NOTHING;

-- ─── COMMISSIONS ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.commissions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deal_id         UUID REFERENCES public.deals(id) ON DELETE CASCADE,
  lead_id         UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  provider        TEXT NOT NULL,
  period_start    DATE NOT NULL,
  period_end      DATE,
  amount_expected NUMERIC(10,2) NOT NULL,
  amount_received NUMERIC(10,2) DEFAULT 0,
  status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','received','short_pay','missing')),
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_commissions_status ON public.commissions(status);
CREATE INDEX IF NOT EXISTS idx_commissions_period ON public.commissions(period_start);

ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Agents manage commissions" ON public.commissions;
CREATE POLICY "Agents manage commissions" ON public.commissions FOR ALL USING (TRUE) WITH CHECK (TRUE);

-- ─── AUTOMATION LOGS ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.automation_logs (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rule_id    UUID REFERENCES public.automation_rules(id) ON DELETE SET NULL,
  rule_name  TEXT NOT NULL,
  entity_id  TEXT,
  result     TEXT NOT NULL,
  details    TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_automation_logs_created ON public.automation_logs(created_at DESC);

ALTER TABLE public.automation_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone view logs" ON public.automation_logs;
DROP POLICY IF EXISTS "System insert logs" ON public.automation_logs;
CREATE POLICY "Anyone view logs"   ON public.automation_logs FOR SELECT USING (TRUE);
CREATE POLICY "System insert logs" ON public.automation_logs FOR INSERT WITH CHECK (TRUE);
