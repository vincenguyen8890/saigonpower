import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { insertActivity } from '@/lib/supabase/queries'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return new Response('Unauthorized', { status: 401 })

  const body = await req.json()

  const activity = await insertActivity({
    lead_id: body.lead_id ?? null,
    type: body.type ?? 'note',
    title: body.title,
    description: body.description ?? null,
    due_date: body.due_date ?? null,
    completed: false,
    assigned_to: session.email,
    created_by: session.email,
  })

  if (!activity) return NextResponse.json({ error: 'Failed to create activity' }, { status: 500 })
  return NextResponse.json(activity)
}
