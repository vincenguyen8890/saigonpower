'use client'

import { useTranslations, useLocale } from 'next-intl'
import { SlidersHorizontal, X } from 'lucide-react'
import type { PlanFilter } from '@/types/plans'
import { mockProviders } from '@/data/mock-plans'
import Button from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface PlanFiltersProps {
  filters: PlanFilter
  onChange: (filters: PlanFilter) => void
}

export default function PlanFilters({ filters, onChange }: PlanFiltersProps) {
  const t = useTranslations('compare')
  const locale = useLocale()

  const hasActiveFilters =
    filters.provider ||
    filters.rateType !== 'all' ||
    filters.termMin ||
    filters.termMax ||
    (filters.minRenewable && filters.minRenewable > 0)

  const clearAll = () =>
    onChange({ rateType: 'all', provider: undefined, termMin: undefined, termMax: undefined, minRenewable: 0 })

  const termOptions = [
    { label: locale === 'vi' ? 'Tất cả' : 'All', min: undefined, max: undefined },
    { label: locale === 'vi' ? '3-6 tháng' : '3-6 mo', min: 3, max: 6 },
    { label: locale === 'vi' ? '12 tháng' : '12 mo', min: 12, max: 12 },
    { label: locale === 'vi' ? '24 tháng' : '24 mo', min: 24, max: 24 },
    { label: locale === 'vi' ? '36 tháng' : '36 mo', min: 36, max: 36 },
  ]

  return (
    <div className="bg-white rounded-2xl border border-surface-border p-5 sticky top-24">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2 font-bold text-gray-900">
          <SlidersHorizontal size={18} className="text-brand-blue" />
          {t('filterTitle')}
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="text-xs text-brand-red hover:underline flex items-center gap-1"
          >
            <X size={13} /> {t('clearFilters')}
          </button>
        )}
      </div>

      {/* Rate Type */}
      <div className="mb-5">
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2.5">
          {t('filterType')}
        </label>
        <div className="flex flex-wrap gap-2">
          {(['all', 'fixed', 'variable'] as const).map((type) => (
            <button
              key={type}
              onClick={() => onChange({ ...filters, rateType: type })}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                filters.rateType === type || (!filters.rateType && type === 'all')
                  ? 'bg-brand-blue text-white'
                  : 'bg-surface-muted text-gray-700 hover:bg-surface-border'
              )}
            >
              {type === 'all' ? t('filterAll') : type === 'fixed' ? t('filterFixed') : t('filterVariable')}
            </button>
          ))}
        </div>
      </div>

      {/* Provider */}
      <div className="mb-5">
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2.5">
          {t('filterProvider')}
        </label>
        <select
          value={filters.provider || ''}
          onChange={(e) => onChange({ ...filters, provider: e.target.value || undefined })}
          className="w-full border border-surface-border rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-blue bg-white"
        >
          <option value="">{t('filterAll')}</option>
          {mockProviders.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {/* Term */}
      <div className="mb-5">
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2.5">
          {t('filterTerm')}
        </label>
        <div className="flex flex-wrap gap-2">
          {termOptions.map(({ label, min, max }) => {
            const isActive = filters.termMin === min && filters.termMax === max
            return (
              <button
                key={label}
                onClick={() => onChange({ ...filters, termMin: min, termMax: max })}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                  isActive ? 'bg-brand-blue text-white' : 'bg-surface-muted text-gray-700 hover:bg-surface-border'
                )}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Renewable */}
      <div className="mb-5">
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2.5">
          {t('filterRenewable')}
        </label>
        <div className="flex flex-wrap gap-2">
          {[
            { label: locale === 'vi' ? 'Tất cả' : 'All', value: 0 },
            { label: '50%+', value: 50 },
            { label: '100%', value: 100 },
          ].map(({ label, value }) => (
            <button
              key={value}
              onClick={() => onChange({ ...filters, minRenewable: value })}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                (filters.minRenewable ?? 0) === value
                  ? 'bg-emerald-500 text-white'
                  : 'bg-surface-muted text-gray-700 hover:bg-surface-border'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
