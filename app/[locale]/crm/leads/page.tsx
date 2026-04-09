import Link from 'next/link'
import { Search, ChevronRight, ChevronLeft } from 'lucide-react'
import LeadStatusBadge from '@/components/crm/LeadStatusBadge'
import LeadScoreBadge from '@/components/crm/LeadScoreBadge'
import { getLeads, getLeadsCount } from '@/lib/supabase/queries'
import { formatDate } from '@/lib/utils'
import { setRequestLocale } from 'next-intl/server'
import { getSession } from '@/lib/auth/session'
import NewLeadModal from './NewLeadModal'
import ImportLeadsModal from './ImportLeadsModal'

const PER_PAGE = 50

interface Props {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ status?: string; service?: string; q?: string; page?: string }>
}

const statusOptions = [
  { value: 'all',       label: 'All Status'  },
  { value: 'new',       label: 'New'          },
  { value: 'contacted', label: 'Contacted'    },
  { value: 'quoted',    label: 'Quoted'       },
  { value: 'enrolled',  label: 'Enrolled'     },
  { value: 'lost',      label: 'Lost'         },
]

const serviceOptions = [
  { value: 'all',         label: 'All Types'   },
  { value: 'residential', label: 'Residential' },
  { value: 'commercial',  label: 'Commercial'  },
]

