import Link from 'next/link'
import { setRequestLocale } from 'next-intl/server'
import { getDeals, getLeads, getCRMAgents, getProvidersFromDB } from '@/lib/supabase/queries'
import { TrendingUp, DollarSign, Target, CheckCircle2, Download } from 'lucide-react'
import { mockProviders } from '@/data/mock-crm'
import NewDealModal from './NewDealModal'
import DealsToolbar from './DealsToolbar'

interface Props {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ stage?: string; q?: string; agent?: string }>
}

const stageConfig: Record<string, { label: string; color: string; bg: string }> = {
  prospect:    { label: 'Prospect',    color: 'text-gray-600',   bg: 'bg-gray-100'   },
  qualified:   { label: 'Qualified',   color: 'text-blue-700',   bg: 'bg-blue-100'   },
  proposal:    { label: 'Proposal',    color: 'text-purple-700', bg: 'bg-purple-100' },
  negotiation: { label: 'Negotiation', color: 'text-amber-700',  bg: 'bg-amber-100'  },
  won:         { label: 'Won',         color: 'text-green-700',  bg: 'bg-green-100'  },
  lost:        { label: 'Lost',        color: 'text-red-600',    bg: 'bg-red-100'    },
}

const stages = ['prospect', 'qualified', 'proposal', 'negotiation', 'won', 'lost']

export default async function DealsPage({ params, searchParams }: Props) {
  const { locale } = await params
  const { stage, q = '', agent = '' } = await searchParams
  setRequestLocale(locale)

  const [deals, leads, agents, providers] = await Promise.all([
    getDeals(stage),
    getLeads(),
    getCRMAgents(),
    getProvidersFromDB(),
  ])

  // Pipeline stats
  const activeDeals = deals.filter(d => !['won', 'lost'].includes(d.stage))
  const wonDeals    = deals.filter(d => d.stage === 'won')
  const totalValue  = activeDeals.reduce((s, d) => s + d.value, 0)
  const wonValue    = wonDeals.reduce((s, d) => s + d.value, 0)
  const weightedValue = activeDeals.reduce((s, d) => s + d.value * d.probability / 100, 0)

  // Lead map for lookups
  const leadMap = Object.fromEntries(leads.map(l => [l.id, l.name]))

  // Apply search filters
  const filteredDeals = deals.filter(d => {
    const qLower = q.toLowerCase()
    const agentLower = agent.toLowerCase()
    const matchQ = !q || d.title.toLowerCase().includes(qLower) || (d.provider ?? '').toLowerCase().includes(qLower) || (d.lead_id ? (leadMap[d.lead_id] ?? '').toLowerCase().includes(qLower) : false)
    const matchAgent = !agent || (d.assigned_to ?? '').toLowerCase().includes(agentLower)
    return matchQ && matchAgent
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Deals & Opportunities</h1>
          <p className="text-gray-500 text-sm mt-1">{activeDeals.length} active deals · ${totalValue.toLocaleString()}/mo pipeline</p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/api/crm/deals/export"
            className="flex items-center gap-1.5 text-sm border border-gray-200 text-gray-600 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors bg-white"
          >
            <Download size={14} />
            Export
          </a>
          <NewDealModal locale={locale} leads={leads} agents={agents} providers={providers} />
        </div>
      </div>

      {/* Search/filter toolbar */}
      <DealsToolbar initialQ={q} initialAgent={agent} />

      {/* Stats — always from full unfiltered deals */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={16} className="text-blue-500" />
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Active Deals</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{activeDeals.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign size={16} className="text-purple-500" />
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Pipeline Value</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">${totalValue.toLocaleString()}<span className="text-sm font-normal text-gray-400">/mo</span></p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-1">
            <Target size={16} className="text-amber-500" />
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Weighted Value</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">${Math.round(weightedValue).toLocaleString()}<span className="text-sm font-normal text-gray-400">/mo</span></p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 size={16} className="text-green-500" />
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Won Value</p>
          </div>
          <p className="text-2xl font-bold text-green-600">${wonValue.toLocaleString()}<span className="text-sm font-normal text-gray-400">/mo</span></p>
        </div>
      </div>

      {/* Stage Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        <a
          href={`/${locale}/crm/deals`}
          className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors ${!stage ? 'bg-brand-greenDark text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
        >
          All ({filteredDeals.length})
        </a>
        {stages.map(s => {
          const count = filteredDeals.filter(d => d.stage === s).length
          const cfg = stageConfig[s]
          return (
            <a
              key={s}
              href={`/${locale}/crm/deals?stage=${s}`}
              className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors ${stage === s ? 'bg-brand-greenDark text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              {cfg.label} ({count})
            </a>
          )
        })}
      </div>

      {/* Deals Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {filteredDeals.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <TrendingUp size={32} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">No deals found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-100 bg-gray-50/50">
                <tr>
                  {['Deal', 'Lead', 'Stage', 'Value', 'Commission', 'Probability', 'Expected Close', ''].map((h, i) => (
                    <th
                      key={i}
                      className={`text-left text-xs font-medium text-gray-400 uppercase tracking-wide px-5 py-3 ${[5,6].includes(i) ? 'hidden lg:table-cell' : ''} ${[1,4].includes(i) ? 'hidden md:table-cell' : ''}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredDeals.map(deal => {
                  const cfg = stageConfig[deal.stage]
                  const provider = mockProviders.find(p => p.name === deal.provider)
                  const commission = provider
                    ? (deal.service_type === 'commercial' ? provider.commission_commercial : provider.commission_residential) * 12
                    : null

                  return (
                    <tr key={deal.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-gray-900">{deal.title}</p>
                        <p className="text-xs text-gray-400 capitalize">{deal.service_type ?? '—'}</p>
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell">
                        <p className="text-sm text-gray-700">
                          {deal.lead_id ? (leadMap[deal.lead_id] ?? '—') : '—'}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium capitalize ${cfg.bg} ${cfg.color}`}>
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-gray-900">${deal.value}<span className="text-xs font-normal text-gray-400">/mo</span></p>
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell">
                        {commission
                          ? <span className="text-sm font-medium text-green-700">${commission.toLocaleString()}</span>
                          : <span className="text-xs text-gray-300">—</span>}
                        <p className="text-xs text-gray-400">12-mo est.</p>
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-brand-greenDark rounded-full" style={{ width: `${deal.probability}%` }} />
                          </div>
                          <span className="text-xs text-gray-500">{deal.probability}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 hidden lg:table-cell">
                        <p className="text-xs text-gray-500">{deal.expected_close ?? 'TBD'}</p>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/${locale}/crm/deals/${deal.id}`}
                          className="text-xs bg-brand-greenDark text-white px-3 py-1.5 rounded-lg hover:bg-brand-green transition-colors font-medium"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
