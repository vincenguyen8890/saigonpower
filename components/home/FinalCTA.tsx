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
    if (!isValidZip(zip)) {
      setError(isVi ? 'ZIP không hợp lệ (5 chữ số)' : 'Invalid ZIP (5 digits)')
      return
    }
    router.push({ pathname: '/compare', query: { zip } } as Parameters<typeof router.push>[0])
  }

  return (
    <section className="py-28 bg-[#03080E] relative overflow-hidden">
      {/* Radial background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_50%,rgba(22,163,74,0.12),transparent)] pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.025]"
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.4) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      {/* Top border glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-px bg-gradient-to-r from-transparent via-brand-green/50 to-transparent" />

      <div ref={ref} className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">

        {/* Stars */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-center gap-1.5 mb-6"
        >
          {[1,2,3,4,5].map(i => (
            <Star key={i} size={18} className="text-brand-gold fill-brand-gold" />
          ))}
          <span className="text-white/40 text-sm ml-2">
            {isVi ? '4.9/5 · 200+ đánh giá Google' : '4.9/5 · 200+ Google reviews'}
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.05] tracking-tight mb-5"
        >
          {isVi ? (
            <>
              Sẵn Sàng<br />
              <span className="bg-gradient-to-r from-brand-green via-green-400 to-brand-greenBright bg-clip-text text-transparent">
                Tiết Kiệm Tiền Điện?
              </span>
            </>
          ) : (
            <>
              Ready to<br />
              <span className="bg-gradient-to-r from-brand-green via-green-400 to-brand-greenBright bg-clip-text text-transparent">
                Save on Electricity?
              </span>
            </>
          )}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-white/45 text-lg sm:text-xl mb-10 max-w-2xl mx-auto leading-relaxed"
        >
          {isVi
            ? 'Hơn 500 gia đình và doanh nghiệp người Việt đã tiết kiệm được. Tư vấn 100% miễn phí, không ràng buộc.'
            : 'Over 500 Vietnamese families and businesses have already saved. 100% free, no commitment.'}
        </motion.p>

        {/* ZIP Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          onSubmit={handleSubmit}
          className="max-w-lg mx-auto mb-6"
        >
          <div className="flex flex-col sm:flex-row gap-3 p-1.5 bg-white/[0.05] border border-white/[0.1] rounded-2xl">
            <div className="flex-1 relative">
              <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" />
              <input
                type="text"
                inputMode="numeric"
                value={zip}
                onChange={(e) => { setZip(e.target.value.replace(/\D/g, '')); setError('') }}
                placeholder={isVi ? 'Nhập mã ZIP...' : 'Enter ZIP code...'}
                maxLength={5}
                className="w-full pl-10 pr-3 py-3.5 rounded-xl bg-transparent text-white placeholder-white/25 text-base focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="sm:shrink-0 bg-brand-green hover:bg-brand-greenBright text-white font-bold py-3.5 px-7 rounded-xl text-base transition-all flex items-center justify-center gap-2 whitespace-nowrap hover:shadow-[0_0_20px_rgba(34,197,94,0.4)]"
            >
              <Zap size={16} className="fill-white" />
              {isVi ? 'Xem Gói Ngay' : 'View Plans Now'}
            </button>
          </div>
          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        </motion.form>

        {/* OR */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.45 }}
          className="flex items-center justify-center gap-4 mb-6"
        >
          <div className="h-px w-12 bg-white/10" />
          <span className="text-white/25 text-xs uppercase tracking-widest">{isVi ? 'hoặc' : 'or'}</span>
          <div className="h-px w-12 bg-white/10" />
        </motion.div>

        {/* Phone + Quote */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
        >
          <a
            href="tel:+18329379999"
            className="flex items-center gap-2.5 bg-white/[0.06] border border-white/[0.1] hover:border-brand-green/40 text-white font-semibold px-6 py-3 rounded-2xl transition-all text-sm hover:bg-white/[0.1]"
          >
            <Phone size={15} className="text-brand-gold" />
            {isVi ? 'Gọi (832) 937-9999' : 'Call (832) 937-9999'}
          </a>
          <Link
            href="/quote"
            className="flex items-center gap-1.5 text-white/40 hover:text-brand-green transition-colors text-sm font-medium"
          >
            {isVi ? 'Điền form báo giá' : 'Fill out quote form'}
            <ArrowRight size={14} />
          </Link>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-x-7 gap-y-3"
        >
          {[
            isVi ? 'Thông tin bảo mật tuyệt đối' : 'Your data is fully secure',
            isVi ? 'Tư vấn miễn phí'             : 'Always free consultation',
            isVi ? 'Không spam'                   : 'No spam, ever',
          ].map(item => (
            <span key={item} className="flex items-center gap-1.5 text-white/30 text-xs">
              <Shield size={11} className="text-brand-green/60" />
              {item}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
