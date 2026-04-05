'use client'

import { useRef } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { motion, useInView } from 'framer-motion'
import { Leaf, Clock, DollarSign, ArrowRight, Zap, Star, TrendingDown } from 'lucide-react'
import { getFeaturedPlans } from '@/data/mock-plans'

const BADGE: Record<string, { vi: string; en: string; cls: string }> = {
  popular:   { vi: 'Phổ Biến',  en: 'Popular',    cls: 'badge-blue'   },
  bestValue: { vi: 'Giá Tốt',   en: 'Best Value',  cls: 'badge-green'  },
  green:     { vi: 'Xanh 100%', en: '100% Green',  cls: 'badge-green'  },
  noFee:     { vi: 'Không Phí', en: 'No Fee',      cls: 'badge-blue'   },
}

export default function FeaturedPlans() {
  const t = useTranslations('featuredPlans')
  const locale = useLocale()
  const isVi = locale === 'vi'
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const plans = getFeaturedPlans(3)

  return (
    <section className="py-24 bg-white">
      <div ref={ref} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <div className="section-eyebrow mx-auto w-fit mb-4">
            <Zap size={12} /> {t('subtitle')}
          </div>
          <h2 className="section-title mb-3">{t('title')}</h2>
          <p className="section-sub">
            {isVi ? 'Cập nhật hàng ngày từ 15+ nhà cung cấp điện Texas' : 'Updated daily from 15+ Texas electricity providers'}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {plans.map((plan, i) => {
            const isFeatured = i === 1
            const badge = plan.badges[0] ? BADGE[plan.badges[0]] : null

            return (
              <motion.div key={plan.id}
                initial={{ opacity: 0, y: 40 }} animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.1 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                className={`relative flex flex-col rounded-2xl border-2 overflow-hidden transition-all duration-300 group hover:-translate-y-1 ${
                  isFeatured
                    ? 'border-brand-green shadow-green bg-white'
                    : 'border-surface-border shadow-card bg-white hover:border-brand-green/40 hover:shadow-card-hover'
                }`}
              >
                {/* Featured banner */}
                {isFeatured && (
                  <div className="flex items-center justify-center gap-1.5 py-2 bg-brand-green">
                    <Star size={12} className="text-white fill-white" />
                    <span className="text-white text-xs font-bold uppercase tracking-wider">
                      {isVi ? 'Được Chọn Nhiều Nhất' : 'Most Selected'}
                    </span>
                  </div>
                )}

                <div className="p-7 flex-1 flex flex-col">
                  {/* Provider + badge */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-brand-muted text-xs font-medium mb-0.5">{plan.provider.name}</p>
                      <p className="text-brand-dark font-bold text-lg leading-tight">{plan.name}</p>
                    </div>
                    {badge && (
                      <span className={badge.cls}>{isVi ? badge.vi : badge.en}</span>
                    )}
                  </div>

                  {/* Big rate — green = savings */}
                  <div className="flex items-end gap-2 mb-2">
                    <span className={`text-6xl font-black leading-none ${isFeatured ? 'text-brand-green' : 'text-brand-dark'}`}>
                      {plan.rateKwh.toFixed(1)}
                    </span>
                    <div className="mb-1">
                      <div className={`text-xl font-black ${isFeatured ? 'text-brand-green' : 'text-brand-muted'}`}>¢</div>
                      <div className="text-brand-muted text-xs">{t('perKwh')}</div>
                    </div>
                  </div>

                  {/* Savings indicator */}
                  {isFeatured && (
                    <div className="flex items-center gap-1.5 mb-5">
                      <TrendingDown size={13} className="text-brand-green" />
                      <span className="text-brand-green text-xs font-bold">
                        {isVi ? 'Thấp hơn 23% so với thị trường' : '23% below market average'}
                      </span>
                    </div>
                  )}

                  {/* Metrics */}
                  <div className={`grid grid-cols-3 gap-2 ${isFeatured ? 'mb-5' : 'mb-5 mt-3'}`}>
                    {[
                      { icon: Clock,      value: `${plan.termMonths}mo`,            label: t('term') },
                      { icon: Leaf,       value: `${plan.renewablePercent}%`,        label: isVi ? 'Tái tạo' : 'Green' },
                      { icon: DollarSign, value: plan.cancellationFee === 0 ? '$0' : `$${plan.cancellationFee}`, label: t('cancellation') },
                    ].map(({ icon: Icon, value, label }) => (
                      <div key={label} className="bg-surface-bg rounded-xl p-2.5 text-center border border-surface-border">
                        <Icon size={13} className="text-brand-blue mx-auto mb-1" />
                        <div className="text-brand-dark text-sm font-bold">{value}</div>
                        <div className="text-brand-muted text-[10px]">{label}</div>
                      </div>
                    ))}
                  </div>

                  <div className="flex-1" />

                  {/* CTA */}
                  <Link href={{ pathname: '/compare', query: {} }}
                    className={`flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all ${
                      isFeatured
                        ? 'bg-brand-green hover:bg-brand-greenDark text-white shadow-green hover:shadow-green-lg'
                        : 'bg-surface-bg hover:bg-brand-greenLight text-brand-dark border border-surface-border hover:border-brand-green hover:text-brand-green'
                    }`}>
                    {t('select')} <ArrowRight size={15} />
                  </Link>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* View all */}
        <motion.div initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0.7 }}
          className="text-center">
          <Link href="/compare" className="btn-ghost font-semibold">
            {isVi ? 'Xem tất cả 50+ gói điện' : 'View all 50+ plans'} <ArrowRight size={14} />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
