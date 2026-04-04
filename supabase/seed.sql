-- ============================================================
-- SEED DATA - Saigon Power
-- ============================================================

-- Providers
INSERT INTO public.providers (slug, name, website, phone, description, rating, review_count) VALUES
('reliant', 'Reliant Energy', 'https://reliant.com', '1-866-222-7100', 'One of the largest retail electricity providers in Texas', 4.2, 12450),
('txu', 'TXU Energy', 'https://txu.com', '1-800-818-6132', 'Texas-born energy company serving millions of customers', 4.0, 18200),
('green-mountain', 'Green Mountain Energy', 'https://greenmountainenergy.com', '1-866-785-4668', '100% renewable electricity pioneer', 4.5, 8900),
('gexa', 'Gexa Energy', 'https://gexaenergy.com', '1-713-961-9399', 'Competitive rates with straightforward pricing', 4.1, 6700),
('cirro', 'Cirro Energy', 'https://cirroenergy.com', '1-888-242-4776', 'Simple, affordable plans for Texas homes and businesses', 3.9, 4200),
('constellation', 'Constellation', 'https://constellation.com', '1-888-900-7052', 'Flexible plans from a national energy leader', 4.3, 9100);

-- Plans (residential)
INSERT INTO public.plans (provider_id, name, rate_kwh, rate_kwh_500, rate_kwh_2000, term_months, rate_type, plan_type, renewable_percent, cancellation_fee, monthly_fee, avg_monthly_bill, badges, features, is_active)
SELECT
  p.id,
  plan.name,
  plan.rate_kwh,
  plan.rate_kwh_500,
  plan.rate_kwh_2000,
  plan.term_months,
  plan.rate_type,
  plan.plan_type,
  plan.renewable_percent,
  plan.cancellation_fee,
  plan.monthly_fee,
  plan.avg_monthly_bill,
  plan.badges::jsonb,
  plan.features::jsonb,
  TRUE
FROM public.providers p
JOIN (VALUES
  ('reliant', 'Simple 12', 12.5, 14.8, 11.2, 12, 'fixed', 'residential', 10, 175.00, 4.95, 129.95, '["popular"]', '["Price protection", "Online account management", "24/7 customer support"]'),
  ('reliant', 'Secure Advantage 24', 13.1, 15.4, 11.8, 24, 'fixed', 'residential', 15, 200.00, 4.95, 135.95, '[]', '["2-year price lock", "Bill credits available", "Smart thermostat compatible"]'),
  ('txu', 'Clear Deal 12', 11.9, 14.2, 10.6, 12, 'fixed', 'residential', 20, 150.00, 0, 124.95, '["bestValue"]', '["No monthly fee", "Free smart meter", "Weekend electricity perks"]'),
  ('txu', 'Clear Deal 36', 12.8, 15.1, 11.5, 36, 'fixed', 'residential', 20, 250.00, 0, 133.95, '[]', '["3-year lock-in", "No monthly fee", "Bill credits up to $75"]'),
  ('green-mountain', 'Pollution Free 12', 13.8, 16.5, 12.4, 12, 'fixed', 'residential', 100, 150.00, 9.95, 147.95, '["green"]', '["100% wind energy", "Carbon offset included", "Green rewards program"]'),
  ('gexa', 'Gexa Saver 12', 11.5, 13.8, 10.2, 12, 'fixed', 'residential', 0, 0, 0, 120.95, '["bestValue", "noFee"]', '["No cancellation fee", "No monthly fee", "Simple billing", "Auto-pay discount"]'),
  ('gexa', 'Gexa Saver Eco 12', 12.2, 14.5, 10.9, 12, 'fixed', 'residential', 100, 0, 0, 127.95, '["green", "noFee"]', '["100% renewable", "No cancellation fee", "No monthly fee"]'),
  ('cirro', 'Smart 6', 10.9, 13.5, 9.8, 6, 'fixed', 'residential', 5, 75.00, 0, 114.95, '["popular"]', '["Short-term flexibility", "Easy renewal", "Online management"]'),
  ('constellation', 'Smart Home 12', 12.1, 14.4, 10.8, 12, 'fixed', 'residential', 25, 150.00, 0, 126.95, '[]', '["Smart home integration", "Usage alerts", "Nest thermostat compatible"]'),
  -- Commercial plans
  ('reliant', 'Business Advantage 12', 10.5, NULL, NULL, 12, 'fixed', 'commercial', 10, 300.00, 9.95, 215.95, '["popular"]', '["Dedicated account manager", "Usage analytics", "Priority support"]'),
  ('gexa', 'Business Saver 24', 9.8, NULL, NULL, 24, 'fixed', 'commercial', 0, 0, 0, 198.95, '["bestValue", "noFee"]', '["No cancellation fee", "Competitive rates", "Bill alerts"]')
) AS plan(provider_slug, name, rate_kwh, rate_kwh_500, rate_kwh_2000, term_months, rate_type, plan_type, renewable_percent, cancellation_fee, monthly_fee, avg_monthly_bill, badges, features)
ON p.slug = plan.provider_slug;

-- Sample blog posts
INSERT INTO public.blog_posts (slug, title_vi, title_en, excerpt_vi, excerpt_en, is_published, published_at) VALUES
(
  'cach-chon-goi-dien-texas',
  'Cách Chọn Gói Điện Texas Phù Hợp Cho Gia Đình',
  'How to Choose the Right Texas Electricity Plan for Your Home',
  'Hướng dẫn đầy đủ để chọn gói điện phù hợp cho gia đình bạn ở Texas.',
  'A complete guide to choosing the right electricity plan for your Texas home.',
  TRUE,
  NOW() - INTERVAL '7 days'
),
(
  'tai-sao-hoa-don-dien-cao',
  'Tại Sao Hóa Đơn Điện Mùa Hè Cao Đến Vậy?',
  'Why Is Your Summer Electricity Bill So High?',
  'Mùa hè Texas nóng bức khiến hóa đơn điện tăng vọt. Tìm hiểu nguyên nhân.',
  'Texas summer heat causes electricity bills to skyrocket. Learn the causes.',
  TRUE,
  NOW() - INTERVAL '14 days'
),
(
  'dien-sach-cho-tiem-nail',
  'Gói Điện Tốt Nhất Cho Tiệm Nail Tại Texas',
  'Best Electricity Plans for Nail Salons in Texas',
  'Tiệm nail sử dụng nhiều điện hơn bạn nghĩ. Đây là cách tìm gói điện thương mại tốt nhất.',
  'Nail salons use more electricity than you think. Here''s how to find the best commercial plan.',
  TRUE,
  NOW() - INTERVAL '21 days'
);
