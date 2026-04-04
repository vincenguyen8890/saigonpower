import { getRequestConfig } from 'next-intl/server'
import type { AbstractIntlMessages } from 'next-intl'
import { routing } from './routing'

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale
  if (!locale || !routing.locales.includes(locale as 'vi' | 'en')) {
    locale = routing.defaultLocale
  }

  // Static imports required — dynamic template literals fail on Vercel Edge
  const messages: AbstractIntlMessages =
    locale === 'vi'
      ? (await import('../messages/vi.json')).default as unknown as AbstractIntlMessages
      : (await import('../messages/en.json')).default as unknown as AbstractIntlMessages

  return { locale, messages }
})
