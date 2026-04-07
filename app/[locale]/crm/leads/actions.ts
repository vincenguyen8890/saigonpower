'use server'

import { revalidatePath } from 'next/cache'
import { updateLead, insertActivity } from '@/lib/supabase/queries'
import type { LeadStatus, LeadTag } from '@/data/mock-crm'
import type { Activity } from '@/lib/supabase/queries'

function bust() {
  revalidatePath('/', 'layout')
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await updateLead(leadId, data as any)
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
