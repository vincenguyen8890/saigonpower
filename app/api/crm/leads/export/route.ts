import { NextRequest, NextResponse } from 'next/server'
import { getLeads } from '@/lib/supabase/queries'
import { getSession } from '@/lib/auth/session'

export async function GET(req: NextRequest) {
  // Auth check
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const leads = await getLeads({
    status:  searchParams.get('status')  || undefined,
    service: searchParams.get('service') || undefined,
    q:       searchParams.get('q')       || undefined,
  })

  const headers = ['ID', 'Name', 'Email', 'Phone', 'ZIP', 'Service', 'Language', 'Status', 'Source', 'Assigned To', 'Notes', 'Created At']
  const rows = leads.map(l => [
    l.id,
    `"${l.name.replace(/"/g, '""')}"`,
    l.email,
    l.phone,
    l.zip,
    l.service_type,
    l.preferred_language,
    l.status,
    l.source || '',
    l.assigned_to || '',
    `"${(l.notes || '').replace(/"/g, '""')}"`,
    l.created_at,
  ].join(','))

  const csv = [headers.join(','), ...rows].join('\n')
  const filename = `saigon-power-leads-${new Date().toISOString().split('T')[0]}.csv`

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
