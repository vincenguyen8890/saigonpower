'use server'

import { insertPlan, updatePlan, deletePlan } from '@/lib/supabase/queries'
import { revalidatePath } from 'next/cache'
import type { Plan } from '@/data/mock-crm'

function bust() { revalidatePath('/', 'layout') }

export async function createPlanAction(data: Omit<Plan, 'id'>) {
  await insertPlan(data)
  bust()
}

export async function updatePlanAction(id: string, data: Partial<Plan>) {
  await updatePlan(id, data)
  bust()
}

export async function deletePlanAction(id: string) {
  await deletePlan(id)
  bust()
}
