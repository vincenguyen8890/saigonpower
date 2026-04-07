import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { getActivities, getCRMAgents } from '@/lib/supabase/queries'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM   = process.env.RESEND_FROM ?? 'Saigon Power <noreply@saigonpower.com>'

export async function GET(req: NextRequest) {
  const auth   = req.headers.get('authorization')
  const secret = process.env.CRON_SECRET
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now      = new Date()
  const todayStr = now.toISOString().split('T')[0]

  const [activities, agents] = await Promise.all([
    getActivities({ completed: false, limit: 500 }),
    getCRMAgents(),
  ])

  const agentMap = Object.fromEntries(agents.map(a => [a.email, a.name]))

  // Activities due today or overdue (not completed, assigned to someone)
  const due = activities.filter(a =>
    a.assigned_to &&
    a.due_date &&
    a.due_date.split('T')[0] <= todayStr
  )

  // Group by agent
  const byAgent = new Map<string, typeof due>()
  for (const a of due) {
    const email = a.assigned_to!
    if (!byAgent.has(email)) byAgent.set(email, [])
    byAgent.get(email)!.push(a)
  }

  let emailsSent = 0

  for (const [agentEmail, tasks] of byAgent.entries()) {
    if (!process.env.RESEND_API_KEY) break

    const agentName = agentMap[agentEmail] ?? agentEmail.split('@')[0]
    const overdue   = tasks.filter(t => t.due_date!.split('T')[0] < todayStr)
    const dueToday  = tasks.filter(t => t.due_date!.split('T')[0] === todayStr)

    const lines = [
      `Hi ${agentName},`,
      '',
      `You have ${tasks.length} task${tasks.length !== 1 ? 's' : ''} requiring attention today.`,
      '',
    ]

    if (dueToday.length > 0) {
      lines.push(`DUE TODAY (${dueToday.length}):`)
      dueToday.slice(0, 10).forEach(t => lines.push(`  • [${t.type.toUpperCase()}] ${t.title}`))
      lines.push('')
    }

    if (overdue.length > 0) {
      lines.push(`OVERDUE (${overdue.length}):`)
      overdue.slice(0, 10).forEach(t => {
        const days = Math.floor((now.getTime() - new Date(t.due_date!).getTime()) / 86400000)
        lines.push(`  • [${t.type.toUpperCase()}] ${t.title} — ${days}d overdue`)
      })
      lines.push('')
    }

    lines.push('Log in to the CRM to take action.')
    lines.push('')
    lines.push('— Saigon Power CRM')

    try {
      await resend.emails.send({
        from:    FROM,
        to:      agentEmail,
        subject: `📋 ${tasks.length} task${tasks.length !== 1 ? 's' : ''} due today${overdue.length > 0 ? ` (${overdue.length} overdue)` : ''}`,
        text:    lines.join('\n'),
      })
      emailsSent++
    } catch {
      // Don't fail entire cron if one email bounces
    }
  }

  return NextResponse.json({
    ok:              true,
    ran_at:          now.toISOString(),
    tasks_due:       due.length,
    agents_notified: byAgent.size,
    emails_sent:     emailsSent,
    resend_configured: !!process.env.RESEND_API_KEY,
  })
}
