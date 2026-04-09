-- crm_plans: electricity plans managed from the CRM and surfaced on the compare page
CREATE TABLE IF NOT EXISTS public.crm_plans (
  id              uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id     text,
  provider_name   text        NOT NULL,
  name            text        NOT NULL,
  rate_kwh        numeric(6,4) NOT NULL,           -- decimal e.g. 0.109 = 10.9¢/kWh
  term_months     integer     NOT NULL DEFAULT 12,
  service_type    text        NOT NULL DEFAULT 'residential',
  cancellation_fee integer    DEFAULT 0,
  renewable       boolean     DEFAULT false,
  renewable_percent integer   DEFAULT 0,           -- 0–100
  promo           text,
  status          text        NOT NULL DEFAULT 'active',
  created_at      timestamptz DEFAULT now(),
  CONSTRAINT crm_plans_service_type_check CHECK (service_type IN ('residential', 'commercial', 'both')),
  CONSTRAINT crm_plans_status_check       CHECK (status IN ('active', 'inactive'))
);

ALTER TABLE public.crm_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for authenticated" ON public.crm_plans FOR ALL USING (true);

-- Seed with the current mock plans so the compare page works immediately
INSERT INTO public.crm_plans (provider_name, name, rate_kwh, term_months, service_type, cancellation_fee, renewable, renewable_percent, promo, status) VALUES
  ('Cirro Energy',        'Smart 6',              0.109, 6,  'residential', 75,  false, 5,   null,                 'active'),
  ('Gexa Energy',         'Gexa Saver 12',        0.115, 12, 'residential', 0,   false, 0,   null,                 'active'),
  ('TXU Energy',          'Clear Deal 12',        0.119, 12, 'residential', 150, false, 20,  null,                 'active'),
  ('Constellation',       'Smart Home 12',        0.121, 12, 'residential', 150, false, 25,  null,                 'active'),
  ('Gexa Energy',         'Gexa Eco 12',          0.122, 12, 'residential', 0,   true,  100, null,                 'active'),
  ('Reliant Energy',      'Simple 12',            0.125, 12, 'residential', 175, false, 10,  null,                 'active'),
  ('TXU Energy',          'Clear Deal 36',        0.128, 36, 'residential', 250, false, 20,  null,                 'active'),
  ('Reliant Energy',      'Secure Advantage 24',  0.131, 24, 'residential', 200, false, 15,  null,                 'active'),
  ('Green Mountain Energy','Pollution Free 12',   0.138, 12, 'residential', 150, true,  100, null,                 'active'),
  ('Gexa Energy',         'Gexa Saver 24',        0.115, 24, 'residential', 200, false, 0,   '$50 bill credit',    'active'),
  ('TXU Energy',          'Business Rate 12',     0.128, 12, 'commercial',  300, false, 0,   null,                 'active'),
  ('Reliant Energy',      'Business Secure 12',   0.134, 12, 'commercial',  200, false, 0,   null,                 'active');
