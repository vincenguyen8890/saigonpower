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
    <section className="py-5 bg-[#03080E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-greenDark via-green-800 to-brand-green"
        >
          {/* Pattern overlay */}
          <div className="absolute inset-0 opacity-[0.06]"
            style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
          <div className="absolute right-0 top-0 w-[400px] h-full bg-gradient-to-l from-brand-greenBright/20 to-transparent pointer-events-none" />

          <div className="relative px-8 py-12 md:py-14 flex flex-col md:flex-row items-center justify-between gap-8">
            {/* Left */}
            <div className="text-center md:text-left max-w-xl">
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-3.5 py-1.5 mb-4">
                <Bell size={13} className="text-brand-gold" />
                <span className="text-green-200 text-xs font-semibold uppercase tracking-widest">
                  {isVi ? 'Dịch vụ gia hạn' : 'Renewal service'}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight mb-3">
                {isVi ? (
                  <>Chúng tôi nhắc bạn <span className="text-brand-gold">trước 60 ngày</span> hết hạn</>
                ) : (
                  <>We remind you <span className="text-brand-gold">60 days before</span> expiry</>
                )}
              </h2>
              <p className="text-green-200/80 text-base leading-relaxed">
                {isVi
                  ? 'Hợp đồng hết hạn → giá tăng 30–50%. Saigon Power tự động tìm gói tốt hơn cho bạn.'
                  : "Expired contract = 30–50% rate spike. We automatically find you a better plan."}
              </p>
            </div>

            {/* Right - CTAs */}
            <div className="flex flex-col gap-3 shrink-0">
              <Link
                href="/quote"
                className="flex items-center justify-center gap-2 bg-brand-gold hover:bg-brand-goldDark text-white font-bold px-7 py-3.5 rounded-2xl transition-all shadow-gold whitespace-nowrap hover:shadow-[0_0_20px_rgba(245,158,11,0.5)] hover:-translate-y-0.5"
              >
                <Bell size={15} />
                {isVi ? 'Đăng ký nhắc nhở miễn phí' : 'Get free reminders'}
                <ArrowRight size={15} />
              </Link>
              <Link
                href="/compare"
                className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-7 py-3.5 rounded-2xl transition-all whitespace-nowrap"
              >
                <RefreshCw size={15} />
                {isVi ? 'So sánh gói mới' : 'Compare new plans'}
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
