'use client'

import { useRef } from 'react'
import { useLocale } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { motion, useInView } from 'framer-motion'
import { Home, Scissors, ChefHat, Briefcase, ArrowRight } from 'lucide-react'

export default function WhoWeHelp() {
  const locale = useLocale()
  const isVi = locale === 'vi'
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  const segments = [
    {
      icon: Home,
      gradient: 'from-blue-500/15 to-blue-700/5',
      border: 'border-blue-500/20',
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-400',
      hoverBorder: 'hover:border-blue-500/40',
      badge: isVi ? 'Phổ biến nhất' : 'Most popular',
      badgeColor: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
      title: isVi ? 'Nhà Ở' : 'Homeowners',
      desc: isVi
        ? 'Gói cố định 12–24 tháng tiết kiệm nhất cho gia đình. Không phí chuyển đổi.'
        : 'Fixed-rate 12–24 month plans for maximum savings. No switching fees.',
      href: '/residential',
    },
    {
      icon: Scissors,
      gradient: 'from-rose-500/15 to-rose-700/5',
      border: 'border-rose-500/20',
      iconBg: 'bg-rose-500/10',
      iconColor: 'text-rose-400',
      hoverBorder: 'hover:border-rose-500/40',
      badge: isVi ? 'Tư vấn riêng' : 'Specialized',
      badgeColor: 'bg-rose-500/15 text-rose-400 border-rose-500/20',
      title: isVi ? 'Tiệm Nail & Spa' : 'Nail Salons & Spas',
      desc: isVi
        ? 'Hiểu chi phí vận hành tiệm nail. Tư vấn đặc biệt cho chủ tiệm người Việt.'
        : 'We understand nail salon operating costs. Specialized advice for Vietnamese owners.',
      href: '/commercial',
    },
    {
      icon: ChefHat,
      gradient: 'from-amber-500/15 to-amber-700/5',
      border: 'border-amber-500/20',
      iconBg: 'bg-amber-500/10',
      iconColor: 'text-amber-400',
      hoverBorder: 'hover:border-amber-500/40',
      badge: isVi ? 'Thương mại' : 'Commercial',
      badgeColor: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
      title: isVi ? 'Nhà Hàng & Quán Ăn' : 'Restaurants',
      desc: isVi
        ? 'Gói thương mại tùy chỉnh. Tiết kiệm hàng trăm đô la mỗi tháng cho nhà hàng.'
        : 'Custom commercial plans. Save hundreds per month on your restaurant electric bill.',
      href: '/commercial',
    },
    {
      icon: Briefcase,
      gradient: 'from-purple-500/15 to-purple-700/5',
      border: 'border-purple-500/20',
      iconBg: 'bg-purple-500/10',
      iconColor: 'text-purple-400',
      hoverBorder: 'hover:border-purple-500/40',
      badge: isVi ? 'Doanh nghiệp' : 'Business',
      badgeColor: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
      title: isVi ? 'Doanh Nghiệp Nhỏ' : 'Small Businesses',
      desc: isVi
        ? 'So sánh gói điện thương mại, ký hợp đồng dài hạn và tiết kiệm ngay từ tháng đầu.'
        : 'Compare commercial plans, sign long-term contracts, save from month one.',
      href: '/commercial',
    },
  ]

  return (
    <section className="py-28 bg-[#03080E] relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_100%,rgba(22,163,74,0.06),transparent)] pointer-events-none" />

      <div ref={ref} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-white/[0.05] border border-white/[0.08] rounded-full px-4 py-1.5 mb-5">
            <div className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse" />
            <span className="text-white/50 text-sm font-medium uppercase tracking-widest">
              {isVi ? 'Đối Tượng Phục Vụ' : 'Who We Serve'}
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-4">
            {isVi ? 'Chúng Tôi Phục Vụ Ai?' : 'Who We Help'}
          </h2>
          <p className="text-white/40 text-lg max-w-2xl mx-auto">
            {isVi
              ? 'Giải pháp điện cho mọi nhu cầu của cộng đồng người Việt tại Texas'
              : 'Electricity solutions for every need in the Vietnamese-American community'}
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {segments.map(({ icon: Icon, gradient, border, iconBg, iconColor, hoverBorder, badge, badgeColor, title, desc, href }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link
                href={href}
                className={`group flex flex-col h-full bg-gradient-to-br ${gradient} border ${border} ${hoverBorder} rounded-3xl p-6 hover:-translate-y-2 transition-all duration-300`}
              >
                <div className="flex items-start justify-between mb-5">
                  <div className={`w-12 h-12 ${iconBg} border ${border} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <Icon size={20} className={iconColor} />
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-xl border font-semibold ${badgeColor}`}>{badge}</span>
                </div>

                <h3 className="font-bold text-white text-lg mb-2 leading-tight">{title}</h3>
                <p className="text-white/45 text-sm leading-relaxed flex-1">{desc}</p>

                <div className={`flex items-center gap-1.5 ${iconColor} font-semibold text-sm mt-5 group-hover:gap-3 transition-all`}>
                  {isVi ? 'Tìm hiểu thêm' : 'Learn more'}
                  <ArrowRight size={14} />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
