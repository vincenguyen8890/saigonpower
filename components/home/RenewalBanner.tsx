'use client'

import { useRef } from 'react'
import { useLocale } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { motion, useInView } from 'framer-motion'
import { Bell, ArrowRight, RefreshCw, AlertTriangle } from 'lucide-react'

export default function RenewalBanner() {
  const locale = useLocale()
  const isVi = locale === 'vi'
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section className="py-6 bg-surface-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl bg-orange-gradient p-8 md:p-10"
        >
          {/* Dot pattern */}
          <div className="absolute inset-0 opacity-[0.06]"
            style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          <div className="absolute right-0 top-0 w-80 h-full bg-gradient-to-l from-white/10 to-transparent pointer-events-none" />

          <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-7">
            {/* Left content */}
            <div className="max-w-xl">
              <div className="section-eyebrow-orange w-fit mb-4">
                <AlertTriangle size={12} /> {isVi ? 'Cảnh Báo Quan Trọng' : 'Important Warning'}
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight mb-3">
                {isVi ? (
                  <>Hợp đồng hết hạn → giá tăng <span className="underline decoration-white/60">30–50%</span></>
                ) : (
                  <>Contract expires → rates spike <span className="underline decoration-white/60">30–50%</span></>
                )}
              </h2>
              <p className="text-white/80 text-base leading-relaxed">
                {isVi
                  ? 'Saigon Power nhắc bạn trước 60 ngày và tự động tìm gói tốt hơn. Miễn phí.'
                  : "We remind you 60 days early and automatically find you a better plan. Always free."}
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col gap-3 shrink-0 w-full md:w-auto">
              <Link href="/quote"
                className="flex items-center justify-center gap-2 bg-white hover:bg-surface-bg text-brand-orange font-bold px-7 py-3.5 rounded-2xl transition-all shadow-[0_4px_16px_rgba(0,0,0,0.12)] hover:-translate-y-0.5 text-sm whitespace-nowrap">
                <Bell size={15} />
                {isVi ? 'Đăng ký nhắc nhở miễn phí' : 'Get free reminders'}
                <ArrowRight size={15} />
              </Link>
              <Link href="/compare"
                className="flex items-center justify-center gap-2 bg-white/15 border border-white/30 hover:bg-white/25 text-white font-semibold px-7 py-3.5 rounded-2xl transition-all text-sm whitespace-nowrap">
                <RefreshCw size={14} />
                {isVi ? 'So sánh gói mới' : 'Compare new plans'}
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
