import { setRequestLocale } from 'next-intl/server'
import { getCRMAgents, getLeads, getDeals, getAgentGoals } from '@/lib/supabase/queries'
import AgentsClient from './AgentsClient'
import GoalsClient from './GoalsClient'

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

  return (
    <div className="space-y-5">
      {/* Tab nav */}
      <div className="flex gap-2">
        <a href="?tab=agents" className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors ${tab !== 'goals' ? 'bg-brand-greenDark text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
          Agents
        </a>
        <a href="?tab=goals" className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors ${tab === 'goals' ? 'bg-brand-greenDark text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
          Monthly Goals
        </a>
      </div>

      {tab === 'goals'
        ? <GoalsClient agents={agents} goals={goals} currentMonth={currentMonth} wonThisMonth={wonThisMonth} />
        : <AgentsClient agents={agents} stats={stats} />
      }
    </div>
  )
}
