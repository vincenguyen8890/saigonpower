'use client'

import { motion } from 'framer-motion'
import { Shield, Clock, Award, Zap } from 'lucide-react'
import { useLocale } from 'next-intl'

const PROVIDERS = [
  'Gexa Energy', 'TXU Energy', 'Reliant Energy', 'Green Mountain Energy',
  'Cirro Energy', 'Payless Power', '4Change Energy', 'Pulse Power',
  'Constellation', 'NRG Energy', 'Ambit Energy', 'Stream Energy',
]

export default function TrustBar() {
  const locale = useLocale()
  const isVi = locale === 'vi'

  const badges = [
    { icon: Shield, text: isVi ? 'Miễn phí 100%' : '100% Free Service' },
    { icon: Clock,  text: isVi ? 'So sánh 30 giây' : 'Compare in 30 Sec' },
    { icon: Award,  text: isVi ? 'Đánh giá cao nhất' : '#1 Vietnamese Broker' },
    { icon: Zap,    text: isVi ? '50+ nhà cung cấp' : '50+ Providers' },
  ]

  return (
    <div className="bg-[#03080E] border-y border-white/[0.06]">
      {/* Trust badges row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {badges.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center justify-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-brand-green/10 flex items-center justify-center flex-shrink-0">
                <Icon size={14} className="text-brand-green" />
              </div>
              <span className="text-white/60 text-sm font-medium">{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Provider marquee */}
      <div className="border-t border-white/[0.04] py-4 overflow-hidden relative">
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#03080E] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#03080E] to-transparent z-10 pointer-events-none" />

        <motion.div
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
          className="flex items-center gap-12 whitespace-nowrap"
        >
          {[...PROVIDERS, ...PROVIDERS].map((name, i) => (
            <div key={i} className="flex items-center gap-2.5 text-white/25 hover:text-white/50 transition-colors">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-green/40" />
              <span className="text-sm font-medium tracking-wide">{name}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
