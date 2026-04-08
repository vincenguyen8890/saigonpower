import { NextRequest, NextResponse } from 'next/server'
import { createSessionToken, COOKIE_NAME } from '@/lib/auth/session'
import type { CRMRole } from '@/lib/auth/permissions'

interface UserEntry {
  email: string
  password: string
  role: CRMRole
  name: string
}

function getUsers(): UserEntry[] {
  const users: UserEntry[] = []

  // Legacy env vars (backward compatible)
  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    users.push({ email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD, role: 'admin', name: 'Admin' })
  }
  if (process.env.AGENT_EMAIL && process.env.AGENT_PASSWORD) {
    users.push({ email: process.env.AGENT_EMAIL, password: process.env.AGENT_PASSWORD, role: 'agent', name: 'Sales Agent' })
  }

  // Named role env vars
  if (process.env.OFFICE_MANAGER_EMAIL && process.env.OFFICE_MANAGER_PASSWORD) {
    users.push({ email: process.env.OFFICE_MANAGER_EMAIL, password: process.env.OFFICE_MANAGER_PASSWORD, role: 'office_manager', name: process.env.OFFICE_MANAGER_NAME || 'Office Manager' })
  }
  if (process.env.CSR_EMAIL && process.env.CSR_PASSWORD) {
    users.push({ email: process.env.CSR_EMAIL, password: process.env.CSR_PASSWORD, role: 'csr', name: process.env.CSR_NAME || 'CSR' })
  }

  // JSON array of extra users: CRM_USERS='[{"email":"...","password":"...","role":"agent","name":"..."}]'
  if (process.env.CRM_USERS) {
    try {
      const extra = JSON.parse(process.env.CRM_USERS) as UserEntry[]
      users.push(...extra)
    } catch {
      // Ignore malformed JSON
    }
  }

  return users
}

async function checkAgentPassword(email: string, password: string): Promise<UserEntry | null> {
  try {
    const { createAdminClient } = await import('@/lib/supabase/admin')
    const db = createAdminClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (db.from('crm_agents') as any)
      .select('id, email, name, role, password, active')
      .eq('email', email.trim().toLowerCase())
      .single()
    if (!data || !data.active) return null

    // If DB password is set, validate against it directly
    if (data.password) {
      if (data.password !== password) return null
      return { email: data.email, password: data.password, role: data.role, name: data.name }
    }

    // No DB password — fall back to env-var users with matching role.
    // This handles the case where an admin changed a user's email after the
    // user was originally set up via env vars (so no password row exists yet).
    const envMatch = getUsers().find(u => u.role === data.role && u.password === password)
    if (!envMatch) return null
    return { email: data.email, password: envMatch.password, role: data.role, name: data.name }
  } catch {
    return null
  }
}

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
  }

  // Check env-var users first, then crm_agents.password
  const users = getUsers()
  let match = users.find(
    u => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password
  )
  if (!match) {
    match = await checkAgentPassword(email, password) ?? undefined
  }

  if (!match) {
    await new Promise(r => setTimeout(r, 400)) // Brute-force delay
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
  }

  const token = await createSessionToken(match.email.trim(), match.role, match.name)

  const response = NextResponse.json({ success: true, role: match.role })
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })

  return response
}
