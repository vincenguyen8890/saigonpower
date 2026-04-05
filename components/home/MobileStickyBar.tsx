'use client'

import { useLocale } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { Phone, Zap } from 'lucide-react'

export default function MobileStickyBar() {
  const locale = useLocale()
  const isVi = locale === 'vi'

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 sm:hidden bg-white border-t border-surface-border shadow-[0_-4px_20px_rgba(15,23,42,0.10)]">
      <div className="grid grid-cols-2">
        {/* Call */}
        <a
          href="tel:+18329379999"
          className="flex flex-col items-center justify-center py-3.5 gap-0.5 text-brand-dark hover:bg-surface-bg transition-colors border-r border-surface-border"
        >
          <Phone size={20} className="text-brand-blue" />
          <span className="text-xs font-bold text-brand-dark">{isVi ? 'Gọi Ngay' : 'Call Now'}</span>
          <span className="text-[10px] text-brand-muted">(832) 937-9999</span>
        </a>

        {/* Get quote — green CTA */}
        <Link
          href="/quote"
          className="flex flex-col items-center justify-center py-3.5 gap-0.5 bg-brand-green hover:bg-brand-greenDark text-white transition-colors"
        >
          <Zap size={20} className="fill-white" />
          <span className="text-xs font-bold">{isVi ? 'Nhận Báo Giá' : 'Get Quote'}</span>
          <span className="text-[10px] text-white/70">{isVi ? 'Miễn phí' : 'Free'}</span>
        </Link>
      </div>
    </div>
  )
}
