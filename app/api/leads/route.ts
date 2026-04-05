import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { notifyNewLead } from '@/lib/email/notify'
import { z } from 'zod'

const schema = z.object({
  name:              z.string().min(2).max(100),
  email:             z.string().email().optional(),
  phone:             z.string().optional(),
  zip:               z.string().length(5),
  serviceType:       z.enum(['residential', 'commercial']),
  preferredLanguage: z.enum(['vi', 'en']).default('vi'),
  source:            z.string().optional(),
  notes:             z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = schema.parse(body)

    const lead = {
      name:               data.name,
      email:              data.email || null,
      phone:              data.phone || null,
      zip:                data.zip,
      service_type:       data.serviceType,
      preferred_language: data.preferredLanguage,
      status:             'new' as const,
      source:             data.source || 'website',
      notes:              data.notes || null,
      assigned_to:        null,
    }

    // Save to Supabase (skip if placeholder)
    let saved: Record<string, unknown> = { id: `lead-${Date.now()}`, ...lead }
    const isPlaceholder = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')
    if (!isPlaceholder) {
      const supabase = await createClient()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: row, error } = await (supabase.from('leads') as any)
        .insert(lead).select().single()
      if (!error && row) saved = row
    }

    // Fire-and-forget email notification
    notifyNewLead({ ...lead, source: lead.source }).catch(() => {})

    return NextResponse.json({ success: true, data: saved }, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: err.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status      = searchParams.get('status')
    const serviceType = searchParams.get('serviceType')

    const isPlaceholder = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')
    if (isPlaceholder) {
      const { mockLeads } = await import('@/data/mock-crm')
      return NextResponse.json({ data: mockLeads })
    }

    const supabase = await createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase.from('leads') as any)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200)

    if (status)      query = query.eq('status', status)
    if (serviceType) query = query.eq('service_type', serviceType)

    const { data, error } = await query
    if (error) throw error

    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}
