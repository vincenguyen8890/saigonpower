import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['vi', 'en'],
  defaultLocale: 'vi',
  // Localized pathnames removed — uniform paths across both locales
  // avoids Edge runtime resolution failures on Vercel
})
