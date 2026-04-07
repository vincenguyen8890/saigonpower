-- Agent monthly goals
CREATE TABLE IF NOT EXISTS public.crm_agent_goals (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_email TEXT NOT NULL,
  month       TEXT NOT NULL,            -- 'YYYY-MM'
  target_deals INT  NOT NULL DEFAULT 0,
  target_value INT  NOT NULL DEFAULT 0, -- monthly commission target in $
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE (agent_email, month)
);

ALTER TABLE public.crm_agent_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for authenticated" ON public.crm_agent_goals
  FOR ALL USING (auth.role() = 'authenticated');

-- Commission payment tracking on deals
ALTER TABLE public.deals ADD COLUMN IF NOT EXISTS commission_paid        BOOLEAN DEFAULT false;
ALTER TABLE public.deals ADD COLUMN IF NOT EXISTS commission_paid_amount NUMERIC(10,2);
ALTER TABLE public.deals ADD COLUMN IF NOT EXISTS commission_paid_at     TIMESTAMPTZ;

-- Share token for customer summary page
ALTER TABLE public.deals ADD COLUMN IF NOT EXISTS share_token TEXT UNIQUE;
