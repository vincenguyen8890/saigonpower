'use server'

import { createClient } from '@/lib/supabase/server'
import { insertLead } from '@/lib/supabase/queries'
import { revalidatePath } from 'next/cache'

function bust() { revalidatePath('/', 'layout') }

export async function createQuoteAction(data: {
  name: string
  email: string
  phone: string
  zip: string
  service_type: 'residential' | 'commercial'
  business_name: string
  monthly_usage_kwh: string
  preferred_language: 'vi' | 'en'
  notes: string
}) {
  const quote = {
    name:               data.name,
    email:              data.email || null,
    phone:              data.phone || null,
    zip:                data.zip,
    service_type:       data.service_type,
    business_name:      data.business_name || null,
    monthly_usage_kwh:  data.monthly_usage_kwh ? parseInt(data.monthly_usage_kwh) : null,
    preferred_language: data.preferred_language,
    notes:              data.notes || null,
    status:             'pending' as const,
    lead_id:            null as string | null,
  }

  try {
    // Create linked lead first
    const lead = await insertLead({
      name:               data.name,
      email:              data.email || '',
      phone:              data.phone || '',
      zip:                data.zip,
      service_type:       data.service_type,
      preferred_language: data.preferred_language,
      status:             'new',
      source:             'crm',
      notes:              data.notes || null,
      assigned_to:        null,
    })
    if (lead) quote.lead_id = lead.id

    // Save quote request
    const supabase = await createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('quote_requests') as any).insert(quote)
  } catch { /* silently continue */ }

  bust()
}

export async function updateQuoteStatusAction(id: string, status: string) {
  try {
    const supabase = await createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('quote_requests') as any).update({ status }).eq('id', id)
  } catch { /* ignore */ }
  bust()
}
