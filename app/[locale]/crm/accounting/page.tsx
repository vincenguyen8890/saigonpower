import { setRequestLocale } from 'next-intl/server'
import { getDeals, getCommissions, getProvidersFromDB } from '@/lib/supabase/queries'
import { DollarSign, TrendingUp, AlertTriangle, CheckCircle2, Clock, PlusCircle } from 'lucide-react'
import Link from 'next/link'
import RecordPaymentButton from './RecordPaymentButton'
import NewCommissionButton from './NewCommissionButton'

interface Props {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ status?: string }>
}

const STATUS_STYLES = {
  received:  { bg: 'bg-green-50',  text: 'text-green-700',  label: 'Received'  },
  short_pay: { bg: 'bg-amber-50',  text: 'text-amber-700',  label: 'Short Pay' },
  missing:   { bg: 'bg-red-50',    text: 'text-red-700',    label: 'Missing'   },
  pending:   { bg: 'bg-gray-100',  text: 'text-gray-600',   label: 'Pending'   },
}

const statusOptions = [
  { value: 'all',       label: 'All'       },
  { value: 'pending',   label: 'Pending'   },
  { value: 'received',  label: 'Received'  },
  { value: 'short_pay', label: 'Short Pay' },
  { value: 'missing',   label: 'Missing'   },
]

