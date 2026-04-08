-- Expand role CHECK constraint to include office_manager and csr
ALTER TABLE public.crm_agents DROP CONSTRAINT IF EXISTS crm_agents_role_check;
ALTER TABLE public.crm_agents ADD CONSTRAINT crm_agents_role_check
  CHECK (role IN ('admin', 'office_manager', 'csr', 'agent'));
