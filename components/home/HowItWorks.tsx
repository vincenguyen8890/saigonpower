'use client'

import { useRef } from 'react'
import { useLocale } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { motion, useInView } from 'framer-motion'
import { MapPin, BarChart2, CheckCircle, ArrowRight } from 'lucide-react'

export default function HowItWorks() {
  const locale = useLocale()
  const isVi = locale === 'vi'
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  const steps = isVi
    ? [
        {
          num: '01',
          Icon: MapPin,
          title: 'Nhập ZIP Code',
          desc: 'Chỉ cần 5 chữ số. Không cần đăng ký tài khoản.',
          accent: 'text-brand-blue',
          bg: 'bg-brand-blueLight',
          numClr: 'text-brand-blue/10',
        },
        {
          num: '02',
          Icon: BarChart2,
          title: 'So Sánh Gói Điện',
          desc: 'Chúng tôi phân tích và xếp hạng 50+ gói điện cho khu vực của bạn.',
          accent: 'text-brand-green',
          bg: 'bg-brand-greenLight',
          numClr: 'text-brand-green/10',
        },
        {
          num: '03',
          Icon: CheckCircle,
          title: 'Chuyển & Tiết Kiệm',
          desc: 'Chúng tôi lo toàn bộ thủ tục chuyển đổi trong vòng 24 giờ.',
          accent: 'text-brand-orange',
          bg: 'bg-brand-orangeLight',
          numClr: 'text-brand-orange/10',
        },
      ]
    : [
        {
          num: '01',
          Icon: MapPin,
          title: 'Enter Your ZIP',
          desc: 'Just 5 digits. No account needed.',
          accent: 'text-brand-blue',
          bg: 'bg-brand-blueLight',
          numClr: 'text-brand-blue/10',
        },
        {
          num: '02',
          Icon: BarChart2,
          title: 'Compare Plans',
          desc: 'We analyze and rank 50+ electricity plans for your area.',
          accent: 'text-brand-green',
          bg: 'bg-brand-greenLight',
          numClr: 'text-brand-green/10',
        },
        {
          num: '03',
          Icon: CheckCircle,
          title: 'Switch & Save',
          desc: 'We handle all the paperwork and switching in 24 hours.',
          accent: 'text-brand-orange',
          bg: 'bg-brand-orangeLight',
          numClr: 'text-brand-orange/10',
        },
      ]

  return (
    <section id="how-it-works" className="min-h-screen bg-[#F8FAFC] flex items-center">
      <div ref={ref} className="max-w-6xl mx-auto px-6 lg:px-12 w-full py-24">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-20"
        >
          <h2 className="text-[clamp(2rem,5vw,4.5rem)] font-black text-brand-dark tracking-tight mb-4">
            {isVi ? 'Đơn Giản Như Thế Này' : 'As Simple As This'}
          </h2>
          <p className="text-xl text-brand-muted">
            {isVi ? 'Ba bước. Không cần kinh nghiệm.' : 'Three steps. No experience needed.'}
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-16">
          {steps.map(({ num, Icon, title, desc, accent, bg, numClr }, i) => (
            <motion.div
              key={num}
              initial={{ opacity: 0, y: 48 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.75, delay: 0.1 + i * 0.14, ease: [0.22, 1, 0.36, 1] }}
              className="relative bg-white rounded-3xl p-8 lg:p-10 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 overflow-hidden"
            >
              {/* Background number */}
              <div className={`absolute top-4 right-5 text-[5.5rem] font-black ${numClr} leading-none select-none pointer-events-none`}>
                {num}
              </div>

              {/* Icon */}
              <div className={`relative w-14 h-14 ${bg} rounded-2xl flex items-center justify-center mb-7`}>
                <Icon size={26} className={accent} />
              </div>

              <h3 className="text-xl font-black text-brand-dark mb-3">{title}</h3>
              <p className="text-brand-muted leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.55 }}
          className="text-center"
        >
          <Link href="/compare" className="btn-cta-lg">
            {isVi ? 'Bắt Đầu Ngay' : 'Get Started Now'}
            <ArrowRight size={18} />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
