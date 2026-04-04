// No-op: locale routing handled by root page redirect + [locale] segment
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(_request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  // Only match the exact root path so the Edge Function barely ever runs
  matcher: ['/'],
}
