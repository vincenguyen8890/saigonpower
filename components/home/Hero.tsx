'use client'

import { useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { useRouter } from '@/i18n/navigation'
import { Leaf, Phone, Star, ArrowRight, CheckCircle, Plug } from 'lucide-react'
import Image from 'next/image'
import Button from '@/components/ui/Button'
import { isValidZip } from '@/lib/utils'

export default function Hero() {
  const t = useTranslations('hero')
  const locale = useLocale()
  const router = useRouter()
  const [zip, setZip] = useState('')
  const [error, setError] = useState('')

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
    <section className="relative min-h-screen bg-hero-gradient overflow-hidden flex items-center">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/4 -right-1/4 w-[600px] h-[600px] bg-brand-green/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-1/4 -left-1/4 w-[500px] h-[500px] bg-brand-greenBright/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-greenDark/20 rounded-full blur-3xl" />
        {/* Dot grid pattern */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left - Content */}
          <div className="animate-fade-up">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-green-400/30 rounded-full px-4 py-2 mb-6">
              <Star size={14} className="text-brand-gold fill-brand-gold" />
              <span className="text-green-100 text-sm font-medium">{t('badge')}</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-5">
              {t('headline').split(' ').map((word, i) => (
                i === 2 ? (
                  <span key={i} className="text-brand-gold"> {word} </span>
                ) : (
                  <span key={i}>{word} </span>
                )
              ))}
            </h1>

            <p className="text-blue-200 text-lg sm:text-xl leading-relaxed mb-8 max-w-lg">
              {t('subheadline')}
            </p>

            {/* ZIP form */}
            <form onSubmit={handleZipSubmit} className="mb-6">
              <div className="flex gap-2 max-w-md">
                <div className="flex-1 relative">
                  <Plug size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={zip}
                    onChange={(e) => { setZip(e.target.value); setError('') }}
                    placeholder={t('zipPlaceholder')}
                    maxLength={5}
                    className="w-full pl-10 pr-4 py-4 rounded-xl bg-white text-gray-900 placeholder-gray-400 text-base focus:outline-none focus:ring-2 focus:ring-brand-gold shadow-lg"
                  />
                </div>
                <Button type="submit" variant="gold" size="lg" className="shrink-0 shadow-gold">
                  {t('zipCTA')}
                  <ArrowRight size={18} />
                </Button>
              </div>
              {error && <p className="mt-2 text-red-300 text-sm">{error}</p>}
            </form>

            {/* Call CTA */}
            <div className="flex items-center gap-3 mb-10">
              <span className="text-blue-300 text-sm">{t('callLabel')}</span>
              <a
                href="tel:+18329379999"
                className="flex items-center gap-2 text-white font-semibold hover:text-brand-gold transition-colors"
              >
                <Phone size={16} className="text-brand-gold" />
                (832) 937-9999
              </a>
            </div>

            {/* Trust signals */}
            <div className="flex flex-wrap gap-4">
              {['Miễn phí tư vấn', 'Không ràng buộc', 'Hỗ trợ tiếng Việt'].map((item) => (
                <div key={item} className="flex items-center gap-1.5 text-blue-200 text-sm">
                  <CheckCircle size={15} className="text-brand-green" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Right - Logo + Stats + Visual */}
          <div className="animate-fade-up" style={{ animationDelay: '0.2s', opacity: 0 }}>
            {/* Logo showcase */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                {/* Glow ring */}
                <div className="absolute inset-0 rounded-full bg-brand-green/30 blur-2xl scale-110" />
                <div className="relative w-44 h-44 rounded-full overflow-hidden ring-4 ring-white/30 shadow-2xl">
                  <Image
                    src="/sg-power-logo.jpg"
                    alt="Saigon Power"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
                {/* Floating badge */}
                <div className="absolute -bottom-2 -right-2 bg-brand-gold text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-gold">
                  Texas ERCOT ⚡
                </div>
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {stats.map(({ value, label }) => (
                <div
                  key={label}
                  className="bg-white/10 backdrop-blur-sm border border-green-400/20 rounded-2xl p-5 text-center hover:bg-white/15 transition-colors"
                >
                  <div className="text-3xl font-bold text-brand-gold mb-1">{value}</div>
                  <div className="text-green-200 text-sm">{label}</div>
                </div>
              ))}
            </div>

            {/* Sample plan card */}
            <div className="bg-white rounded-2xl p-5 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-xs text-gray-500 mb-0.5">Gexa Energy</div>
                  <div className="font-bold text-gray-900">Gexa Saver 12</div>
                </div>
                <div className="bg-emerald-100 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                  Giá Tốt Nhất
                </div>
              </div>
              <div className="flex items-end gap-1 mb-4">
                <span className="text-4xl font-bold text-brand-blue">11.5</span>
                <span className="text-gray-500 mb-1">¢/kWh</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs mb-4">
                <div className="bg-surface-light rounded-lg p-2">
                  <div className="font-semibold text-gray-700">12</div>
                  <div className="text-gray-500">tháng</div>
                </div>
                <div className="bg-surface-light rounded-lg p-2">
                  <div className="font-semibold text-gray-700">$0</div>
                  <div className="text-gray-500">phí hủy</div>
                </div>
                <div className="bg-surface-light rounded-lg p-2">
                  <div className="font-semibold text-gray-700">~$121</div>
                  <div className="text-gray-500">/tháng</div>
                </div>
              </div>
              <button className="w-full bg-brand-greenDark hover:bg-brand-green text-white font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors text-sm shadow">
                Chọn Gói Này <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Wave divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 80L1440 80L1440 20C1200 70 960 -10 720 20C480 50 240 0 0 20L0 80Z" fill="white" />
        </svg>
      </div>
    </section>
  )
}
