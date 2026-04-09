import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import Image from 'next/image'
import { Phone, Mail, MapPin, Clock, Facebook, Youtube, Zap } from 'lucide-react'

export default function Footer() {
  const t = useTranslations('footer')
  const year = new Date().getFullYear()

  return (
    <footer className="bg-brand-dark text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">

          {/* Brand column */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-brand-green/30 shadow-lg shrink-0">
                <Image src="/sg-power-logo.jpg" alt="Saigon Power" width={48} height={48} className="object-cover w-full h-full" />
              </div>
              <div>
                <div className="font-black text-lg tracking-tight">Saigon Power</div>
                <div className="text-xs font-semibold text-brand-green">giadienre.com</div>
              </div>
            </div>

            <p className="text-white/50 text-sm leading-relaxed mb-6 max-w-xs">{t('tagline')}</p>

            <div className="space-y-2.5 text-sm text-white/50">
              {[
                { icon: Phone,  href: 'tel:+18329379999',        text: t('phone') },
                { icon: Mail,   href: 'mailto:info@saigonllc.com', text: t('email') },
                { icon: MapPin, href: undefined,                  text: t('address') },
                { icon: Clock,  href: undefined,                  text: t('hours') },
              ].map(({ icon: Icon, href, text }) => (
                <div key={text} className="flex items-center gap-2.5 hover:text-white transition-colors">
                  <Icon size={13} className="text-brand-green shrink-0" />
                  {href ? <a href={href}>{text}</a> : <span>{text}</span>}
                </div>
              ))}
            </div>

            <div className="flex gap-2.5 mt-5">
              <a href="https://www.facebook.com/giadienre2020/" target="_blank" rel="noopener noreferrer" aria-label="Facebook"
                className="w-9 h-9 bg-white/8 hover:bg-brand-blue rounded-lg flex items-center justify-center transition-all duration-200 border border-white/10">
                <Facebook size={15} />
              </a>
              <a href="#" aria-label="YouTube"
                className="w-9 h-9 bg-white/8 hover:bg-red-600 rounded-lg flex items-center justify-center transition-all duration-200 border border-white/10">
                <Youtube size={15} />
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-brand-green mb-4">{t('services')}</h3>
            <ul className="space-y-2.5 text-sm text-white/50">
              {[
                { href: '/residential' as const, label: t('residential') },
                { href: '/commercial'  as const, label: t('commercial') },
                { href: '/compare'     as const, label: t('compare') },
                { href: '/blog'        as const, label: t('blog') },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="hover:text-white transition-colors inline-block">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-brand-green mb-4">{t('company')}</h3>
            <ul className="space-y-2.5 text-sm text-white/50">
              {[
                { href: '/about'   as const, label: t('about') },
                { href: '/contact' as const, label: t('contact') },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="hover:text-white transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-brand-green mb-4">{t('support')}</h3>
            <ul className="space-y-2.5 text-sm text-white/50">
              {[
                { href: '/faq'   as const, label: t('faq') },
                { href: '/quote' as const, label: 'Nhận Báo Giá' },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="hover:text-white transition-colors">{label}</Link>
                </li>
              ))}
              <li>
                <span className="flex items-center gap-1.5 text-brand-green font-semibold text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse" />
                  {t('support247')}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/35">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-1.5">
              <Zap size={11} className="text-brand-green" />
              <span>{t('copyright', { year })}</span>
            </div>
            <span className="hidden sm:block opacity-40">·</span>
            <span>{t('license')}</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-white/70 transition-colors">{t('privacy')}</Link>
            <span className="opacity-30">·</span>
            <Link href="/" className="hover:text-white/70 transition-colors">{t('terms')}</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
