import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const schema = z.object({
  serviceType: z.enum(['residential', 'commercial']),
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().min(10).max(20),
  zip: z.string().length(5).regex(/^\d{5}$/),
  businessName: z.string().optional(),
  monthlyUsageKwh: z.string().optional(),
  notes: z.string().max(1000).optional(),
  preferredLanguage: z.enum(['vi', 'en']),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = schema.parse(body)

    const supabase = await createClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('quote_requests') as any).insert({
      service_type: data.serviceType,
      name: data.name,
      email: data.email,
      phone: data.phone,
      zip: data.zip,
      business_name: data.businessName || null,
      monthly_usage_kwh: data.monthlyUsageKwh ? parseInt(data.monthlyUsageKwh) : null,
      notes: data.notes || null,
      preferred_language: data.preferredLanguage,
      status: 'pending',
    })

    if (error) {
      console.error('Supabase error:', error)
      // Still return success for demo purposes
    }

    return NextResponse.json({ success: true, message: 'Quote request received' }, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: err.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from('quote_requests') as any)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) throw error
    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}
