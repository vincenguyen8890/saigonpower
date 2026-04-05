import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, DollarSign, Target, Calendar, Building2, User, TrendingUp, CheckCircle2 } from 'lucide-react'
import { getDealById, getLeadById, getActivities } from '@/lib/supabase/queries'
import { mockProviders } from '@/data/mock-crm'
import { formatDate } from '@/lib/utils'
import { setRequestLocale } from 'next-intl/server'
import DealEditForm from './DealEditForm'

interface Props {
  params: Promise<{ locale: string; id: string }>
}

const stageConfig: Record<string, { label: string; color: string; bg: string; pct: number }> = {
  prospect:    { label: 'Prospect',    color: 'text-gray-600',   bg: 'bg-gray-100',   pct: 10 },
  qualified:   { label: 'Qualified',   color: 'text-blue-700',   bg: 'bg-blue-100',   pct: 30 },
  proposal:    { label: 'Proposal',    color: 'text-purple-700', bg: 'bg-purple-100', pct: 50 },
  negotiation: { label: 'Negotiation', color: 'text-amber-700',  bg: 'bg-amber-100',  pct: 75 },
  won:         { label: 'Won',         color: 'text-green-700',  bg: 'bg-green-100',  pct: 100 },
  lost:        { label: 'Lost',        color: 'text-red-600',    bg: 'bg-red-100',    pct: 0   },
}

