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

  const locale = request.formData
    ? (await request.formData()).get('locale') as string ?? 'vi'
    : 'vi'

  const response = NextResponse.redirect(new URL(`/${locale}/auth/login`, request.url))

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
