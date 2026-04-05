'use client'

import { useRef, useState } from 'react'
import { useLocale } from 'next-intl'
import { useRouter } from '@/i18n/navigation'
import { Link } from '@/i18n/navigation'
import { motion, useInView } from 'framer-motion'
import { Phone, ArrowRight, Shield, MapPin, Zap, Star } from 'lucide-react'
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
    if (!isValidZip(zip)) { setError(isVi ? 'ZIP không hợp lệ (5 chữ số)' : 'Invalid ZIP (5 digits)'); return }
    router.push({ pathname: '/compare', query: { zip } } as Parameters<typeof router.push>[0])
  }

  return (
    <section className="py-24 bg-white">
      <div ref={ref} className="max-w-4xl mx-auto px-4 sm:px-6 text-center">

        {/* Stars */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5 }}
          className="flex items-center justify-center gap-1.5 mb-5">
          {[1,2,3,4,5].map(i => <Star key={i} size={18} className="text-yellow-400 fill-yellow-400" />)}
          <span className="text-brand-muted text-sm ml-1.5">
            {isVi ? '4.9/5 · 200+ đánh giá Google' : '4.9/5 · 200+ Google reviews'}
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h2 initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="text-5xl sm:text-6xl font-black leading-tight tracking-tight mb-4">
          <span className="text-brand-dark">{isVi ? 'Sẵn Sàng ' : 'Ready to '}</span>
          <span className="gradient-text-hero">{isVi ? 'Tiết Kiệm Tiền Điện?' : 'Save on Electricity?'}</span>
        </motion.h2>

        <motion.p initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="section-sub mb-10 max-w-2xl mx-auto">
          {isVi
            ? 'Hơn 500 gia đình và doanh nghiệp người Việt đã tiết kiệm được. Tư vấn 100% miễn phí, không ràng buộc.'
            : 'Over 500 Vietnamese families and businesses have already saved. 100% free, no commitment.'}
        </motion.p>

        {/* ZIP Form — pill style */}
        <motion.form initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.15 }}
          onSubmit={handleSubmit}
          className="max-w-lg mx-auto mb-5"
        >
          <div className="flex flex-col sm:flex-row gap-3 p-1.5 bg-white border-2 border-surface-border hover:border-brand-green/40 rounded-2xl shadow-card transition-all focus-within:border-brand-green/60 focus-within:shadow-green">
            <div className="flex-1 relative">
              <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none" />
              <input
                type="text" inputMode="numeric"
                value={zip}
                onChange={e => { setZip(e.target.value.replace(/\D/g, '')); setError('') }}
                placeholder={isVi ? 'Nhập mã ZIP...' : 'Enter ZIP code...'}
                maxLength={5}
                className="w-full pl-9 pr-3 py-3 rounded-xl bg-transparent text-brand-dark placeholder-brand-subtle text-base focus:outline-none font-medium"
              />
            </div>
            <button type="submit"
              className="sm:shrink-0 bg-brand-green hover:bg-brand-greenDark text-white font-bold py-3 px-7 rounded-xl transition-all flex items-center justify-center gap-2 whitespace-nowrap shadow-green hover:shadow-green-lg hover:-translate-y-0.5">
              <Zap size={15} className="fill-white" />
              {isVi ? 'Xem Gói Ngay' : 'View Plans Now'}
            </button>
          </div>
          {error && <p className="text-red-500 text-sm mt-2 font-medium">{error}</p>}
        </motion.form>

        {/* OR divider */}
        <motion.div initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0.3 }}
          className="flex items-center justify-center gap-4 mb-5">
          <div className="h-px w-14 bg-surface-border" />
          <span className="text-brand-muted text-xs uppercase tracking-widest">{isVi ? 'hoặc' : 'or'}</span>
          <div className="h-px w-14 bg-surface-border" />
        </motion.div>

        {/* Phone + quote links */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.35 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
          <a href="tel:+18329379999"
            className="flex items-center gap-2.5 border border-surface-border hover:border-brand-green text-brand-dark font-semibold px-6 py-3 rounded-2xl transition-all text-sm bg-white hover:bg-brand-greenLight hover:text-brand-green">
            <Phone size={15} className="text-brand-blue" />
            {isVi ? 'Gọi (832) 937-9999' : 'Call (832) 937-9999'}
          </a>
          <Link href="/quote" className="btn-ghost font-semibold">
            {isVi ? 'Điền form báo giá' : 'Fill out quote form'} <ArrowRight size={14} />
          </Link>
        </motion.div>

        {/* Trust badges */}
        <motion.div initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0.45 }}
          className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {[
            isVi ? 'Thông tin bảo mật tuyệt đối' : 'Your data is fully secure',
            isVi ? 'Tư vấn miễn phí'             : 'Always free consultation',
            isVi ? 'Không spam'                   : 'No spam, ever',
          ].map(item => (
            <span key={item} className="flex items-center gap-1.5 text-brand-muted text-xs">
              <Shield size={11} className="text-brand-green" />
              {item}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
