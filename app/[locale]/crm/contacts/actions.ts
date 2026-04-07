'use server'

import { revalidatePath } from 'next/cache'
import { deleteLead, updateAccountStatus } from '@/lib/supabase/queries'
import type { AccountStatus } from '@/lib/supabase/queries'

export async function deleteCustomerAction(id: string): Promise<void> {
  await deleteLead(id)
  revalidatePath('/', 'layout')
}

export async function bulkUpdateAccountStatusAction(ids: string[], status: AccountStatus): Promise<void> {
  await Promise.all(ids.map(id => updateAccountStatus(id, status)))
  revalidatePath('/', 'layout')
}
