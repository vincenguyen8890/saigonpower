'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react'
import { Link } from '@/i18n/navigation'

const BEFORE = [
  'Paying 15–18¢/kWh without knowing it',
  'Contract expired — auto-rolled to variable rate',
  'Spent hours on PowerToChoose with no help',
  'No one to call when your bill spikes',
  'Renewing the same plan out of habit',
]

const AFTER = [
  'Locked in at 10.9–12¢/kWh fixed rate',
  'Renewal reminder 60 days before expiration',
  'We compare 50+ plans and recommend the best',
  'Dedicated agent who speaks your language',
  'Switched in 24 hours — zero paperwork from you',
]

export default function ProblemSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section className="bg-[#0B1120] py-20 lg:py-28 relative overflow-hidden">

      {/* Subtle orange glow — suggests the "problem" heat */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-[0.06] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(255,109,0,1) 0%, transparent 70%)' }} />

      <div ref={ref} className="max-w-5xl mx-auto px-5 lg:px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-widest rounded-full px-4 py-1.5 mb-5">
            <AlertTriangle size={11} />
            The Situation Most Texans Are In
          </div>
          <h2 className="text-[clamp(1.8rem,4vw,3.2rem)] font-black text-white tracking-tight">
            Most Texans Are Overpaying.<br />
            <span className="text-orange-400">Most Don&apos;t Know It.</span>
          </h2>
          <p className="text-white/50 text-lg mt-4 max-w-xl mx-auto">
            The average Texan stays on the same plan 2+ years after it expires — paying 40% more than they should.
          </p>
        </motion.div>

        {/* Before / After grid */}
        <div className="grid md:grid-cols-2 gap-4 lg:gap-6 mb-10">

          {/* BEFORE */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-red-950/30 border border-red-500/20 rounded-2xl p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertTriangle size={13} className="text-red-400" />
              </div>
              <span className="text-red-400 text-sm font-bold uppercase tracking-wide">Without Saigon Power</span>
            </div>
            <ul className="space-y-3">
              {BEFORE.map(item => (
                <li key={item} className="flex items-start gap-3 text-white/50 text-sm">
                  <span className="w-4 h-4 rounded-full border border-red-500/40 flex-shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* AFTER */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.18 }}
            className="bg-green-950/30 border border-[#00C853]/25 rounded-2xl p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-full bg-[#00C853]/20 flex items-center justify-center">
                <CheckCircle size={13} className="text-[#00C853]" />
              </div>
              <span className="text-[#00C853] text-sm font-bold uppercase tracking-wide">With Saigon Power</span>
            </div>
            <ul className="space-y-3">
              {AFTER.map(item => (
                <li key={item} className="flex items-start gap-3 text-white/75 text-sm">
                  <CheckCircle size={14} className="text-[#00C853] flex-shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center"
        >
          <Link href="/compare"
            className="inline-flex items-center gap-2 bg-[#00C853] hover:bg-[#00A846] text-white font-bold px-8 py-3.5 rounded-2xl text-sm transition-all shadow-lg shadow-green-900/30 hover:-translate-y-0.5">
            Compare My Rate Now <ArrowRight size={15} />
          </Link>
          <p className="text-white/30 text-xs mt-3">Free · No credit check · Takes 30 seconds</p>
        </motion.div>

      </div>
    </section>
  )
}
