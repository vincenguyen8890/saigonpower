-- ============================================================
-- RLS Policies for Saigon Power CRM
-- Run in Supabase SQL editor (Dashboard → SQL Editor)
-- ============================================================

-- Enable RLS on all CRM tables
ALTER TABLE crm_leads     ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_deals     ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_agents    ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_plans     ENABLE ROW LEVEL SECURITY;

-- ── LEADS ──────────────────────────────────────────────────
-- Admins and office managers see all leads
-- Agents only see leads assigned to them
-- CSRs see all leads (customer service role)
DROP POLICY IF EXISTS "leads_select" ON crm_leads;
CREATE POLICY "leads_select" ON crm_leads
  FOR SELECT USING (
    (current_setting('app.role', true) IN ('admin', 'office_manager', 'csr'))
    OR (current_setting('app.user_email', true) = assigned_to)
  );

DROP POLICY IF EXISTS "leads_insert" ON crm_leads;
CREATE POLICY "leads_insert" ON crm_leads
  FOR INSERT WITH CHECK (
    current_setting('app.role', true) IN ('admin', 'office_manager', 'csr', 'agent')
  );

DROP POLICY IF EXISTS "leads_update" ON crm_leads;
CREATE POLICY "leads_update" ON crm_leads
  FOR UPDATE USING (
    (current_setting('app.role', true) IN ('admin', 'office_manager', 'csr'))
    OR (current_setting('app.user_email', true) = assigned_to)
  );

DROP POLICY IF EXISTS "leads_delete" ON crm_leads;
CREATE POLICY "leads_delete" ON crm_leads
  FOR DELETE USING (
    current_setting('app.role', true) IN ('admin', 'office_manager')
  );

-- ── DEALS ──────────────────────────────────────────────────
DROP POLICY IF EXISTS "deals_select" ON crm_deals;
CREATE POLICY "deals_select" ON crm_deals
  FOR SELECT USING (
    (current_setting('app.role', true) IN ('admin', 'office_manager', 'csr'))
    OR (current_setting('app.user_email', true) = agent_email)
  );

DROP POLICY IF EXISTS "deals_insert" ON crm_deals;
CREATE POLICY "deals_insert" ON crm_deals
  FOR INSERT WITH CHECK (
    current_setting('app.role', true) IN ('admin', 'office_manager', 'csr', 'agent')
  );

DROP POLICY IF EXISTS "deals_update" ON crm_deals;
CREATE POLICY "deals_update" ON crm_deals
  FOR UPDATE USING (
    (current_setting('app.role', true) IN ('admin', 'office_manager'))
    OR (current_setting('app.user_email', true) = agent_email)
  );

DROP POLICY IF EXISTS "deals_delete" ON crm_deals;
CREATE POLICY "deals_delete" ON crm_deals
  FOR DELETE USING (
    current_setting('app.role', true) IN ('admin', 'office_manager')
  );

-- ── ACTIVITIES ─────────────────────────────────────────────
DROP POLICY IF EXISTS "activities_select" ON crm_activities;
CREATE POLICY "activities_select" ON crm_activities
  FOR SELECT USING (
    (current_setting('app.role', true) IN ('admin', 'office_manager', 'csr'))
    OR (current_setting('app.user_email', true) = agent_email)
  );

DROP POLICY IF EXISTS "activities_insert" ON crm_activities;
CREATE POLICY "activities_insert" ON crm_activities
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "activities_update" ON crm_activities;
CREATE POLICY "activities_update" ON crm_activities
  FOR UPDATE USING (
    (current_setting('app.role', true) IN ('admin', 'office_manager'))
    OR (current_setting('app.user_email', true) = agent_email)
  );

-- ── AGENTS ─────────────────────────────────────────────────
-- Only admins can see/edit all agents; agents can only see themselves
DROP POLICY IF EXISTS "agents_select" ON crm_agents;
CREATE POLICY "agents_select" ON crm_agents
  FOR SELECT USING (
    (current_setting('app.role', true) IN ('admin', 'office_manager'))
    OR (current_setting('app.user_email', true) = email)
  );

DROP POLICY IF EXISTS "agents_update" ON crm_agents;
CREATE POLICY "agents_update" ON crm_agents
  FOR UPDATE USING (
    current_setting('app.role', true) = 'admin'
  );

-- ── CONTRACTS ──────────────────────────────────────────────
DROP POLICY IF EXISTS "contracts_select" ON crm_contracts;
CREATE POLICY "contracts_select" ON crm_contracts
  FOR SELECT USING (
    (current_setting('app.role', true) IN ('admin', 'office_manager', 'csr'))
    OR (current_setting('app.user_email', true) = agent_email)
  );

-- ── PLANS ──────────────────────────────────────────────────
-- Plans are read-only for all authenticated users; only admins write
DROP POLICY IF EXISTS "plans_select" ON crm_plans;
CREATE POLICY "plans_select" ON crm_plans
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "plans_write" ON crm_plans;
CREATE POLICY "plans_write" ON crm_plans
  FOR ALL USING (
    current_setting('app.role', true) IN ('admin', 'office_manager')
  );

-- ============================================================
-- NOTE: These policies use current_setting() to read the session
-- role/email that the app sets per-request via:
--   SET LOCAL app.role = 'agent';
--   SET LOCAL app.user_email = 'user@example.com';
-- The Supabase admin client bypasses RLS (service_role key).
-- Public/anon client queries will respect these policies.
-- ============================================================
