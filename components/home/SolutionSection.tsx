'use client'

import { useRef } from 'react'
import { useLocale } from 'next-intl'
import { motion, useInView } from 'framer-motion'
import { Zap, Shield, Clock } from 'lucide-react'

export default function SolutionSection() {
  const locale = useLocale()
  const isVi = locale === 'vi'
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  const features = isVi
    ? [
        {
          Icon: Zap,
          title: '50+ Gói Điện',
          desc: 'So sánh tự động toàn bộ các nhà cung cấp điện tại Texas — không cần bạn làm gì.',
          accent: 'text-brand-blue',
          bg: 'bg-brand-blueLight',
        },
        {
          Icon: Shield,
          title: 'Hoàn Toàn Miễn Phí',
          desc: 'Không phí ẩn. Không ràng buộc. Không cần thẻ tín dụng.',
          accent: 'text-brand-green',
          bg: 'bg-brand-greenLight',
        },
        {
          Icon: Clock,
          title: 'Chuyển Trong 24h',
          desc: 'Chúng tôi xử lý mọi thủ tục cho bạn trong vòng 24 giờ.',
          accent: 'text-brand-orange',
          bg: 'bg-brand-orangeLight',
        },
      ]
    : [
        {
          Icon: Zap,
          title: '50+ Plans Compared',
          desc: 'Automatically compares every electricity provider in Texas — no effort from you.',
          accent: 'text-brand-blue',
          bg: 'bg-brand-blueLight',
        },
        {
          Icon: Shield,
          title: 'Completely Free',
          desc: 'No hidden fees. No commitments. No credit card required.',
          accent: 'text-brand-green',
          bg: 'bg-brand-greenLight',
        },
        {
          Icon: Clock,
          title: 'Switch in 24 Hours',
          desc: 'We handle all the paperwork and switching for you in 24 hours.',
          accent: 'text-brand-orange',
          bg: 'bg-brand-orangeLight',
        },
      ]

  return (
    <section className="min-h-screen bg-[#F8FAFC] flex items-center">
      <div ref={ref} className="max-w-6xl mx-auto px-6 lg:px-12 w-full py-24">

        {/* Header */}
        <div className="text-center mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 32 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
            className="text-[clamp(2.5rem,6vw,5rem)] font-black text-brand-dark leading-[1.08] tracking-tight mb-5"
          >
            {isVi ? (
              <>
                Chúng Tôi<br />
                <span className="gradient-text-hero">Lo Cho Bạn</span>
              </>
            ) : (
              <>
                We Handle<br />
                <span className="gradient-text-hero">Everything For You</span>
              </>
            )}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-xl text-brand-muted max-w-xl mx-auto leading-relaxed"
          >
            {isVi
              ? 'Saigon Power so sánh 50+ gói điện và tìm lựa chọn tốt nhất cho bạn tại Texas'
              : 'Saigon Power automatically compares 50+ plans and finds the best option for you in Texas'}
          </motion.p>
        </div>

        {/* Feature cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {features.map(({ Icon, title, desc, accent, bg }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 44 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.75, delay: 0.14 + i * 0.13, ease: [0.22, 1, 0.36, 1] }}
              className="bg-white rounded-3xl p-10 shadow-card hover:shadow-card-hover hover:-translate-y-1.5 transition-all duration-300 group"
            >
              <div className={`w-16 h-16 ${bg} rounded-2xl flex items-center justify-center mb-7 group-hover:scale-105 transition-transform duration-300`}>
                <Icon size={28} className={accent} />
              </div>
              <h3 className="text-xl font-black text-brand-dark mb-3">{title}</h3>
              <p className="text-brand-muted leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
