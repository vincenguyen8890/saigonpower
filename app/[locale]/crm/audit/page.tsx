import { setRequestLocale } from 'next-intl/server'
import { getSession } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import { getActivities } from '@/lib/supabase/queries'
import { ClipboardList, Shield, TrendingUp, Settings, User } from 'lucide-react'

interface Props {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ type?: string }>
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TYPE_ICONS: Record<string, any> = {
  'system:audit':           TrendingUp,
  'system:deal-automation': TrendingUp,
  'system:lead-automation': User,
  'system':                 Settings,
}

const TYPE_LABELS: Record<string, string> = {
  'system:audit':           'Field Change',
  'system:deal-automation': 'Deal Automation',
  'system:lead-automation': 'Lead Automation',
  'system':                 'System',
}

export default async function AuditLogPage({ params, searchParams }: Props) {
  const { locale } = await params
  const { type } = await searchParams
  setRequestLocale(locale)

  const session = await getSession()
  if (!session || !['admin', 'office_manager'].includes(session.role ?? '')) {
    redirect(`/${locale}/crm`)
  }

  const allActivities = await getActivities({ limit: 500 })

  // Filter to system-generated audit entries only
  const auditEntries = allActivities.filter(a =>
    a.created_by?.startsWith('system')
  )

  const filtered = type
    ? auditEntries.filter(a => a.created_by === type)
    : auditEntries

  const typeCounts = auditEntries.reduce<Record<string, number>>((acc, a) => {
    const k = a.created_by ?? 'system'
    acc[k] = (acc[k] ?? 0) + 1
    return acc
  }, {})

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
          <ClipboardList size={18} className="text-slate-600" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-[#0F172A]">Audit Log</h1>
          <p className="text-sm text-slate-400 mt-0.5">{auditEntries.length} system events recorded</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold px-3 py-1.5 rounded-lg">
          <Shield size={12} />
          Admin / Manager only
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2">
        <a
          href={`/${locale}/crm/audit`}
          className={`text-xs px-3 py-1.5 rounded-full font-medium border transition-colors ${
            !type ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
          }`}
        >
          All ({auditEntries.length})
        </a>
        {Object.entries(typeCounts).map(([t, count]) => (
          <a
            key={t}
            href={`/${locale}/crm/audit?type=${t}`}
            className={`text-xs px-3 py-1.5 rounded-full font-medium border transition-colors ${
              type === t ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
            }`}
          >
            {TYPE_LABELS[t] ?? t} ({count})
          </a>
        ))}
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <ClipboardList size={32} className="mx-auto text-slate-200 mb-3" />
            <p className="text-sm font-medium text-slate-500">No audit events yet</p>
            <p className="text-xs text-slate-400 mt-1">Events are recorded automatically when deals and leads change</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {filtered.map(entry => {
              const Icon = TYPE_ICONS[entry.created_by ?? ''] ?? ClipboardList
              const isDeal = entry.description?.startsWith('deal:')
              const dealId = isDeal ? entry.description?.split('|')[0].replace('deal:', '').trim() : null
              const changeDesc = isDeal
                ? entry.description?.split('|').slice(1).join('|').trim()
                : entry.description

              return (
                <div key={entry.id} className="flex items-start gap-4 px-5 py-4 hover:bg-slate-50/50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon size={13} className="text-slate-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-[13px] font-semibold text-slate-800">{entry.title}</p>
                      <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-medium">
                        {TYPE_LABELS[entry.created_by ?? ''] ?? entry.created_by}
                      </span>
                    </div>
                    {changeDesc && (
                      <p className="text-[11px] text-slate-400 mt-0.5 font-mono truncate max-w-xl">{changeDesc}</p>
                    )}
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-[11px] text-slate-400">
                        {new Date(entry.created_at ?? '').toLocaleString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric',
                          hour: 'numeric', minute: '2-digit',
                        })}
                      </p>
                      {dealId && (
                        <a
                          href={`/${locale}/crm/deals/${dealId}`}
                          className="text-[11px] text-green-600 hover:text-green-700 font-medium"
                        >
                          View deal →
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
