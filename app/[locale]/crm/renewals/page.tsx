import { Calendar, MapPin, RefreshCw, AlertTriangle } from 'lucide-react'
import { setRequestLocale } from 'next-intl/server'
import { formatDate } from '@/lib/utils'
import { getDeals, getLeads } from '@/lib/supabase/queries'
import StartRenewalButton from './StartRenewalButton'

interface Props { params: Promise<{ locale: string }> }

export default async function RenewalCalendarPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const [deals, leads] = await Promise.all([getDeals('won'), getLeads()])

  // Only won deals with a contract end date
  const contracts = deals.filter(d => d.contract_end_date)

  const leadMap = Object.fromEntries(leads.map(l => [l.id, l]))

  const now = new Date()

  const getDaysLeft = (endDate: string) =>
    Math.ceil((new Date(endDate).getTime() - now.getTime()) / 86400000)

  const getUrgency = (days: number) =>
    days < 0 ? 'expired' : days <= 30 ? 'critical' : days <= 60 ? 'warning' : 'ok'

  const urgencyConfig = {
    expired:  { bar: 'bg-gray-400',   text: 'text-gray-500',  badge: 'bg-gray-100 text-gray-500',    label: 'Expired'       },
    critical: { bar: 'bg-red-500',    text: 'text-red-600',   badge: 'bg-red-100 text-red-700',      label: 'Renew now'     },
    warning:  { bar: 'bg-amber-400',  text: 'text-amber-600', badge: 'bg-amber-100 text-amber-700',  label: 'Expiring soon' },
    ok:       { bar: 'bg-green-400',  text: 'text-green-600', badge: 'bg-green-100 text-green-700',  label: 'On track'      },
  }

  const counts = {
    expired:  contracts.filter(d => getDaysLeft(d.contract_end_date!) < 0).length,
    critical: contracts.filter(d => { const n = getDaysLeft(d.contract_end_date!); return n >= 0 && n <= 30 }).length,
    warning:  contracts.filter(d => { const n = getDaysLeft(d.contract_end_date!); return n > 30 && n <= 60 }).length,
    ok:       contracts.filter(d => getDaysLeft(d.contract_end_date!) > 60).length,
  }

  // Sort by soonest expiry first
  const sorted = [...contracts].sort(
    (a, b) => new Date(a.contract_end_date!).getTime() - new Date(b.contract_end_date!).getTime()
  )

  // Group by month
  const byMonth = sorted.reduce<Record<string, typeof sorted>>((acc, d) => {
    const key = new Date(d.contract_end_date!).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
    if (!acc[key]) acc[key] = []
    acc[key].push(d)
    return acc
  }, {})

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar size={22} className="text-brand-greenDark" />
            Renewal Calendar
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {counts.critical > 0
              ? <span className="text-red-600 font-medium">{counts.critical} need renewal within 30 days</span>
              : 'No urgent renewals'}
            {' '}&middot; {contracts.length} active contracts
          </p>
        </div>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-4 gap-3 mb-8">
        {([
          { key: 'expired',  label: 'Expired',        count: counts.expired  },
          { key: 'critical', label: 'Within 30 days', count: counts.critical },
          { key: 'warning',  label: 'Within 60 days', count: counts.warning  },
          { key: 'ok',       label: 'Over 60 days',   count: counts.ok       },
        ] as const).map(s => {
          const cfg = urgencyConfig[s.key]
          return (
            <div key={s.key} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className={`w-3 h-3 rounded-full ${cfg.bar} mb-2`} />
              <p className="text-2xl font-bold text-gray-900">{s.count}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          )
        })}
      </div>

      {/* Alert banner for critical */}
      {counts.critical > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-5 flex items-start gap-3">
          <AlertTriangle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-700">
              {counts.critical} contract{counts.critical > 1 ? 's' : ''} expiring within 30 days
            </p>
            <p className="text-xs text-red-600 mt-0.5">
              Click &quot;Renew&quot; to create a renewal deal and start rate shopping for the customer.
            </p>
          </div>
        </div>
      )}

      {contracts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-16 text-center text-gray-400">
          <RefreshCw size={40} className="mx-auto mb-3 opacity-30" />
          <p>No won deals with contract end dates</p>
          <p className="text-xs mt-1">Set a contract end date on won deals to track renewals here.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(byMonth).map(([month, monthDeals]) => (
            <div key={month}>
              <div className="flex items-center gap-3 mb-3">
                <h2 className="font-semibold text-gray-700 text-sm capitalize">{month}</h2>
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-xs text-gray-400">{monthDeals.length} contracts</span>
              </div>

              <div className="space-y-2">
                {monthDeals.map(deal => {
                  const daysLeft = getDaysLeft(deal.contract_end_date!)
                  const urgency = getUrgency(daysLeft)
                  const cfg = urgencyConfig[urgency]
                  const lead = deal.lead_id ? leadMap[deal.lead_id] : null
                  const displayName = lead?.name ?? deal.title

                  return (
                    <div key={deal.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm flex overflow-hidden hover:shadow-md transition-shadow">
                      <div className={`w-1 flex-shrink-0 ${cfg.bar}`} />

                      <div className="flex-1 p-4 flex flex-wrap items-center gap-4">
                        {/* Customer */}
                        <div className="min-w-[160px]">
                          <p className="text-sm font-semibold text-gray-900">{displayName}</p>
                          <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                            <MapPin size={10} />
                            {deal.service_address?.split(',').slice(-2).join(',').trim() ?? '—'}
                          </p>
                        </div>

                        {/* Plan */}
                        <div className="hidden sm:block min-w-[140px]">
                          <p className="text-xs text-gray-400">Current plan</p>
                          <p className="text-sm text-gray-700">{deal.plan_name ?? deal.provider ?? '—'}</p>
                          {deal.rate_kwh && (
                            <p className="text-xs text-gray-400">{(deal.rate_kwh * 100).toFixed(1)}¢/kWh</p>
                          )}
                        </div>

                        {/* Expiry */}
                        <div className="min-w-[100px]">
                          <p className="text-xs text-gray-400">Expires</p>
                          <p className="text-sm font-medium text-gray-900">{formatDate(deal.contract_end_date!, locale)}</p>
                        </div>

                        {/* Days left */}
                        <div>
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${cfg.badge}`}>
                            {daysLeft < 0 ? 'Expired' : `${daysLeft} days left`}
                          </span>
                        </div>

                        {/* Type */}
                        <span className={`text-xs px-2 py-0.5 rounded font-medium hidden md:inline ${
                          deal.service_type === 'commercial' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'
                        }`}>
                          {deal.service_type === 'commercial' ? 'Comm.' : 'Res.'}
                        </span>

                        {/* Actions */}
                        <div className="ml-auto">
                          <StartRenewalButton
                            contractId={deal.id}
                            leadId={deal.lead_id ?? null}
                            customerName={displayName}
                            provider={deal.provider ?? ''}
                            planName={deal.plan_name ?? null}
                            serviceType={(deal.service_type as 'residential' | 'commercial') ?? 'residential'}
                            currentRate={deal.rate_kwh ?? null}
                            endDate={deal.contract_end_date!}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
