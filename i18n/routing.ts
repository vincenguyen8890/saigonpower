import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['vi', 'en'],
  defaultLocale: 'vi',
  pathnames: {
    '/': '/',
    '/compare': {
      vi: '/so-sanh',
      en: '/compare',
    },
    '/residential': {
      vi: '/dien-dan-cu',
      en: '/residential',
    },
    '/commercial': {
      vi: '/dien-thuong-mai',
      en: '/commercial',
    },
    '/about': {
      vi: '/ve-chung-toi',
      en: '/about',
    },
    '/faq': '/faq',
    '/blog': '/blog',
    '/contact': {
      vi: '/lien-he',
      en: '/contact',
    },
    '/quote': {
      vi: '/bao-gia',
      en: '/quote',
    },
    '/thank-you': {
      vi: '/cam-on',
      en: '/thank-you',
    },
    '/dashboard': {
      vi: '/bang-dieu-khien',
      en: '/dashboard',
    },
    '/dashboard/contract': {
      vi: '/bang-dieu-khien/hop-dong',
      en: '/dashboard/contract',
    },
    '/dashboard/renewal': {
      vi: '/bang-dieu-khien/gia-han',
      en: '/dashboard/renewal',
    },
    '/dashboard/profile': {
      vi: '/bang-dieu-khien/ho-so',
      en: '/dashboard/profile',
    },
  },
})
