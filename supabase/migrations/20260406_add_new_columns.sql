-- Add new columns to leads
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS customer_id     TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS email2          TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS phone2          TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS dob             TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS anxh            TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS service_address TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS mailing_address TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS referral_by     TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS tags            TEXT[];
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS account_status  TEXT CHECK (account_status IN ('active','inactive','switch_away'));

-- Add new columns to deals
ALTER TABLE public.deals
  ADD COLUMN IF NOT EXISTS flags        TEXT[],
  ADD COLUMN IF NOT EXISTS service_city  TEXT,
  ADD COLUMN IF NOT EXISTS service_state TEXT,
  ADD COLUMN IF NOT EXISTS service_zip   TEXT;

-- Add password column to crm_agents for DB-based login
ALTER TABLE public.crm_agents ADD COLUMN IF NOT EXISTS password TEXT;
