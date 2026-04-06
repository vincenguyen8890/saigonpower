'use client'

import { useRef, useState } from 'react'
import { useLocale } from 'next-intl'
import { useRouter } from '@/i18n/navigation'
import { motion, useInView } from 'framer-motion'
import { ArrowRight, MapPin, Phone, Shield } from 'lucide-react'
import { isValidZip } from '@/lib/utils'

export default function FinalCTA() {
  const locale = useLocale()
  const router = useRouter()
  const [zip, setZip] = useState('')
  const [error, setError] = useState('')
  const isVi = locale === 'vi'
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValidZip(zip)) {
      setError(isVi ? 'ZIP không hợp lệ (5 chữ số)' : 'Invalid ZIP (5 digits)')
      return
    }
    setError('')
    router.push({ pathname: '/compare', query: { zip } } as Parameters<typeof router.push>[0])
  }

  return (
    <section className="min-h-screen bg-[#0F172A] flex items-center relative overflow-hidden">

      {/* Green atmospheric glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] rounded-full pointer-events-none opacity-[0.12]"
        style={{ background: 'radial-gradient(ellipse, rgba(0,200,83,1) 0%, transparent 65%)' }}
      />

      {/* Subtle grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />

      <div ref={ref} className="relative z-10 max-w-3xl mx-auto px-6 text-center py-24">

        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 36 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
          className="text-[clamp(2.5rem,6vw,5.5rem)] font-black text-white leading-[1.05] tracking-tight mb-6"
        >
          {isVi ? (
            <>
              Bắt Đầu<br />
              <span className="text-brand-green">Tiết Kiệm Hôm Nay</span>
            </>
          ) : (
            <>
              Start Saving<br />
              <span className="text-brand-green">Today</span>
            </>
          )}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-xl text-slate-400 mb-12 max-w-xl mx-auto leading-relaxed"
        >
          {isVi
            ? '500+ gia đình và doanh nghiệp người Việt đã tiết kiệm. Tư vấn 100% miễn phí.'
            : '500+ Vietnamese families and businesses already saving. 100% free consultation.'}
        </motion.p>

        {/* ZIP form */}
        <motion.form
          initial={{ opacity: 0, y: 18 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, delay: 0.18 }}
          onSubmit={handleSubmit}
          className="flex max-w-sm mx-auto mb-6"
        >
          <div className="relative flex-1">
            <MapPin size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            <input
              type="text"
              inputMode="numeric"
              value={zip}
              onChange={e => { setZip(e.target.value.replace(/\D/g, '')); setError('') }}
              placeholder={isVi ? 'Nhập ZIP code' : 'Enter ZIP code'}
              maxLength={5}
              className="w-full pl-10 pr-4 py-4 bg-white/8 border border-white/15 rounded-l-2xl text-white placeholder-slate-500 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-green/40 focus:border-brand-green/60 backdrop-blur-sm transition-all"
            />
          </div>
          <button
            type="submit"
            className="bg-brand-green hover:bg-brand-greenDark text-white font-bold px-6 py-4 rounded-r-2xl text-sm transition-all shadow-green hover:shadow-green-lg flex items-center gap-2 whitespace-nowrap hover:-translate-y-0.5 active:translate-y-0"
          >
            {isVi ? 'Kiểm Tra' : 'Check Savings'} <ArrowRight size={15} />
          </button>
        </motion.form>

        {error && <p className="text-red-400 text-sm mb-6">{error}</p>}

        {/* Divider + phone */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.35 }}
          className="flex items-center justify-center gap-5 mb-10"
        >
          <div className="h-px flex-1 max-w-[60px] bg-white/10" />
          <a
            href="tel:+18329379999"
            className="flex items-center gap-2 text-slate-500 hover:text-white text-sm font-medium transition-colors"
          >
            <Phone size={14} />
            (832) 937-9999
          </a>
          <div className="h-px flex-1 max-w-[60px] bg-white/10" />
        </motion.div>

        {/* Trust micro-copy */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.48 }}
          className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2"
        >
          {[
            isVi ? 'Dữ liệu bảo mật' : 'Your data is secure',
            isVi ? 'Tư vấn miễn phí' : 'Always free',
            isVi ? 'Không spam' : 'No spam, ever',
          ].map(item => (
            <span key={item} className="flex items-center gap-1.5 text-slate-600 text-xs">
              <Shield size={10} className="text-brand-green flex-shrink-0" />
              {item}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
