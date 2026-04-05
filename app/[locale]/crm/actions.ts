'use server'

import { completeActivity } from '@/lib/supabase/queries'
import { revalidatePath } from 'next/cache'

export async function completeActivityAction(id: string) {
  await completeActivity(id)
  revalidatePath('/', 'layout')
}
