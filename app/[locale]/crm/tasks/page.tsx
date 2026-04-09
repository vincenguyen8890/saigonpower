import { setRequestLocale } from 'next-intl/server'
import { getActivities } from '@/lib/supabase/queries'
import { getLeads } from '@/lib/supabase/queries'
import { getSession } from '@/lib/auth/session'
import CompleteActivityButton from '@/components/crm/CompleteActivityButton'
import AddTaskButton from '@/components/crm/AddTaskButton'
import { Phone, Mail, Users, FileText, Zap, AlignLeft, AlertCircle, Clock, Calendar, CalendarDays, CheckCircle2 } from 'lucide-react'

interface Props {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ type?: string }>
}

const TYPE_ICONS: Record<string, React.FC<{ size?: number; className?: string }>> = {
  call:    Phone,
  email:   Mail,
  meeting: Users,
  task:    FileText,
  renewal: Zap,
  note:    AlignLeft,
}

const TYPE_COLORS: Record<string, string> = {
  call:    'bg-blue-50 text-blue-700',
  email:   'bg-purple-50 text-purple-700',
  meeting: 'bg-amber-50 text-amber-700',
  task:    'bg-gray-100 text-gray-700',
  renewal: 'bg-green-50 text-green-700',
  note:    'bg-slate-50 text-slate-600',
}

function formatDue(due: string | null) {
  if (!due) return '—'
  const d = new Date(due)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default async function TasksPage({ params, searchParams }: Props) {
  const { locale } = await params
  const { type } = await searchParams
  setRequestLocale(locale)

  const session = await getSession()
  const agentFilter = session?.role === 'agent' ? session.email : undefined

  const [allActivities, leads] = await Promise.all([
    getActivities({ completed: false, assigned_to: agentFilter }),
    getLeads({ assigned_to: agentFilter }),
  ])

  const leadMap = Object.fromEntries(leads.map(l => [l.id, l.name]))

  let activities = allActivities
  if (type && type !== 'all') activities = activities.filter(a => a.type === type)

  const now = new Date()
  const todayStr = now.toISOString().split('T')[0]
  const in7 = new Date(now.getTime() + 7 * 86400000).toISOString().split('T')[0]

  const overdue    = activities.filter(a => a.due_date && a.due_date.split('T')[0] < todayStr)
  const today      = activities.filter(a => a.due_date && a.due_date.split('T')[0] === todayStr)
  const thisWeek   = activities.filter(a => a.due_date && a.due_date.split('T')[0] > todayStr && a.due_date.split('T')[0] <= in7)
  const later      = activities.filter(a => !a.due_date || a.due_date.split('T')[0] > in7)

  const typeOptions = ['all', 'call', 'email', 'meeting', 'task', 'renewal', 'note']

  function ActivityRow({ activity }: { activity: typeof activities[0] }) {
    const Icon = TYPE_ICONS[activity.type] ?? FileText
    const colorClass = TYPE_COLORS[activity.type] ?? 'bg-gray-100 text-gray-700'
    return (
      <div className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50/60 transition-colors border-b border-gray-50 last:border-0">
        <span className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center ${colorClass}`}>
          <Icon size={13} />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{activity.title}</p>
          <p className="text-xs text-gray-400 mt-0.5 truncate">
            {activity.lead_id ? leadMap[activity.lead_id] ?? activity.lead_id : 'No lead'}{activity.description ? ` · ${activity.description}` : ''}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {activity.assigned_to && (
            <span className="hidden md:block text-xs text-gray-400 truncate max-w-[120px]">{activity.assigned_to.split('@')[0]}</span>
          )}
          <span className="text-xs text-gray-400">{formatDue(activity.due_date)}</span>
          <CompleteActivityButton activityId={activity.id} />
        </div>
      </div>
    )
  }

  function Group({ label, icon: GroupIcon, items, color }: { label: string; icon: React.FC<{ size?: number; className?: string }>; items: typeof activities; color: string }) {
    if (items.length === 0) return null
    return (
      <div className="mb-5">
        <div className={`flex items-center gap-2 px-1 mb-2`}>
          <GroupIcon size={14} className={color} />
          <h3 className={`text-sm font-semibold ${color}`}>{label}</h3>
          <span className={`text-xs px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium`}>{items.length}</span>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {items.map(a => <ActivityRow key={a.id} activity={a} />)}
        </div>
      </div>
    )
  }

  const totalOpen = allActivities.length

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Work Queue</h1>
          <p className="text-gray-500 text-sm mt-1">
            {totalOpen} open tasks · {overdue.length} overdue
          </p>
        </div>
        <AddTaskButton />
      </div>

      {/* Type filter */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6">
        <form className="flex flex-wrap gap-2">
          {typeOptions.map(t => (
            <button
              key={t}
              name="type"
              value={t}
              type="submit"
              className={`text-xs px-3 py-1.5 rounded-lg font-medium capitalize transition-colors ${
                (type ?? 'all') === t
                  ? 'bg-brand-greenDark text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {t === 'all' ? 'All Types' : t}
            </button>
          ))}
        </form>
      </div>

      {totalOpen === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm text-center py-16">
          <CheckCircle2 size={40} className="text-green-400 mx-auto mb-3" />
          <p className="text-lg font-semibold text-gray-700">All caught up!</p>
          <p className="text-sm text-gray-400 mt-1">No open tasks at the moment.</p>
        </div>
      ) : (
        <>
          <Group label="Overdue"   icon={AlertCircle}   items={overdue}  color="text-red-500"    />
          <Group label="Today"     icon={Clock}         items={today}    color="text-amber-500"  />
          <Group label="This Week" icon={Calendar}      items={thisWeek} color="text-blue-500"   />
          <Group label="Later"     icon={CalendarDays}  items={later}    color="text-gray-400"   />
        </>
      )}
    </div>
  )
}
