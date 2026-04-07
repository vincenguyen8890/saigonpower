'use server'

import { revalidatePath } from 'next/cache'
import { insertCRMAgent, updateCRMAgent, deleteCRMAgent, upsertAgentGoal } from '@/lib/supabase/queries'
import type { CRMAgent, AgentGoal } from '@/lib/supabase/queries'

export async function upsertAgentGoalAction(goal: Omit<AgentGoal, 'id' | 'created_at' | 'updated_at'>) {
  await upsertAgentGoal(goal)
  revalidatePath('/', 'layout')
}

export async function saveAgentAction(agent: Omit<CRMAgent, 'id' | 'created_at'> & { id?: string }) {
  const { id, ...data } = agent
  if (id) {
    await updateCRMAgent(id, data)
  } else {
    await insertCRMAgent(data)
  }
  revalidatePath('/', 'layout')
}

export async function toggleAgentAction(id: string, active: boolean) {
  await updateCRMAgent(id, { active })
  revalidatePath('/', 'layout')
}

export async function deleteAgentAction(id: string) {
  await deleteCRMAgent(id)
  revalidatePath('/', 'layout')
}
