import {
  Users, AlertTriangle, TrendingUp, DollarSign,
  ArrowUpRight, Zap, Briefcase, ChevronRight,
} from 'lucide-react'
import Link from 'next/link'
import { setRequestLocale } from 'next-intl/server'
import {
  getCRMStats, getLeads, getDeals, getActivities,
  getContracts, getProvidersFromDB,
} from '@/lib/supabase/queries'
import { formatDate } from '@/lib/utils'
import LeadStatusBadge from '@/components/crm/LeadStatusBadge'
import RevenueChart from '@/components/crm/RevenueChart'
import KpiCard from '@/components/dashboard/KpiCard'
import PipelineMini from '@/components/dashboard/PipelineMini'
import type { PipelineStage } from '@/components/dashboard/PipelineMini'
import PriorityActions from '@/components/dashboard/PriorityActions'
import type { PriorityAction } from '@/components/dashboard/PriorityActions'
import ActivityFeed from '@/components/dashboard/ActivityFeed'

interface Props { params: Promise<{ locale: string }> }

export default async function CRMOverview({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const [stats, allLeads, deals, activities, contracts, providers] = await Promise.all([
    getCRMStats(),
    getLeads(),
    getDeals(),
    getActivities({ completed: false, limit: 25 }),
    getContracts('active'),
    getProvidersFromDB(),
  ])

  // ── Time context ─────────────────────────────────────────────────────────
  const now = new Date()
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const today = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  // ── Portfolio metrics ─────────────────────────────────────────────────────
  const providerMap = Object.fromEntries(providers.map(p => [p.name, p]))
  const expiring30 = contracts.filter(c => {
    const d = Math.ceil((new Date(c.end_date).getTime() - now.getTime()) / 86400000)
    return d >= 0 && d <= 30
  })
  const annualCommission = contracts.reduce((sum, c) => {
    const prov = providerMap[c.provider]
    if (!prov) return sum
    const monthly = c.service_type === 'commercial' ? prov.commission_commercial : prov.commission_residential
    return sum + monthly * 12
  }, 0)
  const monthlyCommission = Math.round(annualCommission / 12)

  // ── Deal pipeline ─────────────────────────────────────────────────────────
  const activeDeals  = deals.filter(d => !['won', 'lost'].includes(d.stage))
  const wonDeals     = deals.filter(d => d.stage === 'won')
  const wonValue     = wonDeals.reduce((s, d) => s + d.value, 0)
  const prospectDeals    = deals.filter(d => d.stage === 'prospect')
  const activeStageDeals = deals.filter(d => ['qualified', 'proposal'].includes(d.stage))
  const closingDeals     = deals.filter(d => d.stage === 'negotiation')

  const pipelineStages: PipelineStage[] = [
    { key: 'prospect', label: 'New',     count: prospectDeals.length,    value: prospectDeals.reduce((s, d) => s + d.value, 0),    barColor: 'bg-slate-300',   bg: 'bg-slate-50',    textColor: 'text-slate-700'  },
    { key: 'active',   label: 'Active',  count: activeStageDeals.length, value: activeStageDeals.reduce((s, d) => s + d.value, 0), barColor: 'bg-[#2979FF]',   bg: 'bg-[#EBF2FF]',   textColor: 'text-[#2979FF]'  },
    { key: 'closing',  label: 'Closing', count: closingDeals.length,     value: closingDeals.reduce((s, d) => s + d.value, 0),     barColor: 'bg-amber-400',   bg: 'bg-amber-50',    textColor: 'text-amber-700'  },
    { key: 'won',      label: 'Won',     count: wonDeals.length,         value: wonValue,                                          barColor: 'bg-[#00C853]',   bg: 'bg-[#E8FFF1]',   textColor: 'text-[#00A846]'  },
  ]

  // ── Priority actions ─────────────────────────────────────────────────────
  const priorityActions: PriorityAction[] = []

  const overdueActivities = activities.filter(a => a.due_date && new Date(a.due_date) < now)
  overdueActivities.slice(0, 2).forEach(a => {
    priorityActions.push({ id: `overdue-${a.id}`, type: 'follow_up', title: a.title, description: a.description ?? 'Overdue — needs attention', urgency: 'high', href: `/${locale}/crm/tasks`, timeLabel: 'Overdue' })
  })

  expiring30.slice(0, 2).forEach(c => {
    const daysLeft = Math.ceil((new Date(c.end_date).getTime() - now.getTime()) / 86400000)
    priorityActions.push({ id: `expiring-${c.id}`, type: 'expiring', title: `Renewal: ${c.customer_name ?? c.provider}`, description: `Expires in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`, urgency: daysLeft <= 7 ? 'high' : 'medium', href: `/${locale}/crm/renewals`, timeLabel: `${daysLeft}d remaining` })
  })

  const stuckDeals = activeDeals.filter(d => Math.floor((now.getTime() - new Date(d.updated_at).getTime()) / 86400000) > 14)
  stuckDeals.slice(0, 1).forEach(d => {
    priorityActions.push({ id: `stuck-${d.id}`, type: 'stuck_deal', title: `Stuck: ${d.title}`, description: `No activity in 14+ days · $${d.value}/mo`, urgency: 'medium', href: `/${locale}/crm/deals`, timeLabel: 'Needs attention' })
  })

  allLeads.filter(l => l.status === 'new').slice(0, 1).forEach(l => {
    priorityActions.push({ id: `lead-${l.id}`, type: 'new_lead', title: `New lead: ${l.name}`, description: `${l.service_type === 'commercial' ? 'Commercial' : 'Residential'} · ZIP ${l.zip}`, urgency: 'low', href: `/${locale}/crm/leads/${l.id}`, timeLabel: 'Needs initial contact' })
  })

  const recentLeads = allLeads.slice(0, 8)

  const stageColors: Record<string, string> = {
    prospect: 'bg-slate-100 text-slate-600', qualified: 'bg-[#EBF2FF] text-[#2979FF]',
    proposal: 'bg-purple-100 text-purple-700', negotiation: 'bg-amber-100 text-amber-700',
    won: 'bg-[#E8FFF1] text-[#00A846]', lost: 'bg-red-100 text-red-600',
  }

  return (
    <div className="space-y-5 max-w-[1440px]">

      {/* ── Page header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base sm:text-lg font-bold text-[#0F172A]">{greeting} 👋</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5 hidden sm:block">
            {today} · Here&apos;s what needs your attention
          </p>
        </div>
        <Link
          href={`/${locale}/crm/reports`}
          className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#0F172A] bg-white border border-slate-200 px-3 py-1.5 rounded-lg transition-colors shadow-sm"
        >
          <TrendingUp size={13} /> View Reports
        </Link>
      </div>

      {/* ── KPI strip ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard title="New Leads Today" value={stats.newLeadsToday} subtitle={`${stats.newLeadsWeek} this week`} icon={Users} color="blue" trend={{ value: 12, label: 'vs last week' }} href={`/${locale}/crm/leads?status=new`} />
        <KpiCard title="Active Deals" value={activeDeals.length} subtitle={`$${activeDeals.reduce((s, d) => s + d.value, 0).toLocaleString()}/mo`} icon={TrendingUp} color="green" trend={{ value: 8, label: 'vs last month' }} href={`/${locale}/crm/deals`} />
        <KpiCard title="Commission/mo" value={`$${monthlyCommission.toLocaleString()}`} subtitle={`$${annualCommission.toLocaleString()} annual`} icon={DollarSign} color="purple" trend={{ value: 5, label: 'vs last month' }} href={`/${locale}/crm/accounting`} />
        <KpiCard title="Expiring Soon" value={expiring30.length} subtitle="Contracts within 30d" icon={AlertTriangle} color={expiring30.length > 3 ? 'red' : 'orange'} href={`/${locale}/crm/renewals`} />
      </div>

      {/* ── Pipeline + Revenue ── */}
      <div className="grid lg:grid-cols-3 gap-4">
        <PipelineMini stages={pipelineStages} locale={locale} />
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 p-4 sm:p-5 shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={14} className="text-[#00C853]" />
            <h2 className="text-sm font-semibold text-[#0F172A]">Revenue &amp; Enrollment</h2>
          </div>
          <RevenueChart />
        </div>
      </div>

      {/* ── Priority actions + Activity feed ── */}
      <div className="grid lg:grid-cols-2 gap-4">
        <PriorityActions actions={priorityActions} locale={locale} />
        <ActivityFeed activities={activities} locale={locale} />
      </div>

      {/* ── Portfolio strip ── */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-[0_1px_3px_rgba(15,23,42,0.06)] p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-[#0F172A] flex items-center gap-2">
            <Briefcase size={14} className="text-[#00C853]" /> Portfolio
          </h2>
          <Link href={`/${locale}/crm/contracts`} className="text-xs text-[#00C853] hover:text-[#00A846] font-semibold flex items-center gap-1">
            Contracts <ArrowUpRight size={12} />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <div className="text-center p-3 sm:p-4 bg-slate-50 rounded-xl">
            <p className="text-xl sm:text-2xl font-bold text-[#0F172A] tabular-nums">{contracts.length}</p>
            <p className="text-[11px] text-slate-500 font-medium mt-1">Active Contracts</p>
          </div>
          <div className="text-center p-3 sm:p-4 bg-slate-50 rounded-xl">
            <p className="text-xl sm:text-2xl font-bold text-[#0F172A] tabular-nums">{(contracts.length * 1.2).toFixed(1)}</p>
            <p className="text-[11px] text-slate-500 font-medium mt-1">MWh / month</p>
          </div>
          <div className="text-center p-3 sm:p-4 bg-[#E8FFF1] rounded-xl">
            <p className="text-xl sm:text-2xl font-bold text-[#00A846] tabular-nums">${monthlyCommission.toLocaleString()}</p>
            <p className="text-[11px] text-slate-500 font-medium mt-1">Commission / mo</p>
          </div>
          <div className={`text-center p-3 sm:p-4 rounded-xl ${expiring30.length > 0 ? 'bg-red-50' : 'bg-slate-50'}`}>
            <p className={`text-xl sm:text-2xl font-bold tabular-nums ${expiring30.length > 0 ? 'text-red-600' : 'text-[#0F172A]'}`}>{expiring30.length}</p>
            <p className="text-[11px] text-slate-500 font-medium mt-1">At-risk ≤ 30d</p>
          </div>
        </div>
        {expiring30.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <p className="text-xs text-red-600 font-semibold mb-2 flex items-center gap-1">
              <AlertTriangle size={11} /> Expiring soon:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {expiring30.map(c => {
                const d = Math.ceil((new Date(c.end_date).getTime() - now.getTime()) / 86400000)
                return (
                  <Link key={c.id} href={`/${locale}/crm/renewals`}
                    className="text-xs bg-red-50 hover:bg-red-100 text-red-700 border border-red-100 px-2 py-1 rounded-lg font-medium">
                    {c.customer_name ?? c.provider} · {d}d
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Recent leads ── */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-[0_1px_3px_rgba(15,23,42,0.06)] overflow-hidden">
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-semibold text-[#0F172A]">Recent Leads</h2>
            <p className="text-xs text-slate-400 mt-0.5">{stats.totalLeads} total</p>
          </div>
          <Link href={`/${locale}/crm/leads`} className="flex items-center gap-1 text-xs text-[#00C853] hover:text-[#00A846] font-semibold">
            View all <ArrowUpRight size={12} />
          </Link>
        </div>

        {recentLeads.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users size={22} className="text-slate-300" />
            </div>
            <p className="text-sm font-semibold text-slate-500">No leads yet</p>
            <Link href={`/${locale}/crm/leads?action=new`} className="mt-2 inline-block text-xs font-bold text-[#00C853]">
              + Add your first lead
            </Link>
          </div>
        ) : (
          <>
            {/* Mobile: card list */}
            <div className="sm:hidden divide-y divide-slate-50">
              {recentLeads.map(lead => (
                <Link key={lead.id} href={`/${locale}/crm/leads/${lead.id}`}
                  className="flex items-center gap-3 px-4 py-3.5 active:bg-slate-50 transition-colors">
                  <div className="w-9 h-9 rounded-full bg-[#EBF2FF] flex items-center justify-center flex-shrink-0">
                    <span className="text-[13px] font-bold text-[#2979FF]">{lead.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-[#0F172A] truncate">{lead.name}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{lead.phone} · {lead.service_type}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <LeadStatusBadge status={lead.status} />
                    <ChevronRight size={14} className="text-slate-300" />
                  </div>
                </Link>
              ))}
            </div>

            {/* Desktop: table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-50">
                    {['Name', 'Contact', 'Service', 'Status', 'Date', ''].map((h, i) => (
                      <th key={i} className={`text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider px-6 py-3 ${i === 4 ? 'hidden md:table-cell' : ''}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {recentLeads.map(lead => (
                    <tr key={lead.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-[#EBF2FF] flex items-center justify-center flex-shrink-0">
                            <span className="text-[11px] font-bold text-[#2979FF]">{lead.name.charAt(0).toUpperCase()}</span>
                          </div>
                          <div>
                            <p className="text-[13px] font-semibold text-[#0F172A]">{lead.name}</p>
                            <p className="text-[11px] text-slate-400">ZIP {lead.zip}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3.5">
                        <p className="text-[13px] text-slate-600">{lead.phone}</p>
                        <p className="text-[11px] text-slate-400 truncate max-w-[160px]">{lead.email}</p>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className={`text-[11px] px-2 py-0.5 rounded-md font-semibold ${lead.service_type === 'commercial' ? 'bg-[#EBF2FF] text-[#2979FF]' : 'bg-[#E8FFF1] text-[#00A846]'}`}>
                          {lead.service_type === 'commercial' ? 'Commercial' : 'Residential'}
                        </span>
                      </td>
                      <td className="px-6 py-3.5"><LeadStatusBadge status={lead.status} /></td>
                      <td className="px-6 py-3.5 hidden md:table-cell">
                        <p className="text-[11px] text-slate-400">{formatDate(lead.created_at, locale)}</p>
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <Link href={`/${locale}/crm/leads/${lead.id}`} className="text-[11px] font-bold text-[#00C853] hover:text-[#00A846] opacity-0 group-hover:opacity-100 transition-opacity">View →</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* ── Open deals ── */}
      {activeDeals.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-[0_1px_3px_rgba(15,23,42,0.06)] overflow-hidden">
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-semibold text-[#0F172A] flex items-center gap-2">
                <Zap size={14} className="text-[#00C853]" /> Open Deals
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">{activeDeals.length} in progress</p>
            </div>
            <Link href={`/${locale}/crm/deals`} className="flex items-center gap-1 text-xs text-[#00C853] hover:text-[#00A846] font-semibold">
              Board <ArrowUpRight size={12} />
            </Link>
          </div>

          {/* Mobile: card list */}
          <div className="sm:hidden divide-y divide-slate-50">
            {activeDeals.slice(0, 5).map(deal => (
              <Link key={deal.id} href={`/${locale}/crm/deals`}
                className="flex items-center gap-3 px-4 py-3.5 active:bg-slate-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-[#0F172A] truncate">{deal.title}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{deal.probability}% · {deal.expected_close ?? 'TBD'}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold capitalize ${stageColors[deal.stage]}`}>{deal.stage}</span>
                  <span className="text-[13px] font-bold text-[#0F172A]">${deal.value}/mo</span>
                </div>
              </Link>
            ))}
          </div>

          {/* Desktop: table-style rows */}
          <div className="hidden sm:block divide-y divide-slate-50">
            {activeDeals.slice(0, 5).map(deal => (
              <div key={deal.id} className="px-6 py-3.5 flex items-center gap-3 hover:bg-slate-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-[#0F172A] truncate">{deal.title}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{deal.probability}% probability · closes {deal.expected_close ?? 'TBD'}</p>
                </div>
                <div className="flex items-center gap-2.5 flex-shrink-0">
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold capitalize ${stageColors[deal.stage]}`}>{deal.stage}</span>
                  <span className="text-[13px] font-bold text-[#0F172A] tabular-nums">${deal.value}/mo</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
