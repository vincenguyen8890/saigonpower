// Mock CRM data — replace with Supabase queries once credentials are set

export type LeadStatus = 'new' | 'contacted' | 'quoted' | 'enrolled' | 'lost'
export type ServiceType = 'residential' | 'commercial'

export interface Lead {
  id: string
  customer_id: string | null
  name: string
  email: string
  phone: string
  zip: string
  service_type: ServiceType
  preferred_language: 'vi' | 'en'
  status: LeadStatus
  source: string | null
  referral_by: string | null
  service_address: string | null
  mailing_address: string | null
  dob: string | null
  anxh: string | null
  notes: string | null
  assigned_to: string | null
  created_at: string
  updated_at: string
}

export function generateCustomerId(seq: number = 1): string {
  const now = new Date()
  const mm   = String(now.getMonth() + 1).padStart(2, '0')
  const yyyy = String(now.getFullYear())
  const num  = String(seq).padStart(4, '0')
  return `SGP-${mm}${yyyy}${num}`
}

export interface QuoteRequest {
  id: string
  lead_id: string
  name: string
  email: string
  phone: string
  zip: string
  service_type: ServiceType
  business_name: string | null
  monthly_usage_kwh: number | null
  notes: string | null
  preferred_language: 'vi' | 'en'
  status: 'pending' | 'reviewed' | 'sent' | 'accepted' | 'rejected'
  created_at: string
}

export interface CRMStats {
  newLeadsToday: number
  newLeadsWeek: number
  pendingQuotes: number
  activeContracts: number
  expiringSoon: number
  totalLeads: number
  enrolledThisMonth: number
}

const now = new Date()
const daysAgo = (n: number) =>
  new Date(now.getTime() - n * 24 * 60 * 60 * 1000).toISOString()

export const mockLeads: Lead[] = [
  {
    id: 'lead-001',
    customer_id: 'SGP-0420260001',
    name: 'Lan Nguyen',
    email: 'lan.nguyen@gmail.com',
    phone: '(832) 555-0101',
    zip: '77036',
    service_type: 'residential',
    preferred_language: 'vi',
    status: 'new',
    source: 'website',
    referral_by: null, service_address: null, mailing_address: null, dob: null, anxh: null,
    notes: null,
    assigned_to: null,
    created_at: daysAgo(0),
    updated_at: daysAgo(0),
  },
  {
    id: 'lead-002',
    customer_id: 'SGP-0420260002',
    name: 'Minh Tran',
    email: 'mtran@nailsalon.com',
    phone: '(713) 555-0202',
    zip: '77479',
    service_type: 'commercial',
    preferred_language: 'vi',
    status: 'contacted',
    source: 'referral',
    referral_by: null, service_address: null, mailing_address: null, dob: null, anxh: null,
    notes: 'Nail salon, 2 locations. Needs commercial rate.',
    assigned_to: 'agent@saigonllc.com',
    created_at: daysAgo(1),
    updated_at: daysAgo(0),
  },
  {
    id: 'lead-003',
    customer_id: 'SGP-0420260003',
    name: 'Mai Pham',
    email: 'mai.pham@gmail.com',
    phone: '(832) 555-0303',
    zip: '77450',
    service_type: 'residential',
    preferred_language: 'vi',
    status: 'quoted',
    source: 'facebook',
    referral_by: null, service_address: null, mailing_address: null, dob: null, anxh: null,
    notes: 'Interested in 12-month fixed rate. Budget ~$150/mo.',
    assigned_to: 'agent@saigonllc.com',
    created_at: daysAgo(3),
    updated_at: daysAgo(1),
  },
  {
    id: 'lead-004',
    customer_id: 'SGP-0420260004',
    name: 'Hung Le',
    email: 'hung.le@yahoo.com',
    phone: '(281) 555-0404',
    zip: '77584',
    service_type: 'residential',
    preferred_language: 'en',
    status: 'enrolled',
    source: 'website',
    referral_by: null, service_address: null, mailing_address: null, dob: null, anxh: null,
    notes: 'Enrolled in Gexa Saver 12. Start date: last week.',
    assigned_to: 'agent@saigonllc.com',
    created_at: daysAgo(7),
    updated_at: daysAgo(2),
  },
  {
    id: 'lead-005',
    customer_id: 'SGP-0420260005',
    name: 'Thanh Vo',
    email: 'thanh.vo@gmail.com',
    phone: '(713) 555-0505',
    zip: '77057',
    service_type: 'residential',
    preferred_language: 'vi',
    status: 'new',
    source: 'google',
    referral_by: null, service_address: null, mailing_address: null, dob: null, anxh: null,
    notes: null,
    assigned_to: null,
    created_at: daysAgo(0),
    updated_at: daysAgo(0),
  },
  {
    id: 'lead-006',
    customer_id: 'SGP-0420260006',
    name: 'Hoa Nguyen Restaurant',
    email: 'hoa.restaurant@gmail.com',
    phone: '(832) 555-0606',
    zip: '77099',
    service_type: 'commercial',
    preferred_language: 'vi',
    status: 'new',
    source: 'website',
    referral_by: null, service_address: null, mailing_address: null, dob: null, anxh: null,
    notes: 'Vietnamese restaurant, ~3,000 kWh/month.',
    assigned_to: null,
    created_at: daysAgo(0),
    updated_at: daysAgo(0),
  },
  {
    id: 'lead-007',
    customer_id: 'SGP-0420260007',
    name: 'David Kim',
    email: 'd.kim@email.com',
    phone: '(281) 555-0707',
    zip: '77494',
    service_type: 'residential',
    preferred_language: 'en',
    status: 'lost',
    source: 'google',
    referral_by: null, service_address: null, mailing_address: null, dob: null, anxh: null,
    notes: 'Went with another provider.',
    assigned_to: 'agent@saigonllc.com',
    created_at: daysAgo(14),
    updated_at: daysAgo(5),
  },
  {
    id: 'lead-008',
    customer_id: 'SGP-0420260008',
    name: 'Linh Do',
    email: 'linh.do@gmail.com',
    phone: '(713) 555-0808',
    zip: '77081',
    service_type: 'residential',
    preferred_language: 'vi',
    status: 'contacted',
    source: 'referral',
    referral_by: null, service_address: null, mailing_address: null, dob: null, anxh: null,
    notes: 'Referred by Lan Nguyen.',
    assigned_to: 'agent@saigonllc.com',
    created_at: daysAgo(2),
    updated_at: daysAgo(1),
  },
]

