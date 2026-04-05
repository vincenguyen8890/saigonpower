import { setRequestLocale } from 'next-intl/server'
import { getCRMAgents, getLeads, getDeals } from '@/lib/supabase/queries'
import AgentsClient from './AgentsClient'

interface Props { params: Promise<{ locale: string }> }

export default async function AgentsPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const [agents, leads, deals] = await Promise.all([
    getCRMAgents(),
    getLeads(),
    getDeals(),
  ])

  // Compute stats per agent email
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

  return (
    <AgentsClient agents={agents} stats={stats} />
  )
}
