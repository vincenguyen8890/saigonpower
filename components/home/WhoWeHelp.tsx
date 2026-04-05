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
      iconBg:   'bg-brand-blueLight',
      iconColor:'text-brand-blue',
      border:   'hover:border-brand-blue/40',
      badge: isVi ? 'Phổ biến nhất' : 'Most popular',
      badgeClass: 'badge-blue',
      arrowColor: 'text-brand-blue',
      title: isVi ? 'Nhà Ở' : 'Homeowners',
      desc:  isVi
        ? 'Gói cố định 12–24 tháng tiết kiệm nhất cho gia đình. Không phí chuyển đổi.'
        : 'Fixed-rate 12–24 month plans for maximum savings. No switching fees.',
      href: '/residential',
      savingsHint: isVi ? 'Tiết kiệm $200+/năm' : 'Save $200+/year',
    },
    {
      icon: Scissors,
      iconBg:   'bg-brand-greenLight',
      iconColor:'text-brand-green',
      border:   'hover:border-brand-green/40',
      badge: isVi ? 'Tư vấn riêng' : 'Specialized',
      badgeClass: 'badge-green',
      arrowColor: 'text-brand-green',
      title: isVi ? 'Tiệm Nail & Spa' : 'Nail Salons & Spas',
      desc:  isVi
        ? 'Hiểu chi phí vận hành tiệm nail. Tư vấn đặc biệt cho chủ tiệm người Việt.'
        : 'We understand nail salon operating costs. Specialized advice for Vietnamese owners.',
      href: '/commercial',
      savingsHint: isVi ? 'Tiết kiệm $80+/tháng' : 'Save $80+/month',
    },
    {
      icon: ChefHat,
      iconBg:   'bg-brand-orangeLight',
      iconColor:'text-brand-orange',
      border:   'hover:border-brand-orange/40',
      badge: isVi ? 'Thương mại' : 'Commercial',
      badgeClass: 'badge-orange',
      arrowColor: 'text-brand-orange',
      title: isVi ? 'Nhà Hàng & Quán Ăn' : 'Restaurants',
      desc:  isVi
        ? 'Gói thương mại tùy chỉnh. Tiết kiệm hàng trăm đô la mỗi tháng cho nhà hàng.'
        : 'Custom commercial plans. Save hundreds per month on your restaurant electric bill.',
      href: '/commercial',
      savingsHint: isVi ? 'Tiết kiệm $100+/tháng' : 'Save $100+/month',
    },
    {
      icon: Briefcase,
      iconBg:   'bg-brand-blueLight',
      iconColor:'text-brand-blue',
      border:   'hover:border-brand-blue/40',
      badge: isVi ? 'Doanh nghiệp' : 'Business',
      badgeClass: 'badge-blue',
      arrowColor: 'text-brand-blue',
      title: isVi ? 'Doanh Nghiệp Nhỏ' : 'Small Businesses',
      desc:  isVi
        ? 'So sánh gói điện thương mại, ký hợp đồng dài hạn và tiết kiệm ngay từ tháng đầu.'
        : 'Compare commercial plans, sign long-term contracts, save from month one.',
      href: '/commercial',
      savingsHint: isVi ? 'Tiết kiệm $150+/tháng' : 'Save $150+/month',
    },
  ]

  return (
    <section className="py-24 bg-surface-bg">
      <div ref={ref} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <div className="section-eyebrow mx-auto w-fit mb-4">
            <Home size={12} /> {isVi ? 'Đối Tượng Phục Vụ' : 'Who We Serve'}
          </div>
          <h2 className="section-title mb-3">
            {isVi ? 'Chúng Tôi Phục Vụ Ai?' : 'Who We Help'}
          </h2>
          <p className="section-sub max-w-2xl mx-auto">
            {isVi
              ? 'Giải pháp điện cho mọi nhu cầu của cộng đồng người Việt tại Texas'
              : 'Electricity solutions for every need in the Vietnamese-American community'}
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {segments.map(({ icon: Icon, iconBg, iconColor, border, badge, badgeClass, arrowColor, title, desc, href, savingsHint }, i) => (
            <motion.div key={title}
              initial={{ opacity: 0, y: 32 }} animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, delay: 0.1 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link href={href}
                className={`group card card-hover flex flex-col h-full p-6 border border-surface-border ${border} transition-all block`}>
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <Icon size={20} className={iconColor} />
                  </div>
                  <span className={badgeClass}>{badge}</span>
                </div>

                <h3 className="font-bold text-brand-dark text-base mb-2 leading-tight">{title}</h3>
                <p className="text-brand-muted text-sm leading-relaxed flex-1">{desc}</p>

                {/* Savings hint */}
                <div className="mt-4 pt-4 border-t border-surface-border">
                  <div className="flex items-center justify-between">
                    <span className="savings-number text-sm">{savingsHint}</span>
                    <div className={`flex items-center gap-1 ${arrowColor} font-semibold text-xs group-hover:gap-2 transition-all`}>
                      {isVi ? 'Xem thêm' : 'Learn more'} <ArrowRight size={13} />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
