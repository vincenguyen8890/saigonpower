import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

function esc(v: unknown): string {
  const s = v == null ? '' : String(v)
  if (s.includes(',') || s.includes('"') || s.includes('\n')) return `"${s.replace(/"/g, '""')}"`
  return s
}

async function fetchAll(table: string, select = '*') {
  const supabase = createAdminClient()
  const PAGE = 1000
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let all: any[] = []
  let from = 0
  while (true) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from(table) as any)
      .select(select)
      .order('created_at', { ascending: false })
      .range(from, from + PAGE - 1)
    if (error) throw new Error(error.message)
    all = all.concat(data ?? [])
    if (!data || data.length < PAGE) break
    from += PAGE
  }
  return all
}

export async function GET(req: NextRequest) {
  const type = new URL(req.url).searchParams.get('type') ?? 'leads'

  try {
    if (type === 'deals') {
      const deals = await fetchAll('deals')
      const headers = [
        'id', 'title', 'stage', 'value', 'probability', 'provider',
        'plan_name', 'service_type', 'product_type', 'rate_kwh', 'adder_kwh',
        'usage_kwh', 'term_months', 'esid', 'service_address',
        'contract_start_date', 'contract_end_date',
        'assigned_to', 'expected_close', 'notes', 'created_at',
      ]
      const rows = [
        headers.join(','),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...deals.map((r: any) => headers.map(h => esc(r[h])).join(',')),
      ]
      return new NextResponse(rows.join('\r\n'), {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="deals-export.csv"',
        },
      })
    }

    // Default: leads
    const leads = await fetchAll('leads')
    const headers = [
      'customer_id', 'name', 'email', 'phone', 'zip',
      'service_type', 'status', 'account_status', 'source',
      'assigned_to', 'service_address', 'notes', 'created_at',
    ]
    const rows = [
      headers.join(','),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...leads.map((r: any) => headers.map(h => esc(r[h])).join(',')),
    ]
    return new NextResponse(rows.join('\r\n'), {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="leads-export.csv"',
      },
    })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
