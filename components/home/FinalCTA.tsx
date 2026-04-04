'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/navigation'
import { Leaf, Phone, ArrowRight, Shield } from 'lucide-react'
import Image from 'next/image'
import Button from '@/components/ui/Button'
import { isValidZip } from '@/lib/utils'

export default function FinalCTA() {
  const t = useTranslations('finalCTA')
  const router = useRouter()
  const [zip, setZip] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValidZip(zip)) {
      setError('ZIP không hợp lệ')
      return
    }
    router.push({ pathname: '/compare', query: { zip } } as Parameters<typeof router.push>[0])
  }

  return (
    <section className="py-24 bg-hero-gradient relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-brand-blueLight/30 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Logo */}
        <div className="w-20 h-20 rounded-full overflow-hidden ring-4 ring-white/30 shadow-2xl mx-auto mb-6">
          <Image src="/sg-power-logo.jpg" alt="Saigon Power" width={80} height={80} className="object-cover" />
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
          {t('title')}
        </h2>
        <p className="text-blue-200 text-lg mb-10">{t('subtitle')}</p>

        {/* ZIP form */}
        <form onSubmit={handleSubmit} className="flex gap-2 max-w-md mx-auto mb-4">
          <div className="flex-1 relative">
            <Leaf size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={zip}
              onChange={(e) => { setZip(e.target.value); setError('') }}
              placeholder={t('zipPlaceholder')}
              maxLength={5}
              className="w-full pl-9 pr-4 py-4 rounded-xl bg-white text-gray-900 placeholder-gray-400 text-base focus:outline-none focus:ring-2 focus:ring-brand-gold shadow-lg"
            />
          </div>
          <Button type="submit" variant="gold" size="lg" className="shrink-0">
            {t('cta')} <ArrowRight size={18} />
          </Button>
        </form>
        {error && <p className="text-red-300 text-sm mb-4">{error}</p>}

        {/* Phone CTA */}
        <a
          href="tel:+18329379999"
          className="inline-flex items-center gap-2 text-blue-200 hover:text-white transition-colors text-sm"
        >
          <Phone size={16} className="text-brand-gold" />
          {t('callCTA')}
        </a>

        {/* Disclaimer */}
        <div className="mt-8 flex items-center justify-center gap-2 text-blue-300 text-xs">
          <Shield size={13} />
          <span>{t('disclaimer')}</span>
        </div>
      </div>
    </section>
  )
}
