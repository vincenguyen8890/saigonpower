import { getRequestConfig } from 'next-intl/server'
import type { AbstractIntlMessages } from 'next-intl'
import { headers } from 'next/headers'

const locales = ['vi', 'en'] as const
type Locale = typeof locales[number]
const defaultLocale: Locale = 'vi'

export default getRequestConfig(async ({ requestLocale }) => {
  // Try requestLocale first (set by next-intl plugin via header)
  let locale = await requestLocale

  // Fall back to our custom header
  if (!locale || !locales.includes(locale as Locale)) {
    const headersList = await headers()
    const headerLocale = headersList.get('x-next-intl-locale')
    if (headerLocale && locales.includes(headerLocale as Locale)) {
      locale = headerLocale
    } else {
      locale = defaultLocale
    }
  }

  const messages: AbstractIntlMessages =
    locale === 'vi'
      ? (await import('../messages/vi.json')).default as unknown as AbstractIntlMessages
      : (await import('../messages/en.json')).default as unknown as AbstractIntlMessages

  return { locale, messages }
})
