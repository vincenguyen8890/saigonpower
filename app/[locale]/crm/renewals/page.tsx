import { RefreshCw, Calendar, MapPin, AlertTriangle } from 'lucide-react'
import { setRequestLocale } from 'next-intl/server'
import { formatDate } from '@/lib/utils'
import { createClient } from '@/lib/supabase/server'

interface Props { params: Promise<{ locale: string }> }

const mockContracts = [
  { id: 'CTR-001', user_name: 'Hung Le',         plan_name: 'Gexa Saver 12',       provider: 'Gexa Energy',    rate_kwh: 0.109, start_date: '2024-01-15', end_date: '2025-01-15', service_address: '1234 Main St, Houston TX 77036',      status: 'active', service_type: 'residential' },
  { id: 'CTR-002', user_name: 'Mai Pham',         plan_name: 'TXU Energy Saver 24', provider: 'TXU Energy',     rate_kwh: 0.118, start_date: '2023-06-01', end_date: '2025-06-01', service_address: '5678 Oak Ave, Katy TX 77450',          status: 'active', service_type: 'residential' },
  { id: 'CTR-003', user_name: 'Minh Tran Nails',  plan_name: 'Reliant Business 12', provider: 'Reliant Energy', rate_kwh: 0.132, start_date: '2024-03-01', end_date: '2025-03-01', service_address: '910 Business Blvd, Sugar Land TX 77479', status: 'active', service_type: 'commercial'  },
  { id: 'CTR-004', user_name: 'Linh Do',          plan_name: 'Green Mtn Simple 12', provider: 'Green Mountain', rate_kwh: 0.125, start_date: '2024-02-01', end_date: '2025-02-01', service_address: '321 Elm St, Houston TX 77081',         status: 'active', service_type: 'residential' },
  { id: 'CTR-005', user_name: 'David Kim',        plan_name: 'Cirro Value 6',       provider: 'Cirro Energy',   rate_kwh: 0.114, start_date: '2024-10-01', end_date: '2025-04-01', service_address: '654 Pine Rd, Pearland TX 77584',       status: 'active', service_type: 'residential' },
]