export const mockQuotes: QuoteRequest[] = [
  {
    id: 'quote-001',
    lead_id: 'lead-001',
    name: 'Lan Nguyen',
    email: 'lan.nguyen@gmail.com',
    phone: '(832) 555-0101',
    zip: '77036',
    service_type: 'residential',
    business_name: null,
    monthly_usage_kwh: 1200,
    notes: 'Looking for best fixed rate under 12 months.',
    preferred_language: 'vi',
    status: 'pending',
    created_at: daysAgo(0),
  },
  {
    id: 'quote-002',
    lead_id: 'lead-002',
    name: 'Minh Tran',
    email: 'mtran@nailsalon.com',
    phone: '(713) 555-0202',
    zip: '77479',
    service_type: 'commercial',
    business_name: 'Minh Beauty Nails',
    monthly_usage_kwh: 4500,
    notes: '2 locations, want same provider if possible.',
    preferred_language: 'vi',
    status: 'reviewed',
    created_at: daysAgo(1),
  },
  {
    id: 'quote-003',
    lead_id: 'lead-005',
    name: 'Thanh Vo',
    email: 'thanh.vo@gmail.com',
    phone: '(713) 555-0505',
    zip: '77057',
    service_type: 'residential',
    business_name: null,
    monthly_usage_kwh: 900,
    notes: null,
    preferred_language: 'vi',
    status: 'pending',
    created_at: daysAgo(0),
  },
  {
    id: 'quote-004',
    lead_id: 'lead-006',
    name: 'Hoa Nguyen Restaurant',
    email: 'hoa.restaurant@gmail.com',
    phone: '(832) 555-0606',
    zip: '77099',
    service_type: 'commercial',
    business_name: 'Pho Hoa Restaurant',
    monthly_usage_kwh: 3200,
    notes: 'High AC usage in summer.',
    preferred_language: 'vi',
    status: 'pending',
    created_at: daysAgo(0),
  },
]

export interface Provider {
  id: string
  name: string
  short_name: string
  website: string
  phone: string
  commission_residential: number // $ per enrollment
  commission_commercial: number
  active_plans: number
  notes: string | null
  status: 'active' | 'inactive'
}

export interface Plan {
  id: string
  provider_id: string
  provider_name: string
  name: string
  rate_kwh: number
  term_months: number
  service_type: ServiceType
  cancellation_fee: number | null
  renewable: boolean
  promo: string | null
  status: 'active' | 'inactive'
}

