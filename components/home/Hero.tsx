'use client'

import { useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { useRouter } from '@/i18n/navigation'
import { Phone, Star, ArrowRight, CheckCircle, MapPin } from 'lucide-react'
import { isValidZip } from '@/lib/utils'

export default function Hero() {
  const t = useTranslations('hero')
  const locale = useLocale()
  const router = useRouter()
  const [zip, setZip] = useState('')
  const [error, setError] = useState('')
  const isVi = locale === 'vi'

  const handleZipSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValidZip(zip)) {
      setError(t('zipError'))
      return
    }
    setError('')
    router.push({ pathname: '/compare', query: { zip } } as Parameters<typeof router.push>[0])
  }

  const stats = [
    { value: '50+', label: t('statsPlans') },
    { value: '15+', label: t('statsProviders') },
    { value: '$300', label: t('statsSavings') },
    { value: '500+', label: t('statsClients') },
  ]

  return (
    <section className="relative min-h-[90vh] bg-hero-gradient overflow-hidden flex items-center">
      {/* Background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-brand-green/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] bg-brand-greenBright/10 rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '40px 40px' }}
        />
      </div>

      <div className="relative w-full max-w-4xl mx-auto px-4 sm:px-6 pt-32 pb-24 text-center">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-green-400/30 rounded-full px-4 py-2 mb-8">
          <Star size={13} className="text-brand-gold fill-brand-gold" />
          <span className="text-green-100 text-sm font-medium">{t('badge')}</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-5">
          {isVi ? (
            <>
              So sánh giá điện Texas<br />
              <span className="text-brand-gold">trong 30 giây</span>
            </>
          ) : (
            <>
              Compare Texas Electricity<br />
              <span className="text-brand-gold">in 30 Seconds</span>
            </>
          )}
        </h1>

        {/* Subheadline */}
        <p className="text-green-200 text-lg sm:text-xl mb-10 max-w-2xl mx-auto">
          {t('subheadline')}
        </p>

        {/* ZIP Form — center of screen, dominant */}
        <form onSubmit={handleZipSubmit} className="max-w-xl mx-auto mb-5">
          <div className="flex flex-col sm:flex-row gap-3 shadow-2xl">
            <div className="flex-1 relative">
              <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                inputMode="numeric"
                value={zip}
                onChange={(e) => { setZip(e.target.value.replace(/\D/g, '')); setError('') }}
                placeholder={t('zipPlaceholder')}
                maxLength={5}
                className="w-full pl-11 pr-4 py-5 rounded-2xl bg-white text-gray-900 placeholder-gray-400 text-lg font-medium focus:outline-none focus:ring-4 focus:ring-brand-gold/40"
              />
            </div>
            <button
              type="submit"
              className="sm:shrink-0 bg-brand-gold hover:bg-brand-goldDark text-white font-bold py-5 px-8 rounded-2xl text-base transition-colors shadow-gold flex items-center justify-center gap-2 whitespace-nowrap"
            >
              {t('zipCTA')} <ArrowRight size={18} />
            </button>
          </div>
          {error && <p className="mt-3 text-red-300 text-sm">{error}</p>}
        </form>

        {/* Call CTA */}
        <div className="flex items-center justify-center gap-3 mb-12">
          <span className="text-green-400 text-sm">{t('callLabel')}</span>
          <a
            href="tel:+18329379999"
            className="flex items-center gap-2 text-white font-bold text-lg hover:text-brand-gold transition-colors"
          >
            <Phone size={16} className="text-brand-gold" />
            (832) 937-9999
          </a>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto mb-8">
          {stats.map(({ value, label }) => (
            <div key={label} className="bg-white/10 backdrop-blur-sm border border-green-400/20 rounded-2xl py-4 px-3">
              <div className="text-2xl font-bold text-brand-gold mb-0.5">{value}</div>
              <div className="text-green-300 text-xs">{label}</div>
            </div>
          ))}
        </div>

        {/* Trust micro-copy */}
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          {(isVi
            ? ['Miễn phí tư vấn', 'Không ràng buộc', 'Hỗ trợ tiếng Việt']
            : ['Free consultation', 'No commitment', 'Vietnamese support']
          ).map((item) => (
            <div key={item} className="flex items-center gap-1.5 text-green-300 text-sm">
              <CheckCircle size={14} className="text-brand-green" />
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Wave divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 60L1440 60L1440 15C1200 55 960 -5 720 15C480 35 240 -5 0 15L0 60Z" fill="white" />
        </svg>
      </div>
    </section>
  )
}
