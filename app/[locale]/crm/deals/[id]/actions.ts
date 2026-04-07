'use server'

import { revalidatePath } from 'next/cache'
import { markCommissionPaid, setDealShareToken, getDealById, saveDealTemplate } from '@/lib/supabase/queries'
import { randomUUID } from 'crypto'

export async function markCommissionPaidAction(dealId: string, amount: number): Promise<void> {
  await markCommissionPaid(dealId, amount)
  revalidatePath('/', 'layout')
}

export async function saveDealAsTemplateAction(dealId: string, templateName: string): Promise<void> {
  const deal = await getDealById(dealId)
  if (!deal) return
  await saveDealTemplate({
    name:         templateName,
    provider:     deal.provider,
    plan_name:    deal.plan_name,
    product_type: deal.product_type,
    rate_kwh:     deal.rate_kwh,
    adder_kwh:    deal.adder_kwh,
    term_months:  deal.term_months,
    service_type: deal.service_type,
    notes:        null,
    created_by:   null,
  })
}

export async function getOrCreateShareTokenAction(dealId: string): Promise<string> {
  const deal = await getDealById(dealId)
  if (deal?.share_token) return deal.share_token
  const token = randomUUID()
  await setDealShareToken(dealId, token)
  return token
}
