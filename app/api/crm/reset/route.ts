import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * POST /api/crm/reset
 * Admin-only: deletes all rows from leads, deals, activities, and contracts.
 */
export async function POST() {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  if (supabaseUrl.includes('placeholder') || !supabaseUrl) {
    return NextResponse.json({ ok: true, mock: true })
  }

  const db = createAdminClient()

  // Delete in dependency order: activities and contracts reference leads/deals
  const tables = ['activities', 'contracts', 'deals', 'leads'] as const
  for (const table of tables) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (db.from(table) as any).delete().neq('id', '00000000-0000-0000-0000-000000000000')
    if (error && !String(error.code).includes('42P01')) {
      return NextResponse.json({ error: `Failed to reset ${table}: ${error.message}` }, { status: 500 })
    }
  }

  return NextResponse.json({ ok: true })
}
