'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { ChevronDown, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import Button from '@/components/ui/Button'

export default function FAQPreview() {
  const t = useTranslations('faqPreview')
  const [openIdx, setOpenIdx] = useState<number | null>(0)

  const items = [
    { q: t('q1'), a: t('a1') },
    { q: t('q2'), a: t('a2') },
    { q: t('q3'), a: t('a3') },
    { q: t('q4'), a: t('a4') },
  ]

  return (
    <section className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-brand-blue mb-4">{t('title')}</h2>
        </div>

        <div className="space-y-3 mb-10">
          {items.map(({ q, a }, i) => (
            <div
              key={i}
              className="border border-surface-border rounded-2xl overflow-hidden transition-all duration-200"
            >
              <button
                className="w-full flex items-center justify-between p-5 text-left hover:bg-surface-light transition-colors"
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
              >
                <span className="font-semibold text-gray-900 pr-4">{q}</span>
                <ChevronDown
                  size={18}
                  className={cn(
                    'text-brand-blue shrink-0 transition-transform duration-200',
                    openIdx === i && 'rotate-180'
                  )}
                />
              </button>
              {openIdx === i && (
                <div className="px-5 pb-5 text-gray-600 leading-relaxed border-t border-surface-border">
                  <p className="pt-4">{a}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link href="/faq">
            <Button variant="outline" size="lg">
              {t('viewAll')} <ArrowRight size={16} />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
