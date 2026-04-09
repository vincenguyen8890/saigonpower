import { NextRequest, NextResponse } from 'next/server'
import { compare } from 'bcryptjs'
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

  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    users.push({ email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD, role: 'admin', name: 'Admin' })
  }
  if (process.env.AGENT_EMAIL && process.env.AGENT_PASSWORD) {
    users.push({ email: process.env.AGENT_EMAIL, password: process.env.AGENT_PASSWORD, role: 'agent', name: 'Sales Agent' })
  }
  if (process.env.OFFICE_MANAGER_EMAIL && process.env.OFFICE_MANAGER_PASSWORD) {
    users.push({ email: process.env.OFFICE_MANAGER_EMAIL, password: process.env.OFFICE_MANAGER_PASSWORD, role: 'office_manager', name: process.env.OFFICE_MANAGER_NAME || 'Office Manager' })
  }
  if (process.env.CSR_EMAIL && process.env.CSR_PASSWORD) {
    users.push({ email: process.env.CSR_EMAIL, password: process.env.CSR_PASSWORD, role: 'csr', name: process.env.CSR_NAME || 'CSR' })
  }
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

// Compares password against either a bcrypt hash or a legacy plaintext value.
// Accepts both so existing deployments keep working without a forced reset.
async function verifyPassword(candidate: string, stored: string): Promise<boolean> {
  // bcrypt hashes always start with $2a$ or $2b$ and are 60 chars
  if (stored.startsWith('$2') && stored.length === 60) {
    return compare(candidate, stored)
  }
  // Legacy plaintext — constant-time compare via subtle (avoids timing attacks)
  const enc = new TextEncoder()
  const a = enc.encode(candidate)
  const b = enc.encode(stored)
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i]
  return diff === 0
}

// Returns the matched user, null if wrong password, or 'not_found' if email not in DB.
async function checkAgentPassword(email: string, password: string): Promise<UserEntry | null | 'not_found'> {
  try {
    const { createAdminClient } = await import('@/lib/supabase/admin')
    const db = createAdminClient()
    const { data } = await (db.from('crm_agents') as any)
      .select('id, email, name, role, password, active')
      .eq('email', email.trim().toLowerCase())
      .single()

    if (!data) return 'not_found'
    if (!data.active) return null

    if (data.password) {
      const ok = await verifyPassword(password, data.password)
      if (!ok) return null
      return { email: data.email, password: data.password, role: data.role, name: data.name }
    }

    // No DB password — fall back to env-var users with matching role
    const envUsers = getUsers()
    for (const u of envUsers) {
      if (u.role === data.role && await verifyPassword(password, u.password)) {
        return { email: data.email, password: u.password, role: data.role, name: data.name }
      }
    }
    return null
  } catch {
    return 'not_found'
  }
}

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
  }

  const dbResult = await checkAgentPassword(email, password)
  let match: UserEntry | undefined

  if (dbResult === 'not_found') {
    const users = getUsers()
    for (const u of users) {
      if (u.email.toLowerCase() === email.trim().toLowerCase() && await verifyPassword(password, u.password)) {
        match = u
        break
      }
    }
  } else {
    match = dbResult ?? undefined
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
