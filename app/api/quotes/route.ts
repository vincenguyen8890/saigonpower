import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { notifyNewQuote } from '@/lib/email/notify'
import { z } from 'zod'

const schema = z.object({
  serviceType:       z.enum(['residential', 'commercial']),
  name:              z.string().min(2).max(100),
  email:             z.string().email(),
  phone:             z.string().min(10).max(20),
  zip:               z.string().length(5).regex(/^\d{5}$/),
  businessName:      z.string().optional(),
  monthlyUsageKwh:   z.string().optional(),
  notes:             z.string().max(1000).optional(),
  preferredLanguage: z.enum(['vi', 'en']),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = schema.parse(body)

    const supabase = await createClient()

    // 1 — Insert lead first so we get a real lead_id to link the quote to
    let leadId: string | null = null
    const leadPayload = {
      name:               data.name,
      email:              data.email,
      phone:              data.phone,
      zip:                data.zip,
      service_type:       data.serviceType,
      preferred_language: data.preferredLanguage,
      status:             'new',
      source:             'quote_form',
      notes:              data.notes || null,
      assigned_to:        null,
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: leadRow, error: leadError } = await (supabase.from('leads') as any)
      .insert(leadPayload)
      .select('id')
      .single()

    if (leadError) {
      console.error('[quotes] lead insert error:', leadError.message)
    } else {
      leadId = leadRow?.id ?? null
    }

    // 2 — Insert quote request, linked to the lead
    const quotePayload = {
      lead_id:            leadId,
      service_type:       data.serviceType,
      name:               data.name,
      email:              data.email,
      phone:              data.phone,
      zip:                data.zip,
      business_name:      data.businessName  || null,
      monthly_usage_kwh:  data.monthlyUsageKwh ? parseInt(data.monthlyUsageKwh) : null,
      notes:              data.notes          || null,
      preferred_language: data.preferredLanguage,
      status:             'pending',
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: quoteError } = await (supabase.from('quote_requests') as any).insert(quotePayload)
    if (quoteError) {
      console.error('[quotes] quote insert error:', quoteError.message)
    }

    // 3 — Email notification (fire-and-forget — never block the response)
    notifyNewQuote({
      name:               data.name,
      phone:              data.phone,
      email:              data.email,
      zip:                data.zip,
      service_type:       data.serviceType,
      business_name:      data.businessName  || null,
      monthly_usage_kwh:  data.monthlyUsageKwh ? parseInt(data.monthlyUsageKwh) : null,
      preferred_language: data.preferredLanguage,
      notes:              data.notes         || null,
    }).catch(err => console.error('[quotes] email error:', err))

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: err.errors }, { status: 400 })
    }
    console.error('[quotes] unexpected error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let q = (supabase.from('quote_requests') as any)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200)

    if (status && status !== 'all') q = q.eq('status', status)

    const { data, error } = await q
    if (error) throw error
    return NextResponse.json({ data: data ?? [] })
  } catch (err) {
    console.error('[quotes] GET error:', err)
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}
