'use server'

import { revalidatePath } from 'next/cache'
import { insertDeal, updateDeal, deleteDeal, getDealById, insertActivity, updateAccountStatus } from '@/lib/supabase/queries'
import type { Deal } from '@/lib/supabase/queries'

const AUDIT_LABELS: Partial<Record<keyof Deal, string>> = {
  stage: 'Stage', provider: 'Supplier', plan_name: 'Plan', rate_kwh: 'Rate',
  adder_kwh: 'Adder', term_months: 'Term', contract_start_date: 'Start date',
  contract_end_date: 'End date', assigned_to: 'Agent', service_order: 'Service order',
  esid: 'ESI ID', service_address: 'Address',
}

async function logDealChange(dealId: string, leadId: string | null, oldDeal: Deal, updates: Partial<Deal>) {
  const changed: string[] = []
  for (const [k, label] of Object.entries(AUDIT_LABELS)) {
    const key = k as keyof Deal
    if (key in updates && String(updates[key] ?? '') !== String(oldDeal[key] ?? '')) {
      changed.push(`${label}: "${oldDeal[key] ?? '—'}" → "${updates[key] ?? '—'}"`)
    }
  }
  if (changed.length === 0) return
  await insertActivity({
    lead_id:     leadId,
    type:        'note',
    title:       `Deal updated`,
    description: `deal:${dealId} | ${changed.join(' · ')}`,
    due_date:    null,
    completed:   true,
    assigned_to: null,
    created_by:  'system:audit',
  })
}

function bust() {
  revalidatePath('/', 'layout')
}

export async function createDeal(deal: Omit<Deal, 'id' | 'created_at' | 'updated_at'>): Promise<{ error?: string }> {
  const url  = process.env.NEXT_PUBLIC_SUPABASE_URL  ?? 'MISSING'
  const key  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'MISSING'
  const mock = url.includes('placeholder') || url === 'MISSING'

  console.log('[createDeal] url:', url.slice(0, 40), '| mock:', mock, '| key starts:', key.slice(0, 10))

  const result = await insertDeal(deal)

  console.log('[createDeal] insertDeal result:', result ? 'OK id=' + (result as Deal).id : 'NULL')

  if (!result) return {
    error: `Save failed. mock=${mock} url=${url.slice(0, 40)} key=${key.slice(0, 10)}…`,
  }
  bust()
  return {}
}

export async function updateDealAction(id: string, updates: Partial<Deal>) {
  const old = await getDealById(id)
  await updateDeal(id, updates)
  if (old) await logDealChange(id, old.lead_id, old, updates)
  bust()
}

export async function deleteDealAction(id: string): Promise<void> {
  await deleteDeal(id)
  bust()
}

export async function bulkUpdateDealsAction(ids: string[], updates: Partial<Deal>): Promise<void> {
  await Promise.all(ids.map(id => updateDeal(id, updates)))
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

  if (newStage === 'won' && leadId) {
    await updateAccountStatus(leadId, 'active')
  }

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
