'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { useLocale } from 'next-intl'
import { useRouter } from '@/i18n/navigation'
import { Link } from '@/i18n/navigation'
import { motion } from 'framer-motion'
import { ArrowRight, ChevronDown, MapPin, Zap } from 'lucide-react'
import { isValidZip } from '@/lib/utils'

const HeroScene = dynamic(() => import('@/components/3d/HeroScene'), { ssr: false })

export default function Hero() {
  const locale = useLocale()
  const router = useRouter()
  const [zip, setZip] = useState('')
  const [error, setError] = useState('')
  const isVi = locale === 'vi'

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValidZip(zip)) {
      setError(isVi ? 'Vui lòng nhập ZIP hợp lệ (5 chữ số)' : 'Please enter a valid 5-digit ZIP')
      return
    }
    setError('')
    router.push({ pathname: '/compare', query: { zip } } as Parameters<typeof router.push>[0])
  }

  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden bg-white">
      {/* Atmospheric gradients */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[700px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(ellipse, rgba(41,121,255,0.3) 0%, transparent 65%)' }}
        />
        <div
          className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, rgba(0,200,83,0.3) 0%, transparent 70%)' }}
        />
      </div>

      {/* Main grid */}
      <div className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-6 lg:px-12 grid lg:grid-cols-[1fr_1.15fr] gap-8 items-center pt-28 pb-16">

        {/* Left: content */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="text-[clamp(2.8rem,5vw,5rem)] font-black text-brand-dark leading-[1.05] tracking-tight mb-6">
              {isVi ? (
                <>
                  Giảm Hóa Đơn Điện<br />
                  <span className="gradient-text-hero">Mỗi Tháng</span>
                </>
              ) : (
                <>
                  Lower Your<br />
                  Electricity Bill<br />
                  <span className="gradient-text-hero">Every Month</span>
                </>
              )}
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            className="text-xl text-brand-muted leading-relaxed mb-10 max-w-[420px]"
          >
            {isVi
              ? 'Saigon Power tìm gói điện tốt nhất cho bạn tại Texas. Hoàn toàn miễn phí.'
              : 'Saigon Power finds the best electricity plan for you in Texas. Completely free.'}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.22 }}
            className="space-y-4"
          >
            {/* ZIP form */}
            <form onSubmit={handleSubmit} className="flex max-w-sm">
              <div className="relative flex-1">
                <MapPin size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none" />
                <input
                  type="text"
                  inputMode="numeric"
                  value={zip}
                  onChange={e => { setZip(e.target.value.replace(/\D/g, '')); setError('') }}
                  placeholder={isVi ? 'Nhập ZIP code' : 'Enter ZIP code'}
                  maxLength={5}
                  className="w-full pl-10 pr-4 py-4 border border-gray-200 rounded-l-2xl bg-white text-brand-dark placeholder-brand-subtle text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green shadow-sm transition-all"
                />
              </div>
              <button
                type="submit"
                className="bg-brand-green hover:bg-brand-greenDark text-white font-bold px-6 py-4 rounded-r-2xl text-sm transition-all shadow-green hover:shadow-green-lg flex items-center gap-2 whitespace-nowrap hover:-translate-y-0.5 active:translate-y-0"
              >
                {isVi ? 'Kiểm Tra' : 'Check Savings'} <ArrowRight size={15} />
              </button>
            </form>

            {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

            {/* Ghost secondary link */}
            <Link
              href="/quote"
              className="inline-flex items-center gap-2 text-brand-muted hover:text-brand-dark text-sm font-medium transition-colors group"
            >
              <Zap size={14} className="text-brand-green group-hover:scale-110 transition-transform" />
              {isVi ? 'Yêu cầu tư vấn miễn phí →' : 'Get a free consultation →'}
            </Link>
          </motion.div>
        </div>

        {/* Right: 3D scene */}
        <motion.div
          initial={{ opacity: 0, x: 32 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.1, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
          className="hidden lg:block h-[580px]"
        >
          <HeroScene />
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 pointer-events-none"
      >
        <div className="w-px h-8 bg-gradient-to-b from-transparent to-brand-muted/30" />
        <motion.div
          animate={{ y: [0, 7, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown size={18} className="text-brand-muted/40" />
        </motion.div>
      </motion.div>
    </section>
  )
}
