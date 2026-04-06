import { convertToModelMessages, streamText, UIMessage } from 'ai'
import { getSession } from '@/lib/auth/session'
import { getOpenAIModel, hasOpenAI } from '@/lib/ai/client'
import { getLeads, getDeals, getContracts, getActivities } from '@/lib/supabase/queries'

export const maxDuration = 30

const SYSTEM_PROMPT = `You are the internal AI Sales Manager for Saigon Power — a Texas electricity brokerage serving Vietnamese-American customers.

Your job is to help sales agents and admins manage their CRM by answering questions about leads, deals, contracts, renewals, and tasks. You have access to the current CRM snapshot below.

## Rules
- Only use data from the CRM snapshot provided. Never invent data.
- Be concise, direct, and action-oriented. Max 3–5 sentences per response.
- Format lists with bullet points when showing multiple items.
- When asked "who needs attention?", prioritize: overdue tasks → expiring contracts → stale leads → stuck deals.
- Dates are in ISO format. Today is {{TODAY}}.

## CRM Snapshot
{{CRM_CONTEXT}}`

async function buildCRMContext(): Promise<string> {
  const now = new Date()
  const threeDaysAgo = new Date(Date.now() - 3 * 86400000).toISOString()
  const thirtyDaysOut = new Date(Date.now() + 30 * 86400000).toISOString()

  const [leads, deals, contracts, activities] = await Promise.all([
    getLeads(),
    getDeals(),
    getContracts('active'),
    getActivities({ completed: false, limit: 50 }),
  ])

  const staleLeads = leads.filter(
    l => l.status !== 'enrolled' && l.status !== 'lost' &&
    l.updated_at < threeDaysAgo,
  )

  const expiringContracts = contracts.filter(
    c => c.end_date <= thirtyDaysOut && c.end_date >= now.toISOString(),
  )

  const overdueTasks = activities.filter(
    a => a.due_date && a.due_date < now.toISOString(),
  )

  const openDeals = deals.filter(d => d.stage !== 'won' && d.stage !== 'lost')

  const sections = [
    `LEADS (total ${leads.length}):`,
    `  New: ${leads.filter(l => l.status === 'new').length}`,
    `  Contacted: ${leads.filter(l => l.status === 'contacted').length}`,
    `  Quoted: ${leads.filter(l => l.status === 'quoted').length}`,
    `  Enrolled: ${leads.filter(l => l.status === 'enrolled').length}`,
    `  Lost: ${leads.filter(l => l.status === 'lost').length}`,
    `  Stale (no contact 3+ days): ${staleLeads.length}`,
    staleLeads.length > 0 ? `  Stale names: ${staleLeads.slice(0, 5).map(l => l.name).join(', ')}` : '',
    '',
    `OPEN DEALS (${openDeals.length}):`,
    ...openDeals.slice(0, 10).map(d =>
      `  - ${d.title} | ${d.stage} | $${d.value} | ${d.provider ?? 'no provider'} | assigned: ${d.assigned_to ?? 'unassigned'}`
    ),
    '',
    `CONTRACTS EXPIRING WITHIN 30 DAYS (${expiringContracts.length}):`,
    ...expiringContracts.map(c => {
      const days = Math.ceil((new Date(c.end_date).getTime() - now.getTime()) / 86400000)
      return `  - ${c.customer_name ?? c.provider} | ${c.provider} | expires in ${days} days (${c.end_date})`
    }),
    '',
    `OVERDUE TASKS (${overdueTasks.length}):`,
    ...overdueTasks.slice(0, 10).map(a =>
      `  - ${a.title} | due ${a.due_date} | assigned: ${a.assigned_to ?? 'unassigned'}`
    ),
  ]

  return sections.filter(s => s !== '').join('\n')
}

export async function POST(req: Request) {
  const session = await getSession()
  if (!session) return new Response('Unauthorized', { status: 401 })

  if (!hasOpenAI()) {
    return Response.json({ error: 'OPENAI_API_KEY not configured' }, { status: 503 })
  }

  const { messages }: { messages: UIMessage[] } = await req.json()

  const crmContext = await buildCRMContext()
  const systemPrompt = SYSTEM_PROMPT
    .replace('{{TODAY}}', new Date().toISOString().split('T')[0])
    .replace('{{CRM_CONTEXT}}', crmContext)

  const result = streamText({
    model: getOpenAIModel(),
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
    maxOutputTokens: 600,
  })

  return result.toUIMessageStreamResponse()
}
