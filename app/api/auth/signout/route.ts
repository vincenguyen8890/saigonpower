import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  await supabase.auth.signOut()

  const locale = request.headers.get('x-locale') || 'vi'
  return NextResponse.redirect(new URL(`/${locale}/auth/login`, request.url))
}
