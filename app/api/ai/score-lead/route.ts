import { generateText } from 'ai'
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { getOpenAIModel, hasOpenAI } from '@/lib/ai/client'
import type { Lead } from '@/lib/supabase/queries'

export const maxDuration = 30

export interface LeadScore {
  score: number
  tier: 'hot' | 'warm' | 'cold'
  reasoning: string
  recommended_action: string
  suggested_queue: 'immediate' | 'this-week' | 'nurture'
}

function ruleBasedScore(lead: Lead): LeadScore {
  let score = 50
  if (lead.service_type === 'commercial') score += 20
  if (lead.status === 'quoted') score += 15
  if (lead.status === 'contacted') score += 10
  if (lead.status === 'new') score -= 5
  const daysSinceCreated = (Date.now() - new Date(lead.created_at).getTime()) / 86400000
  if (daysSinceCreated < 1) score += 10
  if (daysSinceCreated > 7) score -= 10

  score = Math.max(0, Math.min(100, score))
  const tier = score >= 70 ? 'hot' : score >= 40 ? 'warm' : 'cold'
  return {
    score,
    tier,
    reasoning: 'Rule-based score (AI not configured).',
    recommended_action: tier === 'hot' ? 'Call immediately' : tier === 'warm' ? 'Follow up this week' : 'Add to nurture sequence',
    suggested_queue: tier === 'hot' ? 'immediate' : tier === 'warm' ? 'this-week' : 'nurture',
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return new Response('Unauthorized', { status: 401 })

  const lead: Lead = await req.json()

  if (!hasOpenAI()) {
    return NextResponse.json(ruleBasedScore(lead))
  }

  const daysSinceUpdate = Math.floor(
    (Date.now() - new Date(lead.updated_at).getTime()) / 86400000,
  )

  const prompt = `Score this electricity sales lead for Saigon Power. Respond with valid JSON only (no markdown).

LEAD DATA:
- Name: ${lead.name}
- Service type: ${lead.service_type}
- Status: ${lead.status}
- ZIP: ${lead.zip}
- Created: ${lead.created_at}
- Days since last update: ${daysSinceUpdate}
- Phone: ${lead.phone ? 'provided' : 'missing'}
- Email: ${lead.email ? 'provided' : 'missing'}

Scoring context:
- Commercial leads are worth 3-5x residential in commission
- New leads contacted within 24h convert 3x better
- Stale leads (7+ days no contact) are likely cold
- Quoted leads who haven't responded in 3+ days need a nudge

Return this JSON:
{
  "score": <0-100>,
  "tier": "hot|warm|cold",
  "reasoning": "2 sentence explanation",
  "recommended_action": "specific action to take right now",
  "suggested_queue": "immediate|this-week|nurture"
}`

  try {
    const { text } = await generateText({
      model: getOpenAIModel(),
      prompt,
      maxOutputTokens: 300,
    })
    return NextResponse.json(JSON.parse(text.trim()) as LeadScore)
  } catch {
    return NextResponse.json(ruleBasedScore(lead))
  }
}
