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
  let all: any[] = []
  let from = 0
  while (true) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from('leads') as any)
      .select('*')
      .order('created_at', { ascending: false })
      .range(from, from + PAGE - 1)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    all = all.concat(data ?? [])
    if (!data || data.length < PAGE) break
    from += PAGE
  }

  const headers = [
    'customer_id', 'name', 'email', 'email2', 'phone', 'phone2',
    'zip', 'service_type', 'status', 'account_status',
    'dob', 'anxh', 'tags', 'source', 'assigned_to',
    'service_address', 'notes', 'created_at',
  ]

  const rows = [
    headers.join(','),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...all.map((r: any) =>
      headers.map(h => {
        const v = r[h]
        return esc(Array.isArray(v) ? v.join('; ') : v)
      }).join(',')
    ),
  ]

  return new NextResponse(rows.join('\r\n'), {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="customers.csv"',
    },
  })
}
