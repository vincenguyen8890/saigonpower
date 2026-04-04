import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import Image from 'next/image'
import { Phone, Mail, MapPin, Clock, Facebook, Youtube } from 'lucide-react'

export default function Footer() {
  const t = useTranslations('footer')
  const year = new Date().getFullYear()

  return (
    <footer className="bg-brand-blueDark text-white">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            {/* Logo + brand */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-14 h-14 rounded-full overflow-hidden ring-2 ring-white/20 shadow-lg shrink-0">
                <Image
                  src="/sg-power-logo.jpg"
                  alt="Saigon Power"
                  width={56}
                  height={56}
                  className="object-cover w-full h-full"
                />
              </div>
              <div>
                <div className="font-bold text-xl tracking-tight">Saigon Power</div>
                <div className="text-sm text-green-400 font-medium">giadienre.com</div>
              </div>
            </div>

            <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-xs">
              {t('tagline')}
            </p>
            <div className="space-y-2.5 text-sm text-gray-400">
              <div className="flex items-center gap-2.5 hover:text-white transition-colors">
                <Phone size={14} className="text-green-400 shrink-0" />
                <a href="tel:+18329379999">{t('phone')}</a>
              </div>
              <div className="flex items-center gap-2.5 hover:text-white transition-colors">
                <Mail size={14} className="text-green-400 shrink-0" />
                <a href="mailto:info@saigonllc.com">{t('email')}</a>
              </div>
              <div className="flex items-center gap-2.5">
                <MapPin size={14} className="text-green-400 shrink-0" />
                <span>{t('address')}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock size={14} className="text-green-400 shrink-0" />
                <span>{t('hours')}</span>
              </div>
            </div>
            {/* Social */}
            <div className="flex gap-3 mt-5">
              <a
                href="#"
                className="w-9 h-9 bg-white/10 hover:bg-green-600 rounded-lg flex items-center justify-center transition-all duration-200"
                aria-label="Facebook"
              >
                <Facebook size={16} />
              </a>
              <a
                href="#"
                className="w-9 h-9 bg-white/10 hover:bg-red-500 rounded-lg flex items-center justify-center transition-all duration-200"
                aria-label="YouTube"
              >
                <Youtube size={16} />
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold text-xs uppercase tracking-wider text-green-400 mb-4">{t('services')}</h3>
            <ul className="space-y-2.5 text-sm text-gray-400">
              {[
                { href: '/residential', label: t('residential') },
                { href: '/commercial', label: t('commercial') },
                { href: '/compare', label: t('compare') },
                { href: '/blog', label: t('blog') },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href as '/residential' | '/commercial' | '/compare' | '/blog'}
                    className="hover:text-white hover:translate-x-0.5 transition-all inline-block"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-xs uppercase tracking-wider text-green-400 mb-4">{t('company')}</h3>
            <ul className="space-y-2.5 text-sm text-gray-400">
              {[
                { href: '/about', label: t('about') },
                { href: '/contact', label: t('contact') },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href as '/about' | '/contact'}
                    className="hover:text-white transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-xs uppercase tracking-wider text-green-400 mb-4">{t('support')}</h3>
            <ul className="space-y-2.5 text-sm text-gray-400">
              {[
                { href: '/faq', label: t('faq') },
                { href: '/quote', label: 'Nhận Báo Giá' },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href as '/faq' | '/quote'} className="hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
              <li>
                <span className="inline-flex items-center gap-1.5 text-green-400 font-medium">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  {t('support247')}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
            <span>{t('copyright', { year })}</span>
            <span className="hidden sm:block opacity-40">•</span>
            <span>{t('license')}</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-gray-300 transition-colors">{t('privacy')}</Link>
            <span className="opacity-40">•</span>
            <Link href="/" className="hover:text-gray-300 transition-colors">{t('terms')}</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
