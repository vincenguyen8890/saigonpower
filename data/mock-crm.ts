// Mock CRM data — replace with Supabase queries once credentials are set

export type LeadStatus = 'new' | 'contacted' | 'quoted' | 'enrolled' | 'lost'
export type ServiceType = 'residential' | 'commercial'

export interface Lead {
  id: string
  name: string
  email: string
  phone: string
  zip: string
  service_type: ServiceType
  preferred_language: 'vi' | 'en'
  status: LeadStatus
  source: string | null
  notes: string | null
  assigned_to: string | null
  created_at: string
  updated_at: string
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
    name: 'Lan Nguyen',
    email: 'lan.nguyen@gmail.com',
    phone: '(832) 555-0101',
    zip: '77036',
    service_type: 'residential',
    preferred_language: 'vi',
    status: 'new',
    source: 'website',
    notes: null,
    assigned_to: null,
    created_at: daysAgo(0),
    updated_at: daysAgo(0),
  },
  {
    id: 'lead-002',
    name: 'Minh Tran',
    email: 'mtran@nailsalon.com',
    phone: '(713) 555-0202',
    zip: '77479',
    service_type: 'commercial',
    preferred_language: 'vi',
    status: 'contacted',
    source: 'referral',
    notes: 'Nail salon, 2 locations. Needs commercial rate.',
    assigned_to: 'agent@saigonllc.com',
    created_at: daysAgo(1),
    updated_at: daysAgo(0),
  },
  {
    id: 'lead-003',
    name: 'Mai Pham',
    email: 'mai.pham@gmail.com',
    phone: '(832) 555-0303',
    zip: '77450',
    service_type: 'residential',
    preferred_language: 'vi',
    status: 'quoted',
    source: 'facebook',
    notes: 'Interested in 12-month fixed rate. Budget ~$150/mo.',
    assigned_to: 'agent@saigonllc.com',
    created_at: daysAgo(3),
    updated_at: daysAgo(1),
  },
  {
    id: 'lead-004',
    name: 'Hung Le',
    email: 'hung.le@yahoo.com',
    phone: '(281) 555-0404',
    zip: '77584',
    service_type: 'residential',
    preferred_language: 'en',
    status: 'enrolled',
    source: 'website',
    notes: 'Enrolled in Gexa Saver 12. Start date: last week.',
    assigned_to: 'agent@saigonllc.com',
    created_at: daysAgo(7),
    updated_at: daysAgo(2),
  },
  {
    id: 'lead-005',
    name: 'Thanh Vo',
    email: 'thanh.vo@gmail.com',
    phone: '(713) 555-0505',
    zip: '77057',
    service_type: 'residential',
    preferred_language: 'vi',
    status: 'new',
    source: 'google',
    notes: null,
    assigned_to: null,
    created_at: daysAgo(0),
    updated_at: daysAgo(0),
  },
  {
    id: 'lead-006',
    name: 'Hoa Nguyen Restaurant',
    email: 'hoa.restaurant@gmail.com',
    phone: '(832) 555-0606',
    zip: '77099',
    service_type: 'commercial',
    preferred_language: 'vi',
    status: 'new',
    source: 'website',
    notes: 'Vietnamese restaurant, ~3,000 kWh/month.',
    assigned_to: null,
    created_at: daysAgo(0),
    updated_at: daysAgo(0),
  },
  {
    id: 'lead-007',
    name: 'David Kim',
    email: 'd.kim@email.com',
    phone: '(281) 555-0707',
    zip: '77494',
    service_type: 'residential',
    preferred_language: 'en',
    status: 'lost',
    source: 'google',
    notes: 'Went with another provider.',
    assigned_to: 'agent@saigonllc.com',
    created_at: daysAgo(14),
    updated_at: daysAgo(5),
  },
  {
    id: 'lead-008',
    name: 'Linh Do',
    email: 'linh.do@gmail.com',
    phone: '(713) 555-0808',
    zip: '77081',
    service_type: 'residential',
    preferred_language: 'vi',
    status: 'contacted',
    source: 'referral',
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

export const mockCRMStats: CRMStats = {
  newLeadsToday: 3,
  newLeadsWeek: 8,
  pendingQuotes: 3,
  activeContracts: 24,
  expiringSoon: 4,
  totalLeads: mockLeads.length,
  enrolledThisMonth: 2,
}
