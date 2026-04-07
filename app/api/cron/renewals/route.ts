import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { getDeals, getCRMAgents, insertActivity } from '@/lib/supabase/queries'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM   = process.env.RESEND_FROM ?? 'Saigon Power <noreply@saigonpower.com>'

const WINDOWS = [
  { label: '90-day',  min: 85,  max: 95,  activityType: 'task'  as const, title: '90-day renewal review',          emoji: '📋', urgency: 'low'    },
  { label: '60-day',  min: 55,  max: 65,  activityType: 'call'  as const, title: 'Schedule renewal call',           emoji: '📞', urgency: 'medium' },
  { label: '30-day',  min: 25,  max: 35,  activityType: 'email' as const, title: 'Send renewal quote',              emoji: '📧', urgency: 'high'   },
  { label: '7-day',   min: 4,   max: 8,   activityType: 'task'  as const, title: 'URGENT — contract expiring soon', emoji: '🚨', urgency: 'high'   },
]

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

  // Only deals with a contract_end_date in the future
  const relevant = deals.filter(d => d.contract_end_date && d.contract_end_date >= todayStr)

  const summary: { window: string; sent: string[] }[] = []
  let totalActivities = 0
  let totalEmails     = 0

  for (const w of WINDOWS) {
    const sent: string[] = []

    for (const deal of relevant) {
      const daysLeft = Math.ceil((new Date(deal.contract_end_date!).getTime() - now.getTime()) / 86400000)
      if (daysLeft < w.min || daysLeft > w.max) continue

      const agentEmail = deal.assigned_to ?? null
      const agentName  = agentEmail ? (agentMap[agentEmail] ?? agentEmail.split('@')[0]) : 'Agent'

      // Create activity
      await insertActivity({
        lead_id:     deal.lead_id,
        type:        w.activityType,
        title:       `${w.title} — ${deal.title}`,
        description: `Contract expires in ${daysLeft} days (${deal.contract_end_date}). ${w.label} automated reminder.`,
        due_date:    now.toISOString(),
        completed:   false,
        assigned_to: agentEmail,
        created_by:  'cron:renewal-engine',
      })
      totalActivities++

      // Send email to assigned agent if Resend is configured
      if (agentEmail && process.env.RESEND_API_KEY) {
        try {
          await resend.emails.send({
            from: FROM,
            to:   agentEmail,
            subject: `${w.emoji} ${w.label} renewal alert — ${deal.title}`,
            text: `Hi ${agentName},

This is an automated reminder from Saigon Power CRM.

${deal.title} has a contract expiring in ${daysLeft} days (${deal.contract_end_date}).

Action required: ${w.title}

Deal details:
• Provider: ${deal.provider ?? '—'}
• Plan: ${deal.plan_name ?? '—'}
• Contract value: $${deal.value}/mo
• Contract end: ${deal.contract_end_date}

Please log in to the CRM to take action.

—
Saigon Power Automated Alerts`,
          })
          totalEmails++
        } catch {
          // Don't fail the whole cron if one email bounces
        }
      }

      sent.push(`${deal.title} (${daysLeft}d, agent: ${agentEmail ?? 'unassigned'})`)
    }

    summary.push({ window: w.label, sent })
  }

  return NextResponse.json({
    ok:                   true,
    ran_at:               now.toISOString(),
    deals_checked:        relevant.length,
    activities_created:   totalActivities,
    emails_sent:          totalEmails,
    resend_configured:    !!process.env.RESEND_API_KEY,
    summary,
  })
}
