-- ============================================================
-- SAIGON POWER - Complete Database Schema
-- Platform: Supabase PostgreSQL (ERCOT Texas Electricity)
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- USERS (extends Supabase auth.users)
-- ============================================================
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  preferred_language TEXT NOT NULL DEFAULT 'vi' CHECK (preferred_language IN ('vi', 'en')),
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'agent')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON public.users
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================
-- PROVIDERS
-- ============================================================
CREATE TABLE public.providers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  logo_url TEXT,
  website TEXT,
  phone TEXT,
  description TEXT,
  rating DECIMAL(2,1) DEFAULT 4.0 CHECK (rating >= 0 AND rating <= 5),
  review_count INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read active providers" ON public.providers
  FOR SELECT USING (is_active = TRUE);

-- ============================================================
-- PLANS
-- ============================================================
CREATE TABLE public.plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id UUID NOT NULL REFERENCES public.providers(id),
  name TEXT NOT NULL,
  rate_kwh DECIMAL(6,4) NOT NULL,    -- cents per kWh at 1000 kWh
  rate_kwh_500 DECIMAL(6,4),         -- cents per kWh at 500 kWh
  rate_kwh_2000 DECIMAL(6,4),        -- cents per kWh at 2000 kWh
  term_months INTEGER NOT NULL,
  rate_type TEXT NOT NULL DEFAULT 'fixed' CHECK (rate_type IN ('fixed', 'variable', 'indexed')),
  plan_type TEXT NOT NULL DEFAULT 'residential' CHECK (plan_type IN ('residential', 'commercial', 'both')),
  renewable_percent INTEGER NOT NULL DEFAULT 0 CHECK (renewable_percent >= 0 AND renewable_percent <= 100),
  cancellation_fee DECIMAL(8,2) NOT NULL DEFAULT 0,
  monthly_fee DECIMAL(8,2) NOT NULL DEFAULT 0,
  avg_monthly_bill DECIMAL(8,2),
  badges JSONB DEFAULT '[]',         -- e.g. ["popular", "bestValue"]
  features JSONB DEFAULT '[]',       -- e.g. ["No cancellation fee", "Auto-pay discount"]
  terms_url TEXT,
  efl_url TEXT,                      -- Electricity Facts Label
  yrac_url TEXT,                     -- Your Rights as a Customer
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read active plans" ON public.plans
  FOR SELECT USING (is_active = TRUE);

-- ============================================================
-- LEADS
-- ============================================================
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  zip TEXT NOT NULL,
  service_type TEXT NOT NULL DEFAULT 'residential' CHECK (service_type IN ('residential', 'commercial')),
  preferred_language TEXT NOT NULL DEFAULT 'vi' CHECK (preferred_language IN ('vi', 'en')),
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'quoted', 'enrolled', 'lost')),
  source TEXT,                        -- e.g. 'website', 'referral', 'facebook', 'google'
  notes TEXT,
  assigned_to UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agents can view leads" ON public.leads
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'agent'))
  );

CREATE POLICY "Anyone can insert leads" ON public.leads
  FOR INSERT WITH CHECK (TRUE);

-- ============================================================
-- QUOTE REQUESTS
-- ============================================================
CREATE TABLE public.quote_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID REFERENCES public.leads(id),
  user_id UUID REFERENCES public.users(id),
  service_type TEXT NOT NULL DEFAULT 'residential' CHECK (service_type IN ('residential', 'commercial')),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  zip TEXT NOT NULL,
  business_name TEXT,
  monthly_usage_kwh INTEGER,
  notes TEXT,
  preferred_language TEXT NOT NULL DEFAULT 'vi' CHECK (preferred_language IN ('vi', 'en')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'sent', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit quote requests" ON public.quote_requests
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Users can view own quote requests" ON public.quote_requests
  FOR SELECT USING (auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'agent'))
  );

-- ============================================================
-- CONTRACTS
-- ============================================================
CREATE TABLE public.contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id),
  plan_id UUID NOT NULL REFERENCES public.plans(id),
  provider_id UUID NOT NULL REFERENCES public.providers(id),
  service_address TEXT NOT NULL,
  zip TEXT NOT NULL,
  esid TEXT,                          -- Electric Service Identifier (Texas)
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  rate_kwh DECIMAL(6,4) NOT NULL,
  term_months INTEGER NOT NULL,
  service_type TEXT NOT NULL DEFAULT 'residential' CHECK (service_type IN ('residential', 'commercial')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled', 'pending')),
  renewal_reminded BOOLEAN NOT NULL DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own contracts" ON public.contracts
  FOR SELECT USING (auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'agent'))
  );

-- ============================================================
-- BLOG POSTS
-- ============================================================
CREATE TABLE public.blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title_vi TEXT NOT NULL,
  title_en TEXT NOT NULL,
  excerpt_vi TEXT,
  excerpt_en TEXT,
  content_vi TEXT,
  content_en TEXT,
  author_id UUID REFERENCES public.users(id),
  cover_image TEXT,
  tags JSONB DEFAULT '[]',
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published posts" ON public.blog_posts
  FOR SELECT USING (is_published = TRUE);

CREATE POLICY "Admins can manage posts" ON public.blog_posts
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================
-- RENEWAL REMINDERS (automated)
-- ============================================================
CREATE TABLE public.renewal_reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contract_id UUID NOT NULL REFERENCES public.contracts(id),
  user_id UUID NOT NULL REFERENCES public.users(id),
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('60_days', '30_days', '14_days', '7_days')),
  sent_at TIMESTAMPTZ,
  sent_via TEXT CHECK (sent_via IN ('email', 'sms', 'both')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER plans_updated_at BEFORE UPDATE ON public.plans FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER leads_updated_at BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER contracts_updated_at BEFORE UPDATE ON public.contracts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER blog_posts_updated_at BEFORE UPDATE ON public.blog_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, preferred_language, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'preferred_language', 'vi'),
    'customer'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function: Get contracts expiring within N days
CREATE OR REPLACE FUNCTION get_expiring_contracts(days_ahead INTEGER DEFAULT 30)
RETURNS TABLE(
  contract_id UUID,
  user_id UUID,
  plan_name TEXT,
  end_date DATE,
  days_left INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.user_id,
    p.name,
    c.end_date,
    (c.end_date - CURRENT_DATE)::INTEGER
  FROM contracts c
  JOIN plans p ON c.plan_id = p.id
  WHERE
    c.status = 'active'
    AND c.end_date BETWEEN CURRENT_DATE AND CURRENT_DATE + days_ahead
  ORDER BY c.end_date ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_leads_status ON public.leads(status);
CREATE INDEX idx_leads_created_at ON public.leads(created_at DESC);
CREATE INDEX idx_leads_zip ON public.leads(zip);
CREATE INDEX idx_contracts_user_id ON public.contracts(user_id);
CREATE INDEX idx_contracts_end_date ON public.contracts(end_date);
CREATE INDEX idx_contracts_status ON public.contracts(status);
CREATE INDEX idx_quote_requests_status ON public.quote_requests(status);
CREATE INDEX idx_plans_provider_id ON public.plans(provider_id);
CREATE INDEX idx_plans_type ON public.plans(plan_type);
CREATE INDEX idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX idx_blog_posts_published ON public.blog_posts(is_published, published_at DESC);
