-- ============================================================
-- RLS Policies for Saigon Power CRM
-- Run in Supabase SQL Editor → paste & run
--
-- Strategy: uses current_setting('app.role') and
-- current_setting('app.user_email') which the app sets
-- per-request before any query on the anon client.
-- The admin (service_role) client bypasses RLS entirely.
-- ============================================================

-- ── Enable RLS on all tables ────────────────────────────────
ALTER TABLE leads             ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals             ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities        ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts         ENABLE ROW LEVEL SECURITY;
ALTER TABLE commissions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_notes        ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_notes        ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_agents        ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_agent_goals   ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_plans         ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_providers     ENABLE ROW LEVEL SECURITY;

-- ── Drop old permissive catch-all policies ──────────────────
DROP POLICY IF EXISTS "Agents manage activities"       ON activities;
DROP POLICY IF EXISTS "Agents manage automation_rules" ON automation_rules;
DROP POLICY IF EXISTS "Agents manage commissions"      ON commissions;
DROP POLICY IF EXISTS "Agents manage contracts"        ON contracts;
DROP POLICY IF EXISTS "Anyone view logs"               ON automation_logs;
DROP POLICY IF EXISTS "System insert logs"             ON automation_logs;

-- ── Helper: is the current session admin or office_manager ──
-- (avoids repeating the same expression everywhere)

-- ── LEADS ───────────────────────────────────────────────────
DROP POLICY IF EXISTS "leads_select" ON leads;
CREATE POLICY "leads_select" ON leads FOR SELECT USING (
  current_setting('app.role', true) IN ('admin', 'office_manager', 'csr')
  OR current_setting('app.user_email', true) = assigned_to
);

DROP POLICY IF EXISTS "leads_insert" ON leads;
CREATE POLICY "leads_insert" ON leads FOR INSERT WITH CHECK (
  current_setting('app.role', true) IN ('admin', 'office_manager', 'csr', 'agent')
);

DROP POLICY IF EXISTS "leads_update" ON leads;
CREATE POLICY "leads_update" ON leads FOR UPDATE USING (
  current_setting('app.role', true) IN ('admin', 'office_manager', 'csr')
  OR current_setting('app.user_email', true) = assigned_to
);

DROP POLICY IF EXISTS "leads_delete" ON leads;
CREATE POLICY "leads_delete" ON leads FOR DELETE USING (
  current_setting('app.role', true) IN ('admin', 'office_manager')
);

-- ── DEALS ───────────────────────────────────────────────────
DROP POLICY IF EXISTS "deals_select" ON deals;
CREATE POLICY "deals_select" ON deals FOR SELECT USING (
  current_setting('app.role', true) IN ('admin', 'office_manager', 'csr')
  OR current_setting('app.user_email', true) = agent_email
);

DROP POLICY IF EXISTS "deals_insert" ON deals;
CREATE POLICY "deals_insert" ON deals FOR INSERT WITH CHECK (
  current_setting('app.role', true) IN ('admin', 'office_manager', 'csr', 'agent')
);

DROP POLICY IF EXISTS "deals_update" ON deals;
CREATE POLICY "deals_update" ON deals FOR UPDATE USING (
  current_setting('app.role', true) IN ('admin', 'office_manager')
  OR current_setting('app.user_email', true) = agent_email
);

DROP POLICY IF EXISTS "deals_delete" ON deals;
CREATE POLICY "deals_delete" ON deals FOR DELETE USING (
  current_setting('app.role', true) IN ('admin', 'office_manager')
);

-- ── ACTIVITIES ──────────────────────────────────────────────
DROP POLICY IF EXISTS "activities_select" ON activities;
CREATE POLICY "activities_select" ON activities FOR SELECT USING (
  current_setting('app.role', true) IN ('admin', 'office_manager', 'csr')
  OR current_setting('app.user_email', true) = agent_email
);

DROP POLICY IF EXISTS "activities_insert" ON activities;
CREATE POLICY "activities_insert" ON activities FOR INSERT WITH CHECK (
  current_setting('app.role', true) IN ('admin', 'office_manager', 'csr', 'agent')
);

DROP POLICY IF EXISTS "activities_update" ON activities;
CREATE POLICY "activities_update" ON activities FOR UPDATE USING (
  current_setting('app.role', true) IN ('admin', 'office_manager')
  OR current_setting('app.user_email', true) = agent_email
);

-- ── CONTRACTS ───────────────────────────────────────────────
DROP POLICY IF EXISTS "contracts_select" ON contracts;
CREATE POLICY "contracts_select" ON contracts FOR SELECT USING (
  current_setting('app.role', true) IN ('admin', 'office_manager', 'csr')
  OR current_setting('app.user_email', true) = agent_email
);

