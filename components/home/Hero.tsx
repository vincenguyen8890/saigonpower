'use client'

import { useState, useRef, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useLocale } from 'next-intl'
import { useRouter } from '@/i18n/navigation'
import { motion, useInView, animate } from 'framer-motion'
import {
  MapPin, ArrowRight, CheckCircle2, Star,
  FileText, Cpu, Zap, Users, DollarSign, Clock, ListChecks,
} from 'lucide-react'
import { isValidZip } from '@/lib/utils'

const HeroScene = dynamic(() => import('@/components/3d/HeroScene'), { ssr: false })

/* ── Animated counter ─────────────────────────────── */
function CountUp({ to, prefix = '', suffix = '' }: { to: number; prefix?: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  useEffect(() => {
    if (!inView || !ref.current) return
    const ctrl = animate(0, to, {
      duration: 1.4, ease: 'easeOut',
      onUpdate(v) { if (ref.current) ref.current.textContent = prefix + Math.round(v) + suffix },
    })
    return ctrl.stop
  }, [inView, to, prefix, suffix])
  return <span ref={ref}>{prefix}0{suffix}</span>
}

/* ── Main Hero ─────────────────────────────────────── */
export default function Hero() {
  const locale = useLocale()
  const router = useRouter()
  const [zip, setZip] = useState('')
  const [error, setError] = useState('')
  const isVi = locale === 'vi'

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValidZip(zip)) { setError(isVi ? 'Vui lòng nhập mã ZIP hợp lệ (5 chữ số)' : 'Please enter a valid 5-digit ZIP'); return }
    setError('')
    router.push({ pathname: '/compare', query: { zip } } as Parameters<typeof router.push>[0])
  }

  const steps = isVi ? [
    { Icon: FileText,  bg: 'bg-blue-50',  ic: 'text-brand-blue',  title: 'Tải hóa đơn',     desc: 'Chụp hoặc upload bill dễ dàng' },
    { Icon: Cpu,       bg: 'bg-blue-50',  ic: 'text-brand-blue',  title: 'AI phân tích',     desc: 'Hệ thống so sánh 50+ nhà cung cấp' },
    { Icon: Zap,       bg: 'bg-green-50', ic: 'text-brand-green', title: 'Tự động chuyển',   desc: 'Chúng tôi lo mọi thứ trong 24h' },
  ] : [
    { Icon: FileText,  bg: 'bg-blue-50',  ic: 'text-brand-blue',  title: 'Upload Bill',      desc: 'Photo or upload your bill easily' },
    { Icon: Cpu,       bg: 'bg-blue-50',  ic: 'text-brand-blue',  title: 'AI Analysis',      desc: 'Compare 50+ providers instantly' },
    { Icon: Zap,       bg: 'bg-green-50', ic: 'text-brand-green', title: 'Auto Switch',       desc: 'We handle everything in 24h' },
  ]

  const stats = isVi ? [
    { Icon: ListChecks, n: 50,  suffix: '+',     label: 'Gói điện được so sánh' },
    { Icon: Users,      n: 500, suffix: '+',     label: 'Gia đình đã tiết kiệm' },
    { Icon: DollarSign, n: 150, prefix: '$',     label: 'Trung bình tiết kiệm/tháng' },
    { Icon: Clock,      n: 24,  suffix: 'h',     label: 'Hoàn tất chuyển đổi' },
  ] : [
    { Icon: ListChecks, n: 50,  suffix: '+',     label: 'Plans compared' },
    { Icon: Users,      n: 500, suffix: '+',     label: 'Families saved' },
    { Icon: DollarSign, n: 150, prefix: '$',     label: 'Avg saved / month' },
    { Icon: Clock,      n: 24,  suffix: 'h',     label: 'Switch completed' },
  ]

  return (
    <section className="relative overflow-hidden"
      style={{ background: 'linear-gradient(150deg, #EBF4FD 0%, #F8FAFC 45%, #EEF8F0 100%)' }}>

      {/* Background glow blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 right-[5%] w-[520px] h-[520px] rounded-full opacity-40"
          style={{ background: 'radial-gradient(circle, #BFDBFE 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 right-[15%] w-[400px] h-[400px] rounded-full opacity-35"
          style={{ background: 'radial-gradient(circle, #BBF7D0 0%, transparent 70%)' }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-4">

        {/* ── Main two-column grid ──────────────────── */}
        <div className="grid lg:grid-cols-[1fr_1.3fr] gap-8 items-center">

          {/* LEFT: copy */}
          <div className="space-y-5 py-4">

            {/* Social proof badge */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 shadow-sm">
              <Star size={13} className="text-yellow-400 fill-yellow-400" />
              <span className="text-sm font-semibold text-gray-800">
                {isVi ? '500+ gia đình đã tiết kiệm' : '500+ families already saving'}
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.08 }}
              className="text-5xl sm:text-6xl font-black text-gray-900 leading-[1.05] tracking-tight">
              {isVi ? (
                <>Giảm hóa đơn điện<br />
                  <span className="text-brand-green">20–40%</span>{' '}
                  <span className="text-brand-blue">mỗi tháng</span>
                </>
              ) : (
                <>Cut your electricity<br />
                  <span className="text-brand-green">20–40%</span>{' '}
                  <span className="text-brand-blue">every month</span>
                </>
              )}
            </motion.h1>

            {/* Subtext */}
            <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}
              className="text-gray-600 text-lg leading-relaxed max-w-[420px]">
              {isVi
                ? 'Saigon Power tự động tìm và chuyển sang gói điện rẻ nhất cho bạn tại Texas — không cần làm gì.'
                : 'Saigon Power automatically finds and switches to the cheapest plan for you in Texas — no effort needed.'}
            </motion.p>

            {/* Trust checkmarks */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-wrap gap-x-6 gap-y-2">
              {(isVi
                ? ['Phục vụ Houston & toàn Texas', 'Không tiết kiệm = không tính phí']
                : ['Serving Houston & all Texas', 'No savings = no charge']
              ).map(item => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-brand-green flex-shrink-0" />
                  <span className="text-gray-700 text-sm font-medium">{item}</span>
                </div>
              ))}
            </motion.div>

            {/* ZIP form */}
            <motion.form initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.25 }}
              onSubmit={handleSubmit}>
              <div className="flex flex-col sm:flex-row gap-3 max-w-[460px]">
                <div className="flex-1 relative">
                  <MapPin size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type="text" inputMode="numeric"
                    value={zip}
                    onChange={e => { setZip(e.target.value.replace(/\D/g, '')); setError('') }}
                    placeholder={isVi ? 'Nhập ZIP code của bạn' : 'Enter your ZIP code'}
                    maxLength={5}
                    className="w-full pl-10 pr-4 py-[14px] rounded-2xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-green/25 focus:border-brand-green shadow-sm transition-all"
                  />
                </div>
                <button type="submit"
                  className="sm:shrink-0 bg-brand-green hover:bg-brand-greenDark text-white font-bold py-[14px] px-6 rounded-2xl text-sm transition-all flex items-center justify-center gap-2 whitespace-nowrap shadow-[0_4px_16px_rgba(0,200,83,0.35)] hover:-translate-y-0.5 active:translate-y-0">
                  {isVi ? 'Kiểm tra tiết kiệm' : 'Check savings'} <ArrowRight size={15} />
                </button>
              </div>
              {error && <p className="mt-2 text-red-500 text-xs font-medium">{error}</p>}
            </motion.form>

            {/* Customer avatars */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.32 }}
              className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {[
                  ['AN', 'from-blue-400 to-cyan-400'],
                  ['TH', 'from-purple-400 to-pink-400'],
                  ['MN', 'from-amber-400 to-orange-400'],
                  ['BL', 'from-green-400 to-teal-400'],
                ].map(([initials, grad], i) => (
                  <div key={i}
                    className={`w-8 h-8 rounded-full border-2 border-white bg-gradient-to-br ${grad} flex items-center justify-center text-white text-[10px] font-bold`}>
                    {initials}
                  </div>
                ))}
              </div>
              <span className="text-gray-600 text-sm font-medium">
                {isVi ? '500+ khách hàng đã tin tưởng' : '500+ customers trust us'}
              </span>
            </motion.div>
          </div>

          {/* RIGHT: 3D scene */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative hidden lg:block h-[590px]"
          >
            <HeroScene />
          </motion.div>
        </div>

        {/* ── How it works strip ───────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.4 }}
          className="mt-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm px-6 py-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-4 gap-x-0">
            {steps.map((step, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${step.bg}`}>
                  <step.Icon size={22} className={step.ic} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-gray-900 text-sm">{step.title}</div>
                  <div className="text-gray-500 text-xs mt-0.5 leading-snug">{step.desc}</div>
                </div>
                {i < 2 && (
                  <ArrowRight size={16} className="text-gray-300 flex-shrink-0 hidden sm:block" />
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Stats + Testimonial row ─────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-4 grid lg:grid-cols-[1fr_auto] gap-6 items-center pb-6">

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {stats.map(({ Icon, n, suffix, prefix, label }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-50 border border-green-100 flex items-center justify-center flex-shrink-0">
                  <Icon size={17} className="text-brand-green" />
                </div>
                <div>
                  <div className="text-xl font-black text-gray-900 leading-none">
                    <CountUp to={n} prefix={prefix ?? ''} suffix={suffix ?? ''} />
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5 leading-snug">{label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Testimonial card */}
          <div className="hidden lg:block w-[290px] bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex gap-0.5 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={13} className="text-yellow-400 fill-yellow-400" />
              ))}
            </div>
            <p className="text-gray-700 text-sm leading-relaxed">
              {isVi
                ? <>"Saigon Power giúp gia đình tôi tiết kiệm <span className="text-brand-green font-bold">$123/tháng</span>. Quá dễ!"</>
                : <>"Saigon Power saved my family <span className="text-brand-green font-bold">$123/month</span>. So easy!"</>
              }
            </p>
            <div className="flex items-center gap-3 mt-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                AM
              </div>
              <div>
                <div className="font-semibold text-gray-900 text-sm">Anh Minh</div>
                <div className="text-gray-400 text-xs">Houston, TX</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
