'use server'

import { revalidatePath } from 'next/cache'
import { insertDeal, updateDeal, insertActivity } from '@/lib/supabase/queries'
import type { Deal } from '@/lib/supabase/queries'

function bust() {
  revalidatePath('/', 'layout')
}

export async function createDeal(deal: Omit<Deal, 'id' | 'created_at' | 'updated_at'>): Promise<{ error?: string }> {
  const result = await insertDeal(deal)
  if (!result) return { error: 'Failed to save deal. Check server logs.' }
  bust()
  return {}
}

export async function updateDealAction(id: string, updates: Partial<Deal>) {
  await updateDeal(id, updates)
  bust()
}

/**
 * When a deal advances to a new stage, auto-create the next logical activity.
 */
export async function runDealStageAutomation(
  dealId: string,
  newStage: string,
  dealTitle: string,
  leadId: string | null,
): Promise<void> {
  const stageActions: Record<string, { type: 'call' | 'email' | 'task'; title: string; daysOut: number }> = {
    qualified:   { type: 'call',  title: 'Discovery call — confirm usage & budget',  daysOut: 1 },
    proposal:    { type: 'email', title: 'Send proposal and rate comparison',          daysOut: 1 },
    negotiation: { type: 'call',  title: 'Negotiate final rate & terms',              daysOut: 2 },
    won:         { type: 'task',  title: 'Process enrollment & send LOA',             daysOut: 0 },
    lost:        { type: 'task',  title: 'Log loss reason and schedule 30-day check-in', daysOut: 30 },
  }

  const action = stageActions[newStage]
  if (!action) return

  await insertActivity({
    lead_id:     leadId,
    type:        action.type,
    title:       `${action.title} — ${dealTitle}`,
    description: `Auto-created when deal moved to "${newStage}"`,
    due_date:    new Date(Date.now() + action.daysOut * 86400000).toISOString(),
    completed:   false,
    assigned_to: null,
    created_by:  'system:deal-automation',
  })

  bust()
}