export default async function LeadsPage({ params, searchParams }: Props) {
  const { locale } = await params
  const { status, service, q, page: pageParam } = await searchParams
  setRequestLocale(locale)

  const page = Math.max(1, Number(pageParam) || 1)
  const session = await getSession()
  // Agents only see leads assigned to them
  const assigned_to = session?.role === 'agent' ? session.email : undefined
  const filters = { status, service, q, assigned_to }

  const [leads, total] = await Promise.all([
    getLeads({ ...filters, page, perPage: PER_PAGE }),
    getLeadsCount(filters),
  ])

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE))
  const pageStart  = (page - 1) * PER_PAGE + 1
  const pageEnd    = Math.min(page * PER_PAGE, total)

  const csvParams = new URLSearchParams()
  if (status)  csvParams.set('status', status)
  if (service) csvParams.set('service', service)
  if (q)       csvParams.set('q', q)

  const hasFilters = (status && status !== 'all') || (service && service !== 'all') || !!q

  function pageUrl(p: number) {
    const sp = new URLSearchParams()
    if (status && status !== 'all') sp.set('status', status)
    if (service && service !== 'all') sp.set('service', service)
    if (q) sp.set('q', q)
    if (p > 1) sp.set('page', String(p))
    const qs = sp.toString()
    return `/${locale}/crm/leads${qs ? `?${qs}` : ''}`
  }

  return (
    <div className="space-y-4">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base sm:text-lg font-bold text-[#0F172A]">Leads</h1>
          <p className="text-xs text-slate-400 mt-0.5">{total.toLocaleString()} lead{total !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={`/api/crm/leads/export?${csvParams}`}
            className="hidden sm:inline-flex items-center text-xs font-medium border border-slate-200 text-slate-600 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
          >
            ↓ CSV
          </a>
          <ImportLeadsModal />
          <NewLeadModal locale={locale} />
        </div>
      </div>

      {/* ── Filter bar ── */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-[0_1px_3px_rgba(15,23,42,0.06)] p-3 sm:p-4">
        <form className="flex flex-col sm:flex-row gap-2">
          <input type="hidden" name="page" value="1" />
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Name, email, phone, ZIP…"
              className="w-full pl-8 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C853]/30 focus:border-[#00C853] transition-all"
            />
          </div>

          <div className="flex gap-2">
            <select
              name="status"
              defaultValue={status || 'all'}
              className="flex-1 sm:flex-none border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#00C853]/30 focus:border-[#00C853] text-slate-700 min-w-0"
            >
              {statusOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <select
              name="service"
              defaultValue={service || 'all'}
              className="flex-1 sm:flex-none border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#00C853]/30 focus:border-[#00C853] text-slate-700 min-w-0"
            >
              {serviceOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <button
              type="submit"
              className="px-4 py-2.5 text-sm font-semibold bg-[#00C853] hover:bg-[#00A846] text-white rounded-lg transition-colors flex-shrink-0 shadow-sm"
            >
              Go
            </button>
          </div>

          {hasFilters && (
            <Link
              href={`/${locale}/crm/leads`}
              className="text-xs text-slate-400 hover:text-slate-600 self-center sm:self-auto flex-shrink-0"
            >
              Clear filters
            </Link>
          )}
        </form>
      </div>

      {/* ── Results ── */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-[0_1px_3px_rgba(15,23,42,0.06)] overflow-hidden">
        {leads.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Search size={20} className="text-slate-300" />
            </div>
            <p className="text-sm font-semibold text-slate-500">No leads found</p>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your filters</p>
            {hasFilters && (
              <Link href={`/${locale}/crm/leads`} className="mt-3 inline-block text-xs font-bold text-[#00C853]">
                Clear filters
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* ── Mobile: card list ── */}
            <div className="sm:hidden divide-y divide-slate-50">
              {leads.map(lead => (
                <Link
                  key={lead.id}
                  href={`/${locale}/crm/leads/${lead.id}`}
                  className="flex items-center gap-3 px-4 py-4 active:bg-slate-50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-[#EBF2FF] flex items-center justify-center flex-shrink-0">
                    <span className="text-[14px] font-bold text-[#2979FF]">
                      {lead.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-[13px] font-semibold text-[#0F172A] truncate">{lead.name}</p>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold flex-shrink-0 ${
                        lead.service_type === 'commercial'
                          ? 'bg-[#EBF2FF] text-[#2979FF]'
                          : 'bg-[#E8FFF1] text-[#00A846]'
                      }`}>
                        {lead.service_type === 'commercial' ? 'Comm' : 'Res'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 truncate">{lead.phone}</p>
                    <p className="text-[10px] text-slate-300 mt-0.5">{formatDate(lead.created_at, locale)}</p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <LeadStatusBadge status={lead.status} />
                    <ChevronRight size={14} className="text-slate-300" />
                  </div>
                </Link>
              ))}
            </div>

            {/* ── Desktop: table ── */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-50 bg-slate-50/40">
                  <tr>
                    {['Lead', 'Contact', 'Service', 'Status', 'Source', 'Date', ''].map((h, i) => (
                      <th
                        key={i}
                        className={`text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider px-5 py-3 ${
                          i === 4 ? 'hidden lg:table-cell' : ''
                        } ${i === 5 ? 'hidden md:table-cell' : ''}`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {leads.map(lead => (
                    <tr key={lead.id} className="hover:bg-slate-50/60 transition-colors group">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#EBF2FF] flex items-center justify-center flex-shrink-0">
                            <span className="text-[12px] font-bold text-[#2979FF]">{lead.name.charAt(0).toUpperCase()}</span>
                          </div>
                          <div>
                            <p className="text-[13px] font-semibold text-[#0F172A]">{lead.name}</p>
                            <p className="text-[11px] text-slate-400">ZIP {lead.zip}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-[13px] text-slate-600">{lead.phone}</p>
                        <p className="text-[11px] text-slate-400 truncate max-w-[160px]">{lead.email}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`text-[11px] px-2 py-0.5 rounded font-semibold ${
                          lead.service_type === 'commercial'
                            ? 'bg-[#EBF2FF] text-[#2979FF]'
                            : 'bg-[#E8FFF1] text-[#00A846]'
                        }`}>
                          {lead.service_type === 'commercial' ? 'Comm.' : 'Res.'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <LeadStatusBadge status={lead.status} />
                          <LeadScoreBadge lead={lead} />
                        </div>
                      </td>
                      <td className="px-5 py-3.5 hidden lg:table-cell">
                        <span className="text-[11px] text-slate-400 capitalize">{lead.source || '—'}</span>
                      </td>
                      <td className="px-5 py-3.5 hidden md:table-cell">
                        <span className="text-[11px] text-slate-400">{formatDate(lead.created_at, locale)}</span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Link
                          href={`/${locale}/crm/leads/${lead.id}`}
                          className="text-[11px] font-bold text-[#00C853] hover:text-[#00A846] bg-[#E8FFF1] px-2.5 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/40">
            <div className="flex items-center gap-1.5">
              {page > 1 ? (
                <Link
                  href={pageUrl(page - 1)}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-white transition-colors"
                >
                  <ChevronLeft size={15} />
                </Link>
              ) : (
                <span className="p-1.5 rounded-lg border border-slate-100 text-slate-300 cursor-not-allowed">
                  <ChevronLeft size={15} />
                </span>
              )}

              {/* Page number pills */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let p: number
                  if (totalPages <= 7) {
                    p = i + 1
                  } else if (page <= 4) {
                    p = i < 6 ? i + 1 : totalPages
                  } else if (page >= totalPages - 3) {
                    p = i === 0 ? 1 : totalPages - 6 + i
                  } else {
                    const mid = [1, page - 1, page, page + 1, totalPages]
                    p = [1, page - 1, page, page + 1, totalPages][i] ?? i + 1
                    if (i === 1 && page - 1 > 2) return <span key="e1" className="text-xs text-slate-400 px-1">…</span>
                    if (i === 3 && page + 1 < totalPages - 1) return <span key="e2" className="text-xs text-slate-400 px-1">…</span>
                    p = mid[i]
                  }
                  return (
                    <Link
                      key={p}
                      href={pageUrl(p)}
                      className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-medium transition-colors ${
                        p === page
                          ? 'bg-[#00C853] text-white'
                          : 'text-slate-600 hover:bg-white border border-slate-200'
                      }`}
                    >
                      {p}
                    </Link>
                  )
                })}
              </div>

              {page < totalPages ? (
                <Link
                  href={pageUrl(page + 1)}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-white transition-colors"
                >
                  <ChevronRight size={15} />
                </Link>
              ) : (
                <span className="p-1.5 rounded-lg border border-slate-100 text-slate-300 cursor-not-allowed">
                  <ChevronRight size={15} />
                </span>
              )}
            </div>

            <p className="text-xs text-slate-400">
              {pageStart.toLocaleString()}–{pageEnd.toLocaleString()} of {total.toLocaleString()}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
