import { setRequestLocale } from 'next-intl/server'
import { getDeals } from '@/lib/supabase/queries'
import { mockProviders } from '@/data/mock-crm'
import { DollarSign, TrendingUp, AlertTriangle, CheckCircle2, Clock } from 'lucide-react'

interface Props {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ status?: string }>
}

// Mock commission records tied to deals
const mockCommissions = [
  { deal_id: 'd-001', period: 'Apr 2026', expected: 200, received: 200, status: 'received' as const },
  { deal_id: 'd-001', period: 'Mar 2026', expected: 200, received: 175, status: 'short_pay' as const },
  { deal_id: 'd-002', period: 'Apr 2026', expected: 75,  received: 75,  status: 'received' as const },
  { deal_id: 'd-002', period: 'Mar 2026', expected: 75,  received: 0,   status: 'missing' as const  },
  { deal_id: 'd-003', period: 'Apr 2026', expected: 350, received: 0,   status: 'pending' as const  },
  { deal_id: 'd-004', period: 'Apr 2026', expected: 75,  received: 0,   status: 'pending' as const  },
]

const STATUS_STYLES = {
  received:  { bg: 'bg-green-50',  text: 'text-green-700',  label: 'Received'  },
  short_pay: { bg: 'bg-amber-50',  text: 'text-amber-700',  label: 'Short Pay' },
  missing:   { bg: 'bg-red-50',    text: 'text-red-700',    label: 'Missing'   },
  pending:   { bg: 'bg-gray-100',  text: 'text-gray-600',   label: 'Pending'   },
}

export default async function AccountingPage({ params, searchParams }: Props) {
  const { locale } = await params
  const { status } = await searchParams
  setRequestLocale(locale)

  const deals = await getDeals()
  const dealMap = Object.fromEntries(deals.map(d => [d.id, d]))

  const providerMap = Object.fromEntries(mockProviders.map(p => [p.name, p]))

  // Filter
  let rows = mockCommissions
  if (status && status !== 'all') rows = rows.filter(r => r.status === status)

  // Summary stats
  const totalExpected = mockCommissions.reduce((s, r) => s + r.expected, 0)
  const totalReceived = mockCommissions.reduce((s, r) => s + r.received, 0)
  const totalOutstanding = mockCommissions
    .filter(r => r.status !== 'received')
    .reduce((s, r) => s + (r.expected - r.received), 0)
  const shortPays = mockCommissions.filter(r => r.status === 'short_pay').length
  const missing   = mockCommissions.filter(r => r.status === 'missing').length

  const statusOptions = [
    { value: 'all',       label: 'All'       },
    { value: 'pending',   label: 'Pending'   },
    { value: 'received',  label: 'Received'  },
    { value: 'short_pay', label: 'Short Pay' },
    { value: 'missing',   label: 'Missing'   },
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Commission Accounting</h1>
        <p className="text-gray-500 text-sm mt-1">Track expected vs received commission per deal</p>
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
          <p className="text-xs text-gray-400 mt-1">{((totalReceived / totalExpected) * 100).toFixed(0)}% collected</p>
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
          <p className="text-2xl font-bold text-red-600">{shortPays + missing}</p>
          <p className="text-xs text-gray-400 mt-1">{shortPays} short pays · {missing} missing</p>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-5">
        <form className="flex flex-wrap gap-2">
          {statusOptions.map(opt => (
            <button
              key={opt.value}
              name="status"
              value={opt.value}
              type="submit"
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                (status ?? 'all') === opt.value
                  ? 'bg-brand-greenDark text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </form>
      </div>

      {/* Commission Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-100 bg-gray-50/50">
              <tr>
                {['Deal', 'Provider', 'Period', 'Expected', 'Received', 'Variance', 'Status'].map((h, i) => (
                  <th
                    key={i}
                    className={`text-left text-xs font-medium text-gray-400 uppercase tracking-wide px-5 py-3 ${i >= 5 ? 'hidden lg:table-cell' : ''} ${i === 2 ? 'hidden md:table-cell' : ''}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {rows.map((row, idx) => {
                const deal = dealMap[row.deal_id]
                const variance = row.received - row.expected
                const style = STATUS_STYLES[row.status]
                const provider = deal?.provider ? providerMap[deal.provider] : null
                return (
                  <tr key={idx} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-gray-900 truncate max-w-[180px]">
                        {deal?.title ?? row.deal_id}
                      </p>
                      <p className="text-xs text-gray-400">{deal?.service_type ?? '—'}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm text-gray-700">{deal?.provider ?? '—'}</p>
                      {provider && (
                        <p className="text-xs text-gray-400">
                          ${deal?.service_type === 'commercial'
                            ? provider.commission_commercial
                            : provider.commission_residential}/mo commission
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <span className="text-sm text-gray-700">{row.period}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm font-semibold text-gray-900">${row.expected}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-sm font-semibold ${row.received > 0 ? 'text-green-700' : 'text-gray-400'}`}>
                        ${row.received}
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
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {rows.length === 0 && (
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
          {mockProviders.filter(p => p.status === 'active').map(p => (
            <div key={p.id} className="bg-white rounded-xl border border-gray-100 p-3 text-center">
              <p className="text-xs font-semibold text-gray-700 truncate">{p.short_name}</p>
              <p className="text-xs text-gray-400 mt-1">Res: <span className="text-green-700 font-medium">${p.commission_residential}</span></p>
              <p className="text-xs text-gray-400">Com: <span className="text-blue-700 font-medium">${p.commission_commercial}</span></p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
