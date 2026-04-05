'use client'

import { useState, useRef, useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { useRouter } from '@/i18n/navigation'
import { motion, useMotionValue, useSpring, useTransform, useInView, animate } from 'framer-motion'
import { Phone, ArrowRight, MapPin, Zap, TrendingDown, CheckCircle2 } from 'lucide-react'
import { isValidZip } from '@/lib/utils'

function CountUp({ to, suffix = '' }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  useEffect(() => {
    if (!inView || !ref.current) return
    const controls = animate(0, to, {
      duration: 1.4,
      ease: 'easeOut',
      onUpdate(v) {
        if (ref.current) ref.current.textContent = Math.round(v) + suffix
      },
    })
    return controls.stop
  }, [inView, to, suffix])
  return <span ref={ref}>0{suffix}</span>
}

function PlanCard() {
  const cardRef = useRef<HTMLDivElement>(null)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const springCfg = { stiffness: 120, damping: 25 }
  const xSpring = useSpring(mouseX, springCfg)
  const ySpring = useSpring(mouseY, springCfg)
  const rotateX = useTransform(ySpring, [-150, 150], [12, -12])
  const rotateY = useTransform(xSpring, [-150, 150], [-12, 12])

  const handleMove = (e: React.MouseEvent) => {
    const rect = cardRef.current?.getBoundingClientRect()
    if (!rect) return
    mouseX.set(e.clientX - rect.left - rect.width / 2)
    mouseY.set(e.clientY - rect.top - rect.height / 2)
  }
  const handleLeave = () => { mouseX.set(0); mouseY.set(0) }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className="relative"
      style={{ perspective: '1000px' }}
    >
      {/* Glow */}
      <div className="absolute -inset-8 bg-brand-green/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -inset-4 bg-brand-gold/10 rounded-full blur-2xl pointer-events-none" />

      <motion.div
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className="relative bg-white/[0.06] backdrop-blur-2xl border border-white/[0.12] rounded-3xl p-6 w-80 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-green-400 text-xs font-semibold uppercase tracking-wider">Best Match Found</span>
          </div>
          <div className="bg-brand-gold/20 text-brand-gold text-xs font-bold px-2.5 py-1 rounded-full border border-brand-gold/30">
            #1 Pick
          </div>
        </div>

        {/* Provider + Plan */}
        <div className="mb-4" style={{ transform: 'translateZ(20px)' }}>
          <div className="text-white/50 text-xs mb-0.5">Gexa Energy · Fixed 12mo</div>
          <div className="text-white font-bold text-lg">Gexa Saver 12</div>
        </div>

        {/* Rate display */}
        <div className="flex items-end gap-1 mb-5" style={{ transform: 'translateZ(30px)' }}>
          <span className="text-5xl font-black text-white leading-none">10.9</span>
          <div className="mb-1">
            <div className="text-brand-green text-sm font-bold">¢</div>
            <div className="text-white/40 text-xs">/kWh</div>
          </div>
        </div>

        {/* Savings comparison */}
        <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4 mb-4" style={{ transform: 'translateZ(15px)' }}>
          <div className="flex items-center gap-2 mb-3">
            <TrendingDown size={14} className="text-green-400" />
            <span className="text-green-400 text-xs font-semibold">vs. average market rate</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-white/60">This plan</span>
                  <span className="text-green-400 font-bold">10.9¢</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full" style={{ width: '65%' }} />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-white/60">Market avg</span>
                  <span className="text-white/50 font-bold">14.2¢</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-white/20 rounded-full" style={{ width: '85%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Savings badge */}
        <div className="flex items-center justify-between" style={{ transform: 'translateZ(25px)' }}>
          <div className="flex items-center gap-1.5 text-white/50 text-xs">
            <CheckCircle2 size={12} className="text-green-400" />
            <span>No cancellation fee</span>
          </div>
          <div className="bg-brand-gold text-white text-xs font-black px-3 py-1.5 rounded-xl shadow-gold">
            Save $89/mo
          </div>
        </div>

        {/* Bottom shimmer line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-green/40 to-transparent rounded-b-3xl" />
      </motion.div>

      {/* Floating badges */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-4 -right-8 bg-white/[0.08] backdrop-blur-xl border border-white/10 rounded-2xl px-3 py-2 shadow-xl"
      >
        <div className="flex items-center gap-1.5">
          <Zap size={12} className="text-brand-gold fill-brand-gold" />
          <span className="text-white text-xs font-semibold">50+ Plans</span>
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        className="absolute -bottom-4 -left-8 bg-white/[0.08] backdrop-blur-xl border border-white/10 rounded-2xl px-3 py-2 shadow-xl"
      >
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-white text-xs font-semibold">Live Rates</span>
        </div>
      </motion.div>
    </div>
  )
}

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.7, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] } }),
}

