import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const BUCKET = 'deal-documents'

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()
    const file = form.get('file') as File | null
    const dealId = form.get('dealId') as string | null
    if (!file || !dealId) return NextResponse.json({ error: 'Missing file or dealId' }, { status: 400 })

    const supabase = await createClient()
    const path = `${dealId}/${file.name}`
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: true })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const dealId = searchParams.get('dealId')
    const fileName = searchParams.get('fileName')
    if (!dealId || !fileName) return NextResponse.json({ error: 'Missing params' }, { status: 400 })

    const supabase = await createClient()
    const { error } = await supabase.storage.from(BUCKET).remove([`${dealId}/${fileName}`])
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
