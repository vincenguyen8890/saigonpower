'use client'

import { Suspense, useState, useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import { MapPin, Zap, ArrowRight } from 'lucide-react'
import PlanCard from '@/components/compare/PlanCard'
import PlanFilters from '@/components/compare/PlanFilters'
import Button from '@/components/ui/Button'
import type { ElectricityPlan, PlanFilter, PlanSortOption } from '@/types/plans'
import { isValidZip } from '@/lib/utils'

// Inner component that uses useSearchParams — must be wrapped in Suspense
function ComparePlans() {
  const t = useTranslations('compare')
  const locale = useLocale()
  const searchParams = useSearchParams()

  const [zip, setZip] = useState(searchParams.get('zip') || '')
  const [submittedZip, setSubmittedZip] = useState(searchParams.get('zip') || '')
  const [filters, setFilters] = useState<PlanFilter>({ rateType: 'all', minRenewable: 0 })
  const [sortBy, setSortBy] = useState<PlanSortOption>('lowestRate')
  const [allPlans, setAllPlans] = useState<ElectricityPlan[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch live plans from CRM on mount
  useEffect(() => {
    fetch('/api/plans')
      .then(r => r.json())
      .then(json => setAllPlans(json.data ?? json))
      .catch(() => setAllPlans([]))
      .finally(() => setLoading(false))
  }, [])

  const residentialPlans = allPlans.filter(p => p.planType === 'residential' || p.planType === 'both')

  const filteredPlans = residentialPlans.filter((plan) => {
    if (filters.provider && plan.providerId !== filters.provider) return false
    if (filters.rateType && filters.rateType !== 'all' && plan.rateType !== filters.rateType) return false
    if (filters.termMin && plan.termMonths < filters.termMin) return false
    if (filters.termMax && plan.termMonths > filters.termMax) return false
    if (filters.minRenewable && plan.renewablePercent < filters.minRenewable) return false
    return true
  })

  const sortedPlans = [...filteredPlans].sort((a, b) => {
    if (sortBy === 'lowestRate') return a.rateKwh - b.rateKwh
    if (sortBy === 'bestValue') return a.avgMonthlyBill - b.avgMonthlyBill
    if (sortBy === 'termAsc') return a.termMonths - b.termMonths
    if (sortBy === 'renewableHigh') return b.renewablePercent - a.renewablePercent
    return 0
  })

  const handleZipSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isValidZip(zip)) setSubmittedZip(zip)
  }

  const showResults = submittedZip.length === 5

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {!showResults ? (
        <div className="max-w-xl mx-auto mt-8 text-center">
          <div className="bg-white rounded-2xl shadow-card p-8 border border-surface-border">
            <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-5">
              <MapPin size={26} className="text-brand-greenDark" />
            </div>
            <h2 className="text-xl font-bold text-brand-greenDark mb-2">{t('zipTitle')}</h2>
            <p className="text-gray-600 mb-6">{t('zipDesc')}</p>
            <form onSubmit={handleZipSubmit} className="flex gap-2">
              <div className="flex-1 relative">
                <Zap size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  placeholder={locale === 'vi' ? 'Nhập mã ZIP...' : 'Enter ZIP code...'}
                  maxLength={5}
                  className="w-full pl-9 pr-4 py-3.5 border border-surface-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green text-sm"
                />
              </div>
              <Button type="submit" variant="primary" size="md">
                {locale === 'vi' ? 'Xem Gói' : 'View Plans'} <ArrowRight size={16} />
              </Button>
            </form>
          </div>
        </div>
      ) : loading ? (
        <div className="py-20 text-center text-gray-500">
          <Zap size={32} className="mx-auto mb-3 opacity-30 animate-pulse" />
          <p>{locale === 'vi' ? 'Đang tải gói điện...' : 'Loading plans...'}</p>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin size={16} className="text-brand-green" />
              <span>{locale === 'vi' ? 'Kết quả cho ZIP:' : 'Results for ZIP:'}</span>
              <span className="font-bold text-brand-greenDark">{submittedZip}</span>
              <button onClick={() => setSubmittedZip('')} className="text-brand-green hover:underline text-xs ml-1">
                {locale === 'vi' ? '(Đổi)' : '(Change)'}
              </button>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as PlanSortOption)}
              className="border border-surface-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green bg-white"
            >
              <option value="lowestRate">{t('sortLowest')}</option>
              <option value="bestValue">{t('sortBestValue')}</option>
              <option value="termAsc">{t('sortTerm')}</option>
              <option value="renewableHigh">{locale === 'vi' ? 'Tái Tạo Cao' : 'Most Renewable'}</option>
            </select>
          </div>

          <p className="text-sm text-gray-600 mb-6">{t('resultsFound', { count: sortedPlans.length })}</p>

          <div className="grid lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <PlanFilters filters={filters} onChange={setFilters} />
            </div>
            <div className="lg:col-span-3">
              {sortedPlans.length === 0 ? (
                <div className="text-center py-16 text-gray-500">
                  <Zap size={40} className="mx-auto mb-4 opacity-30" />
                  <p className="text-lg font-medium mb-2">{t('noResults')}</p>
                  <button onClick={() => setFilters({ rateType: 'all', minRenewable: 0 })} className="text-brand-green hover:underline text-sm">
                    {t('clearFilters')}
                  </button>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {sortedPlans.map((plan, i) => (
                    <PlanCard key={plan.id} plan={plan} highlighted={i === 0} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Page wraps inner component in Suspense — required for useSearchParams on Vercel
export default function ComparePage() {
  const locale = useLocale()
  const t = useTranslations('compare')

  return (
    <div className="min-h-screen bg-surface-light pt-20">
      <div className="bg-hero-gradient text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">{t('title')}</h1>
          <p className="text-green-200 text-lg">{t('subtitle')}</p>
        </div>
      </div>
      <Suspense fallback={
        <div className="max-w-7xl mx-auto px-4 py-20 text-center text-gray-500">
          <Zap size={32} className="mx-auto mb-3 opacity-30 animate-pulse" />
          <p>{locale === 'vi' ? 'Đang tải...' : 'Loading...'}</p>
        </div>
      }>
        <ComparePlans />
      </Suspense>
    </div>
  )
}
