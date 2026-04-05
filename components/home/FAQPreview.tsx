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
    <section className="py-28 bg-[#03080E] relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_50%_50%,rgba(22,163,74,0.05),transparent)] pointer-events-none" />

      <div ref={ref} className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 bg-white/[0.05] border border-white/[0.08] rounded-full px-4 py-1.5 mb-5">
            <HelpCircle size={12} className="text-brand-green" />
            <span className="text-white/50 text-sm font-medium uppercase tracking-widest">FAQ</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight">{t('title')}</h2>
        </motion.div>

        <div className="space-y-3 mb-10">
          {items.map(({ q, a }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.08 }}
              className={`border rounded-2xl overflow-hidden transition-colors duration-200 ${
                openIdx === i ? 'border-brand-green/30 bg-brand-green/5' : 'border-white/[0.07] bg-white/[0.02] hover:border-white/[0.12]'
              }`}
            >
              <button
                className="w-full flex items-center justify-between p-5 text-left"
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
              >
                <span className="font-semibold text-white/85 pr-4 text-base">{q}</span>
                <div className={`w-7 h-7 rounded-full border flex items-center justify-center flex-shrink-0 transition-all ${
                  openIdx === i ? 'bg-brand-green/20 border-brand-green/30' : 'bg-white/[0.04] border-white/10'
                }`}>
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${openIdx === i ? 'rotate-180 text-brand-green' : 'text-white/40'}`}
                  />
                </div>
              </button>

              <AnimatePresence>
                {openIdx === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                  >
                    <div className="px-5 pb-5 border-t border-white/[0.06]">
                      <p className="pt-4 text-white/50 leading-relaxed text-sm">{a}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          <Link
            href="/faq"
            className="inline-flex items-center gap-2 text-white/40 hover:text-brand-green transition-colors text-sm font-medium border border-white/[0.08] hover:border-brand-green/30 px-6 py-3 rounded-2xl"
          >
            {t('viewAll')} <ArrowRight size={14} />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
