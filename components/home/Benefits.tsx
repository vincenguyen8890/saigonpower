'use client'

import { useRef } from 'react'
import { useLocale } from 'next-intl'
import { motion, useInView } from 'framer-motion'
import { TrendingDown, Lightbulb, Globe, Briefcase, Check, X } from 'lucide-react'

export default function Benefits() {
  const locale = useLocale()
  const isVi = locale === 'vi'
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  const benefits = [
    {
      icon: TrendingDown,
      gradient: 'from-blue-500/15 to-blue-700/5',
      border: 'border-blue-500/20',
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-400',
      glow: 'bg-blue-500',
      title: isVi ? 'Tiết Kiệm $200–$400/Năm' : 'Save $200–$400/Year',
      desc: isVi
        ? 'Khách hàng trung bình tiết kiệm $200–$400 mỗi năm khi chuyển qua Saigon Power.'
        : 'Our average customer saves $200–$400 per year after switching through Saigon Power.',
    },
    {
      icon: Lightbulb,
      gradient: 'from-amber-500/15 to-amber-700/5',
      border: 'border-amber-500/20',
      iconBg: 'bg-amber-500/10',
      iconColor: 'text-amber-400',
      glow: 'bg-amber-500',
      title: isVi ? 'Dễ Hiểu, Không Thuật Ngữ' : 'Plain Language, No Jargon',
      desc: isVi
        ? 'Giải thích rõ ràng bằng tiếng Việt. Không có thuật ngữ điện lực phức tạp.'
        : 'Clear explanations in Vietnamese. No confusing electricity industry jargon.',
    },
    {
      icon: Globe,
      gradient: 'from-green-500/15 to-green-700/5',
      border: 'border-green-500/20',
      iconBg: 'bg-green-500/10',
      iconColor: 'text-green-400',
      glow: 'bg-green-500',
      title: isVi ? 'Người Việt Phục Vụ Người Việt' : 'Vietnamese-Owned & Operated',
      desc: isVi
        ? 'Đội ngũ người Việt hiểu văn hóa, hiểu cộng đồng, và hiểu nhu cầu của bạn.'
        : 'Our team understands Vietnamese culture, community, and your specific needs.',
    },
    {
      icon: Briefcase,
      gradient: 'from-purple-500/15 to-purple-700/5',
      border: 'border-purple-500/20',
      iconBg: 'bg-purple-500/10',
      iconColor: 'text-purple-400',
      glow: 'bg-purple-500',
      title: isVi ? 'Chuyên Gia Thương Mại' : 'Commercial Specialists',
      desc: isVi
        ? 'Chuyên gia riêng cho tiệm nail, nhà hàng và doanh nghiệp nhỏ người Việt.'
        : 'Dedicated experts for Vietnamese nail salons, restaurants, and small businesses.',
    },
  ]

  const comparison = [
    { feature: isVi ? 'Hỗ trợ tiếng Việt'        : 'Vietnamese support',         saigon: true,  ogre: false },
    { feature: isVi ? 'Không phí đăng ký'          : 'No subscription fee',        saigon: true,  ogre: false },
    { feature: isVi ? 'Bạn chọn nhà cung cấp'      : 'You choose the provider',    saigon: true,  ogre: false },
    { feature: isVi ? 'So sánh minh bạch'           : 'Transparent comparison',     saigon: true,  ogre: false },
    { feature: isVi ? 'Nhắc gia hạn tự động'        : 'Automatic renewal reminders',saigon: true,  ogre: true  },
    { feature: isVi ? 'Tư vấn thương mại'           : 'Commercial consulting',      saigon: true,  ogre: false },
    { feature: isVi ? 'Không phí ẩn'                : 'No hidden fees',             saigon: true,  ogre: false },
  ]

  return (
    <section className="py-28 bg-[#03080E] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-green/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-gold/4 rounded-full blur-[80px] pointer-events-none" />

      <div ref={ref} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 bg-white/[0.05] border border-white/[0.08] rounded-full px-4 py-1.5 mb-5">
            <div className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-pulse" />
            <span className="text-white/50 text-sm font-medium uppercase tracking-widest">
              {isVi ? 'Tại Sao Chọn Chúng Tôi' : 'Why Choose Us'}
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
            {isVi ? 'Lợi Ích Vượt Trội' : 'Unmatched Advantages'}
          </h2>
        </motion.div>

        {/* Benefit cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 mb-20">
          {benefits.map(({ icon: Icon, gradient, border, iconBg, iconColor, glow, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className={`relative bg-gradient-to-br ${gradient} border ${border} rounded-3xl p-6 group hover:-translate-y-2 transition-transform duration-300 overflow-hidden`}
            >
              <div className="relative mb-5 w-fit">
                <div className={`w-12 h-12 rounded-2xl ${iconBg} border ${border} flex items-center justify-center`}>
                  <Icon size={20} className={iconColor} />
                </div>
                <div className={`absolute inset-0 ${glow}/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity`} />
              </div>
              <h3 className="text-white font-bold text-base mb-2 leading-snug">{title}</h3>
              <p className="text-white/40 text-sm leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Comparison table */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="bg-white/[0.03] border border-white/[0.07] rounded-3xl overflow-hidden"
        >
          {/* Table header */}
          <div className="grid grid-cols-3 border-b border-white/[0.07] px-6 py-4">
            <div className="text-white/40 text-sm font-medium">{isVi ? 'Tính năng' : 'Feature'}</div>
            <div className="text-center">
              <span className="text-brand-green text-sm font-bold">Saigon Power</span>
            </div>
            <div className="text-center">
              <span className="text-white/30 text-sm font-medium">Energy Ogre</span>
            </div>
          </div>

          {comparison.map(({ feature, saigon, ogre }, i) => (
            <div
              key={feature}
              className={`grid grid-cols-3 px-6 py-3.5 ${i % 2 === 0 ? 'bg-white/[0.01]' : ''} border-b border-white/[0.04] last:border-0`}
            >
              <div className="text-white/55 text-sm">{feature}</div>
              <div className="flex justify-center">
                {saigon
                  ? <div className="w-6 h-6 rounded-full bg-brand-green/15 border border-brand-green/30 flex items-center justify-center"><Check size={12} className="text-brand-green" /></div>
                  : <div className="w-6 h-6 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center"><X size={12} className="text-red-400" /></div>}
              </div>
              <div className="flex justify-center">
                {ogre
                  ? <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center"><Check size={12} className="text-white/40" /></div>
                  : <div className="w-6 h-6 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center"><X size={12} className="text-red-400/60" /></div>}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
