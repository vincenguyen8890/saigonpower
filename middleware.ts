import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(_request: NextRequest) {
  return NextResponse.next()
}

// Empty matcher = middleware never runs
export const config = {
  matcher: [],
}
