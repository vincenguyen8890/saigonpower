import { Building2, Phone, Globe, Zap, DollarSign } from 'lucide-react'
import { setRequestLocale } from 'next-intl/server'
import { mockProviders } from '@/data/mock-crm'

interface Props { params: Promise<{ locale: string }> }

export default async function ProvidersPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const isVi = locale === 'vi'

  const providers = mockProviders

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{isVi ? 'Nhà Cung Cấp Điện' : 'Energy Providers'}</h1>
        <p className="text-gray-500 text-sm mt-1">
          {providers.filter(p => p.status === 'active').length} {isVi ? 'nhà cung cấp đang hợp tác' : 'active provider partnerships'}
        </p>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {providers.map(p => (
          <div key={p.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">

            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-greenDark/10 flex items-center justify-center flex-shrink-0">
                  <Zap size={18} className="text-brand-greenDark" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{p.name}</p>
                  <p className="text-xs text-gray-400">{p.short_name}</p>
                </div>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                p.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
              }`}>
                {p.status === 'active' ? (isVi ? 'Đang HĐ' : 'Active') : (isVi ? 'Ngừng' : 'Inactive')}
              </span>
            </div>

            {/* Commission rates */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="bg-green-50 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500 mb-0.5">{isVi ? 'Hoa Hồng DC' : 'Res. Commission'}</p>
                <p className="text-lg font-bold text-green-700">${p.commission_residential}</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500 mb-0.5">{isVi ? 'Hoa Hồng TM' : 'Comm. Commission'}</p>
                <p className="text-lg font-bold text-blue-700">
                  {p.commission_commercial > 0 ? `$${p.commission_commercial}` : '—'}
                </p>
              </div>
            </div>

            {/* Plans count */}
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
              <Building2 size={13} />
              <span>{p.active_plans} {isVi ? 'gói điện' : 'active plans'}</span>
            </div>

            {/* Contact */}
            <div className="space-y-1.5 pt-3 border-t border-gray-50">
              <a href={`tel:${p.phone}`} className="flex items-center gap-2 text-xs text-gray-500 hover:text-brand-greenDark transition-colors">
                <Phone size={12} />
                {p.phone}
              </a>
              <a href={`https://${p.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-gray-500 hover:text-brand-greenDark transition-colors">
                <Globe size={12} />
                {p.website}
              </a>
            </div>

            {p.notes && (
              <p className="text-xs text-gray-400 italic mt-3 pt-3 border-t border-gray-50">
                {p.notes}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Commission summary */}
      <div className="mt-8 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <DollarSign size={16} className="text-brand-green" />
          {isVi ? 'Tổng Quan Hoa Hồng' : 'Commission Overview'}
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {[isVi?'Nhà Cung Cấp':'Provider', isVi?'DC (Residential)':'Res.', isVi?'TM (Commercial)':'Comm.', isVi?'Số Gói':'Plans'].map((h, i) => (
                  <th key={i} className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide py-2 pr-6">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {providers.filter(p => p.status === 'active').map(p => (
                <tr key={p.id}>
                  <td className="py-3 pr-6 font-medium text-gray-900">{p.name}</td>
                  <td className="py-3 pr-6 text-green-700 font-semibold">${p.commission_residential}</td>
                  <td className="py-3 pr-6 text-blue-700 font-semibold">{p.commission_commercial > 0 ? `$${p.commission_commercial}` : '—'}</td>
                  <td className="py-3 pr-6 text-gray-500">{p.active_plans}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
