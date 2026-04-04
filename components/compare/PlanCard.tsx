'use client'

import { useTranslations, useLocale } from 'next-intl'
import { useRouter } from '@/i18n/navigation'
import { Leaf, Clock, DollarSign, ArrowRight, ExternalLink } from 'lucide-react'
import type { ElectricityPlan } from '@/types/plans'
import Button from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface PlanCardProps {
  plan: ElectricityPlan
  highlighted?: boolean
}

const BADGE_CONFIG: Record<string, { vi: string; en: string; className: string }> = {
  popular: { vi: 'Phổ Biến', en: 'Popular', className: 'bg-blue-100 text-blue-700' },
  bestValue: { vi: 'Giá Tốt Nhất', en: 'Best Value', className: 'bg-amber-100 text-amber-700' },
  green: { vi: 'Xanh 100%', en: '100% Green', className: 'bg-emerald-100 text-emerald-700' },
  noFee: { vi: 'Không Phí Hủy', en: 'No Cancel Fee', className: 'bg-purple-100 text-purple-700' },
}

export default function PlanCard({ plan, highlighted = false }: PlanCardProps) {
  const t = useTranslations('compare')
  const locale = useLocale()
  const router = useRouter()

  const handleSelect = () => {
    router.push({ pathname: '/quote', query: { plan: plan.id, provider: plan.providerId } } as Parameters<typeof router.push>[0])
  }

  return (
    <div
      className={cn(
        'bg-white rounded-2xl border-2 transition-all duration-300 hover:shadow-card-hover overflow-hidden',
        highlighted
          ? 'border-brand-blue shadow-blue ring-1 ring-brand-blue/20'
          : 'border-surface-border shadow-card hover:-translate-y-0.5'
      )}
    >
      {highlighted && (
        <div className="bg-brand-blue text-white text-xs font-semibold text-center py-2">
          ⭐ {locale === 'vi' ? 'Được Chọn Nhiều Nhất' : 'Most Selected'}
        </div>
      )}

      <div className="p-5">
        {/* Provider + badges */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">
              {plan.provider.name}
            </div>
            <div className="font-bold text-gray-900 text-base">{plan.name}</div>
            <div className="flex items-center gap-1 mt-1">
              {[...Array(Math.floor(plan.provider.rating))].map((_, i) => (
                <span key={i} className="text-brand-gold text-xs">★</span>
              ))}
              <span className="text-xs text-gray-500 ml-1">({plan.provider.reviewCount.toLocaleString()})</span>
            </div>
          </div>
          <div className="flex flex-col gap-1 items-end">
            {plan.badges.slice(0, 2).map((badge) => {
              const b = BADGE_CONFIG[badge]
              return b ? (
                <span key={badge} className={`text-xs font-semibold px-2 py-0.5 rounded-full ${b.className}`}>
                  {locale === 'vi' ? b.vi : b.en}
                </span>
              ) : null
            })}
          </div>
        </div>

        {/* Main rate */}
        <div className="flex items-end gap-1.5 mb-1">
          <span className="text-4xl font-bold text-brand-blue">{plan.rateKwh.toFixed(1)}</span>
          <span className="text-gray-500 mb-1">{t('perKwh')}</span>
        </div>
        <div className="text-xs text-gray-400 mb-5">
          {locale === 'vi' ? 'tại mức sử dụng 1,000 kWh' : 'at 1,000 kWh usage'}
        </div>

        {/* Rate grid */}
        <div className="grid grid-cols-3 gap-2 mb-4 text-center text-xs">
          <div className="bg-surface-light rounded-lg p-2.5">
            <Clock size={12} className="text-gray-400 mx-auto mb-1" />
            <div className="font-bold text-gray-800">{plan.termMonths}</div>
            <div className="text-gray-500">{t('months')}</div>
          </div>
          <div className="bg-surface-light rounded-lg p-2.5">
            <Leaf size={12} className={cn('mx-auto mb-1', plan.renewablePercent >= 100 ? 'text-emerald-500' : 'text-gray-400')} />
            <div className="font-bold text-gray-800">{plan.renewablePercent}%</div>
            <div className="text-gray-500">{t('renewable')}</div>
          </div>
          <div className="bg-surface-light rounded-lg p-2.5">
            <DollarSign size={12} className="text-gray-400 mx-auto mb-1" />
            <div className="font-bold text-gray-800">${plan.avgMonthlyBill.toFixed(0)}</div>
            <div className="text-gray-500">{locale === 'vi' ? 'TB/tháng' : 'avg/mo'}</div>
          </div>
        </div>

        {/* Details row */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-4 py-3 border-t border-surface-border">
          <div>
            {locale === 'vi' ? 'Loại giá: ' : 'Rate type: '}
            <span className="font-medium text-gray-700">
              {plan.rateType === 'fixed'
                ? (locale === 'vi' ? 'Cố định' : 'Fixed')
                : (locale === 'vi' ? 'Thả nổi' : 'Variable')
              }
            </span>
          </div>
          <div className={cn(plan.cancellationFee === 0 ? 'text-emerald-600 font-medium' : 'text-gray-500')}>
            {plan.cancellationFee === 0
              ? (locale === 'vi' ? '✓ Không phí hủy' : '✓ No cancel fee')
              : `${locale === 'vi' ? 'Phí hủy' : 'Cancel'}: $${plan.cancellationFee}`
            }
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant={highlighted ? 'primary' : 'outline'}
            size="sm"
            className="flex-1"
            onClick={handleSelect}
          >
            {t('selectPlan')} <ArrowRight size={14} />
          </Button>
          <a
            href={plan.eflUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl border border-surface-border hover:bg-surface-muted transition-colors"
            title={locale === 'vi' ? 'Xem chi tiết' : 'View EFL'}
          >
            <ExternalLink size={14} className="text-gray-500" />
          </a>
        </div>
      </div>
    </div>
  )
}
