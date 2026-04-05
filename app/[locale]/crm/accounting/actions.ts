'use server'

import { revalidatePath } from 'next/cache'
import { insertCommission, updateCommission } from '@/lib/supabase/queries'
import type { Commission } from '@/lib/supabase/queries'

export async function recordPaymentAction(
  commissionId: string,
  amountReceived: number,
  status: Commission['status']
) {
  await updateCommission(commissionId, {
    amount_received: amountReceived,
    status,
  })
  revalidatePath('/', 'layout')
}

export async function createCommissionAction(
  data: Omit<Commission, 'id' | 'created_at'>
) {
  await insertCommission(data)
  revalidatePath('/', 'layout')
}
