/**
 * Smarter fuzzy re-linking for remaining unlinked deals.
 * Uses first+last name fragment matching.
 */
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  'https://wtlftywoavdzoshvkzdw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0bGZ0eXdvYXZkem9zaHZremR3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTM5MTY5MiwiZXhwIjoyMDkwOTY3NjkyfQ.kiSgEymbc_1mDQrby7yyLBJw76RS8QFxODY0RCXgRZM'
)

const norm = s => (s || '').toLowerCase().trim().replace(/\s+/g, ' ')

// Extract personal name from deal title like:
// "Frank Le (#4B)" → "frank le"
// "Hong Le (11210 Hazen St)" → "hong le"
// "Trung Hieu Tran M2M" → "trung hieu tran"
function extractName(title) {
  if (!title) return ''
  // Remove content in parens, suffixes like M2M, MTM, #number
  let t = title.replace(/\s*\([^)]*\)/g, '').replace(/\bM2M\b|\bMTM\b/gi, '').trim()
  return norm(t)
}

async function fetchAll(table, select) {
  let all = [], from = 0
  while (true) {
    const { data } = await sb.from(table).select(select).range(from, from + 999)
    all = all.concat(data ?? [])
    if (!data || data.length < 1000) break
    from += 1000
  }
  return all
}

async function main() {
  const allDeals = await fetchAll('deals', 'id,title,service_address,lead_id')
  const unlinked = allDeals.filter(d => !d.lead_id)
  console.log(`🔗 ${unlinked.length} unlinked deals`)

  const leads = await fetchAll('leads', 'id,name,service_address')

  // Build multi-key lookup
  const byFullName = new Map()
  const byLastFirst = new Map() // "last first" → lead
  const byLastName = new Map()  // last name → [leads]

  for (const l of leads) {
    const n = norm(l.name)
    byFullName.set(n, l)

    const parts = n.split(' ')
    if (parts.length >= 2) {
      const last = parts[parts.length - 1]
      const first = parts[0]
      byLastFirst.set(`${last} ${first}`, l)

      if (!byLastName.has(last)) byLastName.set(last, [])
      byLastName.get(last).push({ lead: l, first })
    }
  }

  let linked = 0, ambiguous = 0, stillMissing = 0
  const updates = []

  for (const deal of unlinked) {
    const extracted = extractName(deal.title)
    let matchedLead = null, method = ''

    // Try extracted full name
    if (byFullName.has(extracted)) {
      matchedLead = byFullName.get(extracted)
      method = 'extracted full name'
    }

    // Try "last first" reversed
    if (!matchedLead) {
      const parts = extracted.split(' ')
      if (parts.length >= 2) {
        const reversed = `${parts[parts.length-1]} ${parts.slice(0,-1).join(' ')}`
        if (byFullName.has(reversed)) {
          matchedLead = byFullName.get(reversed)
          method = 'reversed name'
        }
      }
    }

    // Try last name + first initial match
    if (!matchedLead) {
      const parts = extracted.split(' ').filter(Boolean)
      if (parts.length >= 2) {
        const firstName = parts[0]
        const lastName = parts[parts.length - 1]
        const candidates = byLastName.get(lastName) ?? []
        // Filter by first name starts with same letter
        const matches = candidates.filter(c => c.first.startsWith(firstName[0]))
        if (matches.length === 1) {
          matchedLead = matches[0].lead
          method = 'last name + first initial'
        } else if (matches.length > 1) {
          ambiguous++
        }
      }
    }

    if (matchedLead) {
      updates.push({ id: deal.id, lead_id: matchedLead.id, title: deal.title, method })
      linked++
    } else {
      stillMissing++
    }
  }

  console.log(`✅ Matched: ${linked} | Ambiguous: ${ambiguous} | Still missing: ${stillMissing}`)

  if (updates.length === 0) { console.log('Nothing to update.'); return }

  console.log('\n🔄 Updating...')
  let done = 0
  for (const u of updates) {
    const { error } = await sb.from('deals').update({ lead_id: u.lead_id }).eq('id', u.id)
    if (!error) done++
  }
  console.log(`🎉 ${done} deals re-linked via fuzzy match`)
}

main().catch(console.error)
