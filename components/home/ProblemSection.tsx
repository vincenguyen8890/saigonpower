'use client'

import { useRef, useEffect } from 'react'
import { useLocale } from 'next-intl'
import { motion, useInView, animate } from 'framer-motion'
import { TrendingUp } from 'lucide-react'

function RisingRate({ inView }: { inView: boolean }) {
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    if (!inView || !ref.current) return
    const ctrl = animate(8.2, 16.4, {
      duration: 2.8,
      ease: 'easeOut',
      onUpdate(v) {
        if (ref.current) ref.current.textContent = v.toFixed(1) + '¢'
      },
    })
    return ctrl.stop
  }, [inView])
  return <span ref={ref}>8.2¢</span>
}

export default function ProblemSection() {
  const locale = useLocale()
  const isVi = locale === 'vi'
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="min-h-screen bg-[#0F172A] flex items-center relative overflow-hidden">

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />

      {/* Orange atmospheric glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full opacity-[0.08] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(255,109,0,1) 0%, transparent 70%)' }}
      />

      <div ref={ref} className="relative z-10 max-w-5xl mx-auto px-6 lg:px-12 text-center py-24">

        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 bg-brand-orange/10 border border-brand-orange/25 text-brand-orange text-xs font-bold uppercase tracking-widest rounded-full px-4 py-2 mb-10"
        >
          <TrendingUp size={12} />
          {isVi ? 'Thực Tế Đáng Lo' : 'The Hidden Problem'}
        </motion.div>

        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 36 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.85, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="text-[clamp(2.5rem,6vw,5rem)] font-black text-white leading-[1.08] tracking-tight mb-6"
        >
          {isVi ? (
            <>
              Bạn Đang Trả<br />
              <span className="text-brand-orange">Quá Nhiều</span><br />
              Tiền Điện
            </>
          ) : (
            <>
              You&apos;re Likely<br />
              <span className="text-brand-orange">Overpaying</span><br />
              for Electricity
            </>
          )}
        </motion.h2>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.18 }}
          className="text-xl text-slate-400 max-w-2xl mx-auto mb-16 leading-relaxed"
        >
          {isVi
            ? 'Giá điện Texas thay đổi liên tục. Hầu hết mọi người không biết mình đang trả giá quá cao.'
            : "Electricity rates in Texas change constantly. Most people don't realize they're on an overpriced plan."}
        </motion.p>

        {/* Animated rate card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={inView ? { opacity: 1, scale: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="inline-flex flex-col items-center bg-white/5 border border-white/10 rounded-3xl px-12 py-10 backdrop-blur-sm"
        >
          <div className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-3">
            {isVi ? 'Giá điện phổ biến tại Texas' : 'Common Texas electricity rate'}
          </div>
          <div className="text-[clamp(3.5rem,8vw,6.5rem)] font-black text-white leading-none tabular-nums">
            <RisingRate inView={inView} />
          </div>
          <div className="text-slate-500 text-sm mt-2 mb-6">
            {isVi ? 'mỗi kWh — nhiều người đang trả 15–18¢' : 'per kWh — many are paying 15–18¢'}
          </div>
          <div className="flex items-center gap-2 text-brand-orange text-sm font-bold">
            <TrendingUp size={15} />
            {isVi ? 'Giá đang tăng liên tục' : 'Rates keep rising'}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
