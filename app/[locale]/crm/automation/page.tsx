import { setRequestLocale } from 'next-intl/server'
import { Bot, Play, RefreshCw, Mail, UserCheck, TrendingUp, Clock, CheckCircle2, AlertTriangle } from 'lucide-react'
import AutomationRuleCard from './AutomationRuleCard'
import RunRenewalButton from './RunRenewalButton'

interface Props { params: Promise<{ locale: string }> }

const emailTemplates = [
  {
    id: 'welcome',
    name: 'New Lead Welcome',
    trigger: 'Lead status → New',
    subject: 'Welcome to Saigon Power — We\'re here to help!',
    preview: 'Hi {{name}}, thank you for reaching out to Saigon Power. We\'re Texas\'s trusted Vietnamese-owned electricity broker...',
    tags: ['auto', 'lead'],
    lastSent: '2 hours ago',
  },
  {
    id: 'quote-sent',
    name: 'Quote Follow-up',
    trigger: 'Lead status → Quoted',
    subject: '⚡ Your electricity quote is ready — {{name}}',
    preview: 'Hi {{name}}, I\'ve put together a personalized rate comparison for your {{service_type}} service at {{zip}}...',
    tags: ['auto', 'sales'],
    lastSent: '1 day ago',
  },
  {
    id: 'renewal-60',
    name: 'Renewal Reminder — 60 Days',
    trigger: 'Contract expires in 60 days',
    subject: '📅 Your electricity contract renews in 60 days — lock in a better rate',
    preview: 'Hi {{name}}, your current plan with {{provider}} expires on {{expiry_date}}. Now is the perfect time to compare new rates...',
    tags: ['auto', 'renewal'],
    lastSent: '3 days ago',
  },
  {
    id: 'renewal-30',
    name: 'Renewal Reminder — 30 Days',
    trigger: 'Contract expires in 30 days',
    subject: '🚨 30 days left on your contract — act now to avoid rollover rates',
    preview: 'Hi {{name}}, this is your 30-day reminder. Without renewal, you\'ll be moved to a variable rate (often 30-50% higher)...',
    tags: ['urgent', 'renewal'],
    lastSent: '1 day ago',
  },
  {
    id: 'enrolled',
    name: 'Enrollment Confirmation',
    trigger: 'Lead status → Enrolled',
    subject: '✅ You\'re enrolled! Welcome to {{provider}}',
    preview: 'Congratulations {{name}}! Your enrollment with {{provider}} is confirmed. Your new rate of {{rate}}¢/kWh starts {{start_date}}...',
    tags: ['auto', 'confirmation'],
    lastSent: '5 hours ago',
  },
  {
    id: 'lost-recovery',
    name: 'Lost Lead Check-in',
    trigger: 'Lead status → Lost (30 days later)',
    subject: 'Still looking for a better electricity rate?',
    preview: 'Hi {{name}}, it\'s been a while since we last spoke. Rates have changed and we may have better options for you now...',
    tags: ['recovery'],
    lastSent: 'Never',
  },
]

