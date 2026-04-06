import { generateText } from 'ai'
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { getOpenAIModel, hasOpenAI } from '@/lib/ai/client'
import { getContracts } from '@/lib/supabase/queries'

export const maxDuration = 30

export interface RenewalAlert {
  id: string
  customer_name: string
  provider: string
  plan_name: string | null
  days_remaining: number
  end_date: string
  service_type: string
  urgency: 'critical' | 'high' | 'medium'
  outreach_message: string
  task_title: string
}

export interface RenewalSummary {
  summary: string
  contracts: RenewalAlert[]
}

export async function GET() {
  const session = await getSession()
  if (!session) return new Response('Unauthorized', { status: 401 })

  const now = new Date()
  const sixtyDaysOut = new Date(Date.now() + 60 * 86400000).toISOString()

  const contracts = await getContracts('active')
  const expiring = contracts.filter(
    c => c.end_date <= sixtyDaysOut && c.end_date >= now.toISOString(),
  )

  if (expiring.length === 0) {
    return NextResponse.json({ summary: 'No contracts expiring in the next 60 days.', contracts: [] })
  }

  const withDays = expiring.map(c => ({
    ...c,
    days_remaining: Math.ceil((new Date(c.end_date).getTime() - now.getTime()) / 86400000),
  }))

  if (!hasOpenAI()) {
    const alerts: RenewalAlert[] = withDays.map(c => ({
      id: c.id,
      customer_name: c.customer_name ?? c.provider,
      provider: c.provider,
      plan_name: c.plan_name,
      days_remaining: c.days_remaining,
      end_date: c.end_date,
      service_type: c.service_type,
      urgency: c.days_remaining <= 14 ? 'critical' : c.days_remaining <= 30 ? 'high' : 'medium',
      outreach_message: `Hi, your ${c.provider} contract expires in ${c.days_remaining} days. Let's find you a better rate before you roll to variable pricing!`,
      task_title: `Renewal outreach — ${c.customer_name ?? c.provider}`,
    }))
    return NextResponse.json({
      summary: `${expiring.length} contract${expiring.length > 1 ? 's' : ''} expiring within 60 days. Rule-based analysis (AI not configured).`,
      contracts: alerts,
    })
  }

  const contractList = withDays.map(c =>
    `ID: ${c.id} | ${c.customer_name ?? c.provider} | ${c.provider} | ${c.plan_name ?? 'unknown plan'} | ${c.service_type} | ${c.days_remaining} days remaining`
  ).join('\n')

  const prompt = `You are the renewal manager at Saigon Power. Analyze these expiring contracts and generate outreach guidance. Respond with valid JSON only (no markdown).

EXPIRING CONTRACTS (within 60 days):
${contractList}

Context: When contracts expire without renewal, customers roll to expensive variable rates (30-50% higher). Saigon Power renews them for free. Commercial contracts are higher priority due to larger commissions.

Return this JSON:
{
  "summary": "2-3 sentence summary of the renewal situation and what to prioritize",
  "contracts": [
    {
      "id": "contract id",
      "customer_name": "name",
      "provider": "provider name",
      "plan_name": "plan name or null",
      "days_remaining": <number>,
      "end_date": "YYYY-MM-DD",
      "service_type": "residential|commercial",
      "urgency": "critical|high|medium",
      "outreach_message": "personalized SMS/text message to send customer (under 160 chars)",
      "task_title": "task title for agent work queue"
    }
  ]
}

Rules:
- critical = ≤14 days, high = 15-30 days, medium = 31-60 days
- Commercial contracts should be bumped one urgency level higher
- outreach_message must be personal and mention the days remaining`

  try {
    const { text } = await generateText({
      model: getOpenAIModel(),
      prompt,
      maxOutputTokens: 800,
    })
    return NextResponse.json(JSON.parse(text.trim()) as RenewalSummary)
  } catch (err) {
    console.error('[renewals] error:', err)
    // Fallback to rule-based
    const alerts: RenewalAlert[] = withDays.map(c => ({
      id: c.id,
      customer_name: c.customer_name ?? c.provider,
      provider: c.provider,
      plan_name: c.plan_name,
      days_remaining: c.days_remaining,
      end_date: c.end_date,
      service_type: c.service_type,
      urgency: c.days_remaining <= 14 ? 'critical' : c.days_remaining <= 30 ? 'high' : 'medium',
      outreach_message: `Hi, your ${c.provider} contract expires in ${c.days_remaining} days. Call us to renew at a better rate — it's free!`,
      task_title: `Renewal outreach — ${c.customer_name ?? c.provider}`,
    }))
    return NextResponse.json({ summary: `${expiring.length} contract(s) expiring soon.`, contracts: alerts })
  }
}
