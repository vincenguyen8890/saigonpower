'use server'

import { revalidatePath } from 'next/cache'
import { updateLead, insertActivity, insertLeadNote, getLeadById } from '@/lib/supabase/queries'
import type { LeadStatus, LeadTag, Lead } from '@/data/mock-crm'
import type { Activity } from '@/lib/supabase/queries'
import { getSession } from '@/lib/auth/session'

function bust() {
  revalidatePath('/', 'layout')
}

const LEAD_AUDIT_LABELS: Partial<Record<keyof Lead, string>> = {
  name: 'Name', email: 'Email', phone: 'Phone', zip: 'ZIP',
  status: 'Status', service_type: 'Service type', source: 'Source',
  assigned_to: 'Agent', preferred_language: 'Language',
}

async function logLeadChange(leadId: string, old: Lead, updates: Partial<Lead>) {
  const changed: string[] = []
  for (const [k, label] of Object.entries(LEAD_AUDIT_LABELS)) {
    const key = k as keyof Lead
    if (key in updates && String(updates[key] ?? '') !== String(old[key] ?? '')) {
      changed.push(`${label}: "${old[key] ?? '—'}" → "${updates[key] ?? '—'}"`)
    }
  }
  if (changed.length === 0) return
  await insertActivity({
    lead_id:     leadId,
    type:        'note',
    title:       'Lead updated',
    description: changed.join(' · '),
    due_date:    null,
    completed:   true,
    assigned_to: null,
    created_by:  'system:audit',
  })
}

export async function updateLeadStatus(leadId: string, status: LeadStatus) {
  await updateLead(leadId, { status })

  // Auto-create follow-up activity on status changes
  const autoActivities: Partial<Record<LeadStatus, { type: Activity['type']; title: string; daysOut: number }>> = {
    contacted: { type: 'call',  title: 'Follow up after initial contact', daysOut: 2 },
    quoted:    { type: 'email', title: 'Follow up on quote sent',         daysOut: 3 },
    enrolled:  { type: 'task',  title: 'Send enrollment confirmation',    daysOut: 0 },
  }
  const auto = autoActivities[status]
  if (auto) {
    const due = new Date(Date.now() + auto.daysOut * 86400000).toISOString()
    await insertActivity({
      lead_id:     leadId,
      type:        auto.type,
      title:       auto.title,
      description: `Auto-created when status changed to "${status}"`,
      due_date:    due,
      completed:   false,
      assigned_to: null,
      created_by:  'system',
    })
  }

  bust()
}

export async function updateLeadNotes(leadId: string, notes: string) {
  await updateLead(leadId, { notes })
  bust()
}

export async function updateLeadAssignment(leadId: string, assignedTo: string | null) {
  await updateLead(leadId, { assigned_to: assignedTo })
  bust()
}

export async function updateLeadFull(leadId: string, data: {
  name: string
  email: string
  email2?: string | null
  phone: string
  phone2?: string | null
  zip: string
  dob?: string | null
  anxh?: string | null
  service_type: string
  preferred_language: string
  source: string
  notes: string
  assigned_to: string
  tags?: LeadTag[]
}) {
  const old = await getLeadById(leadId)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await updateLead(leadId, data as any)
  if (old) await logLeadChange(leadId, old, data as Partial<Lead>)
  bust()
}

export async function createLeadActivity(activity: Omit<Activity, 'id' | 'created_at' | 'completed_at'>) {
  await insertActivity(activity)
  bust()
}

export async function completeLeadActivity(id: string) {
  const { completeActivity } = await import('@/lib/supabase/queries')
  await completeActivity(id)
  bust()
}

export async function addLeadNote(leadId: string, body: string): Promise<{ error?: string }> {
  const session = await getSession()
  if (!session) return { error: 'Not authenticated' }

  const author = session.name || session.email
  const note = await insertLeadNote(leadId, body.trim(), author)
  if (!note) return { error: 'Failed to save note' }

  bust()
  return {}
}
