'use client'

import { useState, useRef, useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { useRouter } from '@/i18n/navigation'
import { motion, useMotionValue, useSpring, useTransform, useInView, animate } from 'framer-motion'
import { Phone, ArrowRight, MapPin, Zap, TrendingDown, CheckCircle2, Star } from 'lucide-react'
import { isValidZip } from '@/lib/utils'

/* ── Animated counter ───────────────────────────────── */
function CountUp({ to, prefix = '', suffix = '' }: { to: number; prefix?: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  useEffect(() => {
    if (!inView || !ref.current) return
    const ctrl = animate(0, to, {
      duration: 1.6, ease: 'easeOut',
      onUpdate(v) { if (ref.current) ref.current.textContent = prefix + Math.round(v) + suffix },
    })
    return ctrl.stop
  }, [inView, to, prefix, suffix])
  return <span ref={ref}>{prefix}0{suffix}</span>
}

/* ── 3D floating plan card ──────────────────────────── */
function PlanCard() {
  const cardRef = useRef<HTMLDivElement>(null)
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const xS = useSpring(mx, { stiffness: 120, damping: 25 })
  const yS = useSpring(my, { stiffness: 120, damping: 25 })
  const rotX = useTransform(yS, [-140, 140], [10, -10])
  const rotY = useTransform(xS, [-140, 140], [-10, 10])

  const onMove = (e: React.MouseEvent) => {
    const r = cardRef.current?.getBoundingClientRect()
    if (!r) return
    mx.set(e.clientX - r.left - r.width / 2)
    my.set(e.clientY - r.top - r.height / 2)
  }
  const onLeave = () => { mx.set(0); my.set(0) }

  return (
    <div ref={cardRef} onMouseMove={onMove} onMouseLeave={onLeave}
      className="relative" style={{ perspective: '1000px' }}>

      {/* Soft glow behind the card */}
      <div className="absolute -inset-10 bg-white/15 rounded-full blur-3xl pointer-events-none" />

      <motion.div style={{ rotateX: rotX, rotateY: rotY, transformStyle: 'preserve-3d' }}
        className="relative bg-white rounded-3xl shadow-[0_32px_64px_rgba(0,0,0,0.18)] p-6 w-[300px] border border-white/60">

        {/* Card header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-brand-green animate-pulse" />
            <span className="text-brand-green text-xs font-bold uppercase tracking-wider">Best Match</span>
          </div>
          <span className="badge-green">#1 Pick</span>
        </div>

        {/* Provider */}
        <div className="mb-3" style={{ transform: 'translateZ(16px)' }}>
          <div className="text-brand-muted text-xs mb-0.5">Gexa Energy · Fixed 12mo</div>
          <div className="text-brand-dark font-bold text-lg">Gexa Saver 12</div>
        </div>

        {/* Rate */}
        <div className="flex items-end gap-1 mb-5" style={{ transform: 'translateZ(24px)' }}>
          <span className="text-5xl font-black text-brand-dark leading-none">10.9</span>
          <div className="mb-1">
            <div className="text-brand-green text-base font-black">¢</div>
            <div className="text-brand-muted text-xs">/kWh</div>
          </div>
        </div>

        {/* Savings comparison */}
        <div className="bg-brand-greenLight border border-brand-greenBorder rounded-2xl p-4 mb-4"
          style={{ transform: 'translateZ(14px)' }}>
          <div className="flex items-center gap-1.5 mb-3">
            <TrendingDown size={13} className="text-brand-green" />
            <span className="text-brand-green text-xs font-bold">vs. market average</span>
          </div>
          <div className="space-y-2">
            {[
              { label: 'This plan', val: '10.9¢', pct: '65%', color: 'bg-brand-green' },
              { label: 'Market avg', val: '14.2¢', pct: '85%', color: 'bg-surface-border' },
            ].map(({ label, val, pct, color }) => (
              <div key={label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-brand-muted">{label}</span>
                  <span className={`font-bold ${label === 'This plan' ? 'text-brand-green' : 'text-brand-muted'}`}>{val}</span>
                </div>
                <div className="h-2 bg-surface-border rounded-full overflow-hidden">
                  <div className={`h-full ${color} rounded-full`} style={{ width: pct }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom row */}
        <div className="flex items-center justify-between" style={{ transform: 'translateZ(20px)' }}>
          <div className="flex items-center gap-1 text-brand-muted text-xs">
            <CheckCircle2 size={11} className="text-brand-green" />
            <span>No cancel fee</span>
          </div>
          <div className="bg-brand-green text-white text-xs font-black px-3 py-1.5 rounded-xl shadow-green">
            Save $89/mo
          </div>
        </div>
      </motion.div>

      {/* Floating badges */}
      <motion.div animate={{ y: [0, -7, 0] }} transition={{ duration: 3, repeat: Infinity }}
        className="absolute -top-4 -right-6 bg-white rounded-xl px-3 py-2 shadow-card border border-surface-border">
        <div className="flex items-center gap-1.5">
          <Zap size={12} className="text-brand-blue fill-brand-blue" />
          <span className="text-brand-dark text-xs font-bold">50+ Plans</span>
        </div>
      </motion.div>

      <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 3.5, repeat: Infinity, delay: 0.8 }}
        className="absolute -bottom-4 -left-6 bg-white rounded-xl px-3 py-2 shadow-card border border-surface-border">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-brand-green animate-pulse" />
          <span className="text-brand-dark text-xs font-bold">Live Rates</span>
        </div>
      </motion.div>
    </div>
  )
}

/* ── Fade-up animation variant ──────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.65, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
}

/* ── Main Hero ──────────────────────────────────────── */
export default function Hero() {
  const t = useTranslations('hero')
  const locale = useLocale()
  const router = useRouter()
  const [zip, setZip] = useState('')
  const [error, setError] = useState('')
  const isVi = locale === 'vi'

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValidZip(zip)) { setError(t('zipError')); return }
    setError('')
    router.push({ pathname: '/compare', query: { zip } } as Parameters<typeof router.push>[0])
  }

  return (
    <section className="relative min-h-screen bg-hero-gradient overflow-hidden flex items-center">
      {/* Subtle mesh overlay for depth */}
      <div className="absolute inset-0 opacity-[0.06]"
        style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />

      {/* Light vignette at bottom so content transitions to white */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-white/10 to-transparent pointer-events-none" />

      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* ── Left: Copy + Form ── */}
          <div>
            {/* Social proof badge */}
            <motion.div custom={0} variants={fadeUp} initial="hidden" animate="show"
              className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-4 py-2 mb-7">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => <Star key={i} size={11} className="text-yellow-300 fill-yellow-300" />)}
              </div>
              <span className="text-white text-sm font-semibold">
                {isVi ? '500+ gia đình đã tiết kiệm' : '500+ families already saving'}
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1 custom={1} variants={fadeUp} initial="hidden" animate="show"
              className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.03] tracking-tight mb-5">
              {isVi ? (
                <>So sánh<br /><span className="text-yellow-300">giá điện Texas</span><br />trong 30 giây</>
              ) : (
                <>Compare<br /><span className="text-yellow-300">Texas electricity</span><br />in 30 seconds</>
              )}
            </motion.h1>

            {/* Sub */}
            <motion.p custom={2} variants={fadeUp} initial="hidden" animate="show"
              className="text-white/80 text-lg sm:text-xl mb-10 max-w-lg leading-relaxed">
              {isVi
                ? 'Miễn phí – Không phí ẩn – Hỗ trợ tiếng Việt. So sánh 50+ gói điện trong vài giây.'
                : 'Free – No hidden fees – Vietnamese support. Compare 50+ plans in seconds.'}
            </motion.p>

            {/* ZIP form */}
            <motion.form custom={3} variants={fadeUp} initial="hidden" animate="show"
              onSubmit={handleSubmit} className="mb-5">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <MapPin size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
                  <input
                    type="text" inputMode="numeric"
                    value={zip}
                    onChange={e => { setZip(e.target.value.replace(/\D/g, '')); setError('') }}
                    placeholder={isVi ? 'Nhập mã ZIP của bạn...' : 'Enter your ZIP code...'}
                    maxLength={5}
                    className="w-full pl-11 pr-4 py-4 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-white/40 text-base font-medium focus:outline-none focus:ring-2 focus:ring-white/60 focus:border-white/60 transition-all"
                  />
                </div>
                <button type="submit"
                  className="sm:shrink-0 bg-white hover:bg-white/90 text-brand-green font-black py-4 px-8 rounded-2xl text-base transition-all flex items-center justify-center gap-2 whitespace-nowrap shadow-[0_4px_20px_rgba(0,0,0,0.15)] hover:-translate-y-0.5">
                  {isVi ? 'So Sánh Ngay' : 'Compare Now'} <ArrowRight size={18} />
                </button>
              </div>
              {error && <p className="mt-2 text-yellow-300 text-sm font-medium">{error}</p>}
            </motion.form>

            {/* Trust micro-copy */}
            <motion.div custom={4} variants={fadeUp} initial="hidden" animate="show"
              className="flex flex-wrap items-center gap-4 mb-12">
              <a href="tel:+18329379999"
                className="flex items-center gap-1.5 text-white/70 hover:text-white transition-colors text-sm">
                <Phone size={13} className="text-yellow-300" />
                <span className="font-semibold">(832) 937-9999</span>
              </a>
              <div className="w-px h-4 bg-white/20" />
              {[
                isVi ? 'Miễn phí' : 'Always free',
                isVi ? 'Không ràng buộc' : 'No commitment',
                isVi ? 'Tiếng Việt' : 'VI support',
              ].map(item => (
                <span key={item} className="flex items-center gap-1 text-white/60 text-xs font-medium">
                  <CheckCircle2 size={11} className="text-yellow-300" />
                  {item}
                </span>
              ))}
            </motion.div>

            {/* Stats */}
            <motion.div custom={5} variants={fadeUp} initial="hidden" animate="show"
              className="grid grid-cols-3 gap-3 max-w-sm">
              {[
                { n: 50, s: '+', label: isVi ? 'Gói điện' : 'Plans' },
                { n: 300, prefix: '$', s: '+', label: isVi ? 'Tiết kiệm/năm' : 'Avg saved/yr' },
                { n: 500, s: '+', label: isVi ? 'Khách hàng' : 'Customers' },
              ].map(({ n, prefix, s, label }) => (
                <div key={label} className="bg-white/15 backdrop-blur-sm border border-white/20 rounded-2xl py-3 px-2 text-center">
                  <div className="text-2xl font-black text-white">
                    <CountUp to={n} prefix={prefix} suffix={s} />
                  </div>
                  <div className="text-white/60 text-xs mt-0.5">{label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* ── Right: 3D card ── */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="hidden lg:flex justify-center items-center"
          >
            <PlanCard />
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <div className="w-5 h-9 border-2 border-white/30 rounded-full flex items-start justify-center p-1.5">
          <motion.div animate={{ y: [0, 12, 0] }} transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1 h-2 bg-white/60 rounded-full" />
        </div>
      </motion.div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
        <svg viewBox="0 0 1440 60" fill="none" className="w-full">
          <path d="M0 60L1440 60L1440 15C1200 55 960 -5 720 15C480 35 240 -5 0 15L0 60Z" fill="white" />
        </svg>
      </div>
    </section>
  )
}