export default async function DealDetailPage({ params }: Props) {
  const { locale, id } = await params
  setRequestLocale(locale)

  const deal = await getDealById(id)
  if (!deal) notFound()

  const [lead, activities] = await Promise.all([
    deal.lead_id ? getLeadById(deal.lead_id) : Promise.resolve(null),
    deal.lead_id ? getActivities({ leadId: deal.lead_id, limit: 10 }) : getActivities({ limit: 10 }),
  ])

  const provider = mockProviders.find(p => p.name === deal.provider)
  const commissionPerMonth = provider
    ? (deal.service_type === 'commercial' ? provider.commission_commercial : provider.commission_residential)
    : 0
  const estimatedLifetimeCommission = commissionPerMonth * 12

  const cfg = stageConfig[deal.stage] ?? stageConfig.prospect
  const stages = ['prospect', 'qualified', 'proposal', 'negotiation', 'won']

  return (
    <div>
      <Link
        href={`/${locale}/crm/deals`}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-5"
      >
        <ArrowLeft size={15} />
        Back to deals
      </Link>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{deal.title}</h1>
          <div className="flex items-center gap-3 mt-2">
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium capitalize ${cfg.bg} ${cfg.color}`}>
              {cfg.label}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded font-medium ${
              deal.service_type === 'commercial' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'
            }`}>
              {deal.service_type === 'commercial' ? 'Commercial' : 'Residential'}
            </span>
            <span className="text-xs text-gray-400">Updated {formatDate(deal.updated_at, locale)}</span>
          </div>
        </div>
        <DealEditForm deal={deal} locale={locale} />
      </div>

      {/* Stage Progress */}
      {deal.stage !== 'lost' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-900">Deal Progress</p>
            <span className="text-sm font-bold text-brand-greenDark">{deal.probability}% probability</span>
          </div>
          <div className="flex items-center gap-2">
            {stages.map((s, i) => {
              const isCurrent = s === deal.stage
              const isPast    = stages.indexOf(deal.stage) > i
              return (
                <div key={s} className="flex-1 flex flex-col items-center">
                  <div className={`w-full h-2 rounded-full mb-1.5 ${
                    isPast ? 'bg-brand-greenDark' : isCurrent ? 'bg-brand-green' : 'bg-gray-100'
                  }`} />
                  <span className={`text-xs capitalize ${isCurrent ? 'text-brand-greenDark font-semibold' : 'text-gray-400'}`}>
                    {s}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Left — deal details */}
        <div className="lg:col-span-2 space-y-5">
          {/* Key Metrics */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
              <DollarSign size={18} className="text-green-500 mx-auto mb-2" />
              <p className="text-xl font-bold text-gray-900">${deal.value}<span className="text-sm font-normal text-gray-400">/mo</span></p>
              <p className="text-xs text-gray-500 mt-0.5">Contract Value</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
              <Target size={18} className="text-purple-500 mx-auto mb-2" />
              <p className="text-xl font-bold text-gray-900">${Math.round(deal.value * deal.probability / 100)}<span className="text-sm font-normal text-gray-400">/mo</span></p>
              <p className="text-xs text-gray-500 mt-0.5">Weighted Value</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
              <TrendingUp size={18} className="text-amber-500 mx-auto mb-2" />
              <p className="text-xl font-bold text-gray-900">${estimatedLifetimeCommission.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-0.5">Est. Commission</p>
            </div>
          </div>

          {/* Deal Terms */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Building2 size={16} className="text-brand-green" />
              Deal Terms
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { label: 'Provider',        value: deal.provider   ?? '—' },
                { label: 'Plan',            value: deal.plan_name  ?? '—' },
                { label: 'Expected Close',  value: deal.expected_close ?? '—' },
                { label: 'Probability',     value: `${deal.probability}%` },
                { label: 'Monthly Comm.',   value: commissionPerMonth > 0 ? `$${commissionPerMonth}/mo` : '—' },
                { label: 'Lifetime Est.',   value: estimatedLifetimeCommission > 0 ? `$${estimatedLifetimeCommission.toLocaleString()}` : '—' },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-start gap-3">
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                    <p className="text-sm font-medium text-gray-900">{value}</p>
                  </div>
                </div>
              ))}
            </div>
            {deal.notes && (
              <div className="mt-4 pt-4 border-t border-gray-50">
                <p className="text-xs text-gray-400 mb-1">Notes</p>
                <p className="text-sm text-gray-700">{deal.notes}</p>
              </div>
            )}
          </div>

          {/* Activities */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle2 size={16} className="text-brand-green" />
              Related Activities
              {activities.filter(a => !a.completed).length > 0 && (
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                  {activities.filter(a => !a.completed).length} open
                </span>
              )}
            </h2>
            {activities.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">No activities yet</p>
            ) : (
              <div className="space-y-2">
                {activities.slice(0, 6).map(a => (
                  <div key={a.id} className={`flex items-start gap-3 p-3 border rounded-xl ${
                    a.completed ? 'border-gray-100 opacity-60' : 'border-amber-100 bg-amber-50/30'
                  }`}>
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                      a.completed ? 'bg-green-400' : 'bg-amber-400'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${a.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                        {a.title}
                      </p>
                      {a.due_date && (
                        <p className="text-xs text-gray-400">{formatDate(a.due_date, locale)}</p>
                      )}
                    </div>
                    <span className="text-xs capitalize text-gray-400 flex-shrink-0">{a.type}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right — linked lead + actions */}
        <div className="space-y-5">
          {/* Linked Lead */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User size={16} className="text-brand-green" />
              Linked Lead
            </h2>
            {lead ? (
              <div>
                <p className="text-sm font-semibold text-gray-900">{lead.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{lead.email}</p>
                <p className="text-xs text-gray-400">{lead.phone}</p>
                <Link
                  href={`/${locale}/crm/leads/${lead.id}`}
                  className="mt-3 inline-flex text-xs text-brand-green hover:text-brand-greenDark font-medium"
                >
                  View lead profile →
                </Link>
              </div>
            ) : (
              <p className="text-sm text-gray-400">No lead linked</p>
            )}
          </div>

          {/* Commission Breakdown */}
          {provider && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <DollarSign size={16} className="text-brand-green" />
                Commission
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Provider</span>
                  <span className="font-medium text-gray-900">{provider.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Rate/month</span>
                  <span className="font-semibold text-green-700">${commissionPerMonth}</span>
                </div>
                <div className="flex justify-between text-sm border-t border-gray-50 pt-3">
                  <span className="text-gray-600">12-month est.</span>
                  <span className="font-bold text-green-700">${estimatedLifetimeCommission.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          {/* Quick info */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-3 text-sm">Meta</h2>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Assigned</span>
                <span className="text-gray-700">{deal.assigned_to?.split('@')[0] ?? '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Created</span>
                <span className="text-gray-700">{formatDate(deal.created_at, locale)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Deal ID</span>
                <span className="font-mono text-gray-500">{deal.id}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