export const mockProviders: Provider[] = [
  { id: 'prv-001', name: 'Gexa Energy',      short_name: 'Gexa',       website: 'gexaenergy.com',    phone: '1-855-639-2727', commission_residential: 75,  commission_commercial: 150, active_plans: 4, notes: 'Best residential rates in Houston area.',   status: 'active'   },
  { id: 'prv-002', name: 'TXU Energy',       short_name: 'TXU',        website: 'txu.com',           phone: '1-800-818-6132', commission_residential: 80,  commission_commercial: 175, active_plans: 6, notes: 'Large brand — good for EN-speaking clients.', status: 'active'   },
  { id: 'prv-003', name: 'Reliant Energy',   short_name: 'Reliant',    website: 'reliant.com',       phone: '1-866-222-7100', commission_residential: 70,  commission_commercial: 200, active_plans: 5, notes: 'Strong commercial pricing.',                status: 'active'   },
  { id: 'prv-004', name: 'Green Mountain',   short_name: 'GreenMtn',   website: 'greenmountain.com', phone: '1-866-785-1885', commission_residential: 65,  commission_commercial: 120, active_plans: 3, notes: '100% renewable options.',                   status: 'active'   },
  { id: 'prv-005', name: 'Cirro Energy',     short_name: 'Cirro',      website: 'cirroenergy.com',   phone: '1-888-600-0872', commission_residential: 60,  commission_commercial: 100, active_plans: 3, notes: 'Budget plans for price-sensitive customers.', status: 'active'  },
  { id: 'prv-006', name: 'Payless Power',    short_name: 'Payless',    website: 'paylesspower.com',  phone: '1-888-963-9363', commission_residential: 50,  commission_commercial: 0,   active_plans: 2, notes: 'Prepaid only. Good for credit-challenged.',  status: 'active'   },
]

export const mockPlans: Plan[] = [
  { id: 'plan-001', provider_id: 'prv-001', provider_name: 'Gexa Energy',    name: 'Gexa Saver 12',        rate_kwh: 0.109, term_months: 12, service_type: 'residential', cancellation_fee: 150, renewable: false, promo: null,                  status: 'active' },
  { id: 'plan-002', provider_id: 'prv-001', provider_name: 'Gexa Energy',    name: 'Gexa Saver 24',        rate_kwh: 0.115, term_months: 24, service_type: 'residential', cancellation_fee: 200, renewable: false, promo: '$50 bill credit',      status: 'active' },
  { id: 'plan-003', provider_id: 'prv-001', provider_name: 'Gexa Energy',    name: 'Gexa Green 12',        rate_kwh: 0.118, term_months: 12, service_type: 'residential', cancellation_fee: 150, renewable: true,  promo: null,                  status: 'active' },
  { id: 'plan-004', provider_id: 'prv-002', provider_name: 'TXU Energy',     name: 'TXU Simple Rate 12',   rate_kwh: 0.121, term_months: 12, service_type: 'residential', cancellation_fee: 175, renewable: false, promo: null,                  status: 'active' },
  { id: 'plan-005', provider_id: 'prv-002', provider_name: 'TXU Energy',     name: 'TXU Energy Saver 24',  rate_kwh: 0.118, term_months: 24, service_type: 'residential', cancellation_fee: 200, renewable: false, promo: '$100 Visa gift card', status: 'active' },
  { id: 'plan-006', provider_id: 'prv-002', provider_name: 'TXU Energy',     name: 'TXU Business 12',      rate_kwh: 0.128, term_months: 12, service_type: 'commercial',  cancellation_fee: 300, renewable: false, promo: null,                  status: 'active' },
  { id: 'plan-007', provider_id: 'prv-003', provider_name: 'Reliant Energy', name: 'Reliant Secure 12',    rate_kwh: 0.124, term_months: 12, service_type: 'residential', cancellation_fee: 150, renewable: false, promo: null,                  status: 'active' },
  { id: 'plan-008', provider_id: 'prv-003', provider_name: 'Reliant Energy', name: 'Reliant Business 12',  rate_kwh: 0.132, term_months: 12, service_type: 'commercial',  cancellation_fee: 350, renewable: false, promo: null,                  status: 'active' },
  { id: 'plan-009', provider_id: 'prv-004', provider_name: 'Green Mountain', name: 'Green Simple 12',      rate_kwh: 0.125, term_months: 12, service_type: 'residential', cancellation_fee: 100, renewable: true,  promo: null,                  status: 'active' },
  { id: 'plan-010', provider_id: 'prv-005', provider_name: 'Cirro Energy',   name: 'Cirro Value 6',        rate_kwh: 0.114, term_months: 6,  service_type: 'residential', cancellation_fee: 75,  renewable: false, promo: null,                  status: 'active' },
  { id: 'plan-011', provider_id: 'prv-005', provider_name: 'Cirro Energy',   name: 'Cirro Value 12',       rate_kwh: 0.119, term_months: 12, service_type: 'residential', cancellation_fee: 100, renewable: false, promo: null,                  status: 'active' },
  { id: 'plan-012', provider_id: 'prv-006', provider_name: 'Payless Power',  name: 'Payless Prepaid',      rate_kwh: 0.138, term_months: 0,  service_type: 'residential', cancellation_fee: null,renewable: false, promo: 'No deposit required', status: 'active' },
]

export const mockCRMStats: CRMStats = {
  newLeadsToday: 3,
  newLeadsWeek: 8,
  pendingQuotes: 3,
  activeContracts: 24,
  expiringSoon: 4,
  totalLeads: mockLeads.length,
  enrolledThisMonth: 2,
}
