'use server'

import { revalidatePath } from 'next/cache'
import { markCommissionPaid, setDealShareToken, getDealById } from '@/lib/supabase/queries'
import { randomUUID } from 'crypto'

export async function markCommissionPaidAction(dealId: string, amount: number): Promise<void> {
  await markCommissionPaid(dealId, amount)
  revalidatePath('/', 'layout')
}

export async function getOrCreateShareTokenAction(dealId: string): Promise<string> {
  const deal = await getDealById(dealId)
  if (deal?.share_token) return deal.share_token
  const token = randomUUID()
  await setDealShareToken(dealId, token)
  return token
}
