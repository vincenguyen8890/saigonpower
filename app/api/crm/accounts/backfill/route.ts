import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * POST /api/crm/accounts/backfill
 * Admin-only: scans all deals and sets account_status on linked leads.
 *   - lead has a 'won' deal  → active
 *   - lead has deals but none won → inactive
 */
export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const db = createAdminClient()

  // Fetch all deals with a lead_id
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: deals, error: dealsErr } = await (db.from('deals') as any)
    .select('lead_id, stage')
    .not('lead_id', 'is', null)

  if (dealsErr) return NextResponse.json({ error: dealsErr.message }, { status: 500 })

  // Group by lead_id
  const byLead: Record<string, string[]> = {}
  for (const d of deals ?? []) {
    if (!d.lead_id) continue
    byLead[d.lead_id] = byLead[d.lead_id] ?? []
    byLead[d.lead_id].push(d.stage)
  }

  let updated = 0
  for (const [leadId, stages] of Object.entries(byLead)) {
    const status = stages.includes('won') ? 'active' : 'inactive'
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (db.from('leads') as any)
      .update({ account_status: status })
      .eq('id', leadId)
    updated++
  }

  return NextResponse.json({ ok: true, updated })
}
