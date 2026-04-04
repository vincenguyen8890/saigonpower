import { NextRequest, NextResponse } from 'next/server'

const locales = ['vi', 'en']
const defaultLocale = 'vi'

function getLocale(request: NextRequest): string {
  // Check cookie first
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value
  if (cookieLocale && locales.includes(cookieLocale)) return cookieLocale

  // Check Accept-Language header
  const acceptLanguage = request.headers.get('accept-language') || ''
  if (acceptLanguage.includes('vi')) return 'vi'

  return defaultLocale
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if pathname already has a locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  if (pathnameHasLocale) {
    // Extract locale from path and set header for next-intl
    const locale = pathname.split('/')[1]
    const response = NextResponse.next()
    response.headers.set('x-next-intl-locale', locale)
    return response
  }

  // Redirect to locale-prefixed path
  const locale = getLocale(request)
  const newUrl = new URL(`/${locale}${pathname === '/' ? '' : pathname}`, request.url)
  newUrl.search = request.nextUrl.search
  return NextResponse.redirect(newUrl)
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}
