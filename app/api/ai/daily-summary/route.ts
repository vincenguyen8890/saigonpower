import { generateText } from 'ai'
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { getOpenAIModel, hasOpenAI } from '@/lib/ai/client'
import { getLeads, getDeals, getContracts, getActivities } from '@/lib/supabase/queries'

export const maxDuration = 30

export interface Priority {
  type: 'lead' | 'deal' | 'contract' | 'task'
  title: string
  action: string
  urgency: 'high' | 'medium' | 'low'
  id: string
}

export interface Insight {
  title: string
  description: string
  type: 'opportunity' | 'risk' | 'info'
}

export interface DailySummary {
  date: string
  summary: string
  priorities: Priority[]
  insights: Insight[]
}

const MOCK_SUMMARY: DailySummary = {
  date: new Date().toISOString().split('T')[0],
  summary: 'AI analysis unavailable (OPENAI_API_KEY not configured). Showing rule-based priorities.',
  priorities: [],
  insights: [
    { title: 'AI not configured', description: 'Set OPENAI_API_KEY to enable AI-powered insights.', type: 'info' },
  ],
}

export async function GET() {
  const session = await getSession()
  if (!session) return new Response('Unauthorized', { status: 401 })

  const now = new Date()
  const threeDaysAgo = new Date(Date.now() - 3 * 86400000).toISOString()
  const thirtyDaysOut = new Date(Date.now() + 30 * 86400000).toISOString()

  const [leads, deals, contracts, activities] = await Promise.all([
    getLeads(),
    getDeals(),
    getContracts('active'),
    getActivities({ completed: false, limit: 100 }),
  ])

  const staleLeads = leads.filter(
    l => l.status !== 'enrolled' && l.status !== 'lost' &&
    l.updated_at < threeDaysAgo,
  )
  const newLeads = leads.filter(l => l.status === 'new')
  const expiringContracts = contracts.filter(
    c => c.end_date <= thirtyDaysOut && c.end_date >= now.toISOString(),
  )
  const overdueTasks = activities.filter(a => a.due_date && a.due_date < now.toISOString())
  const stuckDeals = deals.filter(d => {
    if (d.stage === 'won' || d.stage === 'lost') return false
    const updated = new Date(d.updated_at).getTime()
    return Date.now() - updated > 7 * 86400000
  })

  if (!hasOpenAI()) {
    // Rule-based fallback
    const priorities: Priority[] = [
      ...overdueTasks.slice(0, 3).map(a => ({
        type: 'task' as const,
        title: a.title,
        action: 'Complete overdue task',
        urgency: 'high' as const,
        id: a.id,
      })),
      ...expiringContracts.slice(0, 2).map(c => ({
        type: 'contract' as const,
        title: `${c.customer_name ?? c.provider} — expires ${c.end_date}`,
        action: 'Initiate renewal outreach',
        urgency: 'high' as const,
        id: c.id,
      })),
      ...newLeads.slice(0, 2).map(l => ({
        type: 'lead' as const,
        title: `New lead: ${l.name}`,
        action: 'Make initial contact within 24 hours',
        urgency: 'medium' as const,
        id: l.id,
      })),
    ]
    return NextResponse.json({ ...MOCK_SUMMARY, priorities })
  }

  const prompt = `You are the AI Sales Manager for Saigon Power. Analyze this CRM snapshot and respond with valid JSON only.

Today: ${now.toISOString().split('T')[0]}

CRM DATA:
- New leads: ${newLeads.length} (${newLeads.slice(0, 3).map(l => l.name).join(', ')})
- Stale leads (no contact 3+ days): ${staleLeads.length} (${staleLeads.slice(0, 3).map(l => l.name).join(', ')})
- Open deals: ${deals.filter(d => d.stage !== 'won' && d.stage !== 'lost').length}
- Stuck deals (no update 7+ days): ${stuckDeals.length} (${stuckDeals.slice(0, 2).map(d => d.title).join(', ')})
- Contracts expiring within 30 days: ${expiringContracts.length} (${expiringContracts.slice(0, 3).map(c => `${c.customer_name ?? c.provider} in ${Math.ceil((new Date(c.end_date).getTime() - now.getTime()) / 86400000)} days`).join(', ')})
- Overdue tasks: ${overdueTasks.length} (${overdueTasks.slice(0, 3).map(a => a.title).join(', ')})

Return this exact JSON structure (no markdown, no code blocks):
{
  "date": "${now.toISOString().split('T')[0]}",
  "summary": "2-3 sentence executive summary of today's sales situation",
  "priorities": [
    { "type": "lead|deal|contract|task", "title": "...", "action": "specific action to take", "urgency": "high|medium|low", "id": "use actual IDs or 'new'" }
  ],
  "insights": [
    { "title": "short title", "description": "1-2 sentence insight", "type": "opportunity|risk|info" }
  ]
}

Rules:
- List up to 5 priorities, ranked by urgency
- List 2-3 insights (patterns, risks, opportunities you see)
- Be specific and action-oriented, not generic
- Use actual names from the data`

  try {
    const { text } = await generateText({
      model: getOpenAIModel(),
      prompt,
      maxOutputTokens: 800,
    })

    const json = JSON.parse(text.trim()) as DailySummary
    return NextResponse.json(json)
  } catch (err) {
    console.error('[daily-summary] error:', err)
    return NextResponse.json(MOCK_SUMMARY)
  }
}
