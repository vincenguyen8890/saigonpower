import { NextRequest, NextResponse } from 'next/server'
import { getDealTemplates, saveDealTemplate, deleteDealTemplate } from '@/lib/supabase/queries'

export async function GET() {
  const templates = await getDealTemplates()
  return NextResponse.json({ templates })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body.name?.trim()) return NextResponse.json({ error: 'name required' }, { status: 400 })
    await saveDealTemplate(body)
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const id = new URL(req.url).searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
  await deleteDealTemplate(id)
  return NextResponse.json({ ok: true })
}
