'use client'

import { useState } from 'react'
import {
  Phone, Mail, Video, FileText, CheckSquare, RefreshCw,
  CheckCircle2, Clock, ArrowRight,
} from 'lucide-react'
import Link from 'next/link'
import type { Activity } from '@/lib/supabase/queries'

type Tab = 'today' | 'next7' | 'overdue'

interface TypeConfig {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: React.ComponentType<any>
  color: string
  bg: string
}

const typeConfig: Record<Activity['type'], TypeConfig> = {
  call:    { icon: Phone,       color: 'text-[#2979FF]', bg: 'bg-[#EBF2FF]' },
  email:   { icon: Mail,        color: 'text-purple-600', bg: 'bg-purple-50' },
  meeting: { icon: Video,       color: 'text-[#00A846]',  bg: 'bg-[#E8FFF1]' },
  note:    { icon: FileText,    color: 'text-slate-500',  bg: 'bg-slate-50'   },
  task:    { icon: CheckSquare, color: 'text-amber-600',  bg: 'bg-amber-50'   },
  renewal: { icon: RefreshCw,   color: 'text-[#FF6D00]',  bg: 'bg-[#FFF3E8]'  },
}

function isToday(d: string | null) {
  return !!d && new Date(d).toDateString() === new Date().toDateString()
}
function isOverdue(d: string | null) {
  return !!d && new Date(d) < new Date() && !isToday(d)
}
function isNext7(d: string | null) {
  if (!d) return false
  const date = new Date(d)
  const now = new Date()
  return date >= now && date <= new Date(now.getTime() + 7 * 86400000)
}

function formatRelative(d: string) {
  const date = new Date(d)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  if (diff < 0) {
    return date.toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    })
  }
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`
  if (diff < 604_800_000) return `${Math.floor(diff / 86_400_000)}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

interface ActivityFeedProps {
  activities: Activity[]
  locale: string
}

export default function ActivityFeed({ activities, locale }: ActivityFeedProps) {
  const [tab, setTab] = useState<Tab>('today')

  const counts: Record<Tab, number> = {
    today:   activities.filter(a => isToday(a.due_date)).length,
    next7:   activities.filter(a => isNext7(a.due_date)).length,
    overdue: activities.filter(a => isOverdue(a.due_date)).length,
  }

  const filtered = activities.filter(a => {
    if (tab === 'today')   return isToday(a.due_date)
    if (tab === 'overdue') return isOverdue(a.due_date)
    return isNext7(a.due_date)
  })

  const tabs: { key: Tab; label: string }[] = [
    { key: 'today',   label: 'Today'    },
    { key: 'next7',   label: 'Next 7d'  },
    { key: 'overdue', label: 'Overdue'  },
  ]

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-[0_1px_3px_rgba(15,23,42,0.06)] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-[#0F172A] flex items-center gap-2">
            <CheckCircle2 size={14} className="text-[#00C853]" />
            Activities
          </h2>
          <Link
            href={`/${locale}/crm/tasks`}
            className="text-[11px] text-[#00C853] hover:text-[#00A846] font-semibold flex items-center gap-1"
          >
            All tasks <ArrowRight size={11} />
          </Link>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-slate-50 rounded-lg p-0.5 gap-0.5">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 text-[11px] font-semibold rounded-md transition-all ${
                tab === t.key
                  ? 'bg-white text-[#0F172A] shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {t.label}
              {counts[t.key] > 0 && (
                <span className={`text-[10px] min-w-[16px] h-4 rounded-full font-bold flex items-center justify-center px-1 ${
                  t.key === 'overdue'
                    ? 'bg-red-100 text-red-600'
                    : tab === t.key
                    ? 'bg-[#E8FFF1] text-[#00A846]'
                    : 'bg-slate-200 text-slate-600'
                }`}>
                  {counts[t.key]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline list */}
      <div className="flex-1 overflow-y-auto" style={{ maxHeight: 320 }}>
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
            <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center mb-2">
              <CheckCircle2 size={18} className="text-slate-300" />
            </div>
            <p className="text-sm font-semibold text-slate-500">
              {tab === 'today'   ? 'Nothing scheduled today'    :
               tab === 'overdue' ? 'No overdue activities'      :
               'Nothing in the next 7 days'}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {tab === 'overdue' ? 'Great work staying on track!' : 'Check back or add a new task'}
            </p>
          </div>
        ) : (
          <div className="relative px-5 py-2">
            {/* Timeline rail */}
            <div className="absolute left-[28px] top-4 bottom-4 w-px bg-slate-100 pointer-events-none" />

            {filtered.map(a => {
              const tc = typeConfig[a.type] ?? typeConfig.task
              const TIcon = tc.icon
              const overdue = isOverdue(a.due_date)

              return (
                <div key={a.id} className="flex gap-3 py-2.5 relative">
                  <div className={`w-7 h-7 ${tc.bg} rounded-full flex items-center justify-center flex-shrink-0 z-10 ring-2 ring-white`}>
                    <TIcon size={13} className={tc.color} />
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <p className="text-[13px] font-semibold text-[#0F172A] leading-snug">{a.title}</p>
                    {a.description && (
                      <p className="text-xs text-slate-400 mt-0.5 truncate">{a.description}</p>
                    )}
                    {a.due_date && (
                      <p className={`text-[11px] mt-1 flex items-center gap-1 font-medium ${
                        overdue ? 'text-red-500' : 'text-slate-400'
                      }`}>
                        <Clock size={9} />
                        {overdue ? 'Overdue · ' : ''}{formatRelative(a.due_date)}
                      </p>
                    )}
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold flex-shrink-0 capitalize self-start mt-0.5 ${tc.bg} ${tc.color}`}>
                    {a.type}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="px-5 py-2.5 border-t border-slate-50">
        <p className="text-[11px] text-slate-400 text-center">
          {activities.length} open {activities.length === 1 ? 'activity' : 'activities'} total
        </p>
      </div>
    </div>
  )
}
