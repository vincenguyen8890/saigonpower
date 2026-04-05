'use client'

import { motion } from 'framer-motion'
import { Shield, Clock, Award, Zap, Star } from 'lucide-react'
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
    { icon: Shield, label: isVi ? 'Miễn phí 100%'      : '100% Free Service',   color: 'text-brand-green' },
    { icon: Star,   label: isVi ? '4.9/5 Google'         : '4.9/5 Google Rating', color: 'text-yellow-500'  },
    { icon: Clock,  label: isVi ? 'So sánh 30 giây'      : '30-Second Compare',   color: 'text-brand-blue'  },
    { icon: Award,  label: isVi ? '#1 Môi giới người Việt': '#1 Vietnamese Broker',color: 'text-brand-orange'},
    { icon: Zap,    label: isVi ? '50+ nhà cung cấp'     : '50+ Providers',       color: 'text-brand-blue'  },
  ]

  return (
    <div className="bg-white border-b border-surface-border">
      {/* Trust badges */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {badges.map(({ icon: Icon, label, color }) => (
            <div key={label} className="flex items-center gap-2">
              <Icon size={15} className={color} />
              <span className="text-brand-muted text-sm font-medium">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Provider marquee */}
      <div className="border-t border-surface-border bg-surface-bg py-3 overflow-hidden relative">
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-surface-bg to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-surface-bg to-transparent z-10 pointer-events-none" />

        <motion.div
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
          className="flex items-center gap-12 whitespace-nowrap"
        >
          {[...PROVIDERS, ...PROVIDERS].map((name, i) => (
            <div key={i} className="flex items-center gap-2 text-brand-subtle hover:text-brand-muted transition-colors">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-green/50" />
              <span className="text-xs font-semibold tracking-wide uppercase">{name}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
