'use server'

import { revalidatePath } from 'next/cache'
import { insertDeal, insertActivity, updateContract } from '@/lib/supabase/queries'

export async function startRenewalAction(params: {
  contractId: string
  leadId: string | null
  customerName: string
  provider: string
  planName: string | null
  serviceType: 'residential' | 'commercial'
  currentRate: number | null
}) {
  const { contractId, leadId, customerName, provider, planName, serviceType, currentRate } = params

  // Create a renewal deal
  await insertDeal({
    lead_id:             leadId,
    title:               `Renewal — ${customerName}`,
    value:               serviceType === 'commercial' ? 200 : 75,
    stage:               'prospect',
    probability:         50,
    expected_close:      new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    provider:            provider,
    plan_name:           planName,
    service_type:        serviceType,
    notes:               `Renewal from contract ${contractId}. Current rate: ${currentRate ? `${(currentRate * 100).toFixed(1)}¢/kWh` : 'N/A'} with ${provider}.`,
    assigned_to:         null,
    agent_code:          null,
    service_address:     null,
    esid:                null,
    contract_start_date: null,
    contract_end_date:   null,
    rate_kwh:            currentRate,
    adder_kwh:           null,
    term_months:         null,
    product_type:        null,
    usage_kwh:           null,
  })

  // Log renewal activity
  if (leadId) {
    await insertActivity({
      lead_id:     leadId,
      type:        'renewal',
      title:       `Renewal started — ${customerName}`,
      description: `Contract with ${provider} (${planName ?? 'N/A'}) flagged for renewal. New deal created.`,
      due_date:    new Date(Date.now() + 7 * 86400000).toISOString(),
      completed:   false,
      assigned_to: null,
      created_by:  'agent',
    })
  }

  revalidatePath('/', 'layout')
}

export async function sendRenewalReminderAction(params: {
  contractId: string
  leadId: string | null
  customerName: string
  provider: string
  endDate: string
}) {
  // Log a reminder activity
  if (params.leadId) {
    await insertActivity({
      lead_id:     params.leadId,
      type:        'email',
      title:       `Renewal reminder sent — ${params.customerName}`,
      description: `Reminded customer about ${params.provider} contract expiring ${params.endDate}.`,
      due_date:    null,
      completed:   true,
      assigned_to: null,
      created_by:  'agent',
    })
  }

  revalidatePath('/', 'layout')
}

export async function markContractExpiredAction(id: string) {
  await updateContract(id, { status: 'expired' })
  revalidatePath('/', 'layout')
}
