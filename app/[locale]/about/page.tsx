'use client'

import { useRef } from 'react'
import { Link } from '@/i18n/navigation'
import { motion, useInView } from 'framer-motion'
import {
  ArrowRight, Phone, Zap, BarChart2, RefreshCw, Database,
  CheckCircle, Shield, Users, Globe, ChevronRight
} from 'lucide-react'

const STATS = [
  { value: '500+', label: 'Texas families served' },
  { value: '$150',  label: 'Average monthly savings' },
  { value: '50+',   label: 'Providers compared' },
  { value: '24hrs', label: 'Average switch time' },
]

const DIFFERENTIATORS = [
  {
    icon: BarChart2,
    title: 'We Show Reality, Not Rates',
    desc: 'We calculate what you actually pay — including base charges, usage tiers, and hidden fees — not just the advertised price.',
    accent: 'text-[#2979FF]',
    bg: 'bg-[#2979FF]/10',
  },
  {
    icon: Zap,
    title: 'We Optimize, Not Just Compare',
    desc: 'We guide you to the best option based on your real usage pattern — not what earns us the highest commission.',
    accent: 'text-[#00C853]',
    bg: 'bg-[#00C853]/10',
  },
  {
    icon: RefreshCw,
    title: 'We Stay With You After Signup',
    desc: "Electricity isn't a one-time decision. We track your contract, monitor the market, and alert you before renewal traps kick in.",
    accent: 'text-orange-400',
    bg: 'bg-orange-400/10',
  },
  {
    icon: Database,
    title: 'We Build With Data',
    desc: 'Our system is designed to learn, adapt, and improve your savings over time — not just hand you a list and walk away.',
    accent: 'text-purple-400',
    bg: 'bg-purple-400/10',
  },
]

const PLATFORM_FEATURES = [
  'Control your electricity in one place',
  'Automatically stay on the best plan',
  'Avoid renewal traps with 60-day alerts',
  'Full support in English and Vietnamese',
  'Zero paperwork — we handle everything',
  'No credit check, no hidden fees',
]

