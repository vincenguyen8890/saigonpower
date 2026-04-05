import { setRequestLocale } from 'next-intl/server'
import { getLeads, getDeals, getActivities } from '@/lib/supabase/queries'
import { BarChart3, TrendingUp, Users, CheckCircle2, DollarSign, Target } from 'lucide-react'
import LeadFunnelChart from '@/components/crm/LeadFunnelChart'
import PipelineValueChart from '@/components/crm/PipelineValueChart'
import EnrollmentTrendChart from '@/components/crm/EnrollmentTrendChart'
import LeadSourceChart from '@/components/crm/LeadSourceChart'
import { mockProviders } from '@/data/mock-crm'

interface Props { params: Promise<{ locale: string }> }

export default async function ReportsPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const [leads, deals, activities] = await Promise.all([
    getLeads(),
    getDeals(),
    getActivities({ limit: 200 }),
  ])

  // ── Lead Funnel ──────────────────────────────────────────────
  const statuses = ['new', 'contacted', 'quoted', 'enrolled', 'lost'] as const
  const leadFunnel = statuses.map(s => ({
    name: s,
    value: leads.filter(l => l.status === s).length,
  }))

  // ── Pipeline by Stage ────────────────────────────────────────
  const stages = ['prospect', 'qualified', 'proposal', 'negotiation', 'won', 'lost'] as const
  const pipelineData = stages.map(s => ({
    stage: s,
    value: deals.filter(d => d.stage === s).reduce((sum, d) => sum + d.value, 0),
    count: deals.filter(d => d.stage === s).length,
  }))

  // ── Monthly Trend (synthetic — real data needs Supabase aggregation) ──
  const trendData = [
    { month: 'Nov', newLeads: 11, enrolled: 8,  revenue: 4200 },
    { month: 'Dec', newLeads: 17, enrolled: 12, revenue: 5800 },
    { month: 'Jan', newLeads: 14, enrolled: 10, revenue: 4900 },
    { month: 'Feb', newLeads: 22, enrolled: 16, revenue: 6700 },
    { month: 'Mar', newLeads: 25, enrolled: 19, revenue: 7400 },
    { month: 'Apr', newLeads: leads.length, enrolled: leads.filter(l => l.status === 'enrolled').length, revenue: 8100 },
  ]

  // ── Lead Sources ─────────────────────────────────────────────
  const sourceMap: Record<string, number> = {}
  leads.forEach(l => {
    const src = l.source || 'unknown'
    sourceMap[src] = (sourceMap[src] || 0) + 1
  })
  const sourceData = Object.entries(sourceMap)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value }))

  // ── Commission Estimates ──────────────────────────────────────
  const commissionByProvider = mockProviders
    .filter(p => p.status === 'active')
    .map(p => {
      const resDeals = deals.filter(d => d.provider === p.name && d.service_type === 'residential' && d.stage !== 'lost')
      const comDeals = deals.filter(d => d.provider === p.name && d.service_type === 'commercial' && d.stage !== 'lost')
      const est = resDeals.length * p.commission_residential * 12 + comDeals.length * p.commission_commercial * 12
      return { name: p.name, deals: resDeals.length + comDeals.length, estimated: est }
    })
    .filter(p => p.deals > 0)

  // ── Activity Stats ────────────────────────────────────────────
  const totalActivities = activities.length
  const completedActivities = activities.filter(a => a.completed).length
  const completionRate = totalActivities > 0 ? Math.round((completedActivities / totalActivities) * 100) : 0

  const activityTypes = ['call', 'email', 'meeting', 'task', 'renewal', 'note'] as const
  const activityBreakdown = activityTypes.map(t => ({
    type: t,
    total: activities.filter(a => a.type === t).length,
    done:  activities.filter(a => a.type === t && a.completed).length,
  })).filter(a => a.total > 0)

  // ── Top Summary ───────────────────────────────────────────────
  const conversionRate = leads.length > 0
    ? Math.round((leads.filter(l => l.status === 'enrolled').length / leads.length) * 100)
    : 0
  const totalPipeline   = deals.reduce((s, d) => s + d.value, 0)
  const wonValue        = deals.filter(d => d.stage === 'won').reduce((s, d) => s + d.value, 0)
  const totalCommission = commissionByProvider.reduce((s, p) => s + p.estimated, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BarChart3 size={22} className="text-brand-greenDark" />
          Reports & Analytics
        </h1>
        <p className="text-gray-500 text-sm mt-1">Performance overview across all modules</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Leads',      value: leads.length,       sub: `${conversionRate}% conversion`,    color: 'text-blue-600',   bg: 'bg-blue-50',   icon: Users        },
          { label: 'Pipeline Value',   value: `$${totalPipeline}`, sub: `$${wonValue} won`,                color: 'text-purple-600', bg: 'bg-purple-50', icon: TrendingUp   },
          { label: 'Est. Commission',  value: `$${totalCommission.toLocaleString()}`, sub: 'lifetime est.', color: 'text-green-700',  bg: 'bg-green-50',  icon: DollarSign   },
          { label: 'Activity Rate',    value: `${completionRate}%`, sub: `${completedActivities}/${totalActivities} done`, color: 'text-amber-600', bg: 'bg-amber-50', icon: CheckCircle2 },
        ].map(({ label, value, sub, color, bg, icon: Icon }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon size={18} className={color} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs font-medium text-gray-500 mt-0.5">{label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* Lead Funnel + Pipeline Value */}
      <div className="grid lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
            <Users size={16} className="text-brand-green" />
            Lead Funnel by Status
          </h2>
          <p className="text-xs text-gray-400 mb-4">{leads.length} total leads</p>
          <LeadFunnelChart data={leadFunnel} />
          {/* Conversion helpers */}
          <div className="mt-4 grid grid-cols-5 gap-1">
            {leadFunnel.map((d, i) => (
              <div key={d.name} className="text-center">
                <p className="text-sm font-bold text-gray-900">{d.value}</p>
                <p className="text-xs text-gray-400 capitalize">{d.name}</p>
                {i > 0 && leadFunnel[i-1].value > 0 && (
                  <p className="text-xs text-brand-green font-medium">
                    {Math.round(d.value / leadFunnel[i-1].value * 100)}%
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
            <TrendingUp size={16} className="text-brand-green" />
            Pipeline by Stage
          </h2>
          <p className="text-xs text-gray-400 mb-4">{deals.length} deals · ${totalPipeline}/mo total</p>
          <PipelineValueChart data={pipelineData} />
        </div>
      </div>

      {/* Enrollment Trend + Lead Sources */}
      <div className="grid lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
            <TrendingUp size={16} className="text-brand-green" />
            Monthly Performance
          </h2>
          <p className="text-xs text-gray-400 mb-4">New leads, enrollments & revenue trend</p>
          <EnrollmentTrendChart data={trendData} />
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
            <Target size={16} className="text-brand-green" />
            Lead Sources
          </h2>
          <p className="text-xs text-gray-400 mb-4">Where leads are coming from</p>
          <LeadSourceChart data={sourceData.length > 0 ? sourceData : [{ name: 'No data', value: 1 }]} />
        </div>
      </div>

      {/* Commission Estimates + Activity Breakdown */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Commission Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <DollarSign size={16} className="text-brand-green" />
            Commission Estimates
          </h2>
          {commissionByProvider.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">No deals with providers yet</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Provider', 'Deals', 'Est. Lifetime'].map(h => (
                    <th key={h} className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide py-2 pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {commissionByProvider.map(p => (
                  <tr key={p.name}>
                    <td className="py-3 pr-4 font-medium text-gray-900">{p.name}</td>
                    <td className="py-3 pr-4 text-gray-600">{p.deals}</td>
                    <td className="py-3 pr-4 font-semibold text-green-700">${p.estimated.toLocaleString()}</td>
                  </tr>
                ))}
                <tr className="border-t border-gray-200">
                  <td className="py-3 font-bold text-gray-900">Total</td>
                  <td className="py-3 font-bold text-gray-900">{commissionByProvider.reduce((s, p) => s + p.deals, 0)}</td>
                  <td className="py-3 font-bold text-green-700">${totalCommission.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          )}
          <p className="text-xs text-gray-400 mt-4 italic">* Estimated: provider monthly commission × 12-month contract</p>
        </div>

        {/* Activity Breakdown */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle2 size={16} className="text-brand-green" />
            Activity Performance
          </h2>
          {activityBreakdown.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">No activities logged yet</p>
          ) : (
            <div className="space-y-3">
              {activityBreakdown.map(a => (
                <div key={a.type} className="flex items-center gap-3">
                  <span className="text-xs text-gray-600 capitalize w-16 flex-shrink-0">{a.type}</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-greenDark rounded-full"
                      style={{ width: `${a.total > 0 ? (a.done / a.total) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-14 text-right flex-shrink-0">
                    {a.done}/{a.total}
                  </span>
                </div>
              ))}
            </div>
          )}
          <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
            <span className="text-sm text-gray-600">Overall completion</span>
            <span className="text-sm font-semibold text-brand-greenDark">{completionRate}%</span>
          </div>
        </div>
      </div>
    </div>
  )
}
