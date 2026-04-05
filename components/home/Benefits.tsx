'use client'

import { useRef } from 'react'
import { useLocale } from 'next-intl'
import { motion, useInView } from 'framer-motion'
import { TrendingDown, Lightbulb, Globe, Briefcase, Check, X, Zap } from 'lucide-react'

export default function Benefits() {
  const locale = useLocale()
  const isVi = locale === 'vi'
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  const benefits = [
    {
      icon: TrendingDown, iconBg: 'bg-brand-greenLight', iconColor: 'text-brand-green',
      title: isVi ? 'Tiết Kiệm $200–$400/Năm'       : 'Save $200–$400/Year',
      desc:  isVi ? 'Khách hàng trung bình tiết kiệm $200–$400 mỗi năm khi chuyển qua Saigon Power.'
                  : 'Our average customer saves $200–$400 per year after switching through Saigon Power.',
      highlight: true,
    },
    {
      icon: Lightbulb, iconBg: 'bg-brand-blueLight', iconColor: 'text-brand-blue',
      title: isVi ? 'Dễ Hiểu, Không Thuật Ngữ'       : 'Plain Language, No Jargon',
      desc:  isVi ? 'Giải thích rõ ràng bằng tiếng Việt. Không có thuật ngữ điện lực phức tạp.'
                  : 'Clear explanations in Vietnamese. No confusing electricity industry jargon.',
      highlight: false,
    },
    {
      icon: Globe, iconBg: 'bg-brand-greenLight', iconColor: 'text-brand-green',
      title: isVi ? 'Người Việt Phục Vụ Người Việt'  : 'Vietnamese-Owned & Operated',
      desc:  isVi ? 'Đội ngũ người Việt hiểu văn hóa, hiểu cộng đồng, và hiểu nhu cầu của bạn.'
                  : 'Our team understands Vietnamese culture, community, and your specific needs.',
      highlight: false,
    },
    {
      icon: Briefcase, iconBg: 'bg-brand-blueLight', iconColor: 'text-brand-blue',
      title: isVi ? 'Chuyên Gia Thương Mại'           : 'Commercial Specialists',
      desc:  isVi ? 'Chuyên gia riêng cho tiệm nail, nhà hàng và doanh nghiệp nhỏ người Việt.'
                  : 'Dedicated experts for Vietnamese nail salons, restaurants, and small businesses.',
      highlight: false,
    },
  ]

  const comparison = [
    { feature: isVi ? 'Hỗ trợ tiếng Việt'         : 'Vietnamese support',          saigon: true,  ogre: false },
    { feature: isVi ? 'Không phí đăng ký'           : 'No subscription fee',         saigon: true,  ogre: false },
    { feature: isVi ? 'Bạn chọn nhà cung cấp'       : 'You choose the provider',     saigon: true,  ogre: false },
    { feature: isVi ? 'So sánh minh bạch'            : 'Transparent comparison',      saigon: true,  ogre: false },
    { feature: isVi ? 'Nhắc gia hạn tự động'         : 'Automatic renewal reminders', saigon: true,  ogre: true  },
    { feature: isVi ? 'Tư vấn thương mại'            : 'Commercial consulting',        saigon: true,  ogre: false },
    { feature: isVi ? 'Không phí ẩn'                 : 'No hidden fees',              saigon: true,  ogre: false },
  ]

  return (
    <section className="py-24 bg-surface-bg">
      <div ref={ref} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="section-eyebrow mx-auto w-fit mb-4">
            <Zap size={12} /> {isVi ? 'Tại Sao Chọn Chúng Tôi' : 'Why Choose Us'}
          </div>
          <h2 className="section-title mb-3">{isVi ? 'Lợi Ích Vượt Trội' : 'Unmatched Advantages'}</h2>
        </motion.div>

        {/* Benefit cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
          {benefits.map(({ icon: Icon, iconBg, iconColor, title, desc, highlight }, i) => (
            <motion.div key={title}
              initial={{ opacity: 0, y: 32 }} animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, delay: 0.1 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className={`card card-hover p-6 ${highlight ? 'border-brand-green/30 ring-1 ring-brand-green/20' : ''}`}
            >
              <div className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center mb-4`}>
                <Icon size={20} className={iconColor} />
              </div>
              <h3 className={`font-bold text-base mb-2 leading-tight ${highlight ? 'text-brand-green' : 'text-brand-dark'}`}>
                {title}
              </h3>
              <p className="text-brand-muted text-sm leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Comparison table */}
        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <h3 className="text-center text-xl font-bold text-brand-dark mb-6">
            {isVi ? 'So Sánh Với Energy Ogre' : 'How We Compare to Energy Ogre'}
          </h3>
          <div className="card overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-3 bg-surface-bg border-b border-surface-border px-6 py-4">
              <div className="text-brand-muted text-xs font-semibold uppercase tracking-wide">
                {isVi ? 'Tính năng' : 'Feature'}
              </div>
              <div className="text-center">
                <span className="text-xs font-bold text-brand-green uppercase tracking-wide">Saigon Power</span>
              </div>
              <div className="text-center">
                <span className="text-xs font-medium text-brand-muted uppercase tracking-wide">Energy Ogre</span>
              </div>
            </div>

            {comparison.map(({ feature, saigon, ogre }, i) => (
              <div key={feature}
                className={`grid grid-cols-3 px-6 py-3.5 border-b border-surface-border last:border-0 ${i % 2 === 0 ? '' : 'bg-surface-bg/50'}`}>
                <div className="text-brand-dark text-sm">{feature}</div>
                <div className="flex justify-center">
                  {saigon
                    ? <div className="w-6 h-6 rounded-full bg-brand-greenLight border border-brand-greenBorder flex items-center justify-center">
                        <Check size={12} className="text-brand-green" />
                      </div>
                    : <div className="w-6 h-6 rounded-full bg-red-50 border border-red-100 flex items-center justify-center">
                        <X size={12} className="text-red-400" />
                      </div>}
                </div>
                <div className="flex justify-center">
                  {ogre
                    ? <div className="w-6 h-6 rounded-full bg-surface-muted border border-surface-border flex items-center justify-center">
                        <Check size={12} className="text-brand-muted" />
                      </div>
                    : <div className="w-6 h-6 rounded-full bg-red-50 border border-red-100 flex items-center justify-center">
                        <X size={12} className="text-red-400" />
                      </div>}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
