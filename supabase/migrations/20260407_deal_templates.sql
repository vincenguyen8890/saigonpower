CREATE TABLE IF NOT EXISTS public.crm_deal_templates (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  provider     TEXT,
  plan_name    TEXT,
  product_type TEXT,
  rate_kwh     NUMERIC(10,6),
  adder_kwh    NUMERIC(10,6),
  term_months  INT,
  service_type TEXT CHECK (service_type IN ('residential', 'commercial')),
  notes        TEXT,
  created_by   TEXT,
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.crm_deal_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for authenticated" ON public.crm_deal_templates
  FOR ALL USING (auth.role() = 'authenticated');