export default function Hero() {
  const t = useTranslations('hero')
  const locale = useLocale()
  const router = useRouter()
  const [zip, setZip] = useState('')
  const [error, setError] = useState('')
  const isVi = locale === 'vi'

  const handleZipSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValidZip(zip)) { setError(t('zipError')); return }
    setError('')
    router.push({ pathname: '/compare', query: { zip } } as Parameters<typeof router.push>[0])
  }

  return (
    <section className="relative min-h-screen bg-[#03080E] overflow-hidden flex items-center">

      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.4) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      {/* Orbs */}
      <div className="absolute top-0 left-1/4 w-[700px] h-[700px] bg-brand-greenDark/30 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-brand-green/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/3 right-0 w-[400px] h-[400px] bg-brand-gold/8 rounded-full blur-[80px] pointer-events-none" />

      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left — text + form */}
          <div>
            {/* Badge */}
            <motion.div custom={0} variants={fadeUp} initial="hidden" animate="show"
              className="inline-flex items-center gap-2.5 bg-white/[0.06] border border-white/10 rounded-full px-4 py-2 mb-8">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} viewBox="0 0 12 12" fill="#f59e0b" className="w-3 h-3"><path d="M6 0l1.5 4.5H12L8.25 7.5 9.75 12 6 9 2.25 12 3.75 7.5 0 4.5h4.5z" /></svg>
                ))}
              </div>
              <span className="text-white/70 text-sm">
                {isVi ? 'Được tin dùng bởi 500+ gia đình Việt' : 'Trusted by 500+ Vietnamese families'}
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1 custom={1} variants={fadeUp} initial="hidden" animate="show"
              className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.05] tracking-tight mb-6">
              {isVi ? (
                <>
                  So sánh<br />
                  <span className="bg-gradient-to-r from-brand-green via-green-400 to-brand-greenBright bg-clip-text text-transparent">
                    giá điện Texas
                  </span><br />
                  trong 30 giây
                </>
              ) : (
                <>
                  Compare<br />
                  <span className="bg-gradient-to-r from-brand-green via-green-400 to-brand-greenBright bg-clip-text text-transparent">
                    Texas electricity
                  </span><br />
                  in 30 seconds
                </>
              )}
            </motion.h1>

            {/* Subheadline */}
            <motion.p custom={2} variants={fadeUp} initial="hidden" animate="show"
              className="text-white/50 text-lg sm:text-xl mb-10 max-w-lg leading-relaxed">
              {isVi
                ? 'Miễn phí – Không phí ẩn – Hỗ trợ tiếng Việt 100%. So sánh 50+ gói điện ngay hôm nay.'
                : 'Free – No hidden fees – Vietnamese support available. Compare 50+ plans today.'}
            </motion.p>

            {/* ZIP Form */}
            <motion.form custom={3} variants={fadeUp} initial="hidden" animate="show"
              onSubmit={handleZipSubmit} className="mb-5">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    type="text"
                    inputMode="numeric"
                    value={zip}
                    onChange={(e) => { setZip(e.target.value.replace(/\D/g, '')); setError('') }}
                    placeholder={isVi ? 'Nhập mã ZIP của bạn...' : 'Enter your ZIP code...'}
                    maxLength={5}
                    className="w-full pl-11 pr-4 py-4.5 rounded-2xl bg-white/[0.07] border border-white/10 text-white placeholder-white/25 text-base font-medium focus:outline-none focus:ring-2 focus:ring-brand-green/60 focus:border-brand-green/40 transition-all"
                    style={{ paddingTop: '18px', paddingBottom: '18px' }}
                  />
                </div>
                <button
                  type="submit"
                  className="sm:shrink-0 bg-brand-green hover:bg-brand-greenBright text-white font-bold py-4 px-8 rounded-2xl text-base transition-all shadow-green flex items-center justify-center gap-2 whitespace-nowrap hover:shadow-[0_0_30px_rgba(34,197,94,0.4)] hover:-translate-y-0.5"
                  style={{ paddingTop: '18px', paddingBottom: '18px' }}
                >
                  {isVi ? 'So Sánh Ngay' : 'Compare Now'} <ArrowRight size={18} />
                </button>
              </div>
              {error && <p className="mt-2.5 text-red-400 text-sm">{error}</p>}
            </motion.form>

            {/* Call + trust line */}
            <motion.div custom={4} variants={fadeUp} initial="hidden" animate="show"
              className="flex flex-wrap items-center gap-5 mb-12">
              <a href="tel:+18329379999"
                className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm">
                <Phone size={14} className="text-brand-gold" />
                <span className="font-semibold">(832) 937-9999</span>
              </a>
              <div className="w-px h-4 bg-white/10" />
              {[
                isVi ? 'Miễn phí' : 'Always free',
                isVi ? 'Không ràng buộc' : 'No commitment',
                isVi ? 'Tiếng Việt' : 'VI support',
              ].map(item => (
                <span key={item} className="flex items-center gap-1.5 text-white/40 text-xs">
                  <CheckCircle2 size={12} className="text-brand-green" />
                  {item}
                </span>
              ))}
            </motion.div>

            {/* Stats */}
            <motion.div custom={5} variants={fadeUp} initial="hidden" animate="show"
              className="grid grid-cols-3 gap-4 max-w-sm">
              {[
                { n: 50, s: '+', label: isVi ? 'Gói điện' : 'Plans' },
                { n: 300, s: '+', label: isVi ? 'Tiết kiệm/năm' : 'Saved/year' },
                { n: 500, s: '+', label: isVi ? 'Khách hàng' : 'Customers' },
              ].map(({ n, s, label }) => (
                <div key={label} className="text-center">
                  <div className="text-2xl font-black text-white">
                    <CountUp to={n} suffix={s} />
                  </div>
                  <div className="text-white/35 text-xs mt-0.5">{label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right — 3D card */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="hidden lg:flex justify-center items-center"
          >
            <PlanCard />
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <div className="w-5 h-9 border border-white/20 rounded-full flex items-start justify-center p-1.5">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1 h-2 bg-white/40 rounded-full"
          />
        </div>
      </motion.div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#03080E] to-transparent pointer-events-none" />
    </section>
  )
}
