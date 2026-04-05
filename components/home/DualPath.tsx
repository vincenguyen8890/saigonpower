'use client'

import { useRef } from 'react'
import { useLocale } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { motion, useInView } from 'framer-motion'
import { BarChart2, UserCheck, ArrowRight, Zap, Clock } from 'lucide-react'

export default function DualPath() {
  const locale = useLocale()
  const isVi = locale === 'vi'
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section className="py-28 bg-[#040C0A] relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(22,163,74,0.05),transparent)] pointer-events-none" />

      <div ref={ref} className="max-w-5xl mx-auto px-4 sm:px-6">

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 bg-white/[0.05] border border-white/[0.08] rounded-full px-4 py-1.5 mb-5">
            <Zap size={12} className="text-brand-green" />
            <span className="text-white/50 text-sm font-medium uppercase tracking-widest">
              {isVi ? 'Bắt Đầu Ngay' : 'Get Started'}
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-3">
            {isVi ? 'Bạn Muốn Làm Gì Hôm Nay?' : 'How Can We Help You?'}
          </h2>
          <p className="text-white/40 text-lg">
            {isVi ? 'Chọn cách phù hợp nhất với bạn' : 'Choose the path that works best for you'}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-5">

          {/* Self-compare */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Link
              href="/compare"
              className="group flex flex-col h-full bg-white/[0.03] border border-white/[0.08] hover:border-brand-green/30 rounded-3xl p-8 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="w-14 h-14 bg-brand-green/10 border border-brand-green/20 rounded-2xl flex items-center justify-center group-hover:bg-brand-green/15 transition-colors">
                  <BarChart2 size={24} className="text-brand-green" />
                </div>
                <span className="text-xs bg-brand-green/10 text-brand-green border border-brand-green/20 px-3 py-1 rounded-full font-semibold">
                  {isVi ? 'Nhanh nhất' : 'Fastest'}
                </span>
              </div>

              <h3 className="text-2xl font-bold text-white mb-3">
                {isVi ? 'Tự So Sánh Gói Điện' : 'Compare Plans Yourself'}
              </h3>
              <p className="text-white/45 leading-relaxed mb-6 flex-1">
                {isVi
                  ? 'Nhập ZIP, xem và so sánh tất cả gói điện trong khu vực của bạn. Chọn ngay trong 5 phút.'
                  : 'Enter your ZIP, browse and compare all plans in your area. Enroll in 5 minutes.'}
              </p>

              <div className="flex flex-wrap gap-2 mb-5">
                {(isVi
                  ? ['Không cần gặp mặt', '50+ gói điện', 'Ngay lập tức']
                  : ['No appointment', '50+ plans', 'Instant']
                ).map(label => (
                  <span key={label} className="text-xs bg-white/[0.05] border border-white/[0.08] text-white/50 px-2.5 py-1 rounded-lg font-medium">
                    {label}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2 text-brand-green font-bold group-hover:gap-3 transition-all">
                {isVi ? 'Xem gói điện ngay' : 'Browse plans now'}
                <ArrowRight size={16} />
              </div>
            </Link>
          </motion.div>

          {/* Agent-assisted */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Link
              href="/quote"
              className="group relative flex flex-col h-full bg-gradient-to-br from-brand-greenDark to-green-900 border border-brand-green/25 hover:border-brand-green/50 rounded-3xl p-8 overflow-hidden transition-all duration-300 hover:-translate-y-1"
            >
              <div className="absolute inset-0 opacity-[0.05]"
                style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
              <div className="absolute right-0 top-0 w-32 h-32 bg-brand-greenBright/15 rounded-full blur-3xl pointer-events-none" />

              <div className="relative flex items-start justify-between mb-6">
                <div className="w-14 h-14 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center group-hover:bg-white/15 transition-colors">
                  <UserCheck size={24} className="text-white" />
                </div>
                <span className="text-xs bg-brand-gold/20 text-brand-gold border border-brand-gold/30 px-3 py-1 rounded-full font-semibold">
                  {isVi ? 'Phổ biến nhất' : 'Most popular'}
                </span>
              </div>

              <div className="relative">
                <h3 className="text-2xl font-bold text-white mb-3">
                  {isVi ? 'Để Chúng Tôi Chọn Giúp' : 'Let Us Choose For You'}
                </h3>
                <p className="text-green-200/70 leading-relaxed mb-6">
                  {isVi
                    ? 'Chuyên gia người Việt phân tích hóa đơn và chọn gói tốt nhất. Hoàn toàn miễn phí.'
                    : 'Our Vietnamese-speaking experts analyze your bill and find the best plan. Always free.'}
                </p>

                <div className="flex flex-wrap gap-2 mb-5">
                  {(isVi
                    ? ['Tư vấn 1-1', 'Tiết kiệm tối đa', 'Tiếng Việt']
                    : ['1-on-1 advice', 'Max savings', 'Vietnamese']
                  ).map(label => (
                    <span key={label} className="text-xs bg-white/10 text-green-200 px-2.5 py-1 rounded-lg font-medium border border-white/15">
                      {label}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2 bg-white/8 rounded-xl px-4 py-2.5 mb-5 border border-white/10">
                  <Clock size={14} className="text-brand-gold" />
                  <span className="text-white/80 text-sm">{isVi ? 'Phản hồi trong 24 giờ' : 'Response within 24 hours'}</span>
                </div>

                <div className="flex items-center gap-2 text-brand-gold font-bold group-hover:gap-3 transition-all">
                  <Zap size={15} />
                  {isVi ? 'Nhận tư vấn miễn phí' : 'Get free consultation'}
                  <ArrowRight size={16} />
                </div>
              </div>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
