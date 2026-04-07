/**
 * Re-link unlinked deals to contacts.
 *
 * Strategy:
 * 1. Fetch all deals where lead_id IS NULL
 * 2. Fetch all leads
 * 3. For each unlinked deal, try to match by:
 *    a. Deal title normalized === lead name normalized (exact)
 *    b. Deal service_address contains lead name words (partial)
 *    c. Lead service_address matches deal service_address
 *
 * Run: node scripts/relink-deals.mjs
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL     = 'https://wtlftywoavdzoshvkzdw.supabase.co'
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0bGZ0eXdvYXZkem9zaHZremR3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTM5MTY5MiwiZXhwIjoyMDkwOTY3NjkyfQ.kiSgEymbc_1mDQrby7yyLBJw76RS8QFxODY0RCXgRZM'

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

function norm(s) {
  return (s || '').toLowerCase().trim().replace(/\s+/g, ' ')
}

function normAddr(s) {
  return (s || '').toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim()
}

// Fetch all pages
async function fetchAll(table, select = '*') {
  let all = [], from = 0
  while (true) {
    const { data, error } = await supabase.from(table).select(select).range(from, from + 999)
    if (error) throw error
    all = all.concat(data ?? [])
    if (!data || data.length < 1000) break
    from += 1000
  }
  return all
}

async function main() {
  console.log('🔗 Fetching unlinked deals...')
  const allDeals = await fetchAll('deals', 'id,title,service_address,lead_id')
  const unlinked = allDeals.filter(d => !d.lead_id)
  console.log(`   ${unlinked.length} unlinked deals, ${allDeals.length - unlinked.length} already linked`)

  console.log('👤 Fetching all leads...')
  const leads = await fetchAll('leads', 'id,name,service_address,phone')

  // Build lookup maps
  // name → lead
  const byName = new Map()
  for (const l of leads) {
    const key = norm(l.name)
    if (key) byName.set(key, l)
  }

  // normalized address → lead
  const byAddr = new Map()
  for (const l of leads) {
    const key = normAddr(l.service_address)
    if (key && key.length > 5) byAddr.set(key, l)
  }

  let linked = 0, stillMissing = 0
  const updates = []

  for (const deal of unlinked) {
    let matchedLead = null
    let method = ''

    const dealTitle = norm(deal.title)
    const dealAddr  = normAddr(deal.service_address)

    // Strategy A: deal title exactly matches lead name
    if (byName.has(dealTitle)) {
      matchedLead = byName.get(dealTitle)
      method = 'exact name'
    }

    // Strategy B: deal title contains "FirstName LastName – address" pattern
    // extract the name part before " – " or " - "
    if (!matchedLead) {
      const dashIdx = deal.title ? deal.title.search(/ [–-] /) : -1
      if (dashIdx > 0) {
        const namePart = norm(deal.title.substring(0, dashIdx))
        if (byName.has(namePart)) {
          matchedLead = byName.get(namePart)
          method = 'name from title'
        }
      }
    }

    // Strategy C: match by service address
    if (!matchedLead && dealAddr && dealAddr.length > 8) {
      if (byAddr.has(dealAddr)) {
        matchedLead = byAddr.get(dealAddr)
        method = 'address'
      }
    }

    // Strategy D: partial address match (deal address contains lead address or vice versa)
    if (!matchedLead && dealAddr && dealAddr.length > 8) {
      for (const [addr, lead] of byAddr) {
        if (addr.length > 8 && (dealAddr.includes(addr) || addr.includes(dealAddr))) {
          matchedLead = lead
          method = 'partial address'
          break
        }
      }
    }

    if (matchedLead) {
      updates.push({ id: deal.id, lead_id: matchedLead.id, method })
      linked++
    } else {
      stillMissing++
    }
  }

  console.log(`\n✅ Matched: ${linked} | Still unlinked: ${stillMissing}`)

  if (updates.length === 0) {
    console.log('Nothing to update.')
    return
  }

  // Apply updates in batches
  console.log('\n🔄 Updating deals...')
  let updated = 0
  for (const u of updates) {
    const { error } = await supabase
      .from('deals')
      .update({ lead_id: u.lead_id })
      .eq('id', u.id)
    if (error) {
      console.error(`  ✗ deal ${u.id}: ${error.message}`)
    } else {
      updated++
      if (updated % 50 === 0) console.log(`  ... ${updated} updated`)
    }
  }

  console.log(`\n🎉 Done! ${updated} deals re-linked.`)
  console.log(`   ${stillMissing} deals could not be matched (no name/address overlap).`)
}

main().catch(console.error)
