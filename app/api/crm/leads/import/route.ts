import { NextRequest, NextResponse } from 'next/server'
import { insertLead } from '@/lib/supabase/queries'
import { createClient } from '@/lib/supabase/server'

async function getExistingKeys(): Promise<{ emails: Set<string>; phones: Set<string> }> {
  try {
    const supabase = await createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase.from('leads') as any)
      .select('email, phone')
      .not('email', 'is', null)
    const emails = new Set<string>()
    const phones = new Set<string>()
    for (const row of data ?? []) {
      if (row.email) emails.add(row.email.trim().toLowerCase())
      if (row.phone) phones.add(row.phone.trim().replace(/\D/g, ''))
    }
    return { emails, phones }
  } catch {
    return { emails: new Set(), phones: new Set() }
  }
}

interface CSVRow {
  name?: string
  email?: string
  phone?: string
  zip?: string
  service_type?: string
  preferred_language?: string
  source?: string
  notes?: string
  [key: string]: string | undefined
}

export async function POST(req: NextRequest) {
  try {
    const { rows } = await req.json() as { rows: CSVRow[] }

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: 'No rows provided' }, { status: 400 })
    }

    // Load existing emails + phones upfront to detect duplicates without per-row queries
    const { emails: existingEmails, phones: existingPhones } = await getExistingKeys()

    let imported   = 0
    let failed     = 0
    let duplicates = 0
    const errors: string[] = []
    const skipped: string[] = []

    for (let i = 0; i < rows.length; i++) {
      const row    = rows[i]
      const rowNum = i + 2

      if (!row.name?.trim()) {
        failed++
        errors.push(`Row ${rowNum}: missing required field "name"`)
        continue
      }
      if (!row.zip?.trim()) {
        failed++
        errors.push(`Row ${rowNum}: missing required field "zip"`)
        continue
      }

      // Deduplication: skip if email or phone already exists
      const emailKey = row.email?.trim().toLowerCase()
      const phoneKey = row.phone?.trim().replace(/\D/g, '')

      if (emailKey && existingEmails.has(emailKey)) {
        duplicates++
        skipped.push(`Row ${rowNum}: "${row.name}" — email ${row.email} already exists`)
        continue
      }
      if (phoneKey && phoneKey.length >= 7 && existingPhones.has(phoneKey)) {
        duplicates++
        skipped.push(`Row ${rowNum}: "${row.name}" — phone ${row.phone} already exists`)
        continue
      }

      const serviceType   = row.service_type?.trim().toLowerCase()
      const validService  = serviceType === 'commercial' ? 'commercial' : 'residential'
      const language      = row.preferred_language?.trim().toLowerCase()
      const validLanguage = language === 'en' ? 'en' : 'vi'

      try {
        const result = await insertLead({
          customer_id:        null,
          name:               row.name.trim(),
          email:              row.email?.trim()  ?? '',
          phone:              row.phone?.trim()  ?? '',
          zip:                row.zip.trim(),
          service_type:       validService  as 'residential' | 'commercial',
          preferred_language: validLanguage as 'vi' | 'en',
          status:             'new',
          source:             row.source?.trim() || 'import',
          referral_by:        null,
          service_address:    null,
          mailing_address:    null,
          dob:                null,
          anxh:               null,
          email2:             null,
          phone2:             null,
          tags:               null,
          account_status:     null,
          notes:              row.notes?.trim() || null,
          assigned_to:        null,
        })

        if (result) {
          imported++
          // Track newly imported keys so later rows in the same batch can't duplicate them either
          if (emailKey) existingEmails.add(emailKey)
          if (phoneKey && phoneKey.length >= 7) existingPhones.add(phoneKey)
        } else {
          failed++
          errors.push(`Row ${rowNum}: insert failed for "${row.name}"`)
        }
      } catch (err) {
        failed++
        errors.push(`Row ${rowNum}: ${err instanceof Error ? err.message : 'unknown error'}`)
      }
    }

    return NextResponse.json({ imported, failed, duplicates, errors, skipped })
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}
