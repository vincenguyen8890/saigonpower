import { setRequestLocale } from 'next-intl/server'
import { getCRMAgents, getLeads, getDeals, getAgentGoals } from '@/lib/supabase/queries'
import AgentsClient from './AgentsClient'
import GoalsClient from './GoalsClient'
import CommissionClient from './CommissionClient'

interface Props {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ tab?: string }>
}

export default async function AgentsPage({ params, searchParams }: Props) {
  const { locale } = await params
  const { tab = 'agents' } = await searchParams
  setRequestLocale(locale)

  const now = new Date()
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const monthStart = `${currentMonth}-01`

  const [agents, leads, deals, goals] = await Promise.all([
    getCRMAgents(),
    getLeads(),
    getDeals(),
    getAgentGoals(),
  ])

  const agentEmails = [...new Set([
    ...agents.map(a => a.email),
    ...leads.map(l => l.assigned_to).filter(Boolean) as string[],
    ...deals.map(d => d.assigned_to).filter(Boolean) as string[],
  ])]

  const REFERRAL_FEE: Record<string, number> = { inside_agent: 5 }
  const DEFAULT_REFERRAL_FEE = 20

  const stats = agentEmails.map(email => ({
    email,
    leads:    leads.filter(l => l.assigned_to === email).length,
    deals:    deals.filter(d => d.assigned_to === email && !['won','lost'].includes(d.stage)).length,
    enrolled: leads.filter(l => l.assigned_to === email && l.status === 'enrolled').length,
  }))

  // Won this month per agent
  const wonThisMonth: Record<string, { deals: number; value: number }> = {}
  for (const d of deals.filter(d => d.stage === 'won' && d.assigned_to && d.updated_at >= monthStart)) {
    const e = d.assigned_to!
    if (!wonThisMonth[e]) wonThisMonth[e] = { deals: 0, value: 0 }
    wonThisMonth[e].deals++
    wonThisMonth[e].value += d.value
  }

  // Commission summary per agent
  const commissionRows = agentEmails.map(email => {
    const agent = agents.find(a => a.email === email)
    const feePerDeal = agent?.agent_type ? (REFERRAL_FEE[agent.agent_type] ?? DEFAULT_REFERRAL_FEE) : DEFAULT_REFERRAL_FEE
    const wonDeals = deals.filter(d => d.assigned_to === email && d.stage === 'won')
    const totalOwed = wonDeals.length * feePerDeal
    const totalPaid = wonDeals.reduce((s, d) => s + (d.commission_paid ? (d.commission_paid_amount ?? feePerDeal) : 0), 0)
    return { email, name: agent?.name ?? email.split('@')[0], wonDeals: wonDeals.length, feePerDeal, totalOwed, totalPaid, balance: totalOwed - totalPaid }
  }).filter(r => r.wonDeals > 0 || r.totalPaid > 0)

  return (
    <div className="space-y-5">
      {/* Tab nav */}
      <div className="flex gap-2">
        <a href="?tab=agents" className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors ${!tab || tab === 'agents' ? 'bg-brand-greenDark text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
          Agents
        </a>
        <a href="?tab=goals" className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors ${tab === 'goals' ? 'bg-brand-greenDark text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
          Monthly Goals
        </a>
        <a href="?tab=commission" className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors ${tab === 'commission' ? 'bg-brand-greenDark text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
          Commission
        </a>
      </div>

      {tab === 'goals'
        ? <GoalsClient agents={agents} goals={goals} currentMonth={currentMonth} wonThisMonth={wonThisMonth} />
        : tab === 'commission'
        ? <CommissionClient rows={commissionRows} />
        : <AgentsClient agents={agents} stats={stats} />
      }
    </div>
  )
}
