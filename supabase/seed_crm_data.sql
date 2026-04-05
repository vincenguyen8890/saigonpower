-- ============================================================
-- SAIGON POWER CRM — Sample Data Seed
-- Run in Supabase SQL Editor after crm_complete.sql
-- ============================================================

-- ─── LEADS ────────────────────────────────────────────────────────────────────
INSERT INTO public.leads (name, email, phone, zip, service_type, preferred_language, status, source, notes, assigned_to) VALUES
  ('Lan Nguyen',           'lan.nguyen@gmail.com',    '(832) 555-0101', '77036', 'residential', 'vi', 'new',       'website',  null,                                             null),
  ('Minh Tran',            'mtran@nailsalon.com',     '(713) 555-0202', '77479', 'commercial',  'vi', 'contacted', 'referral', 'Nail salon, 2 locations. Needs commercial rate.', 'agent@saigonllc.com'),
  ('Mai Pham',             'mai.pham@gmail.com',      '(832) 555-0303', '77450', 'residential', 'vi', 'quoted',    'facebook', 'Interested in 12-month fixed rate. Budget ~$150/mo.','agent@saigonllc.com'),
  ('Hung Le',              'hung.le@yahoo.com',       '(281) 555-0404', '77584', 'residential', 'en', 'enrolled',  'website',  'Enrolled in Gexa Saver 12. Start date: last week.','agent@saigonllc.com'),
  ('Thanh Vo',             'thanh.vo@gmail.com',      '(713) 555-0505', '77057', 'residential', 'vi', 'new',       'google',   null,                                             null),
  ('Hoa Nguyen Restaurant','hoa.restaurant@gmail.com','(832) 555-0606', '77099', 'commercial',  'vi', 'new',       'website',  'Vietnamese restaurant, ~3,000 kWh/month.',        null),
  ('David Kim',            'd.kim@email.com',         '(281) 555-0707', '77494', 'residential', 'en', 'lost',      'google',   'Went with another provider.',                    'agent@saigonllc.com'),
  ('Linh Do',              'linh.do@gmail.com',       '(713) 555-0808', '77081', 'residential', 'vi', 'contacted', 'referral', 'Referred by Lan Nguyen.',                        'agent@saigonllc.com')
ON CONFLICT DO NOTHING;

-- ─── DEALS (linked to leads by position) ──────────────────────────────────────
-- We use subqueries to get the real UUIDs after insert
INSERT INTO public.deals (lead_id, title, value, stage, probability, expected_close, provider, plan_name, service_type, notes, assigned_to)
SELECT id, 'Minh Tran – Nail Salon Commercial', 200, 'proposal', 70, CURRENT_DATE + 26, 'Reliant Energy', 'Reliant Business 12', 'commercial', null, 'agent@saigonllc.com'
FROM public.leads WHERE name = 'Minh Tran' AND source = 'referral' LIMIT 1;

INSERT INTO public.deals (lead_id, title, value, stage, probability, expected_close, provider, plan_name, service_type, notes, assigned_to)
SELECT id, 'Mai Pham – Residential 12mo', 75, 'negotiation', 85, CURRENT_DATE + 10, 'Gexa Energy', 'Gexa Saver 12', 'residential', null, 'agent@saigonllc.com'
FROM public.leads WHERE name = 'Mai Pham' LIMIT 1;

INSERT INTO public.deals (lead_id, title, value, stage, probability, expected_close, provider, plan_name, service_type, notes, assigned_to)
SELECT id, 'Hoa Nguyen Restaurant', 350, 'qualified', 50, CURRENT_DATE + 41, null, null, 'commercial', 'High usage ~3200 kWh/mo', null
FROM public.leads WHERE name = 'Hoa Nguyen Restaurant' LIMIT 1;

INSERT INTO public.deals (lead_id, title, value, stage, probability, expected_close, provider, plan_name, service_type, notes, assigned_to)
SELECT id, 'Lan Nguyen – Residential', 75, 'prospect', 30, CURRENT_DATE + 57, null, null, 'residential', null, null
FROM public.leads WHERE name = 'Lan Nguyen' LIMIT 1;

-- ─── ACTIVITIES ───────────────────────────────────────────────────────────────
INSERT INTO public.activities (lead_id, type, title, description, due_date, completed, assigned_to, created_by)
SELECT id, 'call', 'Follow up after initial contact', 'Auto-created when status changed to "contacted"', NOW() - INTERVAL '3 days', false, 'agent@saigonllc.com', 'system'
FROM public.leads WHERE name = 'Minh Tran' LIMIT 1;

INSERT INTO public.activities (lead_id, type, title, description, due_date, completed, assigned_to, created_by)
SELECT id, 'email', 'Follow up on quote sent', 'Check if Mai has reviewed the Gexa Saver 12 quote', NOW() - INTERVAL '1 day', false, 'agent@saigonllc.com', 'system'
FROM public.leads WHERE name = 'Mai Pham' LIMIT 1;

