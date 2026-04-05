-- Add new columns to deals table
ALTER TABLE public.deals
  ADD COLUMN IF NOT EXISTS agent_code          TEXT,
  ADD COLUMN IF NOT EXISTS service_address     TEXT,
  ADD COLUMN IF NOT EXISTS esid                TEXT,
  ADD COLUMN IF NOT EXISTS contract_start_date DATE,
  ADD COLUMN IF NOT EXISTS contract_end_date   DATE,
  ADD COLUMN IF NOT EXISTS rate_kwh            NUMERIC(6,4),
  ADD COLUMN IF NOT EXISTS adder_kwh           NUMERIC(6,4),
  ADD COLUMN IF NOT EXISTS term_months         INTEGER,
  ADD COLUMN IF NOT EXISTS product_type        TEXT,
  ADD COLUMN IF NOT EXISTS usage_kwh           INTEGER;
