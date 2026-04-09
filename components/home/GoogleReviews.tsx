'use client'

import { useRef, useState } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react'

const REVIEWS = [
  {
    name: 'Lan Nguyễn',
    location: 'Houston, TX',
    initials: 'LN',
    color: 'bg-[#2979FF]',
    savings: '$340/yr',
    before: '15.8¢',
    after: '10.9¢',
    text: 'Saigon Power saved me $340 last year. They explain everything clearly and handle all the paperwork — I didn\'t have to do anything.',
  },
  {
    name: 'Minh Trần',
    location: 'Sugar Land, TX',
    initials: 'MT',
    color: 'bg-[#00C853]',
    savings: '$80/mo',
    before: '16.2¢',
    after: '11.5¢',
    text: 'As a nail salon owner, switching electricity was always confusing. Saigon Power handled all 3 of my locations and saved $80/month.',
  },
  {
    name: 'Hoa Lê',
    location: 'Katy, TX',
    initials: 'HL',
    color: 'bg-orange-500',
    savings: '$95/mo',
    before: '17.1¢',
    after: '11.9¢',
    text: 'They reminded me 60 days before my contract expired — saved me from a huge rate spike. Outstanding service, I tell everyone I know.',
  },
  {
    name: 'Tuấn Phạm',
    location: 'Pearland, TX',
    initials: 'TP',
    color: 'bg-purple-500',
    savings: '$67/mo',
    before: '16.0¢',
    after: '10.5¢',
    text: 'I was paying 16¢/kWh. They found me a 10.5¢ plan. That\'s a massive difference every single month. The process took 30 minutes.',
  },
  {
    name: 'Dũng Ngô',
    location: 'Richmond, TX',
    initials: 'DN',
    color: 'bg-teal-500',
    savings: '$220/mo',
    before: '18.3¢',
    after: '12.1¢',
    text: 'Running a Vietnamese restaurant, electricity is our biggest expense. Saigon Power cut our bill by 22%. That\'s real money every month.',
  },
  {
    name: 'Mai Võ',
    location: 'Stafford, TX',
    initials: 'MV',
    color: 'bg-rose-500',
    savings: '$55/mo',
    before: '14.9¢',
    after: '10.9¢',
    text: 'My whole family uses Saigon Power now. They explain fixed vs variable rates — nobody had ever explained that to me before. 10/10.',
  },
]

export default function GoogleReviews() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const [current, setCurrent] = useState(0)

  const visible3 = [0, 1, 2].map(offset => REVIEWS[(current + offset) % REVIEWS.length])

  return (
    <section className="bg-[#0F172A] py-20 lg:py-28 relative overflow-hidden">

      {/* Green ambient glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] rounded-full opacity-[0.07] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(0,200,83,1) 0%, transparent 65%)' }} />

      <div ref={ref} className="max-w-6xl mx-auto px-5 lg:px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          {/* Google badge */}
          <div className="inline-flex items-center gap-3 bg-white/8 border border-white/12 rounded-2xl px-5 py-2.5 mb-6">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => <Star key={i} size={13} className="fill-yellow-400 text-yellow-400" />)}
            </div>
            <span className="text-white font-black text-lg">4.9</span>
            <span className="text-white/40 text-xs">·</span>
            <span className="text-white/60 text-sm">200+ Google Reviews</span>
          </div>

          <h2 className="text-[clamp(1.8rem,4vw,3rem)] font-black text-white tracking-tight mb-3">
            Real Texans. Real Savings.
          </h2>
          <p className="text-white/50 text-lg">
            Here&apos;s what happened when they stopped overpaying.
          </p>
        </motion.div>

        {/* Desktop: 3 cards */}
        <div className="hidden md:grid md:grid-cols-3 gap-5 mb-8">
          {visible3.map((r, i) => (
            <motion.div
              key={`${current}-${i}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.07 }}
              className="bg-white/6 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-colors"
            >
              {/* Rate savings */}
              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-white/8">
                <div className="flex-1 text-center">
                  <p className="text-white/35 text-[10px] font-semibold uppercase mb-1">Before</p>
                  <p className="text-red-400 font-black text-lg">{r.before}</p>
                  <p className="text-white/25 text-[10px]">per kWh</p>
                </div>
                <div className="text-white/20 text-lg">→</div>
                <div className="flex-1 text-center">
                  <p className="text-white/35 text-[10px] font-semibold uppercase mb-1">After</p>
                  <p className="text-[#00C853] font-black text-lg">{r.after}</p>
                  <p className="text-white/25 text-[10px]">per kWh</p>
                </div>
                <div className="flex-shrink-0 bg-[#00C853]/15 border border-[#00C853]/25 rounded-xl px-2.5 py-1.5 text-center">
                  <p className="text-[#00C853] font-black text-sm">{r.savings}</p>
                  <p className="text-[#00C853]/60 text-[9px]">saved</p>
                </div>
              </div>

              <Quote size={16} className="text-white/15 mb-3" />
              <p className="text-white/65 text-sm leading-relaxed mb-5">{r.text}</p>

              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-full ${r.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                  {r.initials}
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">{r.name}</p>
                  <p className="text-white/40 text-xs">{r.location}</p>
                </div>
                <div className="ml-auto flex gap-0.5">
                  {[...Array(5)].map((_, i) => <Star key={i} size={10} className="fill-yellow-400 text-yellow-400" />)}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mobile: single card */}
        <div className="md:hidden mb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.25 }}
              className="bg-white/6 border border-white/10 rounded-2xl p-6"
            >
              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-white/8">
                <div className="flex-1 text-center">
                  <p className="text-white/35 text-[10px] font-semibold uppercase mb-1">Before</p>
                  <p className="text-red-400 font-black text-xl">{REVIEWS[current].before}</p>
                </div>
                <span className="text-white/25 text-xl">→</span>
                <div className="flex-1 text-center">
                  <p className="text-white/35 text-[10px] font-semibold uppercase mb-1">After</p>
                  <p className="text-[#00C853] font-black text-xl">{REVIEWS[current].after}</p>
                </div>
                <div className="bg-[#00C853]/15 border border-[#00C853]/25 rounded-xl px-3 py-1.5 text-center">
                  <p className="text-[#00C853] font-black">{REVIEWS[current].savings}</p>
                  <p className="text-[#00C853]/60 text-[10px]">saved</p>
                </div>
              </div>
              <p className="text-white/65 text-sm leading-relaxed mb-5">{REVIEWS[current].text}</p>
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-full ${REVIEWS[current].color} flex items-center justify-center text-white text-xs font-bold`}>
                  {REVIEWS[current].initials}
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">{REVIEWS[current].name}</p>
                  <p className="text-white/40 text-xs">{REVIEWS[current].location}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center gap-4">
          <button onClick={() => setCurrent(c => (c - 1 + REVIEWS.length) % REVIEWS.length)}
            className="w-9 h-9 rounded-full border border-white/15 bg-white/5 hover:border-[#00C853] hover:text-[#00C853] flex items-center justify-center text-white/50 transition-all">
            <ChevronLeft size={16} />
          </button>
          <div className="flex gap-1.5">
            {REVIEWS.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? 'w-6 bg-[#00C853]' : 'w-1.5 bg-white/20 hover:bg-white/40'}`} />
            ))}
          </div>
          <button onClick={() => setCurrent(c => (c + 1) % REVIEWS.length)}
            className="w-9 h-9 rounded-full border border-white/15 bg-white/5 hover:border-[#00C853] hover:text-[#00C853] flex items-center justify-center text-white/50 transition-all">
            <ChevronRight size={16} />
          </button>
        </div>

      </div>
    </section>
  )
}
