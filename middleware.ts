import createMiddleware from 'next-intl/middleware'
import { NextRequest, NextResponse } from 'next/server'
import { routing } from './i18n/routing'

const intlMiddleware = createMiddleware(routing)

// Simple in-memory rate limiter for the login endpoint
// Keyed by IP → { count, resetAt }
const loginAttempts = new Map<string, { count: number; resetAt: number }>()
const LOGIN_WINDOW_MS = 15 * 60 * 1000 // 15 minutes
const LOGIN_MAX = 10

function clientIP(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  )
}

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = loginAttempts.get(ip)
  if (!entry || now > entry.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + LOGIN_WINDOW_MS })
    return false
  }
  entry.count += 1
  return entry.count > LOGIN_MAX
}

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Let all API routes pass through unchanged — never run intl on them
  if (pathname.startsWith('/api/')) {
    // Rate-limit login specifically
    if (req.method === 'POST' && pathname === '/api/auth/login') {
      if (isRateLimited(clientIP(req))) {
        return NextResponse.json(
          { error: 'Too many login attempts. Try again in 15 minutes.' },
          { status: 429 }
        )
      }
    }
    return NextResponse.next()
  }

  return intlMiddleware(req)
}

export const config = {
  matcher: [
    // Match all routes except Next.js internals and static files
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
}
