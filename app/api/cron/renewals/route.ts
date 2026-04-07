import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { generateText } from 'ai'
import { getDeals, getCRMAgents, insertActivity, getActivities, getLeadById } from '@/lib/supabase/queries'
import { getOpenAIModel, hasOpenAI } from '@/lib/ai/client'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM   = process.env.RESEND_FROM ?? 'Saigon Power <noreply@saigonpower.com>'

const WINDOWS = [
  { label: '90-day',  tag: 'seq:90d',  min: 85,  max: 95,  activityType: 'task'  as const, title: '90-day renewal review',          emoji: '📋' },
  { label: '60-day',  tag: 'seq:60d',  min: 55,  max: 65,  activityType: 'call'  as const, title: 'Schedule renewal call',           emoji: '📞' },
  { label: '30-day',  tag: 'seq:30d',  min: 25,  max: 35,  activityType: 'email' as const, title: 'Send renewal quote',              emoji: '📧' },
  { label: '7-day',   tag: 'seq:7d',   min: 4,   max: 8,   activityType: 'task'  as const, title: 'URGENT — contract expiring soon', emoji: '🚨' },
]

async function generateOutreachEmail(
  customerName: string,
  agentName: string,
  dealTitle: string,
  provider: string | null,
  planName: string | null,
  daysLeft: number,
  value: number,
): Promise<string> {
  if (!hasOpenAI()) return defaultEmail(customerName, agentName, dealTitle, provider, daysLeft)

  try {
    const { text } = await generateText({
      model: getOpenAIModel(),
      maxOutputTokens: 300,
      prompt: `Write a short, friendly renewal outreach email for a Texas electricity customer.

Agent: ${agentName}
Customer: ${customerName}
Current plan: ${provider ?? 'current provider'} — ${planName ?? 'current plan'}
Days until contract expires: ${daysLeft}
Current monthly cost: $${value}/mo

Write a 3-4 sentence email body (no subject line, no greeting/sign-off).
Be warm, mention the expiry, offer to find them a better rate. Keep it under 80 words.`,
    })
    return text.trim()
  } catch {
    return defaultEmail(customerName, agentName, dealTitle, provider, daysLeft)
  }
}

function defaultEmail(customerName: string, agentName: string, dealTitle: string, provider: string | null, daysLeft: number): string {
  return `Your ${provider ?? 'electricity'} contract for ${dealTitle} expires in ${daysLeft} days. We'd love to help you find the best rate before it auto-renews. Reply to this email or call us to get a free rate comparison — it only takes a few minutes. We appreciate your trust in Saigon Power!`
}

export async function GET(req: NextRequest) {
  const auth   = req.headers.get('authorization')
  const secret = process.env.CRON_SECRET
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now      = new Date()
  const todayStr = now.toISOString().split('T')[0]

  const [deals, agents] = await Promise.all([
    getDeals(),
    getCRMAgents(),
  ])

  const agentMap = Object.fromEntries(agents.map(a => [a.email, a.name]))

  // Only deals with a future contract_end_date
  const relevant = deals.filter(d => d.contract_end_date && d.contract_end_date >= todayStr)

  // Pre-load all renewal activities to avoid duplicate sends (dedup by tag in description)
  const allRenewalActivities = await getActivities({ limit: 2000 })
  const sentTags = new Set(
    allRenewalActivities
      .filter(a => a.created_by === 'cron:renewal-engine')
      .map(a => a.description ?? '')
      .join('\n')
      .match(/seq:\w+:deal-[^,\s]*/g) ?? []
  )

  const summary: { window: string; sent: string[]; skipped: string[] }[] = []
  let totalActivities = 0
  let totalEmails     = 0

  for (const w of WINDOWS) {
    const sent: string[]    = []
    const skipped: string[] = []

    for (const deal of relevant) {
      const daysLeft = Math.ceil((new Date(deal.contract_end_date!).getTime() - now.getTime()) / 86400000)
      if (daysLeft < w.min || daysLeft > w.max) continue

      // Deduplication — skip if this window was already sent for this deal
      const dedupTag = `${w.tag}:${deal.id}`
      if (sentTags.has(dedupTag)) {
        skipped.push(deal.title)
        continue
      }

      const agentEmail = deal.assigned_to ?? null
      const agentName  = agentEmail ? (agentMap[agentEmail] ?? agentEmail.split('@')[0]) : 'Team'

      // Load lead for customer name
      const lead = deal.lead_id ? await getLeadById(deal.lead_id) : null
      const customerName = lead?.name ?? deal.title

      // AI-personalized outreach message
      const outreachBody = await generateOutreachEmail(
        customerName, agentName, deal.title,
        deal.provider, deal.plan_name, daysLeft, deal.value,
      )

      // Create activity (embed dedup tag in description)
      await insertActivity({
        lead_id:     deal.lead_id,
        type:        w.activityType,
        title:       `${w.title} — ${deal.title}`,
        description: `Contract expires in ${daysLeft} days (${deal.contract_end_date}). ${w.label} automated reminder. [${dedupTag}]`,
        due_date:    now.toISOString(),
        completed:   false,
        assigned_to: agentEmail,
        created_by:  'cron:renewal-engine',
      })
      totalActivities++
      sentTags.add(dedupTag)

      // Send email to assigned agent
      if (agentEmail && process.env.RESEND_API_KEY) {
        try {
          await resend.emails.send({
            from: FROM,
            to:   agentEmail,
            subject: `${w.emoji} ${w.label} renewal — ${deal.title} (${daysLeft} days)`,
            text: `Hi ${agentName},

${w.emoji} Renewal Alert: ${deal.title}

Customer: ${customerName}
Contract expires: ${deal.contract_end_date} (${daysLeft} days away)
Provider: ${deal.provider ?? '—'} | Plan: ${deal.plan_name ?? '—'} | $${deal.value}/mo

Suggested outreach message for ${customerName}:
────────────────────────────────
${outreachBody}
────────────────────────────────

Action: ${w.title}
Log in to the CRM to take action.

—
Saigon Power Automated Alerts`,
          })
          totalEmails++
        } catch {
          // Don't fail the whole cron if one email bounces
        }
      }

      sent.push(`${deal.title} (${daysLeft}d)`)
    }

    summary.push({ window: w.label, sent, skipped })
  }

  return NextResponse.json({
    ok:                 true,
    ran_at:             now.toISOString(),
    deals_checked:      relevant.length,
    activities_created: totalActivities,
    emails_sent:        totalEmails,
    ai_enabled:         hasOpenAI(),
    resend_configured:  !!process.env.RESEND_API_KEY,
    summary,
  })
}
