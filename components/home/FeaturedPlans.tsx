'use client'

import { useRef } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { motion, useInView } from 'framer-motion'
import { Leaf, Clock, DollarSign, ArrowRight, Zap, Star } from 'lucide-react'
import { getFeaturedPlans } from '@/data/mock-plans'

const BADGE_STYLES: Record<string, { label: string; labelEn: string; gradient: string; textColor: string }> = {
  popular:   { label: 'Phổ Biến',  labelEn: 'Popular',    gradient: 'from-blue-500/20 to-blue-700/10',  textColor: 'text-blue-400'  },
  bestValue: { label: 'Giá Tốt',   labelEn: 'Best Value', gradient: 'from-amber-500/20 to-amber-700/10',textColor: 'text-amber-400' },
  green:     { label: 'Xanh 100%', labelEn: '100% Green', gradient: 'from-green-500/20 to-green-700/10',textColor: 'text-green-400' },
  noFee:     { label: 'Không Phí', labelEn: 'No Fee',     gradient: 'from-purple-500/20 to-purple-700/10',textColor:'text-purple-400'},
}

export default function FeaturedPlans() {
  const t = useTranslations('featuredPlans')
  const locale = useLocale()
  const isVi = locale === 'vi'
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const plans = getFeaturedPlans(3)

  return (
    <section className="py-28 bg-[#040C0A] relative overflow-hidden">
      {/* Glow blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-brand-green/8 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[200px] bg-brand-gold/6 rounded-full blur-[80px] pointer-events-none" />

      <div ref={ref} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-white/[0.05] border border-white/[0.08] rounded-full px-4 py-1.5 mb-5">
            <Zap size={12} className="text-brand-gold fill-brand-gold" />
            <span className="text-white/50 text-sm font-medium uppercase tracking-widest">{t('subtitle')}</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-4">{t('title')}</h2>
          <p className="text-white/40 text-lg max-w-xl mx-auto">
            {isVi ? 'Cập nhật hàng ngày từ 15+ nhà cung cấp điện Texas' : 'Updated daily from 15+ Texas electricity providers'}
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {plans.map((plan, i) => {
            const isFeatured = i === 1
            const badge = plan.badges[0] ? BADGE_STYLES[plan.badges[0]] : null

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 50 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, delay: 0.15 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                className="relative group"
                style={{ perspective: '800px' }}
              >
                {/* Featured glow */}
                {isFeatured && (
                  <div className="absolute -inset-px rounded-3xl bg-gradient-to-b from-brand-green/40 to-brand-green/0 pointer-events-none" />
                )}

                <div className={`relative h-full flex flex-col rounded-3xl border overflow-hidden transition-transform duration-300 group-hover:-translate-y-2 ${
                  isFeatured
                    ? 'bg-gradient-to-b from-brand-green/10 to-[#04100A] border-brand-green/30'
                    : 'bg-white/[0.03] border-white/[0.08] hover:border-white/[0.14]'
                }`}>
                  {/* Top bar for featured */}
                  {isFeatured && (
                    <div className="flex items-center justify-center gap-2 py-2.5 bg-brand-green/20 border-b border-brand-green/20">
                      <Star size={12} className="text-brand-gold fill-brand-gold" />
                      <span className="text-brand-green text-xs font-bold uppercase tracking-wider">
                        {isVi ? 'Được Chọn Nhiều Nhất' : 'Most Selected'}
                      </span>
                    </div>
                  )}

                  <div className="p-7 flex-1 flex flex-col">
                    {/* Provider + badge */}
                    <div className="flex items-start justify-between mb-5">
                      <div>
                        <p className="text-white/40 text-xs mb-1">{plan.provider.name}</p>
                        <p className="text-white font-bold text-lg leading-tight">{plan.name}</p>
                      </div>
                      {badge && (
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-xl border border-white/10 bg-gradient-to-br ${badge.gradient} ${badge.textColor}`}>
                          {isVi ? badge.label : badge.labelEn}
                        </span>
                      )}
                    </div>

                    {/* Big rate */}
                    <div className="flex items-end gap-2 mb-6">
                      <span className={`text-6xl font-black leading-none ${isFeatured ? 'text-brand-green' : 'text-white'}`}>
                        {plan.rateKwh.toFixed(1)}
                      </span>
                      <div className="mb-1 leading-tight">
                        <div className={`text-xl font-bold ${isFeatured ? 'text-brand-green' : 'text-white/60'}`}>¢</div>
                        <div className="text-white/30 text-xs">{t('perKwh')}</div>
                      </div>
                    </div>

                    {/* Metrics row */}
                    <div className="grid grid-cols-3 gap-2 mb-6">
                      {[
                        { icon: Clock,      value: `${plan.termMonths}mo`,           label: t('term') },
                        { icon: Leaf,       value: `${plan.renewablePercent}%`,       label: isVi ? 'Tái tạo' : 'Green' },
                        { icon: DollarSign, value: plan.cancellationFee === 0 ? '$0' : `$${plan.cancellationFee}`, label: t('cancellation') },
                      ].map(({ icon: Icon, value, label }) => (
                        <div key={label} className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-3 text-center">
                          <Icon size={13} className="text-white/30 mx-auto mb-1.5" />
                          <div className="text-white text-sm font-bold">{value}</div>
                          <div className="text-white/30 text-[10px]">{label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Spacer */}
                    <div className="flex-1" />

                    {/* CTA */}
                    <Link
                      href={{ pathname: '/compare', query: {} }}
                      className={`flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm transition-all duration-200 ${
                        isFeatured
                          ? 'bg-brand-green hover:bg-brand-greenBright text-white hover:shadow-[0_0_20px_rgba(34,197,94,0.4)]'
                          : 'bg-white/[0.07] hover:bg-white/[0.12] text-white border border-white/10'
                      }`}
                    >
                      {t('select')} <ArrowRight size={15} />
                    </Link>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* View all */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.8 }}
          className="text-center"
        >
          <Link
            href="/compare"
            className="inline-flex items-center gap-2 text-white/40 hover:text-brand-green transition-colors text-sm font-medium"
          >
            {isVi ? `Xem tất cả ${50}+ gói điện` : `View all 50+ plans`}
            <ArrowRight size={14} />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
