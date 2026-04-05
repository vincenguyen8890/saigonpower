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
    gradient: 'from-blue-500/20 to-blue-700/5',
    border:   'border-blue-500/20',
    iconBg:   'bg-blue-500/10',
    iconColor:'text-blue-400',
    glow:     'bg-blue-500',
  },
  {
    number: '02',
    icon: BarChart2,
    titleKey: 'step2Title' as const,
    descKey:  'step2Desc'  as const,
    gradient: 'from-amber-500/20 to-amber-700/5',
    border:   'border-amber-500/20',
    iconBg:   'bg-amber-500/10',
    iconColor:'text-amber-400',
    glow:     'bg-amber-500',
  },
  {
    number: '03',
    icon: CheckCircle,
    titleKey: 'step3Title' as const,
    descKey:  'step3Desc'  as const,
    gradient: 'from-green-500/20 to-green-700/5',
    border:   'border-green-500/20',
    iconBg:   'bg-green-500/10',
    iconColor:'text-green-400',
    glow:     'bg-green-500',
  },
]

export default function HowItWorks() {
  const t = useTranslations('howItWorks')
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="py-28 bg-[#03080E] relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[400px] bg-brand-green/5 rounded-full blur-[120px] pointer-events-none" />

      <div ref={ref} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 bg-white/[0.05] border border-white/[0.08] rounded-full px-4 py-1.5 mb-5">
            <div className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse" />
            <span className="text-white/50 text-sm font-medium uppercase tracking-widest">{t('subtitle')}</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight">{t('title')}</h2>
        </motion.div>

        {/* Steps grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-14 relative">

          {/* Connector */}
          <div className="hidden lg:block absolute top-[52px] left-[calc(33.33%-20px)] right-[calc(33.33%-20px)] h-px overflow-hidden">
            <motion.div
              initial={{ scaleX: 0 }}
              animate={inView ? { scaleX: 1 } : {}}
              transition={{ duration: 1.2, delay: 0.6 }}
              className="h-full origin-left bg-gradient-to-r from-blue-500/40 via-amber-500/40 to-green-500/40"
            />
            {/* Animated dot */}
            <motion.div
              initial={{ x: '0%', opacity: 0 }}
              animate={inView ? { x: '100%', opacity: [0, 1, 1, 0] } : {}}
              transition={{ duration: 2, delay: 1.2, ease: 'easeInOut', repeat: Infinity, repeatDelay: 3 }}
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-[0_0_8px_white]"
            />
          </div>

          {steps.map(({ number, icon: Icon, titleKey, descKey, gradient, border, iconBg, iconColor, glow }, i) => (
            <motion.div
              key={number}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.2 + i * 0.15, ease: [0.22, 1, 0.36, 1] }}
              className={`relative bg-gradient-to-br ${gradient} border ${border} rounded-3xl p-8 group hover:-translate-y-2 transition-transform duration-300 overflow-hidden`}
            >
              {/* Big number watermark */}
              <div className="absolute -top-2 -right-2 text-[100px] font-black text-white/[0.03] leading-none select-none pointer-events-none">
                {number}
              </div>

              {/* Icon */}
              <div className="relative mb-6 w-fit">
                <div className={`w-14 h-14 rounded-2xl ${iconBg} border ${border} flex items-center justify-center`}>
                  <Icon size={24} className={iconColor} />
                </div>
                <div className={`absolute inset-0 ${glow}/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              </div>

              <h3 className="text-xl font-bold text-white mb-3">{t(titleKey)}</h3>
              <p className="text-white/45 leading-relaxed text-sm">{t(descKey)}</p>

              {/* Step number pill */}
              <div className={`absolute top-5 right-5 w-8 h-8 rounded-full ${iconBg} border ${border} flex items-center justify-center`}>
                <span className={`text-xs font-bold ${iconColor}`}>{number}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center"
        >
          <Link
            href="/compare"
            className="inline-flex items-center gap-2.5 bg-brand-green hover:bg-brand-greenBright text-white font-bold py-4 px-9 rounded-2xl text-base transition-all duration-200 hover:shadow-[0_0_30px_rgba(34,197,94,0.35)] hover:-translate-y-0.5"
          >
            {t('cta')} <ArrowRight size={18} />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
