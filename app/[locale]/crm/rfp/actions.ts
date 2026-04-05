'use server'

import { revalidatePath } from 'next/cache'
import { insertRFP, updateRFP, insertRFPResponse, updateRFPResponse } from '@/lib/supabase/queries'
import type { RFPRequest, RFPResponse } from '@/lib/supabase/queries'

export async function createRFPAction(data: {
  lead_id: string | null
  title: string
  service_type: 'residential' | 'commercial'
  usage_kwh: number
  zip: string | null
  notes: string | null
  providers: string[]
}) {
  const rfp = await insertRFP({
    lead_id:      data.lead_id,
    title:        data.title,
    service_type: data.service_type,
    usage_kwh:    data.usage_kwh,
    zip:          data.zip,
    status:       'sent',
    notes:        data.notes,
    created_by:   'agent',
  })

  if (rfp) {
    // Create a pending response slot for each provider
    await Promise.all(
      data.providers.map(pName =>
        insertRFPResponse({
          rfp_id:          rfp.id,
          provider_name:   pName,
          plan_name:       null,
          rate_kwh:        null,
          term_months:     null,
          cancellation_fee:null,
          renewable:       false,
          notes:           null,
          status:          'pending',
        })
      )
    )
  }

  revalidatePath('/', 'layout')
  return rfp
}

export async function updateRFPStatusAction(id: string, status: RFPRequest['status']) {
  await updateRFP(id, { status })
  revalidatePath('/', 'layout')
}

export async function recordRFPResponseAction(
  responseId: string,
  data: {
    plan_name: string | null
    rate_kwh: number | null
    term_months: number | null
    cancellation_fee: number | null
    renewable: boolean
    notes: string | null
    status: RFPResponse['status']
  }
) {
  await updateRFPResponse(responseId, data)
  revalidatePath('/', 'layout')
}

export async function addRFPResponseAction(
  rfpId: string,
  data: Omit<RFPResponse, 'id' | 'rfp_id' | 'created_at'>
) {
  await insertRFPResponse({ ...data, rfp_id: rfpId })
  revalidatePath('/', 'layout')
}
