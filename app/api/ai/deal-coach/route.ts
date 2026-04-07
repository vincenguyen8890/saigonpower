import { convertToModelMessages, streamText, UIMessage } from 'ai'
import { getSession } from '@/lib/auth/session'
import { getOpenAIModel, hasOpenAI } from '@/lib/ai/client'
import { getDealById, getLeadById, getActivities } from '@/lib/supabase/queries'

export const maxDuration = 30

export async function POST(req: Request) {
  const session = await getSession()
  if (!session) return new Response('Unauthorized', { status: 401 })

  if (!hasOpenAI()) {
    return Response.json({ error: 'OPENAI_API_KEY not configured' }, { status: 503 })
  }

  const { dealId, messages }: { dealId: string; messages: UIMessage[] } = await req.json()

  // Load deal context
  const deal = await getDealById(dealId)
  if (!deal) return new Response('Deal not found', { status: 404 })

  const lead = deal.lead_id ? await getLeadById(deal.lead_id) : null
  const activities = await getActivities({ leadId: deal.lead_id ?? undefined, limit: 20 })

  const daysSinceUpdate = Math.floor(
    (Date.now() - new Date(deal.updated_at).getTime()) / 86400000,
  )

  const systemPrompt = `You are a senior sales coach for Saigon Power, a Texas electricity brokerage.
You are reviewing a specific deal and giving focused, actionable advice to the sales agent.

## Deal Context
- Title: ${deal.title}
- Stage: ${deal.stage}
- Value: $${deal.value}/mo
- Provider: ${deal.provider ?? 'not set'}
- Plan: ${deal.plan_name ?? 'not set'}
- Rate: ${deal.rate_kwh ? `${(deal.rate_kwh * 100).toFixed(4)}¢/kWh` : 'not set'}
- Term: ${deal.term_months ? `${deal.term_months} months` : 'not set'}
- Service address: ${deal.service_address ?? 'not set'}
- ESID: ${deal.esid ?? 'not set'}
- Days since last update: ${daysSinceUpdate}
- Assigned to: ${deal.assigned_to ?? 'unassigned'}
- Expected close: ${deal.expected_close ?? 'not set'}
- Notes: ${deal.notes ?? 'none'}

## Customer
- Name: ${lead?.name ?? 'unknown'}
- Phone: ${lead?.phone ?? 'not provided'}
- Email: ${lead?.email ?? 'not provided'}
- Status: ${lead?.status ?? 'unknown'}
- Service type: ${lead?.service_type ?? 'unknown'}
- ZIP: ${lead?.zip ?? 'unknown'}

## Recent Activity (last 20)
${activities.length === 0 ? 'No activity recorded' : activities.slice(0, 10).map(a =>
  `- [${a.completed ? 'DONE' : 'OPEN'}] ${a.type.toUpperCase()}: ${a.title} | due: ${a.due_date ?? 'no date'}`
).join('\n')}

## Your coaching style
- Be direct and specific — no fluff
- Give ONE primary action to take right now
- Flag any deal risks you see
- If information is missing (ESID, rate, address), flag it as a blocker
- Keep responses to 3–5 bullet points max
- Today is ${new Date().toISOString().split('T')[0]}`

  const result = streamText({
    model: getOpenAIModel(),
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
    maxOutputTokens: 500,
  })

  return result.toUIMessageStreamResponse()
}
