/**
 * Scan all deals → group by lead_id → set account_status on each lead.
 *   has a 'won' deal  → active
 *   has deals but none won → inactive
 * Customers with multiple deals are handled correctly.
 */
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  'https://wtlftywoavdzoshvkzdw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0bGZ0eXdvYXZkem9zaHZremR3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTM5MTY5MiwiZXhwIjoyMDkwOTY3NjkyfQ.kiSgEymbc_1mDQrby7yyLBJw76RS8QFxODY0RCXgRZM'
)

async function main() {
  // ── 1. Load all deals ────────────────────────────────────────────────────────
  console.log('📦 Loading all deals...')
  let allDeals = [], from = 0
  while (true) {
    const { data, error } = await sb.from('deals')
      .select('id, lead_id, stage, title')
      .not('lead_id', 'is', null)
      .range(from, from + 999)
    if (error) { console.error('deals fetch error:', error.message); process.exit(1) }
    allDeals = allDeals.concat(data ?? [])
    if (!data || data.length < 1000) break
    from += 1000
  }
  console.log(`  → ${allDeals.length} deals found`)

  // ── 2. Group stages by lead ──────────────────────────────────────────────────
  const byLead = {}
  for (const d of allDeals) {
    if (!d.lead_id) continue
    if (!byLead[d.lead_id]) byLead[d.lead_id] = { stages: [], deals: [] }
    byLead[d.lead_id].stages.push(d.stage)
    byLead[d.lead_id].deals.push({ id: d.id, title: d.title, stage: d.stage })
  }

  const leadIds = Object.keys(byLead)
  console.log(`  → ${leadIds.length} unique customers with deals`)

  // ── 3. Load current account_status for those leads (batch to avoid URL limit) ─
  const BATCH = 200
  const leadMap = {}
  for (let i = 0; i < leadIds.length; i += BATCH) {
    const chunk = leadIds.slice(i, i + BATCH)
    const { data, error } = await sb.from('leads')
      .select('id, name, account_status')
      .in('id', chunk)
    if (error) { console.error('leads fetch error:', error.message); process.exit(1) }
    for (const l of data ?? []) leadMap[l.id] = l
  }

  // ── 4. Compute correct status and update ────────────────────────────────────
  console.log('\n🔄 Updating account statuses...\n')
  let active = 0, inactive = 0, skipped = 0

  for (const leadId of leadIds) {
    const { stages, deals } = byLead[leadId]
    const newStatus = stages.includes('won') ? 'active' : 'inactive'
    const lead = leadMap[leadId]
    const name = lead?.name ?? leadId

    if (lead?.account_status === newStatus) {
      console.log(`  ✓ ${name.padEnd(35)} ${newStatus} (no change, ${deals.length} deal${deals.length > 1 ? 's' : ''})`)
      skipped++
      continue
    }

    const { error } = await sb.from('leads')
      .update({ account_status: newStatus })
      .eq('id', leadId)

    if (error) {
      console.error(`  ✗ ${name}: ${error.message}`)
    } else {
      const dealList = deals.map(d => `${d.title} [${d.stage}]`).join(', ')
      console.log(`  ✅ ${name.padEnd(35)} → ${newStatus.padEnd(10)} (${deals.length} deal${deals.length > 1 ? 's' : ''}: ${dealList.slice(0, 80)})`)
      if (newStatus === 'active') active++
      else inactive++
    }
  }

  console.log('\n─────────────────────────────────────')
  console.log(`✅ Active:   ${active} leads updated`)
  console.log(`⬜ Inactive: ${inactive} leads updated`)
  console.log(`⏭  Skipped:  ${skipped} already correct`)
  console.log(`📋 Total:    ${leadIds.length} customers with deals`)
}

main().catch(e => { console.error(e); process.exit(1) })