export default async function AccountingPage({ params, searchParams }: Props) {
  const { locale } = await params
  const { status } = await searchParams
  setRequestLocale(locale)

  const [deals, commissions, providers] = await Promise.all([
    getDeals(),
    getCommissions(status && status !== 'all' ? { status } : undefined),
    getProvidersFromDB(),
  ])

  const dealMap = Object.fromEntries(deals.map(d => [d.id, d]))
  const providerMap = Object.fromEntries(providers.map(p => [p.name, p]))

  // Auto-generate expected commission rows for active deals with NO commission record yet
  const currentPeriodStart = new Date()
  currentPeriodStart.setDate(1)
  const periodLabel = currentPeriodStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })

  const dealsWithCommission = new Set(commissions.map(c => c.deal_id))
  const activeDeals = deals.filter(d => !['won', 'lost'].includes(d.stage))

  const autoRows = activeDeals
    .filter(d => !dealsWithCommission.has(d.id) && d.provider)
    .map(d => {
      const prov = providerMap[d.provider!]
      const expected = prov
        ? (d.service_type === 'commercial' ? prov.commission_commercial : prov.commission_residential)
        : d.value
      return {
        id:              `auto-${d.id}`,
        deal_id:         d.id,
        lead_id:         d.lead_id,
        provider:        d.provider ?? '—',
        period_start:    currentPeriodStart.toISOString().split('T')[0],
        period_end:      null,
        amount_expected: expected,
        amount_received: 0,
        status:          'pending' as const,
        notes:           'Auto-computed — not yet saved',
        created_at:      new Date().toISOString(),
        _isAuto:         true,
      }
    })

  // Combine DB records + auto rows (auto rows shown at bottom)
  const allRows = [
    ...commissions,
    ...(status && status !== 'all' && status !== 'pending' ? [] : autoRows),
  ]

  // Summary — always use all commissions (not filtered) for totals
  const allCommissions = await getCommissions()
  const totalExpected   = allCommissions.reduce((s, r) => s + r.amount_expected, 0)
    + autoRows.reduce((s, r) => s + r.amount_expected, 0)
  const totalReceived   = allCommissions.reduce((s, r) => s + r.amount_received, 0)
  const totalOutstanding = allCommissions
    .filter(r => r.status !== 'received')
    .reduce((s, r) => s + (r.amount_expected - r.amount_received), 0)
    + autoRows.reduce((s, r) => s + r.amount_expected, 0)
  const issues = allCommissions.filter(r => r.status === 'short_pay' || r.status === 'missing').length

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Commission Accounting</h1>
          <p className="text-gray-500 text-sm mt-1">
            Expected vs received · Current period: {periodLabel}
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign size={15} className="text-green-500" />
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Expected</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">${totalExpected.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-1">across all periods</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 size={15} className="text-green-500" />
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Received</span>
          </div>
          <p className="text-2xl font-bold text-green-700">${totalReceived.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-1">
            {totalExpected > 0 ? ((totalReceived / totalExpected) * 100).toFixed(0) : 0}% collected
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-1">
            <Clock size={15} className="text-amber-500" />
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Outstanding</span>
          </div>
          <p className="text-2xl font-bold text-amber-600">${totalOutstanding.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-1">not yet received</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle size={15} className="text-red-500" />
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Issues</span>
          </div>
          <p className="text-2xl font-bold text-red-600">{issues}</p>
          <p className="text-xs text-gray-400 mt-1">short pays or missing</p>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-5">
        <div className="flex flex-wrap items-center gap-2">
          {statusOptions.map(opt => (
            <Link
              key={opt.value}
              href={opt.value === 'all' ? `/${locale}/crm/accounting` : `/${locale}/crm/accounting?status=${opt.value}`}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                (status ?? 'all') === opt.value
                  ? 'bg-brand-greenDark text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {opt.label}
            </Link>
          ))}
          <div className="ml-auto">
            <NewCommissionButton deals={deals} />
          </div>
        </div>
      </div>

      {/* Commission Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-100 bg-gray-50/50">
              <tr>
                {['Deal', 'Provider', 'Period', 'Expected', 'Received', 'Variance', 'Status', ''].map((h, i) => (
                  <th key={i} className={`text-left text-xs font-medium text-gray-400 uppercase tracking-wide px-5 py-3 ${
                    i === 5 ? 'hidden lg:table-cell' : ''
                  } ${i === 2 ? 'hidden md:table-cell' : ''}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {allRows.map((row, idx) => {
                const deal = row.deal_id ? dealMap[row.deal_id] : null
                const variance = row.amount_received - row.amount_expected
                const style = STATUS_STYLES[row.status]
                const isAuto = '_isAuto' in row && Boolean(row._isAuto)
                return (
                  <tr key={idx} className={`hover:bg-gray-50/60 transition-colors ${isAuto ? 'opacity-60' : ''}`}>
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-gray-900 truncate max-w-[180px]">
                        {deal?.title ?? '—'}
                      </p>
                      <p className="text-xs text-gray-400">
                        {deal?.service_type ?? '—'}
                        {isAuto && <span className="ml-1 text-amber-500 italic">· auto</span>}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm text-gray-700">{row.provider}</p>
                      {providerMap[row.provider] && (
                        <p className="text-xs text-gray-400">
                          ${deal?.service_type === 'commercial'
                            ? providerMap[row.provider].commission_commercial
                            : providerMap[row.provider].commission_residential}/mo rate
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <span className="text-sm text-gray-700">
                        {new Date(row.period_start).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm font-semibold text-gray-900">${row.amount_expected}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-sm font-semibold ${row.amount_received > 0 ? 'text-green-700' : 'text-gray-400'}`}>
                        ${row.amount_received}
                      </span>
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell">
                      <span className={`text-sm font-semibold ${
                        variance === 0 ? 'text-gray-400' : variance > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {variance === 0 ? '—' : `${variance > 0 ? '+' : ''}$${variance}`}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${style.bg} ${style.text}`}>
                        {style.label}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      {!isAuto && row.status !== 'received' && (
                        <RecordPaymentButton commission={row} />
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {allRows.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <TrendingUp size={32} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">No records match this filter.</p>
          </div>
        )}
      </div>

      {/* Provider Commission Reference */}
      <div className="mt-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Provider Commission Rates</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {providers.filter(p => p.status === 'active').map(p => (
            <div key={p.id} className="bg-white rounded-xl border border-gray-100 p-3 text-center">
              <p className="text-xs font-semibold text-gray-700 truncate">{p.short_name}</p>
              <p className="text-xs text-gray-400 mt-1">Res: <span className="text-green-700 font-medium">${p.commission_residential}</span></p>
              <p className="text-xs text-gray-400">Com: <span className="text-blue-700 font-medium">${p.commission_commercial}</span></p>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3 italic">
          * &quot;Auto&quot; rows are computed from active deals without a commission record — click &quot;+ Add&quot; to save them.
        </p>
      </div>
    </div>
  )
}
