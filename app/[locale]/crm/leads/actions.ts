'use server'

import { revalidatePath } from 'next/cache'
import { updateLead } from '@/lib/supabase/queries'
import type { LeadStatus } from '@/data/mock-crm'

export async function updateLeadStatus(leadId: string, status: LeadStatus) {
  await updateLead(leadId, { status })
  revalidatePath('/crm/leads')
  revalidatePath(`/crm/leads/${leadId}`)
}

export async function updateLeadNotes(leadId: string, notes: string) {
  await updateLead(leadId, { notes })
  revalidatePath(`/crm/leads/${leadId}`)
}

export async function updateLeadAssignment(leadId: string, assignedTo: string | null) {
  await updateLead(leadId, { assigned_to: assignedTo })
  revalidatePath(`/crm/leads/${leadId}`)
}