function FadeIn({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0B1120]">

      {/* ── HERO ── */}
      <section className="relative overflow-hidden pt-32 pb-24">
        {/* Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full opacity-[0.14] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(0,200,83,0.7) 0%, transparent 60%)' }} />
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        <div className="relative z-10 max-w-4xl mx-auto px-5 text-center">
          <FadeIn>
            <div className="inline-flex items-center gap-2 bg-[#00C853]/10 border border-[#00C853]/25 rounded-full px-4 py-1.5 mb-6">
              <Zap size={12} className="text-[#00C853]" />
              <span className="text-[#00C853] text-xs font-bold uppercase tracking-wide">About Saigon Power</span>
            </div>
          </FadeIn>

          <FadeIn delay={0.08}>
            <h1 className="text-[clamp(2.4rem,5vw,4.2rem)] font-black text-white leading-[1.07] tracking-tight mb-6">
              We&apos;re Not Here to<br />
              <span className="text-[#00C853]">Compare Electricity.</span><br />
              We&apos;re Here to Fix It.
            </h1>
          </FadeIn>

          <FadeIn delay={0.16}>
            <p className="text-lg text-white/55 max-w-2xl mx-auto leading-relaxed">
              The Texas electricity market gives you the power to choose — but in reality, most people are stuck
              navigating a system that is confusing, overpriced, and built to benefit providers, not customers.
              <span className="text-white/80 font-semibold"> We&apos;re here to change that.</span>
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="bg-white/4 border-y border-white/8 py-10">
        <div className="max-w-4xl mx-auto px-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/8 rounded-2xl overflow-hidden">
            {STATS.map(({ value, label }) => (
              <div key={label} className="bg-[#0B1120] px-6 py-6 text-center">
                <p className="text-3xl font-black text-white mb-1">{value}</p>
                <p className="text-white/40 text-xs font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BUILT TO SIMPLIFY ── */}
      <section className="py-20 lg:py-28">
        <div className="max-w-5xl mx-auto px-5 lg:px-8">
          <FadeIn className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-white/6 border border-white/12 rounded-full px-4 py-1.5 mb-5">
              <Zap size={11} className="text-[#00C853]" />
              <span className="text-white/60 text-xs font-semibold uppercase tracking-wide">Built to Simplify a Broken System</span>
            </div>
            <h2 className="text-[clamp(1.8rem,4vw,3rem)] font-black text-white tracking-tight mb-5">
              Not a Broker. Not a Middleman.<br />
              <span className="text-[#00C853]">A Smarter Energy Platform.</span>
            </h2>
            <p className="text-white/50 text-lg max-w-2xl mx-auto leading-relaxed">
              Saigon Power is building a cleaner, more transparent way for Texans to manage their electricity —
              from selection to savings to renewal.
            </p>
          </FadeIn>

          {/* Three promise pills */}
          <FadeIn delay={0.1} className="flex flex-wrap items-center justify-center gap-4 mb-16">
            {['No guesswork', 'No confusion', 'No wasted money'].map(p => (
              <span key={p} className="flex items-center gap-2 bg-[#00C853]/10 border border-[#00C853]/20 rounded-full px-5 py-2 text-[#00C853] text-sm font-bold">
                <CheckCircle size={14} /> {p}
              </span>
            ))}
          </FadeIn>

          {/* Differentiators grid */}
          <div className="grid md:grid-cols-2 gap-5">
            {DIFFERENTIATORS.map(({ icon: Icon, title, desc, accent, bg }, i) => (
              <FadeIn key={title} delay={0.1 + i * 0.08}>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-colors h-full">
                  <div className={`w-11 h-11 ${bg} rounded-xl flex items-center justify-center mb-4`}>
                    <Icon size={20} className={accent} />
                  </div>
                  <h3 className="text-white font-bold text-base mb-2">{title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMMUNITY ── */}
      <section className="bg-[#0F172A] py-20 lg:py-28 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-[500px] h-[400px] rounded-full opacity-[0.06] pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(0,200,83,1) 0%, transparent 70%)' }} />

        <div className="relative z-10 max-w-5xl mx-auto px-5 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Left copy */}
            <FadeIn>
              <div className="inline-flex items-center gap-2 bg-white/6 border border-white/12 rounded-full px-4 py-1.5 mb-5">
                <Users size={11} className="text-white/50" />
                <span className="text-white/50 text-xs font-semibold uppercase tracking-wide">Rooted in Community</span>
              </div>
              <h2 className="text-[clamp(1.8rem,3.5vw,2.8rem)] font-black text-white tracking-tight mb-5">
                We Started With<br />
                <span className="text-[#00C853]">One Clear Mission.</span>
              </h2>
              <p className="text-white/55 text-base leading-relaxed mb-6">
                Serve the Vietnamese community in Texas — properly. For years, too many families were misled
                by complex plans, locked into bad contracts, and paying far more than they should.
              </p>
              <p className="text-white/55 text-base leading-relaxed mb-6">
                We made electricity simple, clear, and fully supported in Vietnamese.
                <span className="text-white/80 font-semibold"> But this is just the beginning.</span>
              </p>
              <div className="flex items-center gap-2 text-[#00C853] text-sm font-bold">
                <Globe size={14} />
                Our platform is designed for every household and business in Texas
              </div>
            </FadeIn>

            {/* Right: pain points */}
            <FadeIn delay={0.12}>
              <div className="bg-red-950/30 border border-red-500/20 rounded-2xl p-6 mb-4">
                <p className="text-red-400 text-xs font-bold uppercase tracking-wide mb-4">What We Saw in the Community</p>
                <ul className="space-y-3">
                  {[
                    'Families misled by confusing plan structures',
                    'Contracts renewed automatically at higher rates',
                    'No one available who spoke their language',
                    'Paying 40–60% more than neighboring households',
                  ].map(item => (
                    <li key={item} className="flex items-start gap-3 text-white/50 text-sm">
                      <span className="w-4 h-4 rounded-full border border-red-500/40 flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-green-950/30 border border-[#00C853]/25 rounded-2xl p-6">
                <p className="text-[#00C853] text-xs font-bold uppercase tracking-wide mb-4">What We Changed</p>
                <ul className="space-y-3">
                  {[
                    'Clear explanations in English and Vietnamese',
                    '60-day renewal reminders before contracts expire',
                    'A dedicated agent who answers the phone',
                    'Average savings of $150/month per household',
                  ].map(item => (
                    <li key={item} className="flex items-start gap-3 text-white/75 text-sm">
                      <CheckCircle size={14} className="text-[#00C853] flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>

          </div>
        </div>
      </section>

      {/* ── PLATFORM VISION ── */}
      <section className="py-20 lg:py-28 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[500px] rounded-full opacity-[0.08] pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(41,121,255,0.8) 0%, transparent 65%)' }} />

        <div className="relative z-10 max-w-5xl mx-auto px-5 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-start">

            <FadeIn>
              <div className="inline-flex items-center gap-2 bg-white/6 border border-white/12 rounded-full px-4 py-1.5 mb-5">
                <span className="text-white/50 text-xs font-semibold uppercase tracking-wide">This Isn&apos;t a Website. It&apos;s a Platform.</span>
              </div>
              <h2 className="text-[clamp(1.8rem,3.5vw,2.8rem)] font-black text-white tracking-tight mb-5">
                Electricity Is<br />
                <span className="text-[#00C853]">Just the Beginning.</span>
              </h2>
              <p className="text-white/55 text-base leading-relaxed mb-6">
                Saigon Power is building a full energy ecosystem — not just another plan comparison site.
                We believe energy should work like modern technology: simple, transparent, automated, and customer-first.
              </p>
              <p className="text-white/55 text-base leading-relaxed">
                Our goal is to become the default platform Texans trust to manage their electricity —
                and eventually expand into a broader ecosystem of essential services.
              </p>
            </FadeIn>

            <FadeIn delay={0.12}>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-7">
                <p className="text-white/40 text-xs font-bold uppercase tracking-wide mb-5">What the Platform Gives You</p>
                <ul className="space-y-3.5">
                  {PLATFORM_FEATURES.map(f => (
                    <li key={f} className="flex items-center gap-3 text-white/70 text-sm">
                      <ChevronRight size={14} className="text-[#00C853] flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>

          </div>
        </div>
      </section>

      {/* ── PROMISE ── */}
      <section className="bg-[#0F172A] py-16 border-y border-white/8">
        <div className="max-w-3xl mx-auto px-5 text-center">
          <FadeIn>
            <div className="w-12 h-12 bg-[#00C853]/10 border border-[#00C853]/25 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Shield size={22} className="text-[#00C853]" />
            </div>
            <h2 className="text-2xl font-black text-white mb-4">Our Promise</h2>
            <p className="text-white/50 text-base leading-relaxed max-w-xl mx-auto mb-2">
              We don&apos;t play pricing games. We don&apos;t hide behind fine print. We don&apos;t push plans that don&apos;t make sense.
            </p>
            <p className="text-white/80 font-semibold text-lg">
              We exist for one reason: to help you pay less — without thinking about it.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-20 lg:py-28 bg-[#0B1120] relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full opacity-[0.12] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(0,200,83,1) 0%, transparent 60%)' }} />

        <div className="relative z-10 max-w-2xl mx-auto px-5 text-center">
          <FadeIn>
            <h2 className="text-[clamp(1.9rem,4vw,3rem)] font-black text-white tracking-tight mb-4">
              Let&apos;s Get You<br />
              <span className="text-[#00C853]">a Better Plan.</span>
            </h2>
            <p className="text-white/50 text-lg mb-8 leading-relaxed">
              If you&apos;re paying too much — and most people are — we&apos;ll show you a better option in minutes
              and handle all the paperwork.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/compare"
                className="flex items-center gap-2 bg-[#00C853] hover:bg-[#00A846] text-white font-bold px-8 py-3.5 rounded-2xl text-sm transition-all shadow-lg shadow-green-900/30 hover:-translate-y-0.5">
                Compare Plans Free <ArrowRight size={15} />
              </Link>
              <a href="tel:+18329379999"
                className="flex items-center gap-2 text-white/50 hover:text-white/80 font-semibold text-sm border border-white/15 hover:border-white/30 px-6 py-3.5 rounded-2xl transition-all">
                <Phone size={14} />
                (832) 937-9999
              </a>
            </div>
            <p className="text-white/25 text-xs mt-5">Free · No credit check · Takes 30 seconds</p>
          </FadeIn>
        </div>
      </section>

    </div>
  )
}
