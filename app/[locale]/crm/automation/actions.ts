'use server'

import { revalidatePath } from 'next/cache'
import { insertActivity } from '@/lib/supabase/queries'

function bust() { revalidatePath('/', 'layout') }

// Mock contracts — same data as contracts/renewals pages
const mockContracts = [
  { id: 'CTR-001', user_name: 'Hung Le',         lead_id: 'lead-004', end_date: '2025-05-15', provider: 'Gexa Energy',    service_type: 'residential', plan_name: 'Gexa Saver 12'       },
  { id: 'CTR-002', user_name: 'Mai Pham',         lead_id: 'lead-003', end_date: '2025-06-01', provider: 'TXU Energy',     service_type: 'residential', plan_name: 'TXU Energy Saver 24'  },
  { id: 'CTR-003', user_name: 'Minh Tran Nails',  lead_id: 'lead-002', end_date: '2025-05-01', provider: 'Reliant Energy', service_type: 'commercial',  plan_name: 'Reliant Business 12'  },
  { id: 'CTR-004', user_name: 'Linh Do',          lead_id: null,       end_date: '2025-05-20', provider: 'Green Mountain', service_type: 'residential', plan_name: 'Green Mtn Simple 12'  },
  { id: 'CTR-005', user_name: 'David Kim',        lead_id: null,       end_date: '2025-06-15', provider: 'Cirro Energy',   service_type: 'residential', plan_name: 'Cirro Value 6'        },
]

export interface AutomationResult {
  rule: string
  created: number
  skipped: number
  details: string[]
}

/**
 * Renewal reminder engine — creates activity records for expiring contracts.
 * Mirrors what the Vercel cron job runs daily.
 */
export async function runRenewalReminders(): Promise<AutomationResult[]> {
  const now = new Date()
  const results: AutomationResult[] = []

  const windows = [
    { label: '60-day reminder',  minDays: 55,  maxDays: 65,  urgency: 'Schedule renewal call',  type: 'call'    as const, daysUntilDue: 0 },
    { label: '30-day reminder',  minDays: 25,  maxDays: 35,  urgency: 'Send renewal quote',      type: 'email'   as const, daysUntilDue: 0 },
    { label: '7-day URGENT',     minDays: 5,   maxDays: 10,  urgency: 'URGENT — contract expiring', type: 'task' as const, daysUntilDue: 0 },
  ]

  for (const window of windows) {
    const created: string[] = []
    const skipped: string[] = []

    for (const contract of mockContracts) {
      const daysLeft = Math.ceil((new Date(contract.end_date).getTime() - now.getTime()) / 86400000)

      if (daysLeft >= window.minDays && daysLeft <= window.maxDays) {
        const result = await insertActivity({
          lead_id:     contract.lead_id,
          type:        window.type,
          title:       `${window.urgency} — ${contract.user_name}`,
          description: `Contract ${contract.id} (${contract.plan_name} / ${contract.provider}) expires in ${daysLeft} days on ${contract.end_date}`,
          due_date:    new Date(now.getTime() + window.daysUntilDue * 86400000).toISOString(),
          completed:   false,
          assigned_to: null,
          created_by:  'system:renewal-engine',
        })
        if (result) created.push(`${contract.user_name} (${daysLeft}d left)`)
        else skipped.push(contract.user_name)
      }
    }

    results.push({ rule: window.label, created: created.length, skipped: skipped.length, details: created })
  }

  bust()
  return results
}

/**
 * Auto-assign new leads based on source rules.
 * Called after lead import or manual entry.
 */
export async function runLeadAssignment(leadIds: string[]): Promise<AutomationResult> {
  // In mock mode this is a no-op; with Supabase it would update assigned_to based on rules
  return {
    rule: 'Lead Auto-Assignment',
    created: 0,
    skipped: leadIds.length,
    details: ['Assignment runs on live Supabase data only'],
  }
}

/**
 * Deal stage automation — creates the next appropriate activity when a deal advances.
 */
export async function runDealStageAutomation(dealId: string, newStage: string, dealTitle: string, leadId: string | null): Promise<void> {
  const stageActions: Record<string, { type: 'call' | 'email' | 'task'; title: string; daysOut: number }> = {
    qualified:   { type: 'call',  title: 'Discovery call — confirm usage & budget',    daysOut: 1 },
    proposal:    { type: 'email', title: 'Send proposal and rate comparison',           daysOut: 1 },
    negotiation: { type: 'call',  title: 'Negotiate final rate & terms',               daysOut: 2 },
    won:         { type: 'task',  title: 'Process enrollment & send LOA',              daysOut: 0 },
    lost:        { type: 'task',  title: 'Log loss reason and schedule check-in',      daysOut: 30 },
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
