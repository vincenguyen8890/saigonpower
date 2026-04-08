-- Add password column to crm_agents for DB-based login
ALTER TABLE public.crm_agents ADD COLUMN IF NOT EXISTS password TEXT;
