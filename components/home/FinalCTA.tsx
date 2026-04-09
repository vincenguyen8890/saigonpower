'use client'

import { useRef, useState } from 'react'
import { useRouter } from '@/i18n/navigation'
import { motion, useInView } from 'framer-motion'
import { ArrowRight, MapPin, Phone, Shield, CheckCircle, Zap } from 'lucide-react'
import { isValidZip } from '@/lib/utils'

const URGENCY_POINTS = [
  'Texas electricity rates change daily',
  "Today's lowest rate: 10.9¢/kWh",
  'Lock in before next rate cycle',
]

export default function FinalCTA() {
  const router = useRouter()
  const [zip, setZip] = useState('')
  const [error, setError] = useState('')
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValidZip(zip)) {
      setError('Please enter a valid 5-digit ZIP')
      return
    }
    setError('')
    router.push({ pathname: '/compare', query: { zip } } as Parameters<typeof router.push>[0])
  }

  return (
    <section className="bg-[#0B1120] py-20 lg:py-28 relative overflow-hidden">

      {/* Green radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] rounded-full pointer-events-none opacity-[0.14]"
        style={{ background: 'radial-gradient(ellipse, rgba(0,200,83,1) 0%, transparent 60%)' }} />
      <div className="absolute inset-0 opacity-[0.02]"
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      <div ref={ref} className="relative z-10 max-w-2xl mx-auto px-5 text-center">

        {/* Urgency tag */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 bg-[#00C853]/10 border border-[#00C853]/25 rounded-full px-4 py-1.5 mb-6"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00C853] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00C853]" />
          </span>
          <span className="text-[#00C853] text-xs font-bold">Rates updated today · Lock in now</span>
        </motion.div>

        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="text-[clamp(2.2rem,5vw,4.5rem)] font-black text-white leading-[1.07] tracking-tight mb-5"
        >
          Stop Overpaying.<br />
          <span className="text-[#00C853]">Start Saving Today.</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.14 }}
          className="text-lg text-white/55 mb-10 max-w-md mx-auto leading-relaxed"
        >
          500+ Texas families already saving an average of <span className="text-white font-semibold">$150/month</span>. Your lower rate is waiting.
        </motion.p>

        {/* Urgency points */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mb-8"
        >
          {URGENCY_POINTS.map(p => (
            <span key={p} className="flex items-center gap-1.5 text-xs text-white/45">
              <Zap size={10} className="text-[#00C853]" /> {p}
            </span>
          ))}
        </motion.div>

        {/* ZIP form */}
        <motion.form
          initial={{ opacity: 0, y: 14 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, delay: 0.22 }}
          onSubmit={handleSubmit}
          className="flex max-w-sm mx-auto mb-4"
        >
          <div className="relative flex-1">
            <MapPin size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              inputMode="numeric"
              value={zip}
              onChange={e => { setZip(e.target.value.replace(/\D/g, '')); setError('') }}
              placeholder="Enter your ZIP code"
              maxLength={5}
              className="w-full pl-10 pr-4 py-4 bg-white/10 border border-white/20 rounded-l-2xl text-white placeholder-white/30 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#00C853]/40 focus:border-[#00C853]/60 backdrop-blur-sm transition-all"
            />
          </div>
          <button type="submit"
            className="bg-[#00C853] hover:bg-[#00A846] text-white font-bold px-6 py-4 rounded-r-2xl text-sm transition-all flex items-center gap-2 whitespace-nowrap hover:-translate-y-0.5 shadow-lg shadow-green-900/30">
            See My Plans <ArrowRight size={15} />
          </button>
        </motion.form>

        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        {/* Phone alt */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.32 }}
        >
          <a href="tel:+18329379999"
            className="inline-flex items-center gap-2 text-white/40 hover:text-white/75 text-sm font-medium transition-colors mb-8">
            <Phone size={13} />
            Prefer to call? (832) 937-9999 · Mon–Fri 8AM–6PM
          </a>
        </motion.div>

        {/* Trust row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.42 }}
          className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2"
        >
          {[
            'Your data is secure',
            'Always free',
            'No spam, ever',
            'No credit check',
          ].map(item => (
            <span key={item} className="flex items-center gap-1.5 text-white/35 text-xs">
              <CheckCircle size={10} className="text-[#00C853] flex-shrink-0" />
              {item}
            </span>
          ))}
        </motion.div>

        {/* Risk reversal */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5 }}
          className="mt-8 flex items-start gap-2.5 bg-white/5 border border-white/8 rounded-2xl px-5 py-4 text-left max-w-sm mx-auto"
        >
          <Shield size={14} className="text-[#00C853] flex-shrink-0 mt-0.5" />
          <p className="text-white/45 text-xs leading-relaxed">
            <span className="text-white/70 font-semibold">Our promise:</span> If we can&apos;t find you a lower rate than what you&apos;re currently paying, we&apos;ll tell you upfront. No pressure, no obligation.
          </p>
        </motion.div>

      </div>
    </section>
  )
}
