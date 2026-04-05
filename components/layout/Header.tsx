'use client'

import { useState, useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { Link, usePathname, useRouter } from '@/i18n/navigation'
import { Menu, X, Phone, Zap } from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

export default function Header() {
  const t = useTranslations('nav')
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const toggleLocale = () => {
    router.replace(pathname, { locale: locale === 'vi' ? 'en' : 'vi' })
  }

  const navLinks = [
    { href: '/compare'     as const, label: t('compare')     },
    { href: '/residential' as const, label: t('residential') },
    { href: '/commercial'  as const, label: t('commercial')  },
    { href: '/about'       as const, label: t('about')       },
    { href: '/faq'         as const, label: t('faq')         },
  ]

  return (
    <header className={cn(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
      scrolled
        ? 'bg-white/98 backdrop-blur-md shadow-sm border-b border-surface-border'
        : 'bg-transparent'
    )}>
      {/* Top utility bar — always visible */}
      <div className="bg-brand-dark text-white text-xs py-1.5 px-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <a href="tel:+18329379999" className="flex items-center gap-1.5 hover:text-brand-green transition-colors">
            <Phone size={11} className="text-brand-green" />
            <span className="font-medium">(832) 937-9999</span>
          </a>
          <span className="hidden sm:block text-white/40">·</span>
          <span className="hidden sm:block text-white/70">
            {locale === 'vi' ? 'Hỗ trợ T2–T6, 8:00–18:00' : 'Mon–Fri, 8AM–6PM support'}
          </span>
        </div>
        <button
          onClick={toggleLocale}
          className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-3 py-0.5 rounded-full transition-colors text-xs font-semibold border border-white/15"
        >
          {locale === 'vi' ? '🇺🇸 EN' : '🇻🇳 VI'}
        </button>
      </div>

      {/* Main nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-brand-green/20 shadow-sm">
              <Image src="/sg-power-logo.jpg" alt="Saigon Power" fill className="object-cover" priority />
            </div>
            <div className="hidden sm:block leading-tight">
              <div className={cn('font-black text-base tracking-tight transition-colors',
                scrolled ? 'text-brand-dark' : 'text-white')}>
                Saigon Power
              </div>
              <div className="text-[10px] font-semibold text-brand-green">giadienre.com</div>
            </div>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map(({ href, label }) => (
              <Link key={href} href={href}
                className={cn(
                  'px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150',
                  scrolled
                    ? 'text-brand-muted hover:text-brand-dark hover:bg-surface-bg'
                    : 'text-white/85 hover:text-white hover:bg-white/10'
                )}>
                {label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="hidden lg:flex items-center gap-2.5">
            <button
              onClick={toggleLocale}
              className={cn(
                'text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all',
                scrolled
                  ? 'border-surface-border text-brand-muted hover:border-brand-green hover:text-brand-green'
                  : 'border-white/25 text-white/80 hover:bg-white/10'
              )}
            >
              {locale === 'vi' ? '🇺🇸 EN' : '🇻🇳 VI'}
            </button>
            <Link href="/compare">
              <span className={cn(
                'text-sm font-semibold px-4 py-2 rounded-xl transition-all',
                scrolled
                  ? 'text-brand-muted hover:text-brand-dark'
                  : 'text-white/80 hover:text-white'
              )}>
                {t('compare')}
              </span>
            </Link>
            <Link href="/quote"
              className="flex items-center gap-2 bg-brand-green hover:bg-brand-greenDark text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-green hover:shadow-green-lg hover:-translate-y-0.5 transition-all duration-200">
              <Zap size={14} className="fill-white" />
              {t('getQuote')}
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden p-2 rounded-lg"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen
              ? <X size={22} className={scrolled ? 'text-brand-dark' : 'text-white'} />
              : <Menu size={22} className={scrolled ? 'text-brand-dark' : 'text-white'} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-surface-border shadow-card">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map(({ href, label }) => (
              <Link key={href} href={href}
                className="block px-3 py-3 text-sm font-medium text-brand-muted hover:text-brand-dark hover:bg-surface-bg rounded-xl transition-colors"
                onClick={() => setMobileOpen(false)}>
                {label}
              </Link>
            ))}
            <div className="pt-3 pb-1 flex gap-2">
              <Link href="/quote" className="flex-1" onClick={() => setMobileOpen(false)}>
                <span className="flex items-center justify-center gap-2 w-full bg-brand-green hover:bg-brand-greenDark text-white font-bold py-3 rounded-xl text-sm shadow-green transition-all">
                  <Zap size={15} className="fill-white" />
                  {t('getQuote')}
                </span>
              </Link>
              <button
                onClick={toggleLocale}
                className="border border-surface-border text-brand-muted px-4 rounded-xl text-sm font-semibold hover:border-brand-green hover:text-brand-green transition-all">
                {locale === 'vi' ? 'EN' : 'VI'}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
