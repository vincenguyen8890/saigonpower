'use client'

import { useRef } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { motion, useInView } from 'framer-motion'
import { MapPin, BarChart2, CheckCircle, ArrowRight } from 'lucide-react'

const steps = [
  {
    number: '01',
    icon: MapPin,
    titleKey: 'step1Title' as const,
    descKey:  'step1Desc'  as const,
    iconBg:   'bg-brand-blueLight',
    iconColor:'text-brand-blue',
    border:   'border-brand-blueBorder',
    numColor: 'text-brand-blue',
  },
  {
    number: '02',
    icon: BarChart2,
    titleKey: 'step2Title' as const,
    descKey:  'step2Desc'  as const,
    iconBg:   'bg-brand-greenLight',
    iconColor:'text-brand-green',
    border:   'border-brand-greenBorder',
    numColor: 'text-brand-green',
  },
  {
    number: '03',
    icon: CheckCircle,
    titleKey: 'step3Title' as const,
    descKey:  'step3Desc'  as const,
    iconBg:   'bg-brand-orangeLight',
    iconColor:'text-brand-orange',
    border:   'border-brand-orangeBorder',
    numColor: 'text-brand-orange',
  },
]

export default function HowItWorks() {
  const t = useTranslations('howItWorks')
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="py-24 bg-surface-bg">
      <div ref={ref} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="section-eyebrow-blue mx-auto w-fit mb-4">
            <BarChart2 size={12} /> {t('subtitle')}
          </div>
          <h2 className="section-title mb-4">{t('title')}</h2>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-14 relative">
          {/* Connecting line */}
          <div className="hidden lg:block absolute top-14 left-[calc(33.33%-16px)] right-[calc(33.33%-16px)] h-px overflow-hidden">
            <motion.div
              initial={{ scaleX: 0 }} animate={inView ? { scaleX: 1 } : {}}
              transition={{ duration: 1.2, delay: 0.5 }}
              className="h-full origin-left bg-gradient-to-r from-brand-blue via-brand-green to-brand-orange"
            />
          </div>

          {steps.map(({ number, icon: Icon, titleKey, descKey, iconBg, iconColor, border, numColor }, i) => (
            <motion.div
              key={number}
              initial={{ opacity: 0, y: 36 }} animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 + i * 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="card p-8 group hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300"
            >
              {/* Step number */}
              <div className={`text-6xl font-black ${numColor} opacity-10 absolute top-4 right-5 select-none pointer-events-none`}>
                {number}
              </div>

              {/* Icon */}
              <div className={`relative mb-6 w-14 h-14 ${iconBg} border ${border} rounded-2xl flex items-center justify-center`}>
                <Icon size={24} className={iconColor} />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-white border border-surface-border rounded-full flex items-center justify-center shadow-sm">
                  <span className={`text-xs font-black ${numColor}`}>{number}</span>
                </div>
              </div>

              <h3 className="text-lg font-bold text-brand-dark mb-2">{t(titleKey)}</h3>
              <p className="text-brand-muted text-sm leading-relaxed">{t(descKey)}</p>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="text-center"
        >
          <Link href="/compare" className="btn-cta-lg">
            {t('cta')} <ArrowRight size={18} />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
