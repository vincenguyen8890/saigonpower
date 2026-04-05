/**
 * Supabase query helpers with automatic mock fallback.
 * When NEXT_PUBLIC_SUPABASE_URL contains "placeholder", all functions
 * return mock data so the app works without a live Supabase project.
 */

import { createClient } from './server'
import {
  mockLeads, mockQuotes, mockCRMStats,
  type Lead, type QuoteRequest, type LeadStatus, type CRMStats,
} from '@/data/mock-crm'

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
