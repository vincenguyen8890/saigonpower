import { RefreshCw, Calendar, MapPin, Bell } from 'lucide-react'
import { setRequestLocale } from 'next-intl/server'
import { formatDate } from '@/lib/utils'
import { createClient } from '@/lib/supabase/server'

interface Props { params: Promise<{ locale: string }> }

const mockContracts = [
  { id: 'CTR-001', user_name: 'Hung Le',        plan_name: 'Gexa Saver 12',       provider: 'Gexa Energy',    rate_kwh: 0.109, end_date: '2025-01-15', service_address: '1234 Main St, Houston TX 77036',      status: 'active', service_type: 'residential' },
  { id: 'CTR-004', user_name: 'Linh Do',         plan_name: 'Green Mtn Simple 12', provider: 'Green Mountain', rate_kwh: 0.125, end_date: '2025-02-01', service_address: '321 Elm St, Houston TX 77081',         status: 'active', service_type: 'residential' },
  { id: 'CTR-003', user_name: 'Minh Tran Nails', plan_name: 'Reliant Business 12', provider: 'Reliant Energy', rate_kwh: 0.132, end_date: '2025-03-01', service_address: '910 Business Blvd, Sugar Land TX 77479', status: 'active', service_type: 'commercial'  },
  { id: 'CTR-005', user_name: 'David Kim',       plan_name: 'Cirro Value 6',       provider: 'Cirro Energy',   rate_kwh: 0.114, end_date: '2025-04-01', service_address: '654 Pine Rd, Pearland TX 77584',       status: 'active', service_type: 'residential' },
  { id: 'CTR-002', user_name: 'Mai Pham',        plan_name: 'TXU Energy Saver 24', provider: 'TXU Energy',     rate_kwh: 0.118, end_date: '2025-06-01', service_address: '5678 Oak Ave, Katy TX 77450',          status: 'active', service_type: 'residential' },
]

