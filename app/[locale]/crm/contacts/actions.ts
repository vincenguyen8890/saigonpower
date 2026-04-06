'use server'

import { revalidatePath } from 'next/cache'
import { deleteLead } from '@/lib/supabase/queries'

export async function deleteCustomerAction(id: string): Promise<void> {
  await deleteLead(id)
  revalidatePath('/', 'layout')
}
