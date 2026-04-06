'use client'

import { useRef } from 'react'
import { useLocale } from 'next-intl'
import { motion, useInView } from 'framer-motion'
import { Link } from '@/i18n/navigation'
import { ArrowRight } from 'lucide-react'

export default function SavingsImpact() {
  const locale = useLocale()
  const isVi = locale === 'vi'
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="min-h-screen bg-white flex items-center relative overflow-hidden">
      {/* Subtle green ambient glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(0,200,83,0.07) 0%, transparent 65%)' }}
      />

      <div ref={ref} className="relative z-10 max-w-4xl mx-auto px-6 text-center py-24">

        {/* Label */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55 }}
          className="text-brand-muted text-sm font-bold uppercase tracking-[0.2em] mb-6"
        >
          {isVi ? 'Tiết kiệm trung bình mỗi tháng' : 'Average monthly savings'}
        </motion.div>

        {/* Big number */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.9, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="text-[clamp(5rem,16vw,13rem)] font-black text-brand-green leading-none tracking-tighter mb-2"
        >
          $50–150
        </motion.div>

        {/* Per month label */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.22 }}
          className="text-[clamp(1.5rem,3.5vw,2.5rem)] font-black text-brand-dark mb-6 tracking-tight"
        >
          {isVi ? 'mỗi tháng' : 'per month'}
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.32 }}
          className="text-xl text-brand-muted mb-12 max-w-lg mx-auto leading-relaxed"
        >
          {isVi
            ? 'Khách hàng Saigon Power tiết kiệm trung bình $50 đến $150 mỗi tháng so với gói điện cũ'
            : 'Saigon Power customers save an average of $50 to $150 every single month compared to their old plan'}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.42 }}
        >
          <Link href="/compare" className="btn-cta-lg">
            {isVi ? 'Kiểm Tra Tiết Kiệm Của Tôi' : 'Check My Savings'}
            <ArrowRight size={18} />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
