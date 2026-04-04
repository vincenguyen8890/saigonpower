import { cookies } from 'next/headers'

export interface SessionData {
  email: string
  role: 'admin' | 'agent'
  exp: number
}

const COOKIE_NAME = 'crm_session'
const SESSION_TTL = 60 * 60 * 24 * 7 // 7 days in seconds

async function getKey(): Promise<CryptoKey> {
  const secret = process.env.SESSION_SECRET || 'dev-secret-change-me-in-production-32ch'
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret.padEnd(32, '0').slice(0, 32)),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  )
}

export async function createSessionToken(email: string, role: 'admin' | 'agent'): Promise<string> {
  const payload: SessionData = {
    email,
    role,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL,
  }
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const key = await getKey()
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payloadB64))
  return `${payloadB64}.${Buffer.from(sig).toString('base64url')}`
}

export async function verifySessionToken(token: string): Promise<SessionData | null> {
  try {
    const dot = token.lastIndexOf('.')
    if (dot === -1) return null
    const payloadB64 = token.slice(0, dot)
    const sigB64 = token.slice(dot + 1)

    const key = await getKey()
    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      Buffer.from(sigB64, 'base64url'),
      new TextEncoder().encode(payloadB64)
    )
    if (!valid) return null

    const data: SessionData = JSON.parse(Buffer.from(payloadB64, 'base64url').toString())
    if (data.exp < Math.floor(Date.now() / 1000)) return null
    return data
  } catch {
    return null
  }
}

export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifySessionToken(token)
}

export { COOKIE_NAME }
