'use client'

import { useState, useEffect } from 'react'
import { useRouter } from '@/i18n/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, MapPin, Zap } from 'lucide-react'
import { isValidZip } from '@/lib/utils'

export default function StickyRateCTA() {
  const router = useRouter()
  const [visible, setVisible] = useState(false)
  const [zip, setZip] = useState('')

  useEffect(() => {
    const handler = () => setVisible(window.scrollY > 600)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValidZip(zip)) return
    router.push({ pathname: '/compare', query: { zip } } as Parameters<typeof router.push>[0])
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0,  opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="fixed top-0 left-0 right-0 z-[60] bg-[#0B1120]/95 backdrop-blur-md border-b border-white/10 shadow-2xl"
        >
          <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
            <div className="hidden sm:flex items-center gap-2">
              <Zap size={14} className="text-[#00C853] fill-[#00C853]" />
              <span className="text-white text-sm font-semibold">Today&apos;s lowest: <span className="text-[#00C853]">10.9¢/kWh</span></span>
              <span className="text-white/30 text-xs">— rates updated daily</span>
            </div>

            <form onSubmit={handleSubmit} className="flex items-center gap-2 flex-1 sm:flex-initial justify-end">
              <div className="relative">
                <MapPin size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  inputMode="numeric"
                  value={zip}
                  onChange={e => setZip(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter ZIP"
                  maxLength={5}
                  className="w-28 pl-8 pr-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/35 text-sm focus:outline-none focus:ring-2 focus:ring-[#00C853]/40"
                />
              </div>
              <button type="submit"
                className="bg-[#00C853] hover:bg-[#00A846] text-white text-sm font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap shadow-lg shadow-green-900/30">
                See Plans <ArrowRight size={13} />
              </button>
            </form>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
