import type { MetadataRoute } from 'next'

const BASE_URL = 'https://giadienre.com'
const locales = ['vi', 'en']

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    { path: '',           priority: 1.0,  changeFrequency: 'weekly'  as const },
    { path: '/plans',     priority: 0.9,  changeFrequency: 'daily'   as const },
    { path: '/quote',     priority: 0.9,  changeFrequency: 'monthly' as const },
    { path: '/contact',   priority: 0.7,  changeFrequency: 'monthly' as const },
    { path: '/faq',       priority: 0.7,  changeFrequency: 'monthly' as const },
    { path: '/about',     priority: 0.6,  changeFrequency: 'monthly' as const },
    { path: '/blog',      priority: 0.6,  changeFrequency: 'weekly'  as const },
    { path: '/resources', priority: 0.5,  changeFrequency: 'monthly' as const },
  ]

  const entries: MetadataRoute.Sitemap = []

  for (const locale of locales) {
    for (const route of routes) {
      entries.push({
        url: `${BASE_URL}/${locale}${route.path}`,
        lastModified: new Date(),
        changeFrequency: route.changeFrequency,
        priority: route.priority,
        alternates: {
          languages: Object.fromEntries(
            locales.map(l => [l, `${BASE_URL}/${l}${route.path}`])
          ),
        },
      })
    }
  }

  return entries
}