export default async function RenewalsPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const isVi = locale === 'vi'

  let contracts = mockContracts
  const isPlaceholder = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')
  if (!isPlaceholder) {
    try {
      const supabase = await createClient()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase.from('contracts') as any)
        .select('*, users(full_name), plans(name, rate_kwh), providers(name)')
        .eq('status', 'active')
        .order('end_date', { ascending: true })
        .limit(200)
      if (data?.length) contracts = data
    } catch { /* fallback to mock */ }
  }

  const now = new Date()

  const buckets = {
    within30:  contracts.filter(c => { const d = Math.ceil((new Date(c.end_date).getTime() - now.getTime()) / 86400000); return d > 0 && d <= 30 }),
    within60:  contracts.filter(c => { const d = Math.ceil((new Date(c.end_date).getTime() - now.getTime()) / 86400000); return d > 30 && d <= 60 }),
    within90:  contracts.filter(c => { const d = Math.ceil((new Date(c.end_date).getTime() - now.getTime()) / 86400000); return d > 60 && d <= 90 }),
    expired:   contracts.filter(c => new Date(c.end_date) <= now),
  }

  const sections = [
    { key: 'within30', label: isVi ? 'Hết Hạn Trong 30 Ngày' : 'Expiring Within 30 Days', color: 'red',   contracts: buckets.within30  },
    { key: 'within60', label: isVi ? 'Hết Hạn Trong 60 Ngày' : 'Expiring Within 60 Days', color: 'amber', contracts: buckets.within60  },
    { key: 'within90', label: isVi ? 'Hết Hạn Trong 90 Ngày' : 'Expiring Within 90 Days', color: 'blue',  contracts: buckets.within90  },
    { key: 'expired',  label: isVi ? 'Đã Hết Hạn'            : 'Already Expired',          color: 'gray',  contracts: buckets.expired   },
  ]

  const colorMap = {
    red:   { badge: 'bg-red-100 text-red-700',     dot: 'bg-red-500',   icon: 'text-red-500'   },
    amber: { badge: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500', icon: 'text-amber-500' },
    blue:  { badge: 'bg-blue-100 text-blue-700',   dot: 'bg-blue-500',  icon: 'text-blue-500'  },
    gray:  { badge: 'bg-gray-100 text-gray-500',   dot: 'bg-gray-400',  icon: 'text-gray-400'  },
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{isVi ? 'Gia Hạn Hợp Đồng' : 'Contract Renewals'}</h1>
        <p className="text-gray-500 text-sm mt-1">
          {buckets.within30.length} {isVi ? 'hợp đồng cần gia hạn ngay' : 'contracts need immediate attention'}
          {buckets.within60.length > 0 && ` · ${buckets.within60.length} ${isVi ? 'trong 60 ngày' : 'within 60 days'}`}
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {sections.map(s => {
          const c = colorMap[s.color as keyof typeof colorMap]
          return (
            <div key={s.key} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center justify-between mb-2">
                <div className={`w-2.5 h-2.5 rounded-full ${c.dot}`} />
                <AlertTriangle size={14} className={c.icon} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{s.contracts.length}</p>
              <p className="text-xs text-gray-500 mt-0.5 leading-snug">{s.label}</p>
            </div>
          )
        })}
      </div>

      {/* Sections */}
      <div className="space-y-8">
        {sections.filter(s => s.contracts.length > 0).map(s => {
          const c = colorMap[s.color as keyof typeof colorMap]
          return (
            <div key={s.key}>
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-2 h-2 rounded-full ${c.dot}`} />
                <h2 className="font-semibold text-gray-700 text-sm">{s.label}</h2>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.badge}`}>{s.contracts.length}</span>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead className="border-b border-gray-100 bg-gray-50/50">
                    <tr>
                      {[isVi?'Khách Hàng':'Customer', isVi?'Gói Điện':'Plan', isVi?'Nhà Cung Cấp':'Provider', isVi?'Giá':'Rate', isVi?'Hết Hạn':'Expires', isVi?'Hành Động':'Action'].map((h, i) => (
                        <th key={i} className={`text-left text-xs font-medium text-gray-400 uppercase tracking-wide px-5 py-3 ${i === 2 ? 'hidden md:table-cell' : ''}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {s.contracts.map(contract => {
                      const daysLeft = Math.ceil((new Date(contract.end_date).getTime() - now.getTime()) / 86400000)
                      return (
                        <tr key={contract.id} className="hover:bg-gray-50/60 transition-colors">
                          <td className="px-5 py-4">
                            <p className="text-sm font-semibold text-gray-900">{contract.user_name}</p>
                            <p className="text-xs text-gray-400 flex items-center gap-1">
                              <MapPin size={10} />
                              {contract.service_address?.split(',').slice(-2).join(',').trim()}
                            </p>
                          </td>
                          <td className="px-5 py-4">
                            <p className="text-sm text-gray-700">{contract.plan_name}</p>
                            <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${contract.service_type === 'commercial' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'}`}>
                              {contract.service_type === 'commercial' ? (isVi ? 'TM' : 'Comm.') : (isVi ? 'DC' : 'Res.')}
                            </span>
                          </td>
                          <td className="px-5 py-4 hidden md:table-cell">
                            <p className="text-xs text-gray-600">{contract.provider}</p>
                          </td>
                          <td className="px-5 py-4">
                            <span className="text-sm font-medium text-gray-900">{(contract.rate_kwh * 100).toFixed(1)}¢</span>
                            <span className="text-xs text-gray-400">/kWh</span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-1.5">
                              <Calendar size={13} className={c.icon} />
                              <div>
                                <p className="text-xs text-gray-700">{formatDate(contract.end_date, locale)}</p>
                                <p className={`text-xs font-medium ${c.icon}`}>
                                  {daysLeft > 0 ? `${daysLeft} ${isVi ? 'ngày' : 'days'}` : (isVi ? 'Đã hết hạn' : 'Expired')}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <button className="text-xs bg-brand-greenDark text-white px-3 py-1.5 rounded-lg hover:bg-brand-green transition-colors font-medium flex items-center gap-1">
                              <RefreshCw size={11} />
                              {isVi ? 'Gia Hạn' : 'Renew'}
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )
        })}

        {sections.every(s => s.contracts.length === 0) && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-16 text-center text-gray-400">
            <RefreshCw size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-lg font-medium">{isVi ? 'Không có hợp đồng sắp hết hạn' : 'No contracts expiring soon'}</p>
          </div>
        )}
      </div>
    </div>
  )
}
