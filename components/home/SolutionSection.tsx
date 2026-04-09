'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Link } from '@/i18n/navigation'
import { MapPin, BarChart2, FileCheck, ArrowRight, Phone } from 'lucide-react'

const STEPS = [
  {
    num: '01',
    Icon: MapPin,
    title: 'Enter Your ZIP',
    desc: 'Takes 5 seconds. We instantly pull every available plan in your service area — no account, no credit check.',
    accent: 'text-[#2979FF]',
    bg: 'bg-[#2979FF]/10',
    border: 'border-[#2979FF]/20',
    time: '5 seconds',
  },
  {
    num: '02',
    Icon: BarChart2,
    title: 'We Compare 50+ Plans',
    desc: "Our team analyzes every provider's rates, terms, and cancellation fees and surfaces your best 3 options.",
    accent: 'text-[#00C853]',
    bg: 'bg-[#00C853]/10',
    border: 'border-[#00C853]/20',
    time: '30 seconds',
  },
  {
    num: '03',
    Icon: FileCheck,
    title: 'We Switch You — Done',
    desc: 'Select your plan and we handle every piece of paperwork. You get a confirmation email. Zero effort from you.',
    accent: 'text-orange-400',
    bg: 'bg-orange-400/10',
    border: 'border-orange-400/20',
    time: 'Within 24 hours',
  },
]

const DIFFERENTIATORS = [
  { label: '50+',    sub: 'Providers compared'       },
  { label: '$150',   sub: 'Avg monthly savings'       },
  { label: '24hrs',  sub: 'Average switch time'       },
  { label: '100%',   sub: 'Free — always'             },
]

export default function SolutionSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section className="bg-[#F8FAFC] py-20 lg:py-28">
      <div ref={ref} className="max-w-6xl mx-auto px-5 lg:px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-5"
        >
          <h2 className="text-[clamp(1.9rem,4vw,3.5rem)] font-black text-[#0F172A] tracking-tight mb-4">
            We Find, Compare, and Switch.<br />
            <span className="text-[#00C853]">You Do Nothing.</span>
          </h2>
          <p className="text-[#64748B] text-lg max-w-xl mx-auto">
            Unlike PowerToChoose, we don&apos;t just list plans — we&apos;re your agent. We handle everything.
          </p>
        </motion.div>

        {/* Stats strip */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-px bg-slate-200 rounded-2xl overflow-hidden mb-14 shadow-sm"
        >
          {DIFFERENTIATORS.map(({ label, sub }) => (
            <div key={sub} className="bg-white px-6 py-5 text-center">
              <p className="text-2xl font-black text-[#0F172A] mb-1">{label}</p>
              <p className="text-xs text-[#64748B] font-medium">{sub}</p>
            </div>
          ))}
        </motion.div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-5 lg:gap-6 mb-12">
          {STEPS.map(({ num, Icon, title, desc, accent, bg, border, time }, i) => (
            <motion.div
              key={num}
              initial={{ opacity: 0, y: 32 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.15 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className={`relative bg-white rounded-2xl p-7 border ${border} shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden`}
            >
              {/* Big number watermark */}
              <div className={`absolute top-3 right-4 text-[4.5rem] font-black ${accent} opacity-[0.07] leading-none select-none`}>{num}</div>

              <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center mb-5`}>
                <Icon size={22} className={accent} />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-base font-black text-[#0F172A]">{title}</h3>
              </div>
              <p className="text-[#64748B] text-sm leading-relaxed mb-4">{desc}</p>
              <span className={`inline-block text-xs font-bold ${accent} bg-white border ${border} px-2.5 py-1 rounded-lg`}>
                ⏱ {time}
              </span>
            </motion.div>
          ))}
        </div>

        {/* CTA row */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href="/compare"
            className="flex items-center gap-2 bg-[#00C853] hover:bg-[#00A846] text-white font-bold px-8 py-3.5 rounded-2xl text-sm transition-all shadow-lg shadow-green-200 hover:-translate-y-0.5">
            Compare Plans Free <ArrowRight size={15} />
          </Link>
          <a href="tel:+18329379999"
            className="flex items-center gap-2 text-[#0F172A] font-semibold text-sm border border-slate-200 hover:border-[#00C853] hover:text-[#00A846] px-6 py-3.5 rounded-2xl transition-all">
            <Phone size={14} />
            Talk to an Agent
          </a>
        </motion.div>

      </div>
    </section>
  )
}