DROP POLICY IF EXISTS "contracts_insert" ON contracts;
CREATE POLICY "contracts_insert" ON contracts FOR INSERT WITH CHECK (
  current_setting('app.role', true) IN ('admin', 'office_manager', 'csr', 'agent')
);

DROP POLICY IF EXISTS "contracts_update" ON contracts;
CREATE POLICY "contracts_update" ON contracts FOR UPDATE USING (
  current_setting('app.role', true) IN ('admin', 'office_manager')
  OR current_setting('app.user_email', true) = agent_email
);

-- ── COMMISSIONS ─────────────────────────────────────────────
DROP POLICY IF EXISTS "commissions_select" ON commissions;
CREATE POLICY "commissions_select" ON commissions FOR SELECT USING (
  current_setting('app.role', true) IN ('admin', 'office_manager')
  OR current_setting('app.user_email', true) = agent_email
);

DROP POLICY IF EXISTS "commissions_insert" ON commissions;
CREATE POLICY "commissions_insert" ON commissions FOR INSERT WITH CHECK (
  current_setting('app.role', true) IN ('admin', 'office_manager')
);

-- ── LEAD NOTES ──────────────────────────────────────────────
DROP POLICY IF EXISTS "lead_notes_select" ON lead_notes;
CREATE POLICY "lead_notes_select" ON lead_notes FOR SELECT USING (
  current_setting('app.role', true) IN ('admin', 'office_manager', 'csr', 'agent')
);

DROP POLICY IF EXISTS "lead_notes_insert" ON lead_notes;
CREATE POLICY "lead_notes_insert" ON lead_notes FOR INSERT WITH CHECK (
  current_setting('app.role', true) IN ('admin', 'office_manager', 'csr', 'agent')
);

-- ── DEAL NOTES ──────────────────────────────────────────────
DROP POLICY IF EXISTS "deal_notes_select" ON deal_notes;
CREATE POLICY "deal_notes_select" ON deal_notes FOR SELECT USING (
  current_setting('app.role', true) IN ('admin', 'office_manager', 'csr', 'agent')
);

DROP POLICY IF EXISTS "deal_notes_insert" ON deal_notes;
CREATE POLICY "deal_notes_insert" ON deal_notes FOR INSERT WITH CHECK (
  current_setting('app.role', true) IN ('admin', 'office_manager', 'csr', 'agent')
);

-- ── CRM AGENTS ──────────────────────────────────────────────
DROP POLICY IF EXISTS "agents_select" ON crm_agents;
CREATE POLICY "agents_select" ON crm_agents FOR SELECT USING (
  current_setting('app.role', true) IN ('admin', 'office_manager')
  OR current_setting('app.user_email', true) = email
);

DROP POLICY IF EXISTS "agents_update" ON crm_agents;
CREATE POLICY "agents_update" ON crm_agents FOR UPDATE USING (
  current_setting('app.role', true) = 'admin'
);

-- ── AGENT GOALS ─────────────────────────────────────────────
DROP POLICY IF EXISTS "agent_goals_select" ON crm_agent_goals;
CREATE POLICY "agent_goals_select" ON crm_agent_goals FOR SELECT USING (
  current_setting('app.role', true) IN ('admin', 'office_manager')
  OR current_setting('app.user_email', true) = agent_email
);

-- ── PLANS ── (public read, admin write) ─────────────────────
DROP POLICY IF EXISTS "plans_select" ON crm_plans;
CREATE POLICY "plans_select" ON crm_plans FOR SELECT USING (true);

DROP POLICY IF EXISTS "plans_write" ON crm_plans;
CREATE POLICY "plans_write" ON crm_plans FOR ALL USING (
  current_setting('app.role', true) IN ('admin', 'office_manager')
);

-- ── PROVIDERS ── (public read, admin write) ──────────────────
DROP POLICY IF EXISTS "providers_select" ON crm_providers;
CREATE POLICY "providers_select" ON crm_providers FOR SELECT USING (true);

DROP POLICY IF EXISTS "providers_write" ON crm_providers;
CREATE POLICY "providers_write" ON crm_providers FOR ALL USING (
  current_setting('app.role', true) IN ('admin', 'office_manager')
);

-- ============================================================
-- HOW IT WORKS:
-- The app must call SET LOCAL before queries on the anon client:
--   SET LOCAL app.role = 'agent';
--   SET LOCAL app.user_email = 'agent@example.com';
--
-- The service_role (admin) client bypasses all RLS — used for
-- all existing CRM server actions, so those are unaffected.
-- These policies protect direct/anon client access.
-- ============================================================
