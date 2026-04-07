/**
 * Backfill account_status, dob, email2, phone2, tags for imported leads
 * and flags for imported deals.
 *
 * Matches by phone number (most reliable unique key from HubSpot).
 *
 * Run: node scripts/backfill-new-columns.mjs
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const SUPABASE_URL     = 'https://wtlftywoavdzoshvkzdw.supabase.co'
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0bGZ0eXdvYXZkem9zaHZremR3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTM5MTY5MiwiZXhwIjoyMDkwOTY3NjkyfQ.kiSgEymbc_1mDQrby7yyLBJw76RS8QFxODY0RCXgRZM'

const CONTACTS_CSV = '/Users/vincenguyen/Downloads/hubspot-crm-exports-all-contacts-2026-04-05.csv'
const DEALS_CSV    = '/Users/vincenguyen/Downloads/hubspot-crm-exports-all-deals-2026-04-05.csv'

const sb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

function parseCSV(text) {
  const lines = text.trim().split('\n')
  const headers = parseLine(lines[0])
  return lines.slice(1).filter(l => l.trim()).map(line => {
    const vals = parseLine(line)
    return Object.fromEntries(headers.map((h, i) => [h.trim().replace(/^"|"$/g, ''), (vals[i] ?? '').trim()]))
  })
}

function parseLine(line) {
  const result = []; let cur = '', inQ = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') { inQ = !inQ }
    else if (ch === ',' && !inQ) { result.push(cur); cur = '' }
    else { cur += ch }
  }
  result.push(cur)
  return result
}

function cleanPhone(raw) {
  if (!raw) return ''
  const digits = raw.replace(/\D/g, '')
  if (digits.length === 11 && digits.startsWith('1')) return digits.slice(1)
  return digits.slice(-10)
}

function parseDOB(raw) {
  if (!raw) return null
  const m = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (!m) return null
  return `${m[3]}-${m[1].padStart(2,'0')}-${m[2].padStart(2,'0')}`
}

function mapAccountStatus(status) {
  if ((status || '').toLowerCase() === 'active') return 'active'
  return null
}

async function main() {
  console.log('📂 Reading CSV files...')
  const contacts = parseCSV(readFileSync(CONTACTS_CSV, 'utf-8'))
  const deals    = parseCSV(readFileSync(DEALS_CSV, 'utf-8'))

  // ── Backfill leads: match by phone ────────────────────────────────────────
  console.log('\n🔄 Backfilling leads (account_status, dob)...')
  let ok = 0, miss = 0

  for (const c of contacts) {
    const phone = cleanPhone(c['Phone Number'])
    if (!phone) { miss++; continue }

    const updates = {
      account_status: mapAccountStatus(c['Status']),
      dob:            parseDOB(c['DOB']),
    }

    const { error } = await sb
      .from('leads')
      .update(updates)
      .eq('phone', phone)

    if (error) { console.error(`✗ ${c['First Name']} ${c['Last Name']}: ${error.message}`); miss++ }
    else ok++

    if (ok % 200 === 0) console.log(`  ... ${ok} updated`)
  }
  console.log(`✅ Leads backfilled: ${ok} updated, ${miss} missed`)

  // ── Backfill deals: flags from CUSTOM FLAG column ─────────────────────────
  console.log('\n🔄 Backfilling deals (flags)...')
  let dOk = 0, dSkip = 0

  for (const d of deals) {
    const flag = (d['CUSTOM FLAG'] || '').trim()
    if (!flag) { dSkip++; continue }

    const { error } = await sb
      .from('deals')
      .update({ flags: [flag] })
      .eq('title', (d['Deal Name'] || '').trim())
      .eq('esid', (d['ESI ID'] || '').trim())

    if (error) { console.error(`✗ deal "${d['Deal Name']}": ${error.message}`) }
    else dOk++
  }
  console.log(`✅ Deals backfilled: ${dOk} with flags, ${dSkip} had no flag`)
  console.log('\n🎉 Backfill complete!')
}

main().catch(err => { console.error('Fatal:', err); process.exit(1) })