INSERT INTO public.activities (lead_id, type, title, description, due_date, completed, assigned_to, created_by)
SELECT id, 'call', 'Initial discovery call', 'Understand usage and budget for residential plan', NOW(), false, 'agent@saigonllc.com', 'agent@saigonllc.com'
FROM public.leads WHERE name = 'Lan Nguyen' LIMIT 1;

INSERT INTO public.activities (lead_id, type, title, description, due_date, completed, assigned_to, created_by)
SELECT id, 'call', 'Initial contact — new lead', null, NOW(), false, null, 'system'
FROM public.leads WHERE name = 'Thanh Vo' LIMIT 1;

INSERT INTO public.activities (lead_id, type, title, description, due_date, completed, assigned_to, created_by)
SELECT id, 'email', 'Send rate comparison to Linh Do', 'Referred by Lan Nguyen — send residential options', NOW() + INTERVAL '1 day', false, 'agent@saigonllc.com', 'agent@saigonllc.com'
FROM public.leads WHERE name = 'Linh Do' LIMIT 1;

INSERT INTO public.activities (lead_id, type, title, description, due_date, completed, assigned_to, created_by)
SELECT id, 'meeting', 'On-site visit — Hoa Nguyen Restaurant', 'Assess meter & usage for commercial quote', NOW() + INTERVAL '2 days', false, 'agent@saigonllc.com', 'agent@saigonllc.com'
FROM public.leads WHERE name = 'Hoa Nguyen Restaurant' LIMIT 1;

INSERT INTO public.activities (lead_id, type, title, description, due_date, completed, assigned_to, created_by)
SELECT id, 'task', 'Prepare commercial proposal for Minh Tran', 'Include Reliant Business 12 + TXU Business 12', NOW() + INTERVAL '3 days', false, 'agent@saigonllc.com', 'agent@saigonllc.com'
FROM public.leads WHERE name = 'Minh Tran' LIMIT 1;

INSERT INTO public.activities (lead_id, type, title, description, due_date, completed, assigned_to, created_by)
SELECT id, 'call', 'Renewal discovery call — Mai Pham', 'Contract expires in ~45 days — offer renewal', NOW() + INTERVAL '9 days', false, 'agent@saigonllc.com', 'system'
FROM public.leads WHERE name = 'Mai Pham' LIMIT 1;

-- Completed activities
INSERT INTO public.activities (lead_id, type, title, description, due_date, completed, completed_at, assigned_to, created_by)
SELECT id, 'task', 'Process enrollment — Gexa Saver 12', 'LOA signed, enrollment confirmed', NOW() - INTERVAL '5 days', true, NOW() - INTERVAL '4 days', 'agent@saigonllc.com', 'agent@saigonllc.com'
FROM public.leads WHERE name = 'Hung Le' LIMIT 1;

INSERT INTO public.activities (lead_id, type, title, description, due_date, completed, completed_at, assigned_to, created_by)
SELECT id, 'note', 'Logged loss reason — David Kim', 'Went with Pulse Power for lower intro rate', null, true, NOW() - INTERVAL '5 days', 'agent@saigonllc.com', 'agent@saigonllc.com'
FROM public.leads WHERE name = 'David Kim' LIMIT 1;

-- ─── CONTRACTS ────────────────────────────────────────────────────────────────
INSERT INTO public.contracts (lead_id, customer_name, provider, plan_name, service_type, address, zip, start_date, end_date, rate_kwh, term_months, status)
SELECT id, 'Hung Le', 'Gexa Energy', 'Gexa Saver 12', 'residential', '1234 Main St, Houston TX', '77036', '2024-01-15', '2025-01-15', 0.109, 12, 'active'
FROM public.leads WHERE name = 'Hung Le' LIMIT 1;

INSERT INTO public.contracts (lead_id, customer_name, provider, plan_name, service_type, address, zip, start_date, end_date, rate_kwh, term_months, status)
SELECT id, 'Mai Pham', 'TXU Energy', 'TXU Energy Saver 24', 'residential', '5678 Oak Ave, Katy TX', '77450', '2023-06-01', '2025-06-01', 0.118, 24, 'active'
FROM public.leads WHERE name = 'Mai Pham' LIMIT 1;

INSERT INTO public.contracts (lead_id, customer_name, provider, plan_name, service_type, address, zip, start_date, end_date, rate_kwh, term_months, status)
SELECT id, 'Minh Tran Nails', 'Reliant Energy', 'Reliant Business 12', 'commercial', '910 Business Blvd, Sugar Land TX', '77479', '2024-03-01', '2025-03-01', 0.132, 12, 'active'
FROM public.leads WHERE name = 'Minh Tran' LIMIT 1;

INSERT INTO public.contracts (lead_id, customer_name, provider, plan_name, service_type, address, zip, start_date, end_date, rate_kwh, term_months, status)
SELECT id, 'Linh Do', 'Green Mountain', 'Green Simple 12', 'residential', '321 Elm St, Houston TX', '77081', '2024-02-01', '2025-02-01', 0.125, 12, 'active'
FROM public.leads WHERE name = 'Linh Do' LIMIT 1;
