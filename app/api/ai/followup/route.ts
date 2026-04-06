import { generateText } from 'ai'
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { getOpenAIModel, hasOpenAI } from '@/lib/ai/client'

export const maxDuration = 30

export interface FollowUpDraft {
  sms: string
  email_subject: string
  email_body: string
  next_action: string
  suggested_date: string
}

interface FollowUpRequest {
  type: 'lead' | 'deal' | 'renewal'
  name: string
  status?: string
  stage?: string
  service_type?: string
  provider?: string
  plan_name?: string
  end_date?: string
  last_contacted_at?: string | null
  notes?: string | null
}

function mockDraft(req: FollowUpRequest): FollowUpDraft {
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]
  return {
    sms: `Hi ${req.name.split(' ')[0]}, this is Saigon Power. We have great electricity plans for you. Can we connect today?`,
    email_subject: `Quick update for ${req.name} — Saigon Power`,
    email_body: `Hi ${req.name.split(' ')[0]},\n\nI wanted to follow up on your electricity needs. We work with all major Texas providers and our service is completely free.\n\nWould you have 5 minutes to chat?\n\nBest,\nSaigon Power Team\n(832) 937-9999`,
    next_action: 'Call or text within 24 hours',
    suggested_date: tomorrow,
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return new Response('Unauthorized', { status: 401 })

  const body: FollowUpRequest = await req.json()

  if (!hasOpenAI()) {
    return NextResponse.json(mockDraft(body))
  }

  const context = body.type === 'renewal'
    ? `Contract renewal: ${body.provider} plan "${body.plan_name}" expires ${body.end_date}.`
    : body.type === 'deal'
    ? `Deal in "${body.stage}" stage for ${body.service_type} service with ${body.provider ?? 'TBD'}.`
    : `Lead status: ${body.status}. Service type: ${body.service_type}.`

  const prompt = `Write follow-up messages for a Saigon Power sales agent. Respond with valid JSON only (no markdown).

CONTEXT:
- Customer: ${body.name}
- Type: ${body.type}
- ${context}
- Last contacted: ${body.last_contacted_at ? new Date(body.last_contacted_at).toLocaleDateString() : 'never'}
- Notes: ${body.notes ?? 'none'}

Saigon Power is a free electricity brokerage serving Texas. They help compare plans and save money on electricity bills.

Return this JSON:
{
  "sms": "concise SMS under 160 chars — friendly, personal, include a question",
  "email_subject": "short subject line under 60 chars",
  "email_body": "3-4 paragraph email — warm, professional, includes clear CTA",
  "next_action": "specific next step for the agent",
  "suggested_date": "ISO date string for next follow-up (YYYY-MM-DD)"
}

Rules:
- Use customer's first name only
- Keep SMS under 160 characters
- Email should feel personal, not templated
- Match the urgency: renewals are time-sensitive, new leads are exploratory`

  try {
    const { text } = await generateText({
      model: getOpenAIModel(),
      prompt,
      maxOutputTokens: 600,
    })
    return NextResponse.json(JSON.parse(text.trim()) as FollowUpDraft)
  } catch (err) {
    console.error('[followup] error:', err)
    return NextResponse.json(mockDraft(body))
  }
}