export default async function AutomationPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bot size={22} className="text-brand-greenDark" />
            Automation Center
          </h1>
          <p className="text-gray-500 text-sm mt-1">Workflow rules, renewal engine, and email automation</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full font-medium">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            Cron active — daily 9 AM UTC
          </span>
        </div>
      </div>

      {/* Renewal Engine — Hero */}
      <div className="bg-gradient-to-r from-brand-greenDark to-green-700 rounded-2xl p-6 text-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <RefreshCw size={18} className="text-green-300" />
              <h2 className="font-bold text-lg">Renewal Notification Engine</h2>
              <span className="text-xs bg-green-500/30 text-green-200 px-2 py-0.5 rounded-full font-medium">Active</span>
            </div>
            <p className="text-green-200 text-sm mb-4 max-w-xl">
              Automatically scans all active contracts and creates Activity records for agents at 60, 30, and 7-day thresholds before expiry.
              Runs daily at 9 AM UTC via Vercel cron. Prevents missed renewals.
            </p>
            <div className="flex items-center gap-6 text-sm">
              <div>
                <p className="text-green-300 text-xs">Cron endpoint</p>
                <p className="font-mono text-green-100 text-xs">/api/cron/renewals</p>
              </div>
              <div>
                <p className="text-green-300 text-xs">Schedule</p>
                <p className="font-mono text-green-100 text-xs">0 9 * * * (daily)</p>
              </div>
              <div>
                <p className="text-green-300 text-xs">Windows</p>
                <p className="text-green-100 text-xs">60d · 30d · 7d</p>
              </div>
            </div>
          </div>
          <RunRenewalButton locale={locale} />
        </div>
      </div>

      {/* Workflow Rules */}
      <div>
        <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Play size={15} className="text-brand-green" />
          Workflow Rules
          <span className="text-xs text-gray-400 font-normal ml-1">— trigger automations on status changes</span>
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <AutomationRuleCard
            icon="call"
            name="New Lead Follow-up"
            description="When a lead is marked Contacted, auto-create a 2-day follow-up call activity."
            trigger="Lead status → Contacted"
            action="Create activity: Follow up after initial contact"
            active={true}
            lastRun="Today, 10:32 AM"
            runsTotal={47}
          />
          <AutomationRuleCard
            icon="email"
            name="Quote Follow-up Task"
            description="When a lead is marked Quoted, create a 3-day follow-up email activity."
            trigger="Lead status → Quoted"
            action="Create activity: Follow up on quote sent"
            active={true}
            lastRun="Yesterday, 2:15 PM"
            runsTotal={31}
          />
          <AutomationRuleCard
            icon="task"
            name="Deal — Proposal Sent"
            description="When a deal moves to Proposal stage, create a 1-day follow-up task."
            trigger="Deal stage → Proposal"
            action="Create activity: Send proposal and rate comparison"
            active={true}
            lastRun="Apr 3, 9:00 AM"
            runsTotal={12}
          />
          <AutomationRuleCard
            icon="enrollment"
            name="Enrollment Confirmation"
            description="When a lead is Enrolled, immediately create a confirmation task for the agent."
            trigger="Lead status → Enrolled"
            action="Create activity: Send enrollment confirmation"
            active={true}
            lastRun="Today, 8:44 AM"
            runsTotal={28}
          />
          <AutomationRuleCard
            icon="won"
            name="Deal Won — Process LOA"
            description="When a deal is marked Won, create an LOA processing task for same day."
            trigger="Deal stage → Won"
            action="Create activity: Process enrollment & send LOA"
            active={true}
            lastRun="Apr 2, 3:30 PM"
            runsTotal={9}
          />
          <AutomationRuleCard
            icon="recovery"
            name="Lost Lead Recovery"
            description="30 days after a lead is marked Lost, create a re-engagement call task."
            trigger="Lead status → Lost + 30 days"
            action="Create activity: Log loss reason and schedule check-in"
            active={false}
            lastRun="Never"
            runsTotal={0}
          />
        </div>
      </div>

      {/* Email Templates */}
      <div>
        <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Mail size={15} className="text-brand-green" />
          Email Templates
          <span className="text-xs text-gray-400 font-normal ml-1">— pre-built sequences for every stage</span>
        </h2>
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {emailTemplates.map(tpl => (
            <div key={tpl.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{tpl.name}</p>
                  <p className="text-xs text-brand-green mt-0.5">{tpl.trigger}</p>
                </div>
                <div className="flex gap-1 flex-wrap justify-end">
                  {tpl.tags.map(tag => (
                    <span key={tag} className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                      tag === 'urgent' ? 'bg-red-50 text-red-600' :
                      tag === 'auto'   ? 'bg-green-50 text-green-700' :
                      tag === 'renewal' ? 'bg-amber-50 text-amber-700' :
                      'bg-gray-50 text-gray-500'
                    }`}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-xs font-medium text-gray-600 mb-1 truncate">{tpl.subject}</p>
              <p className="text-xs text-gray-400 line-clamp-2 mb-4">{tpl.preview}</p>
              <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <Clock size={10} />
                  Sent: {tpl.lastSent}
                </p>
                <button className="text-xs text-brand-green hover:text-brand-greenDark font-medium transition-colors">
                  Preview →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cron log table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Clock size={16} className="text-brand-green" />
          Recent Automation Runs
        </h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              {['Timestamp', 'Rule', 'Triggered', 'Result'].map(h => (
                <th key={h} className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide py-2 pr-6">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {[
              { ts: 'Today 10:32 AM',  rule: 'Lead Follow-up',       count: 1, ok: true  },
              { ts: 'Today 9:00 AM',   rule: 'Renewal Engine (cron)', count: 2, ok: true  },
              { ts: 'Today 8:44 AM',   rule: 'Enrollment Confirm',    count: 1, ok: true  },
              { ts: 'Yesterday 9:00 AM', rule: 'Renewal Engine (cron)', count: 1, ok: true },
              { ts: 'Apr 3 2:15 PM',   rule: 'Quote Follow-up',       count: 1, ok: true  },
              { ts: 'Apr 3 9:00 AM',   rule: 'Renewal Engine (cron)', count: 0, ok: true  },
              { ts: 'Apr 2 3:30 PM',   rule: 'Deal Won — LOA',        count: 1, ok: true  },
            ].map((row, i) => (
              <tr key={i}>
                <td className="py-2.5 pr-6 text-gray-500 text-xs font-mono">{row.ts}</td>
                <td className="py-2.5 pr-6 text-gray-700 font-medium">{row.rule}</td>
                <td className="py-2.5 pr-6 text-gray-600">{row.count} activit{row.count === 1 ? 'y' : 'ies'}</td>
                <td className="py-2.5">
                  <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${
                    row.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
                  }`}>
                    {row.ok ? <CheckCircle2 size={10} /> : <AlertTriangle size={10} />}
                    {row.ok ? 'OK' : 'Error'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
