/**
 * Supabase query helpers with automatic mock fallback.
 * When NEXT_PUBLIC_SUPABASE_URL contains "placeholder", all functions
 * return mock data so the app works without a live Supabase project.
 */

import { createClient } from './server'
import {
  mockLeads, mockQuotes, mockCRMStats, mockPlans, mockProviders,
  type Lead, type QuoteRequest, type LeadStatus, type CRMStats, type Plan, type Provider,
} from '@/data/mock-crm'

export type { Lead, QuoteRequest, Plan, Provider }

function useMock() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')
}

// ─── Leads ────────────────────────────────────────────────────────────────────

export async function getLeads(filters?: {
  status?: string
  service?: string
  q?: string
}): Promise<Lead[]> {
  if (useMock()) {
    let leads = mockLeads
    if (filters?.status && filters.status !== 'all')
      leads = leads.filter(l => l.status === filters.status as LeadStatus)
    if (filters?.service && filters.service !== 'all')
      leads = leads.filter(l => l.service_type === filters.service as Lead['service_type'])
    if (filters?.q) {
      const q = filters.q.toLowerCase()
      leads = leads.filter(l =>
        l.name.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q) ||
        l.phone.includes(q) ||
        l.zip.includes(q)
      )
    }
    return leads
  }

  try {
    const supabase = await createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let q = (supabase.from('leads') as any)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200)

    if (filters?.status && filters.status !== 'all') q = q.eq('status', filters.status)
    if (filters?.service && filters.service !== 'all') q = q.eq('service_type', filters.service)
    if (filters?.q) {
      const search = filters.q
      q = q.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%,zip.ilike.%${search}%`)
    }

    const { data, error } = await q
    if (error) throw error
    return data ?? []
  } catch {
    return mockLeads
  }
}

export async function getLeadById(id: string): Promise<Lead | null> {
  if (useMock()) return mockLeads.find(l => l.id === id) ?? null

  try {
    const supabase = await createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from('leads') as any)
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  } catch {
    return mockLeads.find(l => l.id === id) ?? null
  }
}

export async function updateLead(id: string, updates: Partial<Lead>): Promise<void> {
  if (useMock()) return // mock — no persistence

  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from('leads') as any).update(updates).eq('id', id)
}

export async function insertLead(lead: Omit<Lead, 'id' | 'created_at' | 'updated_at'>): Promise<Lead | null> {
  if (useMock()) return { ...lead, id: `lead-${Date.now()}`, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }

  try {
    const supabase = await createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from('leads') as any)
      .insert(lead)
      .select()
      .single()
    if (error) throw error
    return data
  } catch {
    return null
  }
}

// ─── Quotes ───────────────────────────────────────────────────────────────────

export async function getQuotes(status?: string): Promise<QuoteRequest[]> {
  if (useMock()) {
    if (status && status !== 'all') return mockQuotes.filter(q => q.status === status)
    return mockQuotes
  }

  try {
    const supabase = await createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let q = (supabase.from('quote_requests') as any)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200)
    if (status && status !== 'all') q = q.eq('status', status)
    const { data, error } = await q
    if (error) throw error
    return data ?? []
  } catch {
    return mockQuotes
  }
}

export async function getQuotesByLead(leadId: string): Promise<QuoteRequest[]> {
  if (useMock()) return mockQuotes.filter(q => q.lead_id === leadId)

  try {
    const supabase = await createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from('quote_requests') as any)
      .select('*')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data ?? []
  } catch {
    return mockQuotes.filter(q => q.lead_id === leadId)
  }
}

// ─── Activities ───────────────────────────────────────────────────────────────

export interface Activity {
  id: string
  lead_id: string | null
  type: 'call' | 'email' | 'meeting' | 'note' | 'task' | 'renewal'
  title: string
  description: string | null
  due_date: string | null
  completed: boolean
  completed_at: string | null
  assigned_to: string | null
  created_by: string | null
  created_at: string
}

const _actNow = () => new Date().toISOString()
const _actOffset = (days: number) => new Date(Date.now() + days * 86400000).toISOString()

const mockActivities: Activity[] = [
  // ── Overdue (past due, not complete) ──────────────────────────────────────
  { id: 'act-001', lead_id: 'lead-002', type: 'call',    title: 'Follow up after initial contact',           description: 'Auto-created when status changed to "contacted"', due_date: _actOffset(-3), completed: false, completed_at: null, assigned_to: 'agent@saigonllc.com', created_by: 'system',                  created_at: _actOffset(-4) },
  { id: 'act-002', lead_id: 'lead-003', type: 'email',   title: 'Follow up on quote sent',                  description: 'Check if Mai has reviewed the Gexa Saver 12 quote', due_date: _actOffset(-1), completed: false, completed_at: null, assigned_to: 'agent@saigonllc.com', created_by: 'system',                  created_at: _actOffset(-2) },
  // ── Today ─────────────────────────────────────────────────────────────────
  { id: 'act-003', lead_id: 'lead-001', type: 'call',    title: 'Initial discovery call',                   description: 'Understand usage and budget for residential plan', due_date: _actNow(),      completed: false, completed_at: null, assigned_to: 'agent@saigonllc.com', created_by: 'agent@saigonllc.com', created_at: _actOffset(-1) },
  { id: 'act-004', lead_id: 'lead-005', type: 'call',    title: 'Initial contact — new lead',               description: null,                                              due_date: _actNow(),      completed: false, completed_at: null, assigned_to: null,                  created_by: 'system',                  created_at: _actOffset(-1) },
  // ── This week (1-6 days out) ───────────────────────────────────────────────
  { id: 'act-005', lead_id: 'lead-008', type: 'email',   title: 'Send rate comparison to Linh Do',          description: 'Referred by Lan Nguyen — send residential options', due_date: _actOffset(1), completed: false, completed_at: null, assigned_to: 'agent@saigonllc.com', created_by: 'agent@saigonllc.com', created_at: _actNow()      },
  { id: 'act-006', lead_id: 'lead-006', type: 'meeting', title: 'On-site visit — Hoa Nguyen Restaurant',    description: 'Assess meter & usage for commercial quote',         due_date: _actOffset(2), completed: false, completed_at: null, assigned_to: 'agent@saigonllc.com', created_by: 'agent@saigonllc.com', created_at: _actNow()      },
  { id: 'act-007', lead_id: 'lead-002', type: 'task',    title: 'Prepare commercial proposal for Minh Tran', description: 'Include Reliant Business 12 + TXU Business 12',   due_date: _actOffset(3), completed: false, completed_at: null, assigned_to: 'agent@saigonllc.com', created_by: 'agent@saigonllc.com', created_at: _actNow()      },
  // ── Later (7+ days out) ────────────────────────────────────────────────────
  { id: 'act-008', lead_id: 'lead-003', type: 'call',    title: 'Renewal discovery call — Mai Pham',        description: 'Contract expires in ~45 days — offer renewal',     due_date: _actOffset(9), completed: false, completed_at: null, assigned_to: 'agent@saigonllc.com', created_by: 'system',                  created_at: _actNow()      },
  // ── Completed ─────────────────────────────────────────────────────────────
  { id: 'act-009', lead_id: 'lead-004', type: 'task',    title: 'Process enrollment — Gexa Saver 12',       description: 'LOA signed, enrollment confirmed',                 due_date: _actOffset(-5), completed: true,  completed_at: _actOffset(-4), assigned_to: 'agent@saigonllc.com', created_by: 'agent@saigonllc.com', created_at: _actOffset(-6) },
  { id: 'act-010', lead_id: 'lead-007', type: 'note',    title: 'Logged loss reason — David Kim',           description: 'Went with Pulse Power for lower intro rate',       due_date: null,           completed: true,  completed_at: _actOffset(-5), assigned_to: 'agent@saigonllc.com', created_by: 'agent@saigonllc.com', created_at: _actOffset(-5) },
]

export async function getActivities(opts?: { leadId?: string; completed?: boolean; limit?: number }): Promise<Activity[]> {
  if (useMock()) return mockActivities

  try {
    const supabase = await createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let q = (supabase.from('activities') as any)
      .select('*')
      .order('due_date', { ascending: true })
      .limit(opts?.limit ?? 50)
    if (opts?.leadId)     q = q.eq('lead_id', opts.leadId)
    if (opts?.completed !== undefined) q = q.eq('completed', opts.completed)
    const { data, error } = await q
    if (error) throw error
    return data ?? []
  } catch { return [] }
}

export async function insertActivity(activity: Omit<Activity, 'id' | 'created_at' | 'completed_at'>): Promise<Activity | null> {
  if (useMock()) return { ...activity, id: `act-${Date.now()}`, created_at: new Date().toISOString(), completed_at: null }

  try {
    const supabase = await createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from('activities') as any)
      .insert(activity).select().single()
    if (error) throw error
    return data
  } catch { return null }
}

export async function completeActivity(id: string): Promise<void> {
  if (useMock()) return

  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from('activities') as any)
    .update({ completed: true, completed_at: new Date().toISOString() })
    .eq('id', id)
}

// ─── Deals ────────────────────────────────────────────────────────────────────

export interface Deal {
  id: string
  lead_id: string | null
  title: string
  value: number
  stage: 'prospect' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost'
  probability: number
  expected_close: string | null
  provider: string | null
  plan_name: string | null
  service_type: 'residential' | 'commercial' | null
  notes: string | null
  assigned_to: string | null
  // extended fields
  agent_code: string | null
  service_address: string | null
  esid: string | null
  contract_start_date: string | null
  contract_end_date: string | null
  rate_kwh: number | null
  adder_kwh: number | null
  term_months: number | null
  product_type: string | null
  usage_kwh: number | null
  created_at: string
  updated_at: string
}

const mockDeals: Deal[] = [
  { id: 'd-001', lead_id: 'lead-002', title: 'Minh Tran – Nail Salon Commercial', value: 200, stage: 'proposal',     probability: 70, expected_close: '2025-05-01', provider: 'Reliant Energy', plan_name: 'Reliant Business 12', service_type: 'commercial',  notes: null, assigned_to: 'agent@saigonllc.com', agent_code: null, service_address: '910 Business Blvd, Sugar Land TX', esid: null, contract_start_date: null, contract_end_date: null, rate_kwh: 0.132, adder_kwh: null, term_months: 12, product_type: 'FIXED RATE', usage_kwh: 1800, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'd-002', lead_id: 'lead-003', title: 'Mai Pham – Residential 12mo',       value: 75,  stage: 'negotiation', probability: 85, expected_close: '2025-04-15', provider: 'Gexa Energy',    plan_name: 'Gexa Saver 12',       service_type: 'residential', notes: null, assigned_to: 'agent@saigonllc.com', agent_code: null, service_address: '5678 Oak Ave, Katy TX', esid: null, contract_start_date: null, contract_end_date: null, rate_kwh: 0.109, adder_kwh: null, term_months: 12, product_type: 'FIXED RATE', usage_kwh: 1200, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'd-003', lead_id: 'lead-006', title: 'Hoa Nguyen Restaurant',             value: 350, stage: 'qualified',   probability: 50, expected_close: '2025-05-15', provider: null,             plan_name: null,                  service_type: 'commercial',  notes: 'High usage ~3200 kWh/mo', assigned_to: null, agent_code: null, service_address: null, esid: null, contract_start_date: null, contract_end_date: null, rate_kwh: null, adder_kwh: null, term_months: null, product_type: null, usage_kwh: 3200, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'd-004', lead_id: 'lead-001', title: 'Lan Nguyen – Residential',          value: 75,  stage: 'prospect',    probability: 30, expected_close: '2025-06-01', provider: null,             plan_name: null,                  service_type: 'residential', notes: null, assigned_to: null, agent_code: null, service_address: null, esid: null, contract_start_date: null, contract_end_date: null, rate_kwh: null, adder_kwh: null, term_months: null, product_type: null, usage_kwh: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
]

export async function getDeals(stage?: string): Promise<Deal[]> {
  if (useMock()) {
    if (stage && stage !== 'all') return mockDeals.filter(d => d.stage === stage)
    return mockDeals
  }

  try {
    const supabase = await createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let q = (supabase.from('deals') as any)
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(200)
    if (stage && stage !== 'all') q = q.eq('stage', stage)
    const { data, error } = await q
    if (error) throw error
    return data ?? []
  } catch { return mockDeals }
}

export async function insertDeal(deal: Omit<Deal, 'id' | 'created_at' | 'updated_at'>): Promise<Deal | null> {
  if (useMock()) return { ...deal, id: `d-${Date.now()}`, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }

  try {
    const supabase = await createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from('deals') as any).insert(deal).select().single()
    if (error) { console.error('[insertDeal] Supabase error:', error); throw error }
    return data
  } catch (e) { console.error('[insertDeal] caught:', e); return null }
}

export async function updateDeal(id: string, updates: Partial<Deal>): Promise<void> {
  if (useMock()) return

  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from('deals') as any).update(updates).eq('id', id)
}

export async function getDealById(id: string): Promise<Deal | null> {
  if (useMock()) return mockDeals.find(d => d.id === id) ?? null

  try {
    const supabase = await createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from('deals') as any).select('*').eq('id', id).single()
    if (error) throw error
    return data
  } catch { return mockDeals.find(d => d.id === id) ?? null }
}

// ─── Plans ────────────────────────────────────────────────────────────────────

export async function getPlansFromDB(): Promise<Plan[]> {
  if (useMock()) return mockPlans
  try {
    const supabase = await createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from('crm_plans') as any).select('*').order('provider_name').order('rate_kwh')
    if (error) throw error
    return data ?? []
  } catch { return mockPlans }
}

export async function insertPlan(plan: Omit<Plan, 'id'>): Promise<Plan | null> {
  if (useMock()) {
    const newPlan = { ...plan, id: `plan-${Date.now()}` }
    mockPlans.push(newPlan)
    return newPlan
  }
  try {
    const supabase = await createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from('crm_plans') as any).insert(plan).select().single()
    if (error) throw error
    return data
  } catch { return null }
}

export async function updatePlan(id: string, updates: Partial<Plan>): Promise<void> {
  if (useMock()) {
    const idx = mockPlans.findIndex(p => p.id === id)
    if (idx !== -1) Object.assign(mockPlans[idx], updates)
    return
  }
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from('crm_plans') as any).update(updates).eq('id', id)
}

export async function deletePlan(id: string): Promise<void> {
  if (useMock()) {
    const idx = mockPlans.findIndex(p => p.id === id)
    if (idx !== -1) mockPlans.splice(idx, 1)
    return
  }
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from('crm_plans') as any).delete().eq('id', id)
}

// ─── Providers ────────────────────────────────────────────────────────────────

export async function getProvidersFromDB(): Promise<import('@/data/mock-crm').Provider[]> {
  if (useMock()) return mockProviders
  try {
    const supabase = await createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from('crm_providers') as any).select('*').order('name')
    if (error) throw error
    return data ?? []
  } catch { return mockProviders }
}

export async function insertProvider(provider: Omit<import('@/data/mock-crm').Provider, 'id'>): Promise<import('@/data/mock-crm').Provider | null> {
  if (useMock()) return { ...provider, id: `prv-${Date.now()}` }
  try {
    const supabase = await createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from('crm_providers') as any).insert(provider).select().single()
    if (error) throw error
    return data
  } catch { return null }
}

export async function updateProvider(id: string, updates: Partial<import('@/data/mock-crm').Provider>): Promise<void> {
  if (useMock()) return
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from('crm_providers') as any).update(updates).eq('id', id)
}

export async function deleteProvider(id: string): Promise<void> {
  if (useMock()) return
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from('crm_providers') as any).delete().eq('id', id)
}

// ─── Contracts ────────────────────────────────────────────────────────────────

export interface Contract {
  id: string
  lead_id: string | null
  provider: string
  plan_name: string | null
  service_type: 'residential' | 'commercial'
  address: string | null
  zip: string | null
  esid: string | null
  start_date: string
  end_date: string
  rate_kwh: number | null
  term_months: number | null
  status: 'active' | 'expired' | 'cancelled' | 'pending'
  notes: string | null
  created_at: string
  updated_at: string
  // denormalized for display
  customer_name?: string
}

const mockContracts: Contract[] = [
  { id: 'ctr-001', lead_id: 'lead-004', customer_name: 'Hung Le',         provider: 'Gexa Energy',    plan_name: 'Gexa Saver 12',       service_type: 'residential', address: '1234 Main St, Houston TX',      zip: '77036', esid: null, start_date: '2024-01-15', end_date: '2025-01-15', rate_kwh: 0.109, term_months: 12, status: 'active',  notes: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'ctr-002', lead_id: 'lead-003', customer_name: 'Mai Pham',        provider: 'TXU Energy',     plan_name: 'TXU Energy Saver 24', service_type: 'residential', address: '5678 Oak Ave, Katy TX',         zip: '77450', esid: null, start_date: '2023-06-01', end_date: '2025-06-01', rate_kwh: 0.118, term_months: 24, status: 'active',  notes: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'ctr-003', lead_id: 'lead-002', customer_name: 'Minh Tran Nails', provider: 'Reliant Energy', plan_name: 'Reliant Business 12', service_type: 'commercial',  address: '910 Business Blvd, Sugar Land', zip: '77479', esid: null, start_date: '2024-03-01', end_date: '2025-03-01', rate_kwh: 0.132, term_months: 12, status: 'active',  notes: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'ctr-004', lead_id: 'lead-008', customer_name: 'Linh Do',         provider: 'Green Mountain', plan_name: 'Green Simple 12',     service_type: 'residential', address: '321 Elm St, Houston TX',        zip: '77081', esid: null, start_date: '2024-02-01', end_date: '2025-02-01', rate_kwh: 0.125, term_months: 12, status: 'active',  notes: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
]

export async function getContracts(status?: string): Promise<Contract[]> {
  if (useMock()) return status && status !== 'all' ? mockContracts.filter(c => c.status === status) : mockContracts
  try {
    const supabase = await createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let q = (supabase.from('contracts') as any).select('*').order('end_date', { ascending: true }).limit(200)
    if (status && status !== 'all') q = q.eq('status', status)
    const { data, error } = await q
    if (error) throw error
    return data ?? []
  } catch { return mockContracts }
}

export async function insertContract(contract: Omit<Contract, 'id' | 'created_at' | 'updated_at'>): Promise<Contract | null> {
  if (useMock()) return { ...contract, id: `ctr-${Date.now()}`, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
  try {
    const supabase = await createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from('contracts') as any).insert(contract).select().single()
    if (error) throw error
    return data
  } catch { return null }
}

export async function updateContract(id: string, updates: Partial<Contract>): Promise<void> {
  if (useMock()) return
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from('contracts') as any).update(updates).eq('id', id)
}

export async function deleteContract(id: string): Promise<void> {
  if (useMock()) return
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from('contracts') as any).delete().eq('id', id)
}

// ─── Agents ───────────────────────────────────────────────────────────────────

export interface CRMAgent {
  id: string
  name: string
  email: string
  role: 'admin' | 'agent'
  agent_type: string | null
  phone: string | null
  active: boolean
  notes: string | null
  created_at: string
}

const mockAgents: CRMAgent[] = [
  { id: 'agt-001', name: 'Admin',       email: 'admin@saigonllc.com', role: 'admin', agent_type: 'electricity_broker', phone: '(832) 937-9999', active: true, notes: null, created_at: new Date().toISOString() },
  { id: 'agt-002', name: 'Sales Agent', email: 'agent@saigonllc.com', role: 'agent', agent_type: 'realtor',            phone: '(832) 937-9998', active: true, notes: null, created_at: new Date().toISOString() },
]

export async function getCRMAgents(): Promise<CRMAgent[]> {
  if (useMock()) return mockAgents
  try {
    const supabase = await createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from('crm_agents') as any)
      .select('*').order('created_at', { ascending: true })
    if (error) throw error
    return data ?? []
  } catch { return mockAgents }
}

export async function insertCRMAgent(agent: Omit<CRMAgent, 'id' | 'created_at'>): Promise<CRMAgent | null> {
  if (useMock()) return { ...agent, id: `agt-${Date.now()}`, created_at: new Date().toISOString() }
  try {
    const supabase = await createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from('crm_agents') as any).insert(agent).select().single()
    if (error) throw error
    return data
  } catch { return null }
}

export async function updateCRMAgent(id: string, updates: Partial<CRMAgent>): Promise<void> {
  if (useMock()) return
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from('crm_agents') as any).update(updates).eq('id', id)
}

export async function deleteCRMAgent(id: string): Promise<void> {
  if (useMock()) return
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from('crm_agents') as any).delete().eq('id', id)
}

// ─── Commissions ─────────────────────────────────────────────────────────────

export interface Commission {
  id: string
  deal_id: string | null
  lead_id: string | null
  provider: string
  period_start: string
  period_end: string | null
  amount_expected: number
  amount_received: number
  status: 'pending' | 'received' | 'short_pay' | 'missing'
  notes: string | null
  created_at: string
}

const mockCommissions: Commission[] = [
  { id: 'com-001', deal_id: 'd-001', lead_id: 'lead-002', provider: 'Reliant Energy', period_start: '2026-03-01', period_end: '2026-03-31', amount_expected: 200, amount_received: 175, status: 'short_pay', notes: null, created_at: new Date().toISOString() },
  { id: 'com-002', deal_id: 'd-001', lead_id: 'lead-002', provider: 'Reliant Energy', period_start: '2026-04-01', period_end: '2026-04-30', amount_expected: 200, amount_received: 200, status: 'received',  notes: null, created_at: new Date().toISOString() },
  { id: 'com-003', deal_id: 'd-002', lead_id: 'lead-003', provider: 'Gexa Energy',    period_start: '2026-03-01', period_end: '2026-03-31', amount_expected: 75,  amount_received: 0,   status: 'missing',   notes: null, created_at: new Date().toISOString() },
  { id: 'com-004', deal_id: 'd-002', lead_id: 'lead-003', provider: 'Gexa Energy',    period_start: '2026-04-01', period_end: '2026-04-30', amount_expected: 75,  amount_received: 75,  status: 'received',  notes: null, created_at: new Date().toISOString() },
  { id: 'com-005', deal_id: 'd-003', lead_id: 'lead-006', provider: 'N/A',            period_start: '2026-04-01', period_end: '2026-04-30', amount_expected: 350, amount_received: 0,   status: 'pending',   notes: null, created_at: new Date().toISOString() },
]

export async function getCommissions(opts?: { status?: string; dealId?: string }): Promise<Commission[]> {
  if (useMock()) {
    let rows = mockCommissions
    if (opts?.status && opts.status !== 'all') rows = rows.filter(r => r.status === opts.status)
    if (opts?.dealId) rows = rows.filter(r => r.deal_id === opts.dealId)
    return rows
  }
  try {
    const supabase = await createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let q = (supabase.from('commissions') as any)
      .select('*')
      .order('period_start', { ascending: false })
      .limit(200)
    if (opts?.status && opts.status !== 'all') q = q.eq('status', opts.status)
    if (opts?.dealId) q = q.eq('deal_id', opts.dealId)
    const { data, error } = await q
    if (error) throw error
    return data ?? []
  } catch { return mockCommissions }
}

export async function insertCommission(c: Omit<Commission, 'id' | 'created_at'>): Promise<Commission | null> {
  if (useMock()) return { ...c, id: `com-${Date.now()}`, created_at: new Date().toISOString() }
  try {
    const supabase = await createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from('commissions') as any).insert(c).select().single()
    if (error) throw error
    return data
  } catch { return null }
}

export async function updateCommission(id: string, updates: Partial<Commission>): Promise<void> {
  if (useMock()) return
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from('commissions') as any).update(updates).eq('id', id)
}

// ─── RFP Requests ─────────────────────────────────────────────────────────────

export interface RFPRequest {
  id: string
  lead_id: string | null
  title: string
  service_type: 'residential' | 'commercial'
  usage_kwh: number
  zip: string | null
  status: 'draft' | 'sent' | 'received' | 'closed'
  notes: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface RFPResponse {
  id: string
  rfp_id: string
  provider_name: string
  plan_name: string | null
  rate_kwh: number | null
  term_months: number | null
  cancellation_fee: number | null
  renewable: boolean
  notes: string | null
  status: 'pending' | 'received' | 'declined'
  created_at: string
}

const mockRFPs: RFPRequest[] = [
  { id: 'rfp-001', lead_id: 'lead-006', title: 'Hoa Nguyen Restaurant — Commercial Rate RFP', service_type: 'commercial', usage_kwh: 3200, zip: '77099', status: 'received', notes: 'Vietnamese restaurant, high summer usage', created_by: 'agent@saigonllc.com', created_at: new Date(Date.now() - 3 * 86400000).toISOString(), updated_at: new Date().toISOString() },
  { id: 'rfp-002', lead_id: 'lead-002', title: 'Minh Tran Nails — Commercial Renewal RFP',   service_type: 'commercial', usage_kwh: 1800, zip: '77479', status: 'sent',     notes: 'Contract expires Mar 2025',            created_by: 'agent@saigonllc.com', created_at: new Date(Date.now() - 1 * 86400000).toISOString(), updated_at: new Date().toISOString() },
]

const mockRFPResponses: RFPResponse[] = [
  { id: 'rfpr-001', rfp_id: 'rfp-001', provider_name: 'Reliant Energy', plan_name: 'Reliant Business 12', rate_kwh: 0.128, term_months: 12, cancellation_fee: 350, renewable: false, notes: null, status: 'received', created_at: new Date().toISOString() },
  { id: 'rfpr-002', rfp_id: 'rfp-001', provider_name: 'TXU Energy',     plan_name: 'TXU Business 12',     rate_kwh: 0.131, term_months: 12, cancellation_fee: 300, renewable: false, notes: null, status: 'received', created_at: new Date().toISOString() },
  { id: 'rfpr-003', rfp_id: 'rfp-001', provider_name: 'Cirro Energy',   plan_name: null,                  rate_kwh: null,  term_months: null, cancellation_fee: null, renewable: false, notes: 'No commercial product in this area', status: 'declined', created_at: new Date().toISOString() },
  { id: 'rfpr-004', rfp_id: 'rfp-002', provider_name: 'Reliant Energy', plan_name: 'Reliant Business 12', rate_kwh: 0.130, term_months: 12, cancellation_fee: 350, renewable: false, notes: null, status: 'received', created_at: new Date().toISOString() },
  { id: 'rfpr-005', rfp_id: 'rfp-002', provider_name: 'TXU Energy',     plan_name: null,                  rate_kwh: null,  term_months: null, cancellation_fee: null, renewable: false, notes: 'Pending review',                     status: 'pending',  created_at: new Date().toISOString() },
]

export async function getRFPs(): Promise<RFPRequest[]> {
  if (useMock()) return mockRFPs
  try {
    const supabase = await createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from('rfp_requests') as any)
      .select('*').order('created_at', { ascending: false }).limit(100)
    if (error) throw error
    return data ?? []
  } catch { return mockRFPs }
}

export async function insertRFP(rfp: Omit<RFPRequest, 'id' | 'created_at' | 'updated_at'>): Promise<RFPRequest | null> {
  if (useMock()) return { ...rfp, id: `rfp-${Date.now()}`, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
  try {
    const supabase = await createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from('rfp_requests') as any).insert(rfp).select().single()
    if (error) throw error
    return data
  } catch { return null }
}

export async function updateRFP(id: string, updates: Partial<RFPRequest>): Promise<void> {
  if (useMock()) return
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from('rfp_requests') as any).update(updates).eq('id', id)
}

export async function getRFPResponses(rfpId: string): Promise<RFPResponse[]> {
  if (useMock()) return mockRFPResponses.filter(r => r.rfp_id === rfpId)
  try {
    const supabase = await createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from('rfp_responses') as any)
      .select('*').eq('rfp_id', rfpId).order('created_at')
    if (error) throw error
    return data ?? []
  } catch { return mockRFPResponses.filter(r => r.rfp_id === rfpId) }
}

export async function insertRFPResponse(r: Omit<RFPResponse, 'id' | 'created_at'>): Promise<RFPResponse | null> {
  if (useMock()) return { ...r, id: `rfpr-${Date.now()}`, created_at: new Date().toISOString() }
  try {
    const supabase = await createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from('rfp_responses') as any).insert(r).select().single()
    if (error) throw error
    return data
  } catch { return null }
}

export async function updateRFPResponse(id: string, updates: Partial<RFPResponse>): Promise<void> {
  if (useMock()) return
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from('rfp_responses') as any).update(updates).eq('id', id)
}

// ─── CRM Stats ────────────────────────────────────────────────────────────────

export async function getCRMStats(): Promise<CRMStats> {
  if (useMock()) return mockCRMStats

  try {
    const supabase = await createClient()
    const today = new Date().toISOString().split('T')[0]
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]
    const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]
    const in30Days = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]

    const [todayLeads, weekLeads, pendingQuotes, activeContracts, expiring, enrolled] = await Promise.all([
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase.from('leads') as any).select('id', { count: 'exact' }).gte('created_at', today).eq('status', 'new'),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase.from('leads') as any).select('id', { count: 'exact' }).gte('created_at', weekAgo),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase.from('quote_requests') as any).select('id', { count: 'exact' }).eq('status', 'pending'),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase.from('contracts') as any).select('id', { count: 'exact' }).eq('status', 'active'),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase.from('contracts') as any).select('id', { count: 'exact' }).eq('status', 'active').lte('end_date', in30Days),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase.from('leads') as any).select('id', { count: 'exact' }).eq('status', 'enrolled').gte('updated_at', monthAgo),
    ])

    return {
      newLeadsToday:       todayLeads.count   ?? 0,
      newLeadsWeek:        weekLeads.count    ?? 0,
      pendingQuotes:       pendingQuotes.count ?? 0,
      activeContracts:     activeContracts.count ?? 0,
      expiringSoon:        expiring.count     ?? 0,
      totalLeads:          weekLeads.count    ?? 0,
      enrolledThisMonth:   enrolled.count     ?? 0,
    }
  } catch {
    return mockCRMStats
  }
}
