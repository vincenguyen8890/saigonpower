import { FileSignature, Zap, Calendar, MapPin } from 'lucide-react'
import { setRequestLocale } from 'next-intl/server'
import { formatDate } from '@/lib/utils'
import { createClient } from '@/lib/supabase/server'

interface Props { params: Promise<{ locale: string }> }

const mockContracts = [
  { id: 'CTR-001', user_name: 'Hung Le',          plan_name: 'Gexa Saver 12',       provider: 'Gexa Energy',      rate_kwh: 0.109, start_date: '2024-01-15', end_date: '2025-01-15', service_address: '1234 Main St, Houston TX 77036', status: 'active',  service_type: 'residential' },
  { id: 'CTR-002', user_name: 'Mai Pham',          plan_name: 'TXU Energy Saver 24', provider: 'TXU Energy',       rate_kwh: 0.118, start_date: '2023-06-01', end_date: '2025-06-01', service_address: '5678 Oak Ave, Katy TX 77450',    status: 'active',  service_type: 'residential' },
  { id: 'CTR-003', user_name: 'Minh Tran Nails',  plan_name: 'Reliant Business 12', provider: 'Reliant Energy',   rate_kwh: 0.132, start_date: '2024-03-01', end_date: '2025-03-01', service_address: '910 Business Blvd, Sugar Land TX 77479', status: 'active', service_type: 'commercial' },
  { id: 'CTR-004', user_name: 'Linh Do',           plan_name: 'Green Mtn Simple 12', provider: 'Green Mountain',   rate_kwh: 0.125, start_date: '2024-02-01', end_date: '2025-02-01', service_address: '321 Elm St, Houston TX 77081',   status: 'active',  service_type: 'residential' },
  { id: 'CTR-005', user_name: 'David Kim',         plan_name: 'Cirro Value 6',       provider: 'Cirro Energy',     rate_kwh: 0.114, start_date: '2024-10-01', end_date: '2025-04-01', service_address: '654 Pine Rd, Pearland TX 77584', status: 'active',  service_type: 'residential' },
]

export default async function ContractsPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const isVi = locale === 'vi'

  // TODO: Replace with Supabase query
  let contracts = mockContracts
  const isPlaceholder = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')
  if (!isPlaceholder) {
    try {
      const supabase = await createClient()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase.from('contracts') as any)
        .select('*, users(full_name), plans(name, rate_kwh), providers(name)')
        .order('end_date', { ascending: true })
        .limit(100)
      if (data?.length) contracts = data
    } catch { /* fallback to mock */ }
  }

  const active   = contracts.filter(c => c.status === 'active').length
  const now      = new Date()
  const in30Days = new Date(now.getTime() + 30 * 86400000)
  const expiring = contracts.filter(c => new Date(c.end_date) <= in30Days && c.status === 'active').length

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{isVi ? 'Quản Lý Hợp Đồng' : 'Contracts'}</h1>
        <p className="text-gray-500 text-sm mt-1">
          {active} {isVi ? 'hợp đồng đang hoạt động' : 'active contracts'} · {expiring} {isVi ? 'sắp hết hạn' : 'expiring soon'}
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-100 bg-gray-50/50">
              <tr>
                {[isVi?'ID':'ID', isVi?'Khách Hàng':'Customer', isVi?'Gói Điện':'Plan', isVi?'Nhà Cung Cấp':'Provider', isVi?'Giá':'Rate', isVi?'Hết Hạn':'Expires', isVi?'Dịch Vụ':'Service', isVi?'Trạng Thái':'Status'].map((h, i) => (
                  <th key={i} className={`text-left text-xs font-medium text-gray-400 uppercase tracking-wide px-5 py-3 ${[3,6].includes(i)?'hidden md:table-cell':''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {contracts.map(c => {
                const daysLeft = Math.ceil((new Date(c.end_date).getTime() - now.getTime()) / 86400000)
                const urgency  = daysLeft <= 30 ? 'red' : daysLeft <= 60 ? 'amber' : 'green'
                return (
                  <tr key={c.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-4"><span className="text-xs font-mono text-gray-500">{c.id}</span></td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-gray-900">{c.user_name}</p>
                      <p className="text-xs text-gray-400 flex items-center gap-1"><MapPin size={10} />{c.service_address?.split(',').slice(-2).join(',').trim()}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm text-gray-700">{c.plan_name}</p>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <p className="text-xs text-gray-600">{c.provider}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm font-medium text-gray-900">{(c.rate_kwh * 100).toFixed(1)}¢</span>
                      <span className="text-xs text-gray-400">/kWh</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={13} className={urgency==='red'?'text-red-500':urgency==='amber'?'text-amber-500':'text-gray-400'} />
                        <div>
                          <p className="text-xs text-gray-700">{formatDate(c.end_date, locale)}</p>
                          <p className={`text-xs font-medium ${urgency==='red'?'text-red-500':urgency==='amber'?'text-amber-500':'text-gray-400'}`}>
                            {daysLeft > 0 ? `${daysLeft} ${isVi?'ngày':'days'}` : (isVi?'Đã hết hạn':'Expired')}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <span className={`text-xs px-2 py-0.5 rounded font-medium ${c.service_type==='commercial'?'bg-blue-50 text-blue-700':'bg-green-50 text-green-700'}`}>
                        {c.service_type==='commercial'?(isVi?'TM':'Comm.'):(isVi?'DC':'Res.')}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${c.status==='active'?'bg-green-100 text-green-700':'bg-gray-100 text-gray-500'}`}>
                        {c.status==='active'?(isVi?'Đang Hoạt Động':'Active'):(isVi?'Đã Hết Hạn':'Expired')}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
