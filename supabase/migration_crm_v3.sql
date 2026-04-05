-- CRM v3 Migration — Automation, Commission Tracking, Email Templates
-- Run in Supabase SQL Editor after migration_crm_v2.sql

-- ─── EMAIL TEMPLATES ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.email_templates (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  trigger     TEXT NOT NULL,           -- e.g. 'lead:contacted', 'contract:expiring_60d'
  subject     TEXT NOT NULL,
  body        TEXT NOT NULL,           -- HTML or plain text with {{variable}} placeholders
  active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.email_templates (name, trigger, subject, body) VALUES
('New Lead Welcome',         'lead:new',              'Welcome to Saigon Power!',                                          'Hi {{name}}, thank you for reaching out...'),
('Quote Follow-up',          'lead:quoted',           '⚡ Your electricity quote is ready — {{name}}',                     'Hi {{name}}, I''ve put together a personalized rate comparison...'),
('Renewal Reminder 60d',     'contract:expiring_60d', '📅 Your contract renews in 60 days — lock in a better rate',        'Hi {{name}}, your plan with {{provider}} expires on {{expiry_date}}...'),
('Renewal Reminder 30d',     'contract:expiring_30d', '🚨 30 days left — avoid rollover rates',                            'Hi {{name}}, this is your 30-day reminder...'),
('Enrollment Confirmation',  'lead:enrolled',         '✅ You''re enrolled with {{provider}}!',                            'Congratulations {{name}}! Your enrollment is confirmed...'),
('Lost Lead Recovery',       'lead:lost_30d',         'Still looking for a better electricity rate?',                      'Hi {{name}}, it''s been a while since we last spoke...');

-- ─── AUTOMATION RULES ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.automation_rules (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         TEXT NOT NULL,
  trigger_type TEXT NOT NULL,     -- 'lead_status_change', 'deal_stage_change', 'contract_expiry_window'
  trigger_val  TEXT,              -- e.g. 'contacted', 'proposal', '60'
  action_type  TEXT NOT NULL,     -- 'create_activity', 'send_email', 'assign_lead'
  action_data  JSONB NOT NULL,    -- { type, title, daysOut } or { template_id }
  active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.automation_rules (name, trigger_type, trigger_val, action_type, action_data) VALUES
('Lead Contacted Follow-up', 'lead_status_change', 'contacted', 'create_activity', '{"type":"call","title":"Follow up after initial contact","daysOut":2}'),
('Quote Sent Follow-up',     'lead_status_change', 'quoted',    'create_activity', '{"type":"email","title":"Follow up on quote sent","daysOut":3}'),
('Deal Proposal Next Step',  'deal_stage_change',  'proposal',  'create_activity', '{"type":"email","title":"Send proposal and rate comparison","daysOut":1}'),
('Deal Won — LOA Task',      'deal_stage_change',  'won',       'create_activity', '{"type":"task","title":"Process enrollment and send LOA","daysOut":0}'),
('Renewal 60d Reminder',     'contract_expiry_window', '60',    'create_activity', '{"type":"call","title":"Schedule renewal call","daysOut":0}'),
('Renewal 30d Reminder',     'contract_expiry_window', '30',    'create_activity', '{"type":"email","title":"Send renewal quote","daysOut":0}'),
('Renewal 7d URGENT',        'contract_expiry_window', '7',     'create_activity', '{"type":"task","title":"URGENT — contract expiring","daysOut":0}');

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
                    CHECK (status IN ('pending', 'received', 'short_pay', 'missing')),
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_commissions_deal_id   ON public.commissions(deal_id);
CREATE INDEX IF NOT EXISTS idx_commissions_status    ON public.commissions(status);
CREATE INDEX IF NOT EXISTS idx_commissions_period    ON public.commissions(period_start);

-- ─── AUTOMATION LOG ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.automation_logs (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rule_id      UUID REFERENCES public.automation_rules(id) ON DELETE SET NULL,
  rule_name    TEXT NOT NULL,
  entity_id    TEXT,               -- lead_id or deal_id that triggered it
  result       TEXT NOT NULL,      -- 'ok', 'error', 'skipped'
  details      TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_automation_logs_created ON public.automation_logs(created_at DESC);

-- ─── RLS ──────────────────────────────────────────────────────────────────────
ALTER TABLE public.email_templates   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_rules  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commissions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_logs   ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agents manage email_templates"  ON public.email_templates  FOR ALL USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Agents manage automation_rules" ON public.automation_rules FOR ALL USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Agents manage commissions"      ON public.commissions      FOR ALL USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Agents view automation_logs"    ON public.automation_logs  FOR SELECT USING (TRUE);
CREATE POLICY "System insert automation_logs"  ON public.automation_logs  FOR INSERT WITH CHECK (TRUE);

-- ─── TRIGGERS ─────────────────────────────────────────────────────────────────
CREATE TRIGGER email_templates_updated_at BEFORE UPDATE ON public.email_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
