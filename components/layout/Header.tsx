'use client'

import { useState, useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { Link, usePathname, useRouter } from '@/i18n/navigation'
import { Menu, X, Phone } from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import Button from '@/components/ui/Button'

export default function Header() {
  const t = useTranslations('nav')
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const toggleLocale = () => {
    const next = locale === 'vi' ? 'en' : 'vi'
    router.replace(pathname, { locale: next })
  }

  const navLinks = [
    { href: '/compare' as const, label: t('compare') },
    { href: '/residential' as const, label: t('residential') },
    { href: '/commercial' as const, label: t('commercial') },
    { href: '/about' as const, label: t('about') },
    { href: '/faq' as const, label: t('faq') },
    { href: '/blog' as const, label: t('blog') },
  ]

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-white/97 backdrop-blur-md shadow-md border-b border-green-100'
          : 'bg-transparent'
      )}
    >
      {/* Top bar */}
      <div className="bg-brand-greenDark text-white text-xs py-1.5 px-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <Phone size={11} className="text-brand-greenBright" />
            (832) 937-9999
          </span>
          <span className="hidden sm:block opacity-60">•</span>
          <span className="hidden sm:block opacity-85">
            {locale === 'vi' ? 'Hỗ trợ T2-T6: 8:00–18:00' : 'Support Mon–Fri: 8AM–6PM'}
          </span>
        </div>
        <button
          onClick={toggleLocale}
          className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 px-3 py-1 rounded-full transition-colors text-xs font-semibold border border-white/20"
        >
          {locale === 'vi' ? '🇺🇸 EN' : '🇻🇳 VI'}
        </button>
      </div>

      {/* Main nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <div className={cn(
              'relative rounded-full overflow-hidden transition-all duration-300',
              scrolled
                ? 'w-10 h-10 ring-2 ring-green-200 shadow-sm'
                : 'w-11 h-11 ring-2 ring-white/40 shadow-lg'
            )}>
              <Image
                src="/sg-power-logo.jpg"
                alt="Saigon Power Logo"
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="leading-tight hidden sm:block">
              <div className={cn(
                'font-bold text-base tracking-tight',
                scrolled ? 'text-brand-greenDark' : 'text-white'
              )}>
                Saigon Power
              </div>
              <div className={cn(
                'text-[10px] font-medium -mt-0.5',
                scrolled ? 'text-brand-green' : 'text-green-300'
              )}>
                giadienre.com
              </div>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150',
                  scrolled
                    ? 'text-gray-700 hover:text-brand-greenDark hover:bg-green-50'
                    : 'text-white/90 hover:text-white hover:bg-white/10'
                )}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="hidden lg:flex items-center gap-2">
            <Link href="/contact">
              <Button
                variant="ghost"
                size="sm"
                className={cn(scrolled
                  ? 'text-gray-700 hover:text-brand-greenDark hover:bg-green-50'
                  : 'text-white hover:bg-white/10'
                )}
              >
                {t('contact')}
              </Button>
            </Link>
            <Link href="/quote">
              <Button
                variant="gold"
                size="sm"
                className="shadow-md"
              >
                {t('getQuote')}
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 rounded-lg"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={t('menu')}
          >
            {mobileOpen ? (
              <X size={22} className={scrolled ? 'text-gray-700' : 'text-white'} />
            ) : (
              <Menu size={22} className={scrolled ? 'text-gray-700' : 'text-white'} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-green-100 shadow-lg">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="block px-3 py-3 text-sm font-medium text-gray-700 hover:text-brand-greenDark hover:bg-green-50 rounded-lg transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {label}
              </Link>
            ))}
            <div className="pt-3 pb-1 flex gap-2">
              <Link href="/quote" className="flex-1" onClick={() => setMobileOpen(false)}>
                <Button variant="gold" size="md" fullWidth>{t('getQuote')}</Button>
              </Link>
              <Button variant="outline" size="md" onClick={toggleLocale}
                className="border-brand-green text-brand-greenDark hover:bg-green-50"
              >
                {t('toggleLang')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