export default async function RenewalCalendarPage({ params }: Props) {
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
        .select('*')
        .eq('status', 'active')
        .order('end_date', { ascending: true })
        .limit(200)
      if (data?.length) contracts = data
    } catch { /* fallback */ }
  }

  const now = new Date()

  const getDaysLeft = (endDate: string) =>
    Math.ceil((new Date(endDate).getTime() - now.getTime()) / 86400000)

  const getUrgency = (days: number) =>
    days < 0 ? 'expired' : days <= 30 ? 'critical' : days <= 60 ? 'warning' : 'ok'

  const urgencyConfig = {
    expired:  { bar: 'bg-gray-400',   text: 'text-gray-500',  badge: 'bg-gray-100 text-gray-500',    label: isVi ? 'Đã hết hạn' : 'Expired'        },
    critical: { bar: 'bg-red-500',    text: 'text-red-600',   badge: 'bg-red-100 text-red-700',      label: isVi ? 'Cần gia hạn ngay' : 'Renew now' },
    warning:  { bar: 'bg-amber-400',  text: 'text-amber-600', badge: 'bg-amber-100 text-amber-700',  label: isVi ? 'Sắp hết hạn' : 'Expiring soon'  },
    ok:       { bar: 'bg-green-400',  text: 'text-green-600', badge: 'bg-green-100 text-green-700',  label: isVi ? 'Còn thời gian' : 'On track'      },
  }

  const counts = {
    expired:  contracts.filter(c => getDaysLeft(c.end_date) < 0).length,
    critical: contracts.filter(c => { const d = getDaysLeft(c.end_date); return d >= 0 && d <= 30 }).length,
    warning:  contracts.filter(c => { const d = getDaysLeft(c.end_date); return d > 30 && d <= 60 }).length,
    ok:       contracts.filter(c => getDaysLeft(c.end_date) > 60).length,
  }

  // Group by month
  const byMonth = contracts.reduce<Record<string, typeof contracts>>((acc, c) => {
    const key = new Date(c.end_date).toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US', { year: 'numeric', month: 'long' })
    if (!acc[key]) acc[key] = []
    acc[key].push(c)
    return acc
  }, {})

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Calendar size={22} className="text-brand-greenDark" />
          {isVi ? 'Lịch Gia Hạn Hợp Đồng' : 'Renewal Calendar'}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {counts.critical} {isVi ? 'cần gia hạn trong 30 ngày' : 'need renewal within 30 days'}
        </p>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-4 gap-3 mb-8">
        {([
          { key: 'expired',  label: isVi ? 'Đã Hết Hạn'    : 'Expired',        count: counts.expired  },
          { key: 'critical', label: isVi ? 'Trong 30 Ngày' : 'Within 30 days', count: counts.critical },
          { key: 'warning',  label: isVi ? 'Trong 60 Ngày' : 'Within 60 days', count: counts.warning  },
          { key: 'ok',       label: isVi ? 'Hơn 60 Ngày'  : 'Over 60 days',   count: counts.ok       },
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

      {/* Calendar timeline — grouped by month */}
      <div className="space-y-6">
        {Object.entries(byMonth).map(([month, monthContracts]) => (
          <div key={month}>
            <div className="flex items-center gap-3 mb-3">
              <h2 className="font-semibold text-gray-700 text-sm capitalize">{month}</h2>
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-xs text-gray-400">{monthContracts.length} {isVi ? 'hợp đồng' : 'contracts'}</span>
            </div>

            <div className="space-y-2">
              {monthContracts.map(c => {
                const daysLeft = getDaysLeft(c.end_date)
                const urgency = getUrgency(daysLeft)
                const cfg = urgencyConfig[urgency]

                return (
                  <div key={c.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm flex overflow-hidden hover:shadow-md transition-shadow">
                    {/* Urgency stripe */}
                    <div className={`w-1 flex-shrink-0 ${cfg.bar}`} />

                    <div className="flex-1 p-4 flex flex-wrap items-center gap-4">
                      {/* Customer */}
                      <div className="min-w-[160px]">
                        <p className="text-sm font-semibold text-gray-900">{c.user_name}</p>
                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                          <MapPin size={10} />
                          {c.service_address?.split(',').slice(-2).join(',').trim()}
                        </p>
                      </div>

                      {/* Plan */}
                      <div className="hidden sm:block min-w-[140px]">
                        <p className="text-xs text-gray-400">{isVi ? 'Gói hiện tại' : 'Current plan'}</p>
                        <p className="text-sm text-gray-700">{c.plan_name}</p>
                      </div>

                      {/* Expiry */}
                      <div className="min-w-[100px]">
                        <p className="text-xs text-gray-400">{isVi ? 'Hết hạn' : 'Expires'}</p>
                        <p className="text-sm font-medium text-gray-900">{formatDate(c.end_date, locale)}</p>
                      </div>

                      {/* Days left */}
                      <div>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${cfg.badge}`}>
                          {daysLeft < 0
                            ? (isVi ? 'Đã hết hạn' : 'Expired')
                            : `${daysLeft} ${isVi ? 'ngày còn lại' : 'days left'}`}
                        </span>
                      </div>

                      {/* Type */}
                      <span className={`text-xs px-2 py-0.5 rounded font-medium hidden md:inline ${
                        c.service_type === 'commercial' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'
                      }`}>
                        {c.service_type === 'commercial' ? (isVi ? 'TM' : 'Comm.') : (isVi ? 'DC' : 'Res.')}
                      </span>

                      {/* Actions */}
                      <div className="ml-auto flex items-center gap-2 flex-shrink-0">
                        <button className="text-xs text-gray-400 hover:text-brand-greenDark flex items-center gap-1 transition-colors">
                          <Bell size={12} />
                          {isVi ? 'Nhắc' : 'Remind'}
                        </button>
                        <button className="text-xs bg-brand-greenDark text-white px-3 py-1.5 rounded-lg hover:bg-brand-green transition-colors font-medium flex items-center gap-1">
                          <RefreshCw size={11} />
                          {isVi ? 'Gia Hạn' : 'Renew'}
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
