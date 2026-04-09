import Link from 'next/link'
import { setRequestLocale } from 'next-intl/server'
import { getDeals, getLeads, getCRMAgents, getProvidersFromDB } from '@/lib/supabase/queries'
import { getSession } from '@/lib/auth/session'
import { TrendingUp, DollarSign, Target, CheckCircle2, Download, LayoutGrid, List } from 'lucide-react'
// stageConfig kept here for stage tabs
import NewDealModal from './NewDealModal'
import DealsToolbar from './DealsToolbar'
import DealsKanban from './DealsKanban'
import DealsTable from './DealsTable'
import UnlinkedDealsPanel from './UnlinkedDealsPanel'

interface Props {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ stage?: string; q?: string; agent?: string; view?: string }>
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
  const { stage, q = '', agent = '', view = 'table' } = await searchParams
  const showUnlinked = stage === 'unlinked'
  setRequestLocale(locale)

  const session = await getSession()
  const agentFilter = session?.role === 'agent' ? session.email : undefined

  const [deals, leads, agents, providers] = await Promise.all([
    getDeals(stage, agentFilter),
    getLeads({ assigned_to: agentFilter }),
    getCRMAgents(),
    getProvidersFromDB(),
  ])
  const showValue = !['csr', 'office_manager'].includes(session?.role ?? '')

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
          <p className="text-gray-500 text-sm mt-1">{activeDeals.length} active deals{showValue ? ` · $${totalValue.toLocaleString()}/mo pipeline` : ''}</p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/api/crm/deals/export"
            className="flex items-center gap-1.5 text-sm border border-gray-200 text-gray-600 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors bg-white"
          >
            <Download size={14} />
            Export
          </a>
          <div className="flex border border-gray-200 rounded-xl overflow-hidden bg-white">
            <Link href={`/${locale}/crm/deals?view=table${stage ? `&stage=${stage}` : ''}`}
              className={`px-3 py-2 flex items-center gap-1.5 text-sm transition-colors ${view !== 'kanban' ? 'bg-gray-100 text-gray-800' : 'text-gray-400 hover:bg-gray-50'}`}>
              <List size={15} />
            </Link>
            <Link href={`/${locale}/crm/deals?view=kanban${stage ? `&stage=${stage}` : ''}`}
              className={`px-3 py-2 flex items-center gap-1.5 text-sm transition-colors ${view === 'kanban' ? 'bg-gray-100 text-gray-800' : 'text-gray-400 hover:bg-gray-50'}`}>
              <LayoutGrid size={15} />
            </Link>
          </div>
          <NewDealModal locale={locale} leads={leads} agents={agents} providers={providers} />
        </div>
      </div>

      {/* Search/filter toolbar (table view only) */}
      {view !== 'kanban' && <DealsToolbar initialQ={q} initialAgent={agent} />}

      {/* Stats — always from full unfiltered deals */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={16} className="text-blue-500" />
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Active Deals</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{activeDeals.length}</p>
        </div>
        {showValue && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign size={16} className="text-purple-500" />
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Pipeline Value</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">${totalValue.toLocaleString()}<span className="text-sm font-normal text-gray-400">/mo</span></p>
          </div>
        )}
        {showValue && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-1">
              <Target size={16} className="text-amber-500" />
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Weighted Value</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">${Math.round(weightedValue).toLocaleString()}<span className="text-sm font-normal text-gray-400">/mo</span></p>
          </div>
        )}
        {showValue && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 size={16} className="text-green-500" />
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Won Value</p>
            </div>
            <p className="text-2xl font-bold text-green-600">${wonValue.toLocaleString()}<span className="text-sm font-normal text-gray-400">/mo</span></p>
          </div>
        )}
      </div>

      {/* Kanban view */}
      {view === 'kanban' && (
        <DealsKanban deals={deals} locale={locale} leadMap={leadMap} showValue={showValue} />
      )}

      {view !== 'kanban' && <>
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
        {(() => {
          const unlinkedCount = deals.filter(d => !d.lead_id).length
          return unlinkedCount > 0 ? (
            <a
              href={`/${locale}/crm/deals?stage=unlinked`}
              className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors ${showUnlinked ? 'bg-amber-600 text-white' : 'bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100'}`}
            >
              Unlinked ({unlinkedCount})
            </a>
          ) : null
        })()}
      </div>

      {/* Unlinked deals or Deals Table with bulk ops */}
      {showUnlinked
        ? <UnlinkedDealsPanel deals={deals} leads={leads} locale={locale} />
        : <DealsTable deals={filteredDeals} locale={locale} leadMap={leadMap} agents={agents} showValue={showValue} />
      }
      </>}
    </div>
  )
}
