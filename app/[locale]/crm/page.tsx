import { Users, FileText, Zap, AlertTriangle, TrendingUp, DollarSign, Target, CheckCircle2, RefreshCw, Briefcase } from 'lucide-react'
import Link from 'next/link'
import StatCard from '@/components/crm/StatCard'
import LeadStatusBadge from '@/components/crm/LeadStatusBadge'
import { getCRMStats, getLeads, getDeals, getActivities, getContracts, getProvidersFromDB } from '@/lib/supabase/queries'
import { formatDate } from '@/lib/utils'
import { setRequestLocale } from 'next-intl/server'
import RevenueChart from '@/components/crm/RevenueChart'
import ActivitiesWidget from '@/components/crm/ActivitiesWidget'

interface Props { params: Promise<{ locale: string }> }

export default async function CRMOverview({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const [stats, recentLeads, deals, activities, contracts, providers] = await Promise.all([
    getCRMStats(),
    getLeads(),
    getDeals(),
    getActivities({ completed: false, limit: 20 }),
    getContracts('active'),
    getProvidersFromDB(),
  ])

  const recentDisplayed = recentLeads.slice(0, 5)

  // Portfolio valuation
  const now = new Date()
  const providerMap = Object.fromEntries(providers.map(p => [p.name, p]))
  const expiring30 = contracts.filter(c => {
    const d = Math.ceil((new Date(c.end_date).getTime() - now.getTime()) / 86400000)
    return d >= 0 && d <= 30
  })
  const expiring60 = contracts.filter(c => {
    const d = Math.ceil((new Date(c.end_date).getTime() - now.getTime()) / 86400000)
    return d > 30 && d <= 60
  })
  const annualCommission = contracts.reduce((sum, c) => {
    const prov = providerMap[c.provider]
    if (!prov) return sum
    const monthly = c.service_type === 'commercial' ? prov.commission_commercial : prov.commission_residential
    return sum + monthly * 12
  }, 0)
  const totalMwhMonth = contracts.length * 1200 / 1000 // rough estimate 1200 kWh avg per contract

  // Deal pipeline summary
  const totalPipelineValue = deals.reduce((s, d) => s + d.value, 0)
  const wonDeals = deals.filter(d => d.stage === 'won')
  const wonValue = wonDeals.reduce((s, d) => s + d.value, 0)
  const activeDeals = deals.filter(d => !['won','lost'].includes(d.stage))

  const stageColors: Record<string, string> = {
    prospect:    'bg-gray-100 text-gray-600',
    qualified:   'bg-blue-100 text-blue-700',
    proposal:    'bg-purple-100 text-purple-700',
    negotiation: 'bg-amber-100 text-amber-700',
    won:         'bg-green-100 text-green-700',
    lost:        'bg-red-100 text-red-600',
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">CRM Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back — here's what's happening today</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="New Leads Today"    value={stats.newLeadsToday}    subtitle={`${stats.newLeadsWeek} this week`} icon={Users}         color="blue"   />
        <StatCard title="Pending Quotes"     value={stats.pendingQuotes}    subtitle="Awaiting review"                   icon={FileText}      color="yellow" />
        <StatCard title="Active Contracts"   value={stats.activeContracts}  subtitle="Currently active"                  icon={Zap}           color="green"  />
        <StatCard title="Expiring Soon"      value={stats.expiringSoon}     subtitle="Within 30 days"                    icon={AlertTriangle} color="red"    />
      </div>

      {/* Portfolio Valuation */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <Briefcase size={16} className="text-brand-green" />
            Portfolio Valuation
          </h2>
          <Link href={`/${locale}/crm/renewals`} className="text-xs text-brand-green hover:text-brand-greenDark font-medium">
            View renewals →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-xl">
            <p className="text-2xl font-bold text-gray-900">{contracts.length}</p>
            <p className="text-xs text-gray-500 mt-0.5">Active Contracts</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-xl">
            <p className="text-2xl font-bold text-gray-900">{totalMwhMonth.toFixed(1)}</p>
            <p className="text-xs text-gray-500 mt-0.5">MWh/mo Under Mgmt</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-xl">
            <p className="text-2xl font-bold text-green-700">${annualCommission.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-0.5">Est. Annual Commission</p>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-xl">
            <p className="text-2xl font-bold text-red-600">{expiring30.length}</p>
            <p className="text-xs text-gray-500 mt-0.5">
              At-Risk ≤30d
              {expiring60.length > 0 && <span className="text-amber-500"> · {expiring60.length} by 60d</span>}
            </p>
          </div>
        </div>
        {expiring30.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-50">
            <p className="text-xs text-red-600 font-medium mb-1.5">
              <AlertTriangle size={11} className="inline mr-1" />
              Contracts expiring within 30 days:
            </p>
            <div className="flex flex-wrap gap-2">
              {expiring30.map(c => (
                <span key={c.id} className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded-lg">
                  {c.customer_name ?? c.provider} · {c.end_date}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Company Snapshot + Revenue Chart */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Company Snapshot */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Target size={16} className="text-brand-green" />
            Company Snapshot
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-gray-50">
              <span className="text-sm text-gray-600">Pipeline Value</span>
              <span className="font-semibold text-gray-900">${totalPipelineValue.toLocaleString()}/mo</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-50">
              <span className="text-sm text-gray-600">Won This Month</span>
              <span className="font-semibold text-green-600">${wonValue.toLocaleString()}/mo</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-50">
              <span className="text-sm text-gray-600">Active Deals</span>
              <span className="font-semibold text-gray-900">{activeDeals.length}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-50">
              <span className="text-sm text-gray-600">Enrolled This Month</span>
              <span className="font-semibold text-purple-600">{stats.enrolledThisMonth}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600">Total Leads</span>
              <span className="font-semibold text-gray-900">{stats.totalLeads}</span>
            </div>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp size={16} className="text-brand-green" />
              Revenue Trend
            </h2>
            <span className="text-xs text-gray-400">Last 6 months</span>
          </div>
          <RevenueChart />
        </div>
      </div>

      {/* Activities + Deals */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Activities Widget */}
        <ActivitiesWidget activities={activities} locale={locale} />

        {/* Open Deals */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <DollarSign size={16} className="text-brand-green" />
              Open Deals
            </h2>
            <Link href={`/${locale}/crm/deals`} className="text-sm text-brand-green hover:text-brand-greenDark font-medium">
              View all →
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {activeDeals.slice(0, 5).map(deal => (
              <div key={deal.id} className="px-6 py-3.5 flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{deal.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {deal.probability}% · closes {deal.expected_close ?? 'TBD'}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${stageColors[deal.stage]}`}>
                    {deal.stage}
                  </span>
                  <span className="text-sm font-semibold text-gray-900">${deal.value}/mo</span>
                </div>
              </div>
            ))}
            {activeDeals.length === 0 && (
              <div className="px-6 py-8 text-center text-sm text-gray-400">No active deals</div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Leads */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Recent Leads</h2>
          <Link href={`/${locale}/crm/leads`} className="text-sm text-brand-green hover:text-brand-greenDark font-medium">
            View all →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-50">
                {['Name', 'Contact', 'Service', 'Status', 'Date', ''].map((h, i) => (
                  <th
                    key={i}
                    className={`text-left text-xs font-medium text-gray-400 uppercase tracking-wide px-6 py-3 ${i === 1 ? 'hidden sm:table-cell' : ''} ${i === 4 ? 'hidden md:table-cell' : ''}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentDisplayed.map(lead => (
                <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-900">{lead.name}</p>
                    <p className="text-xs text-gray-400">ZIP: {lead.zip}</p>
                  </td>
                  <td className="px-6 py-4 hidden sm:table-cell">
                    <p className="text-sm text-gray-600">{lead.phone}</p>
                    <p className="text-xs text-gray-400">{lead.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${
                      lead.service_type === 'commercial' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'
                    }`}>
                      {lead.service_type === 'commercial' ? 'Comm.' : 'Res.'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <LeadStatusBadge status={lead.status} />
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <p className="text-xs text-gray-400">{formatDate(lead.created_at, locale)}</p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/${locale}/crm/leads/${lead.id}`}
                      className="text-xs text-brand-green hover:text-brand-greenDark font-medium"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
