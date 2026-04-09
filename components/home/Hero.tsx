'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from '@/i18n/navigation'
import { Link } from '@/i18n/navigation'
import { motion } from 'framer-motion'
import { ArrowRight, MapPin, Phone, Shield, Star, CheckCircle } from 'lucide-react'
import { isValidZip } from '@/lib/utils'

const ShaderBackground = dynamic(() => import('@/components/ui/shader-background'), { ssr: false })

type PlanRow = { plan: string; provider: string; rate: string; term: string; badge: string | null; badgeColor: string }

function useLivePlans() {
  const [rows, setRows] = useState<PlanRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/plans?sortBy=lowestRate')
      .then(r => r.json())
      .then(({ data }) => {
        const top3 = (data as Array<{ name: string; provider: { name: string }; rateKwh: number; termMonths: number; badges: string[] }>)
          .slice(0, 3)
          .map((p, i) => ({
            plan:       p.name,
            provider:   p.provider.name,
            rate:       p.rateKwh.toFixed(1),
            term:       `${p.termMonths} mo`,
            badge:      i === 0 ? 'Lowest' : p.badges.includes('bestValue') ? 'Best Value' : null,
            badgeColor: i === 0 ? 'bg-[#00C853]/20 text-[#00C853]' : 'bg-blue-500/20 text-blue-400',
          }))
        setRows(top3)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return { rows, loading }
}

const TRUST_PILLS = [
  '100% Free Service',
  'No Credit Check',
  'Rates Updated Daily',
  'Switch in 24 Hours',
]

// Simulated current rate — in a real app this could come from an API
const TODAY_RATE = '10.9¢'
const TODAY_CITY = 'Houston area'

export default function Hero() {
  const router = useRouter()
  const [zip, setZip] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValidZip(zip)) {
      setError('Please enter a valid 5-digit ZIP code')
      return
    }
    setError('')
    router.push({ pathname: '/compare', query: { zip } } as Parameters<typeof router.push>[0])
  }

  const { rows: livePlans, loading: plansLoading } = useLivePlans()

  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden bg-[#0B1120]">

      {/* WebGL shader background */}
      <div className="absolute inset-0 pointer-events-none">
        <ShaderBackground />
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-0 opacity-[0.02]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      </div>

      <div className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-5 lg:px-12 pt-28 pb-16 flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

        {/* ── LEFT: copy ── */}
        <div className="flex-1 min-w-0">

          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-white/8 border border-white/15 rounded-full px-4 py-1.5 mb-6"
          >
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => <Star key={i} size={10} className="fill-yellow-400 text-yellow-400" />)}
            </div>
            <span className="text-white/80 text-xs font-semibold">4.9 · 500+ Texas Families Served</span>
            <span className="text-white/30">·</span>
            <span className="text-[#00C853] text-xs font-bold">100% Free</span>
          </motion.div>

          {/* H1 */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="text-[clamp(2.4rem,5vw,4.5rem)] font-black text-white leading-[1.06] tracking-tight mb-5"
          >
            Compare Texas<br />
            Electricity Plans.<br />
            <span className="text-[#00C853]">Switch in 24 Hours.</span>
          </motion.h1>

          {/* Subhead */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.16 }}
            className="text-lg text-white/60 leading-relaxed mb-8 max-w-[440px]"
          >
            We shop 50+ providers, find your lowest rate, and handle all the paperwork.
            <span className="text-white/80 font-semibold"> You do nothing.</span>
          </motion.p>

          {/* ZIP form */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.24 }}
          >
            <form onSubmit={handleSubmit} className="flex max-w-md mb-3">
              <div className="relative flex-1">
                <MapPin size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  inputMode="numeric"
                  value={zip}
                  onChange={e => { setZip(e.target.value.replace(/\D/g, '')); setError('') }}
                  placeholder="Enter your ZIP code"
                  maxLength={5}
                  autoFocus
                  className="w-full pl-10 pr-4 py-4 bg-white/10 border border-white/20 rounded-l-2xl text-white placeholder-white/35 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#00C853]/50 focus:border-[#00C853]/60 backdrop-blur-sm transition-all"
                />
              </div>
              <button
                type="submit"
                className="bg-[#00C853] hover:bg-[#00A846] text-white font-bold px-6 py-4 rounded-r-2xl text-sm transition-all flex items-center gap-2 whitespace-nowrap hover:-translate-y-0.5 active:translate-y-0 shadow-lg shadow-green-900/40"
              >
                See My Plans <ArrowRight size={15} />
              </button>
            </form>

            {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

            {/* Alt CTA: phone */}
            <div className="flex items-center gap-3 mb-8">
              <div className="h-px flex-1 max-w-[40px] bg-white/15" />
              <a href="tel:+18329379999"
                className="flex items-center gap-2 text-white/45 hover:text-white/80 text-sm font-medium transition-colors">
                <Phone size={13} />
                or call (832) 937-9999
              </a>
              <div className="h-px flex-1 max-w-[40px] bg-white/15" />
            </div>

            {/* Trust pills */}
            <div className="flex flex-wrap gap-2">
              {TRUST_PILLS.map(pill => (
                <span key={pill} className="flex items-center gap-1.5 text-xs text-white/55 font-medium">
                  <CheckCircle size={11} className="text-[#00C853] flex-shrink-0" />
                  {pill}
                </span>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── RIGHT: rate comparison card ── */}
        <motion.div
          initial={{ opacity: 0, x: 28 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="w-full lg:w-auto lg:flex-shrink-0 lg:w-[380px]"
        >
          {/* Urgency badge */}
          <div className="flex items-center gap-2 mb-3">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00C853] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00C853]" />
            </span>
            <span className="text-xs text-white/50 font-medium">Live rates · updated today</span>
          </div>

          <div className="bg-white/8 border border-white/15 rounded-3xl p-6 backdrop-blur-sm">
            <p className="text-xs text-white/40 font-semibold uppercase tracking-wider mb-4">{TODAY_CITY} · Top Plans Right Now</p>

            {/* Rate rows */}
            {plansLoading ? (
              <div className="space-y-3 py-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between py-2 animate-pulse">
                    <div className="space-y-1.5">
                      <div className="h-3 w-28 bg-white/10 rounded" />
                      <div className="h-2.5 w-20 bg-white/6 rounded" />
                    </div>
                    <div className="h-6 w-12 bg-white/10 rounded" />
                  </div>
                ))}
              </div>
            ) : livePlans.map((row, i) => (
              <div key={row.plan}
                className={`flex items-center justify-between py-3 ${i < livePlans.length - 1 ? 'border-b border-white/8' : ''}`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-white/85 text-sm font-semibold">{row.plan}</p>
                    {row.badge && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${row.badgeColor}`}>{row.badge}</span>
                    )}
                  </div>
                  <p className="text-white/35 text-xs mt-0.5">{row.provider} · {row.term}</p>
                </div>
                <div className="text-right">
                  <p className="text-white font-black text-lg tabular-nums">{row.rate}<span className="text-white/50 text-xs font-medium">¢</span></p>
                  <p className="text-white/35 text-[10px]">per kWh</p>
                </div>
              </div>
            ))}

            <Link href="/compare?zip="
              className="mt-4 w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 border border-white/15 text-white text-sm font-semibold py-3 rounded-xl transition-all">
              See all plans for your ZIP <ArrowRight size={13} />
            </Link>
          </div>

          {/* Risk reversal */}
          <div className="flex items-start gap-2.5 mt-4 px-1">
            <Shield size={13} className="text-[#00C853] flex-shrink-0 mt-0.5" />
            <p className="text-white/40 text-xs leading-relaxed">
              If we can&apos;t find you a better rate than what you&apos;re paying — we&apos;ll tell you upfront. No pressure.
            </p>
          </div>
        </motion.div>

      </div>

      {/* Bottom: provider strip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="relative z-10 border-t border-white/8 py-4 px-5"
      >
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          <span className="text-white/25 text-[11px] font-semibold uppercase tracking-widest mr-2">We compare</span>
          {['Gexa', 'TXU', 'Reliant', 'Green Mountain', 'Cirro', 'Constellation', 'Pulse Power', '4Change'].map(p => (
            <span key={p} className="text-white/35 text-xs font-semibold">{p}</span>
          ))}
          <span className="text-white/25 text-xs">+ 40 more</span>
        </div>
      </motion.div>

    </section>
  )
}
