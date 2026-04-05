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
    <section className="py-24 bg-white">
      <div ref={ref} className="max-w-5xl mx-auto px-4 sm:px-6">

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="section-eyebrow mx-auto w-fit mb-4">
            <Zap size={12} /> {isVi ? 'Bắt Đầu Ngay' : 'Get Started'}
          </div>
          <h2 className="section-title mb-3">
            {isVi ? 'Bạn Muốn Làm Gì Hôm Nay?' : 'How Can We Help You?'}
          </h2>
          <p className="section-sub">
            {isVi ? 'Chọn cách phù hợp nhất với bạn' : 'Choose the path that works best for you'}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-5">

          {/* Self-compare — blue tech */}
          <motion.div
            initial={{ opacity: 0, x: -24 }} animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.55, delay: 0.2 }}
          >
            <Link href="/compare"
              className="group card card-hover flex flex-col h-full p-8 block hover:border-brand-blue/30">
              <div className="flex items-start justify-between mb-6">
                <div className="w-14 h-14 bg-brand-blueLight border border-brand-blueBorder rounded-2xl flex items-center justify-center group-hover:bg-brand-blue group-hover:border-brand-blue transition-all duration-300">
                  <BarChart2 size={24} className="text-brand-blue group-hover:text-white transition-colors" />
                </div>
                <span className="badge-blue">{isVi ? 'Nhanh nhất' : 'Fastest'}</span>
              </div>
              <h3 className="text-xl font-bold text-brand-dark mb-3">
                {isVi ? 'Tự So Sánh Gói Điện' : 'Compare Plans Yourself'}
              </h3>
              <p className="text-brand-muted leading-relaxed mb-6 flex-1 text-sm">
                {isVi
                  ? 'Nhập ZIP, xem và so sánh tất cả gói điện trong khu vực. Chọn ngay trong 5 phút.'
                  : 'Enter your ZIP, browse and compare all plans in your area. Enroll in 5 minutes.'}
              </p>
              <div className="flex flex-wrap gap-2 mb-5">
                {(isVi
                  ? ['Không cần gặp mặt', '50+ gói', 'Ngay lập tức']
                  : ['No appointment', '50+ plans', 'Instant']
                ).map(l => <span key={l} className="badge-blue">{l}</span>)}
              </div>
              <div className="flex items-center gap-2 text-brand-blue font-bold text-sm group-hover:gap-3 transition-all">
                {isVi ? 'Xem gói điện ngay' : 'Browse plans now'} <ArrowRight size={15} />
              </div>
            </Link>
          </motion.div>

          {/* Agent — green primary */}
          <motion.div
            initial={{ opacity: 0, x: 24 }} animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.55, delay: 0.3 }}
          >
            <Link href="/quote"
              className="group relative flex flex-col h-full bg-brand-green hover:bg-brand-greenDark rounded-2xl p-8 overflow-hidden transition-all duration-300 hover:-translate-y-1 shadow-green hover:shadow-green-lg block">
              {/* Dot pattern */}
              <div className="absolute inset-0 opacity-[0.08]"
                style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl" />

              <div className="relative flex items-start justify-between mb-6">
                <div className="w-14 h-14 bg-white/15 border border-white/25 rounded-2xl flex items-center justify-center group-hover:bg-white/25 transition-colors">
                  <UserCheck size={24} className="text-white" />
                </div>
                <span className="text-xs bg-yellow-400 text-yellow-900 font-bold px-3 py-1 rounded-lg">
                  {isVi ? 'Phổ biến nhất' : 'Most popular'}
                </span>
              </div>

              <div className="relative">
                <h3 className="text-xl font-bold text-white mb-3">
                  {isVi ? 'Để Chúng Tôi Chọn Giúp' : 'Let Us Choose For You'}
                </h3>
                <p className="text-white/80 leading-relaxed mb-6 text-sm">
                  {isVi
                    ? 'Chuyên gia người Việt phân tích hóa đơn và chọn gói tốt nhất. Hoàn toàn miễn phí.'
                    : 'Our Vietnamese experts analyze your bill and find the best plan. Always free.'}
                </p>

                <div className="flex flex-wrap gap-2 mb-5">
                  {(isVi
                    ? ['Tư vấn 1-1', 'Tiết kiệm tối đa', 'Tiếng Việt']
                    : ['1-on-1 advice', 'Max savings', 'Vietnamese']
                  ).map(l => (
                    <span key={l} className="text-xs bg-white/15 border border-white/25 text-white px-2.5 py-1 rounded-lg font-semibold">{l}</span>
                  ))}
                </div>

                <div className="flex items-center gap-2 bg-white/15 rounded-xl px-4 py-2.5 mb-5 border border-white/20">
                  <Clock size={14} className="text-yellow-300" />
                  <span className="text-white text-sm font-medium">
                    {isVi ? 'Phản hồi trong 24 giờ' : 'Response within 24 hours'}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-yellow-300 font-bold text-sm group-hover:gap-3 transition-all">
                  <Zap size={15} className="fill-yellow-300" />
                  {isVi ? 'Nhận tư vấn miễn phí' : 'Get free consultation'}
                  <ArrowRight size={15} />
                </div>
              </div>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
