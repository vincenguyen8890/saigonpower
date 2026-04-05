'use server'

import { insertPlan, updatePlan, deletePlan } from '@/lib/supabase/queries'
import { revalidatePath } from 'next/cache'
import type { Plan } from '@/data/mock-crm'

function bust() { revalidatePath('/', 'layout') }

export async function savePlanAction(plan: Plan) {
  // Determine insert vs update by checking if it's a temp ID
  if (plan.id.startsWith('plan-') && plan.id.length > 10) {
    // new plan — strip the temp id and insert
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _id, ...rest } = plan
    const saved = await insertPlan(rest)
    bust()
    return saved
  } else {
    const { id, ...rest } = plan
    await updatePlan(id, rest)
    bust()
    return plan
  }
}

export async function deletePlanAction(id: string) {
  await deletePlan(id)
  bust()
}
