import { NextRequest, NextResponse } from 'next/server'
import { insertActivity } from '@/lib/supabase/queries'

// Shared contract data (would come from Supabase in production)
const mockContracts = [
  { id: 'CTR-001', user_name: 'Hung Le',        lead_id: 'lead-004', end_date: '2025-05-15', provider: 'Gexa Energy',    plan_name: 'Gexa Saver 12'       },
  { id: 'CTR-002', user_name: 'Mai Pham',        lead_id: 'lead-003', end_date: '2025-06-01', provider: 'TXU Energy',     plan_name: 'TXU Energy Saver 24'  },
  { id: 'CTR-003', user_name: 'Minh Tran Nails', lead_id: 'lead-002', end_date: '2025-05-01', provider: 'Reliant Energy', plan_name: 'Reliant Business 12'  },
  { id: 'CTR-004', user_name: 'Linh Do',         lead_id: null,       end_date: '2025-05-20', provider: 'Green Mountain', plan_name: 'Green Mtn Simple 12'  },
  { id: 'CTR-005', user_name: 'David Kim',       lead_id: null,       end_date: '2025-06-15', provider: 'Cirro Energy',   plan_name: 'Cirro Value 6'        },
]

export async function GET(req: NextRequest) {
  // Verify cron secret — Vercel sets Authorization header automatically
  const auth = req.headers.get('authorization')
  const secret = process.env.CRON_SECRET
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const summary: { window: string; contracts: string[] }[] = []

  const windows = [
    { label: '60-day',  min: 55,  max: 65,  type: 'call'  as const, title: 'Schedule renewal call',     urgencyPrefix: '📞' },
    { label: '30-day',  min: 25,  max: 35,  type: 'email' as const, title: 'Send renewal quote',         urgencyPrefix: '📧' },
    { label: '7-day',   min: 5,   max: 10,  type: 'task'  as const, title: 'URGENT — contract expiring', urgencyPrefix: '🚨' },
  ]

  for (const w of windows) {
    const matched: string[] = []
    for (const c of mockContracts) {
      const daysLeft = Math.ceil((new Date(c.end_date).getTime() - now.getTime()) / 86400000)
      if (daysLeft >= w.min && daysLeft <= w.max) {
        await insertActivity({
          lead_id:     c.lead_id,
          type:        w.type,
          title:       `${w.title} — ${c.user_name}`,
          description: `Contract ${c.id} (${c.plan_name} / ${c.provider}) expires in ${daysLeft} days on ${c.end_date}. Automated ${w.label} reminder.`,
          due_date:    now.toISOString(),
          completed:   false,
          assigned_to: null,
          created_by:  'cron:renewal-engine',
        })
        matched.push(`${c.user_name} (${daysLeft}d)`)
      }
    }
    summary.push({ window: w.label, contracts: matched })
  }

  return NextResponse.json({
    ok: true,
    ran_at: now.toISOString(),
    summary,
    total_activities_created: summary.reduce((n, s) => n + s.contracts.length, 0),
  })
}
