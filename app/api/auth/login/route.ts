import { NextRequest, NextResponse } from 'next/server'
import { createSessionToken, COOKIE_NAME } from '@/lib/auth/session'

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
  }

  let role: 'admin' | 'agent' | null = null

  // Check admin credentials (server-side env vars — never exposed to client)
  const adminEmail    = process.env.ADMIN_EMAIL
  const adminPassword = process.env.ADMIN_PASSWORD
  const agentEmail    = process.env.AGENT_EMAIL
  const agentPassword = process.env.AGENT_PASSWORD

  if (adminEmail && adminPassword &&
      email.trim().toLowerCase() === adminEmail.toLowerCase() &&
      password === adminPassword) {
    role = 'admin'
  } else if (agentEmail && agentPassword &&
             email.trim().toLowerCase() === agentEmail.toLowerCase() &&
             password === agentPassword) {
    role = 'agent'
  }

  if (!role) {
    // Small delay to prevent brute-force timing attacks
    await new Promise(r => setTimeout(r, 400))
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
  }

  const token = await createSessionToken(email.trim(), role)

  const response = NextResponse.json({ success: true, role })
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })

  return response
}
