import Link from 'next/link'
import { Search, Filter, PlusCircle } from 'lucide-react'
import LeadStatusBadge from '@/components/crm/LeadStatusBadge'
import { getLeads } from '@/lib/supabase/queries'
import { formatDate } from '@/lib/utils'
import { setRequestLocale } from 'next-intl/server'
import NewLeadModal from './NewLeadModal'

interface Props {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ status?: string; service?: string; q?: string }>
}

export default async function LeadsPage({ params, searchParams }: Props) {
  const { locale } = await params
  const { status, service, q } = await searchParams
  setRequestLocale(locale)
  const isVi = locale === 'vi'

  const leads = await getLeads({ status, service, q })

  const statusOptions = [
    { value: 'all',       label: 'All Status',    labelVi: 'Tất Cả'      },
    { value: 'new',       label: 'New',            labelVi: 'Mới'         },
    { value: 'contacted', label: 'Contacted',      labelVi: 'Đã liên hệ' },
    { value: 'quoted',    label: 'Quoted',         labelVi: 'Đã báo giá' },
    { value: 'enrolled',  label: 'Enrolled',       labelVi: 'Đã đăng ký' },
    { value: 'lost',      label: 'Lost',           labelVi: 'Đã mất'     },
  ]
  const serviceOptions = [
    { value: 'all',         label: 'All Services', labelVi: 'Tất Cả'      },
    { value: 'residential', label: 'Residential',  labelVi: 'Dân Cư'      },
    { value: 'commercial',  label: 'Commercial',   labelVi: 'Thương Mại'  },
  ]

  // Build CSV export URL
  const csvParams = new URLSearchParams()
  if (status)  csvParams.set('status', status)
  if (service) csvParams.set('service', service)
  if (q)       csvParams.set('q', q)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{isVi ? 'Quản Lý Khách Hàng' : 'Leads Management'}</h1>
          <p className="text-gray-500 text-sm mt-1">{leads.length} {isVi ? 'khách hàng' : 'leads'}</p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={`/api/crm/leads/export?${csvParams}`}
            className="text-sm border border-gray-200 text-gray-600 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors"
          >
            {isVi ? '↓ CSV' : '↓ Export CSV'}
          </a>
          <NewLeadModal locale={locale} />
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-5">
        <form className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input name="q" defaultValue={q} placeholder={isVi ? 'Tìm kiếm...' : 'Search name, email, phone...'}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green" />
          </div>
          <Filter size={14} className="text-gray-400" />
          <select name="status" defaultValue={status || 'all'}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-green">
            {statusOptions.map(o => <option key={o.value} value={o.value}>{isVi ? o.labelVi : o.label}</option>)}
          </select>
          <select name="service" defaultValue={service || 'all'}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-green">
            {serviceOptions.map(o => <option key={o.value} value={o.value}>{isVi ? o.labelVi : o.label}</option>)}
          </select>
          <button type="submit" className="bg-brand-greenDark text-white text-sm px-4 py-2 rounded-xl hover:bg-brand-green transition-colors">
            {isVi ? 'Tìm' : 'Search'}
          </button>
          {(status || service || q) && (
            <Link href={`/${locale}/crm/leads`} className="text-sm text-gray-400 hover:text-gray-600">
              {isVi ? 'Xóa bộ lọc' : 'Clear'}
            </Link>
          )}
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {leads.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg font-medium">{isVi ? 'Không tìm thấy' : 'No leads found'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-100 bg-gray-50/50">
                <tr>
                  {[isVi?'Khách Hàng':'Lead', isVi?'Liên Hệ':'Contact', isVi?'Dịch Vụ':'Service', isVi?'Ngôn Ngữ':'Lang', isVi?'Trạng Thái':'Status', isVi?'Nguồn':'Source', isVi?'Ngày':'Date', ''].map((h, i) => (
                    <th key={i} className={`text-left text-xs font-medium text-gray-400 uppercase tracking-wide px-5 py-3 ${[3,4].includes(i)?'hidden lg:table-cell':''} ${[2,5].includes(i)?'hidden md:table-cell':''}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {leads.map(lead => (
                  <tr key={lead.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-gray-900">{lead.name}</p>
                      <p className="text-xs text-gray-400">ZIP: {lead.zip}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm text-gray-700">{lead.phone}</p>
                      <p className="text-xs text-gray-400 truncate max-w-[160px]">{lead.email}</p>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <span className={`text-xs px-2 py-0.5 rounded font-medium ${lead.service_type==='commercial'?'bg-blue-50 text-blue-700':'bg-green-50 text-green-700'}`}>
                        {lead.service_type==='commercial'?(isVi?'TM':'Comm.'):(isVi?'DC':'Res.')}
                      </span>
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell"><span className="text-xs text-gray-500 uppercase font-medium">{lead.preferred_language}</span></td>
                    <td className="px-5 py-4 hidden lg:table-cell"><LeadStatusBadge status={lead.status} locale={locale} /></td>
                    <td className="px-5 py-4 hidden md:table-cell"><span className="text-xs text-gray-400 capitalize">{lead.source||'—'}</span></td>
                    <td className="px-5 py-4"><span className="text-xs text-gray-400">{formatDate(lead.created_at, locale)}</span></td>
                    <td className="px-5 py-4 text-right">
                      <Link href={`/${locale}/crm/leads/${lead.id}`} className="text-xs bg-brand-greenDark text-white px-3 py-1.5 rounded-lg hover:bg-brand-green transition-colors font-medium">
                        {isVi?'Xem':'View'}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
