import { NextResponse } from 'next/server'
import { insertLead } from '@/lib/supabase/queries'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const lead = await insertLead({
      customer_id:        null,
      name:               body.name,
      email:              body.email             ?? '',
      phone:              body.phone             ?? '',
      zip:                body.zip               ?? '',
      service_type:       body.serviceType       ?? 'residential',
      preferred_language: body.preferredLanguage ?? 'vi',
      status:             'new',
      source:             body.source            ?? 'manual',
      referral_by:        body.referral_by       ?? null,
      service_address:    body.service_address   ?? null,
      mailing_address:    body.mailing_address   ?? null,
      dob:                body.dob               ?? null,
      anxh:               body.anxh              ?? null,
      notes:              body.notes             ?? null,
      assigned_to:        body.assigned_to       ?? null,
    })
    if (!lead) return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 })
    return NextResponse.json(lead, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
