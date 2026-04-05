'use client'

import { useState, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { ChevronDown, ArrowRight, HelpCircle } from 'lucide-react'

export default function FAQPreview() {
  const t = useTranslations('faqPreview')
  const [openIdx, setOpenIdx] = useState<number | null>(0)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  const items = [
    { q: t('q1'), a: t('a1') },
    { q: t('q2'), a: t('a2') },
    { q: t('q3'), a: t('a3') },
    { q: t('q4'), a: t('a4') },
  ]

  return (
    <section className="py-24 bg-surface-bg">
      <div ref={ref} className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="section-eyebrow-blue mx-auto w-fit mb-4">
            <HelpCircle size={12} /> FAQ
          </div>
          <h2 className="section-title">{t('title')}</h2>
        </motion.div>

        <div className="space-y-3 mb-10">
          {items.map(({ q, a }, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.45, delay: 0.1 + i * 0.07 }}
              className={`bg-white rounded-2xl border overflow-hidden transition-all duration-200 ${
                openIdx === i ? 'border-brand-green/30 shadow-card' : 'border-surface-border hover:border-surface-border/80'
              }`}
            >
              <button
                className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-surface-bg/50 transition-colors"
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
              >
                <span className="font-semibold text-brand-dark pr-4 text-base">{q}</span>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                  openIdx === i ? 'bg-brand-greenLight border border-brand-greenBorder' : 'bg-surface-bg border border-surface-border'
                }`}>
                  <ChevronDown size={14} className={`transition-transform duration-200 ${
                    openIdx === i ? 'rotate-180 text-brand-green' : 'text-brand-muted'
                  }`} />
                </div>
              </button>

              <AnimatePresence>
                {openIdx === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22, ease: 'easeOut' }}
                  >
                    <div className="px-6 pb-5 border-t border-surface-border">
                      <p className="pt-4 text-brand-muted leading-relaxed text-sm">{a}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0.5 }}
          className="text-center"
        >
          <Link href="/faq"
            className="inline-flex items-center gap-2 border border-surface-border bg-white hover:border-brand-green hover:text-brand-green text-brand-muted font-semibold px-6 py-3 rounded-2xl text-sm transition-all">
            {t('viewAll')} <ArrowRight size={14} />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
