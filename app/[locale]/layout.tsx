import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import ConditionalLayout from '@/components/layout/ConditionalLayout'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
  variable: '--font-inter',
})

interface Props {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'metadata' })

  return {
    title: {
      default: `${t('siteName')} - ${locale === 'vi' ? 'So Sánh Giá Điện Texas' : 'Compare Texas Electricity Plans'}`,
      template: `%s | ${t('siteName')}`,
    },
    description: t('siteDescription'),
    metadataBase: new URL(t('siteUrl')),
    openGraph: {
      siteName: t('siteName'),
      locale: locale === 'vi' ? 'vi_VN' : 'en_US',
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: 'Saigon Power — Compare Texas Electricity Plans',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      images: ['/og-image.png'],
    },
    alternates: {
      languages: { vi: '/vi', en: '/en' },
    },
  }
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params

  if (!routing.locales.includes(locale as 'vi' | 'en')) {
    notFound()
  }

  setRequestLocale(locale)

  const messages = await getMessages()

  return (
    <html lang={locale} suppressHydrationWarning className={inter.variable}>
      <body className={`${inter.className} font-sans`}>
        <NextIntlClientProvider messages={messages}>
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
