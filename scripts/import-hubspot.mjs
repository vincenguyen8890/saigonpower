/**
 * HubSpot → Saigon Power CRM migration
 * Imports contacts as leads, then deals linked to those leads.
 *
 * Run: node scripts/import-hubspot.mjs
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const SUPABASE_URL      = 'https://wtlftywoavdzoshvkzdw.supabase.co'
const SERVICE_ROLE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0bGZ0eXdvYXZkem9zaHZremR3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTM5MTY5MiwiZXhwIjoyMDkwOTY3NjkyfQ.kiSgEymbc_1mDQrby7yyLBJw76RS8QFxODY0RCXgRZM'

const CONTACTS_CSV = '/Users/vincenguyen/Downloads/hubspot-crm-exports-all-contacts-2026-04-05.csv'
const DEALS_CSV    = '/Users/vincenguyen/Downloads/hubspot-crm-exports-all-deals-2026-04-05.csv'

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

// ── CSV parser (handles quoted fields with embedded commas) ────────────────
function parseCSV(text) {
  const lines = text.trim().split('\n')
  const headers = parseLine(lines[0])
  return lines.slice(1).filter(l => l.trim()).map(line => {
    const vals = parseLine(line)
    return Object.fromEntries(headers.map((h, i) => [h.trim().replace(/^"|"$/g, ''), (vals[i] ?? '').trim()]))
  })
}

function parseLine(line) {
  const result = []
  let cur = '', inQ = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') { inQ = !inQ }
    else if (ch === ',' && !inQ) { result.push(cur); cur = '' }
    else { cur += ch }
  }
  result.push(cur)
  return result
}

// ── Helpers ────────────────────────────────────────────────────────────────
function cleanPhone(raw) {
  if (!raw) return ''
  // Strip +1 country code and non-digits
  const digits = raw.replace(/\D/g, '')
  if (digits.length === 11 && digits.startsWith('1')) return digits.slice(1)
  return digits.slice(-10)
}

function parseDOB(raw) {
  if (!raw) return null
  // MM/DD/YYYY → YYYY-MM-DD
  const m = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (!m) return null
  return `${m[3]}-${m[1].padStart(2,'0')}-${m[2].padStart(2,'0')}`
}

function extractZip(address) {
  if (!address) return ''
  const m = address.match(/\b(\d{5})(?:-\d{4})?\b/)
  return m ? m[1] : ''
}

function normalizeRate(raw) {
  const n = parseFloat(raw)
  if (isNaN(n) || n === 0) return null
  // If > 1, assume cents/kWh — convert to $/kWh
  return n > 1 ? parseFloat((n / 100).toFixed(6)) : n
}

function normalizeName(name) {
  return name.trim().toLowerCase().replace(/\s+/g, ' ')
}

function mapDealType(dealType) {
  const t = (dealType || '').toLowerCase()
  const serviceOrder = t.includes('renewal') ? 'Renewal' : 'Switch'
  const serviceType  = t.includes('comm') ? 'commercial' : 'residential'
  return { serviceOrder, serviceType }
}

function mapAccountStatus(status) {
  if (!status) return null
  if (status.toLowerCase() === 'active') return 'active'
  return null
}

function mapSource(source) {
  if (!source) return 'manual'
  const s = source.toLowerCase()
  if (s.includes('salesperson')) return 'referral'
  if (s.includes('web')) return 'website'
  if (s.includes('phone')) return 'phone'
  return 'manual'
}

function generateCustomerId(seq, date) {
  const d  = date ? new Date(date) : new Date()
  const mm   = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = String(d.getFullYear())
  return `SGP-${mm}${yyyy}${String(seq).padStart(4, '0')}`
}

// ── Main ────────────────────────────────────────────────────────────────────
async function main() {
  console.log('📂 Reading CSV files...')
  const contacts = parseCSV(readFileSync(CONTACTS_CSV, 'utf-8'))
  const deals    = parseCSV(readFileSync(DEALS_CSV, 'utf-8'))
  console.log(`   Contacts: ${contacts.length} | Deals: ${deals.length}`)

  // Build name → deal(s) map for zip lookup + deal linkage
  const dealsByName = new Map()
  for (const deal of deals) {
    const key = normalizeName(deal['Deal Name'] || '')
    if (!dealsByName.has(key)) dealsByName.set(key, [])
    dealsByName.get(key).push(deal)
  }

  // ── Step 1: Import contacts as leads ──────────────────────────────────────
  console.log('\n👤 Importing contacts...')
  let contactOK = 0, contactFail = 0
  const leadIdByName = new Map() // normalized name → lead UUID

  // Get current count for customer ID generation
  const { count: existingCount } = await supabase
    .from('leads').select('*', { count: 'exact', head: true })
  let seq = (existingCount ?? 0) + 1

  for (const c of contacts) {
    const firstName = (c['First Name'] || '').trim()
    const lastName  = (c['Last Name']  || '').trim()
    const fullName  = `${firstName} ${lastName}`.trim()
    if (!fullName) { contactFail++; continue }

    const normName = normalizeName(fullName)

    // Get zip from first associated deal
    const dealsForContact = dealsByName.get(normName) || []
    const zip = extractZip(dealsForContact[0]?.['SERVICE ADDRESS'] || '') || '00000'

    const phone = cleanPhone(c['Phone Number'])
    const customerId = generateCustomerId(seq++, c['Create Date'])

    const payload = {
      customer_id:        customerId,
      name:               fullName,
      email:              c['Email'] || '',
      phone,
      zip,
      service_type:       'residential',
      preferred_language: 'vi',
      status:             'enrolled',
      source:             mapSource(c['SOURCE']),
      referral_by:        null,
      service_address:    dealsForContact[0]?.['SERVICE ADDRESS']?.trim() || null,
      mailing_address:    null,
      dob:                parseDOB(c['DOB']),
      anxh:               null,
      notes:              null,
      assigned_to:        c['Contact owner'] || null,
    }

    const { data, error } = await supabase
      .from('leads').insert(payload).select('id').single()

    if (error) {
      console.error(`  ✗ ${fullName}: ${error.message}`)
      contactFail++
    } else {
      leadIdByName.set(normName, data.id)
      contactOK++
      if (contactOK % 100 === 0) console.log(`  ... ${contactOK} contacts imported`)
    }
  }

  console.log(`✅ Contacts: ${contactOK} imported, ${contactFail} failed`)

  // ── Step 2: Import deals ──────────────────────────────────────────────────
  console.log('\n💼 Importing deals...')
  let dealOK = 0, dealFail = 0, dealNoContact = 0

  for (const d of deals) {
    const dealName   = (d['Deal Name'] || '').trim()
    const normName   = normalizeName(dealName)
    const leadId     = leadIdByName.get(normName) || null

    if (!leadId) dealNoContact++

    const { serviceOrder, serviceType } = mapDealType(d['DEAL TYPE'])
    const termRaw  = parseFloat(d['Contract Term'] || '0')
    const termMonths = isNaN(termRaw) || termRaw === 0 ? null : Math.round(termRaw)
    const rateKwh    = normalizeRate(d['Contract Rate'])
    const adderKwh   = normalizeRate(d['BASE CHARGE'])
    const usageKwh   = parseFloat(d['EST MONTHLY USAGE']) || null

    const zip = extractZip(d['SERVICE ADDRESS'] || '')
    const serviceAddress = (d['SERVICE ADDRESS'] || '').trim() || null
    const esid = (d['ESI ID'] || '').trim() || null

    // Contract end date: some have it, some don't
    const endDate = (d['Contract End Date'] || '').trim() || null

    const payload = {
      // core columns (exist in DB)
      lead_id:             leadId,
      title:               dealName,
      value:               serviceType === 'commercial' ? 200 : 75,
      stage:               'won',
      probability:         100,
      expected_close:      (d['Contract Start Date'] || '').trim() || null,
      provider:            (d['Supplier'] || '').trim() || null,
      plan_name:           null,
      service_type:        serviceType,
      notes:               null,
      assigned_to:         (d['Sales Agent'] || '').trim() || null,
      agent_code:          (d['Agent Code'] || '').trim() || null,
      service_order:       serviceOrder,
      service_address:     serviceAddress,
      esid,
      contract_start_date: (d['Contract Start Date'] || '').trim() || null,
      contract_end_date:   endDate,
      rate_kwh:            rateKwh,
      adder_kwh:           adderKwh,
      term_months:         termMonths,
      product_type:        'FIXED RATE',
      usage_kwh:           usageKwh,
    }

    const { error } = await supabase.from('deals').insert(payload)

    if (error) {
      console.error(`  ✗ Deal "${dealName}": ${error.message}`)
      dealFail++
    } else {
      dealOK++
      if (dealOK % 100 === 0) console.log(`  ... ${dealOK} deals imported`)
    }
  }

  console.log(`✅ Deals: ${dealOK} imported, ${dealFail} failed, ${dealNoContact} without matching contact`)
  console.log('\n🎉 Import complete!')
}

main().catch(err => { console.error('Fatal:', err); process.exit(1) })
