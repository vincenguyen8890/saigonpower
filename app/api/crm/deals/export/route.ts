import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

function esc(v: unknown): string {
  const s = v == null ? '' : String(v)
  if (s.includes(',') || s.includes('"') || s.includes('\n')) return `"${s.replace(/"/g, '""')}"`
  return s
}

export async function GET() {
  const supabase = createAdminClient()
  const PAGE = 1000
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let deals: any[] = []
  let from = 0
  while (true) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from('deals') as any)
      .select('*')
      .order('updated_at', { ascending: false })
      .range(from, from + PAGE - 1)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    deals = deals.concat(data ?? [])
    if (!data || data.length < PAGE) break
    from += PAGE
  }

  // Build lead name map
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let leads: any[] = []
  from = 0
  while (true) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase.from('leads') as any)
      .select('id,name,customer_id')
      .range(from, from + PAGE - 1)
    leads = leads.concat(data ?? [])
    if (!data || data.length < PAGE) break
    from += PAGE
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const leadMap: Record<string, any> = Object.fromEntries(leads.map(l => [l.id, l]))

  const headers = [
    'title', 'contact_name', 'customer_id', 'stage', 'value',
    'provider', 'plan_name', 'service_type', 'service_order', 'product_type',
    'rate_kwh', 'adder_kwh', 'term_months', 'usage_kwh',
    'contract_start_date', 'contract_end_date', 'expected_close',
    'esid', 'service_address', 'flags', 'assigned_to', 'notes', 'created_at',
  ]

  const rows = [
    headers.join(','),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...deals.map((d: any) => {
      const lead = d.lead_id ? leadMap[d.lead_id] : null
      const row: Record<string, unknown> = {
        ...d,
        contact_name: lead?.name ?? '',
        customer_id: lead?.customer_id ?? '',
        flags: Array.isArray(d.flags) ? d.flags.join('; ') : '',
      }
      return headers.map(h => esc(row[h])).join(',')
    }),
  ]

  return new NextResponse(rows.join('\r\n'), {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="deals.csv"',
    },
  })
}
