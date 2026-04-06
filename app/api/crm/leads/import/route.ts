import { NextRequest, NextResponse } from 'next/server'
import { insertLead } from '@/lib/supabase/queries'

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

    let imported = 0
    let failed   = 0
    const errors: string[] = []

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      const rowNum = i + 2 // +2 because row 1 is headers

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

      const serviceType = row.service_type?.trim().toLowerCase()
      const validServiceType = serviceType === 'commercial' ? 'commercial' : 'residential'

      const language = row.preferred_language?.trim().toLowerCase()
      const validLanguage = language === 'en' ? 'en' : 'vi'

      try {
        const result = await insertLead({
          customer_id:        null,
          name:               row.name.trim(),
          email:              row.email?.trim()  ?? '',
          phone:              row.phone?.trim()  ?? '',
          zip:                row.zip.trim(),
          service_type:       validServiceType as 'residential' | 'commercial',
          preferred_language: validLanguage    as 'vi' | 'en',
          status:             'new',
          source:             row.source?.trim()  || 'import',
          referral_by:        null,
          service_address:    null,
          mailing_address:    null,
          dob:                null,
          anxh:               null,
          notes:              row.notes?.trim()   || null,
          assigned_to:        null,
        })

        if (result) imported++
        else {
          failed++
          errors.push(`Row ${rowNum}: insert failed for "${row.name}"`)
        }
      } catch (err) {
        failed++
        errors.push(`Row ${rowNum}: ${err instanceof Error ? err.message : 'unknown error'}`)
      }
    }

    return NextResponse.json({ imported, failed, errors })
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}
