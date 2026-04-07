import { generateText } from 'ai'
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { getOpenAIModel, hasOpenAI } from '@/lib/ai/client'
import { getPlansFromDB } from '@/lib/supabase/queries'

export const maxDuration = 30

export interface RatePlan {
  rank: number
  provider: string
  plan_name: string
  rate_kwh: number
  term_months: number
  product_type: string
  monthly_cost: number
  annual_savings: number
  why: string
}

export interface RateRecommendation {
  recommendations: RatePlan[]
  summary: string
  best_pick: string
}

function mockRecommendation(usage: number): RateRecommendation {
  const base = usage * 0.12
  return {
    recommendations: [
      { rank: 1, provider: 'Gexa Energy', plan_name: 'Gexa Saver 12', rate_kwh: 0.109, term_months: 12, product_type: 'Fixed', monthly_cost: Math.round(usage * 0.109), annual_savings: Math.round(base * 12 - usage * 0.109 * 12), why: 'Lowest fixed rate for 12 months with no hidden fees' },
      { rank: 2, provider: 'Reliant Energy', plan_name: 'Reliant Secure Advantage 24', rate_kwh: 0.115, term_months: 24, product_type: 'Fixed', monthly_cost: Math.round(usage * 0.115), annual_savings: Math.round(base * 12 - usage * 0.115 * 12), why: 'Price stability over 2 years, good for budget planning' },
      { rank: 3, provider: 'TXU Energy', plan_name: 'TXU Simple Rate 6', rate_kwh: 0.122, term_months: 6, product_type: 'Fixed', monthly_cost: Math.round(usage * 0.122), annual_savings: Math.round(base * 12 - usage * 0.122 * 12), why: 'Flexible 6-month term if customer wants to shop again soon' },
    ],
    summary: `Based on ${usage.toLocaleString()} kWh/month usage, Gexa Saver 12 offers the best value at $${(usage * 0.109).toFixed(0)}/mo.`,
    best_pick: 'Gexa Saver 12',
  }
}

export async function POST(req: Request) {
  const session = await getSession()
  if (!session) return new Response('Unauthorized', { status: 401 })

  const { usage_kwh, zip, service_type } = await req.json() as {
    usage_kwh: number
    zip: string
    service_type: 'residential' | 'commercial'
  }

  if (!hasOpenAI()) {
    return NextResponse.json(mockRecommendation(usage_kwh))
  }

  // Load real plans from DB
  const plans = await getPlansFromDB()
  const activePlans = plans.filter(p => p.status === 'active').slice(0, 20)

  const plansText = activePlans.length > 0
    ? activePlans.map(p =>
        `- ${p.provider_name} | ${p.name} | ${p.rate_kwh ? `${(p.rate_kwh * 100).toFixed(4)}¢/kWh` : 'rate TBD'} | ${p.term_months ?? '?'}mo | Fixed`
      ).join('\n')
    : 'Gexa Saver 12 | 10.9¢ | 12mo | Fixed\nReliant Secure 24 | 11.5¢ | 24mo | Fixed\nTXU Simple 6 | 12.2¢ | 6mo | Fixed'

  const monthlyCost = (rate: number) => Math.round(usage_kwh * rate)

  const prompt = `You are a Texas electricity rate advisor for Saigon Power.

Customer profile:
- Monthly usage: ${usage_kwh.toLocaleString()} kWh
- ZIP code: ${zip}
- Service type: ${service_type}

Available plans from our portfolio:
${plansText}

Rank the top 3 plans for this customer. Return ONLY valid JSON, no markdown.

{
  "recommendations": [
    {
      "rank": 1,
      "provider": "string",
      "plan_name": "string",
      "rate_kwh": 0.109,
      "term_months": 12,
      "product_type": "Fixed|Variable|Indexed",
      "monthly_cost": ${monthlyCost(0.109)},
      "annual_savings": 240,
      "why": "one sentence explaining why this is the best fit"
    }
  ],
  "summary": "2-sentence plain-English summary for the agent to share with customer",
  "best_pick": "plan name of #1 recommendation"
}`

  try {
    const { text } = await generateText({
      model: getOpenAIModel(),
      prompt,
      maxOutputTokens: 600,
    })
    const cleaned = text.trim().replace(/^```json\n?/, '').replace(/\n?```$/, '')
    return NextResponse.json(JSON.parse(cleaned) as RateRecommendation)
  } catch {
    return NextResponse.json(mockRecommendation(usage_kwh))
  }
}
