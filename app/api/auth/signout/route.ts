import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { COOKIE_NAME } from '@/lib/auth/session'

export async function POST(request: NextRequest) {
  // Clear Supabase session (if configured)
  try {
    const supabase = await createClient()
    await supabase.auth.signOut()
  } catch {
    // Supabase not configured — ignore
  }

  let locale = 'en'
  try {
    const body = await request.json()
    locale = body.locale ?? 'en'
  } catch {
    // ignore parse errors
  }

  const response = NextResponse.json({ success: true })

  // Clear custom session cookie
  response.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })

  return response
}
