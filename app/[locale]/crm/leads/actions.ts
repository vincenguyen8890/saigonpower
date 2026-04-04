'use server'

import { revalidatePath } from 'next/cache'
import type { LeadStatus } from '@/data/mock-crm'

export async function updateLeadStatus(leadId: string, status: LeadStatus) {
  // TODO: Replace with Supabase once credentials are configured
  // const supabase = await createClient()
  // await supabase.from('leads').update({ status }).eq('id', leadId)

  // Mock: just revalidate the path
  revalidatePath('/crm/leads')
  revalidatePath(`/crm/leads/${leadId}`)
}

export async function updateLeadNotes(leadId: string, notes: string) {
  // TODO: Replace with Supabase once credentials are configured
  // const supabase = await createClient()
  // await supabase.from('leads').update({ notes }).eq('id', leadId)

  revalidatePath(`/crm/leads/${leadId}`)
}
