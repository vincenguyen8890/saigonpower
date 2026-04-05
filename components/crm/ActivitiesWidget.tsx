'use client'

import { useState } from 'react'
import { Phone, Mail, Video, FileText, CheckSquare, RefreshCw, CheckCircle2, Clock } from 'lucide-react'
import type { Activity } from '@/lib/supabase/queries'

const typeIcon: Record<Activity['type'], React.ReactNode> = {
  call:    <Phone size={13}      className="text-blue-500" />,
  email:   <Mail size={13}       className="text-purple-500" />,
  meeting: <Video size={13}      className="text-green-500" />,
  note:    <FileText size={13}   className="text-gray-400" />,
  task:    <CheckSquare size={13} className="text-amber-500" />,
  renewal: <RefreshCw size={13}  className="text-orange-500" />,
}

function isToday(dateStr: string | null) {
  if (!dateStr) return false
  return new Date(dateStr).toDateString() === new Date().toDateString()
}
function isOverdue(dateStr: string | null) {
  if (!dateStr) return false
  return new Date(dateStr) < new Date() && !isToday(dateStr)
}
function isNext7(dateStr: string | null) {
  if (!dateStr) return false
  const d = new Date(dateStr)
  const now = new Date()
  const in7 = new Date(now.getTime() + 7 * 86400000)
  return d >= now && d <= in7
}

type Tab = 'today' | 'next7' | 'overdue'

export default function ActivitiesWidget({ activities, locale }: { activities: Activity[]; locale: string }) {
  const [tab, setTab] = useState<Tab>('today')

  const filtered = activities.filter(a => {
    if (tab === 'today')   return isToday(a.due_date)
    if (tab === 'overdue') return isOverdue(a.due_date)
    if (tab === 'next7')   return isNext7(a.due_date)
    return true
  })

  const counts = {
    today:   activities.filter(a => isToday(a.due_date)).length,
    next7:   activities.filter(a => isNext7(a.due_date)).length,
    overdue: activities.filter(a => isOverdue(a.due_date)).length,
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col">
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
          <CheckCircle2 size={16} className="text-brand-green" />
          Activities
        </h2>
        <div className="flex gap-1">
          {(['today', 'next7', 'overdue'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                tab === t
                  ? 'bg-brand-greenDark text-white'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {t === 'today' ? 'Today' : t === 'next7' ? 'Next 7 Days' : 'Overdue'}
              {counts[t] > 0 && (
                <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                  tab === t ? 'bg-white/20' : t === 'overdue' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  {counts[t]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 divide-y divide-gray-50 overflow-y-auto" style={{ maxHeight: 280 }}>
        {filtered.length === 0 ? (
          <div className="px-6 py-8 text-center text-sm text-gray-400">
            {tab === 'today' ? 'No activities scheduled for today' :
             tab === 'overdue' ? 'No overdue activities' :
             'No activities in the next 7 days'}
          </div>
        ) : (
          filtered.map(a => (
            <div key={a.id} className="px-6 py-3 flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                {typeIcon[a.type]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{a.title}</p>
                {a.description && (
                  <p className="text-xs text-gray-500 truncate">{a.description}</p>
                )}
                {a.due_date && (
                  <p className={`text-xs mt-0.5 flex items-center gap-1 ${isOverdue(a.due_date) ? 'text-red-500' : 'text-gray-400'}`}>
                    <Clock size={10} />
                    {new Date(a.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                )}
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 capitalize ${
                a.type === 'call' ? 'bg-blue-50 text-blue-600' :
                a.type === 'email' ? 'bg-purple-50 text-purple-600' :
                a.type === 'meeting' ? 'bg-green-50 text-green-600' :
                a.type === 'renewal' ? 'bg-orange-50 text-orange-600' :
                'bg-gray-50 text-gray-500'
              }`}>
                {a.type}
              </span>
            </div>
          ))
        )}
      </div>

      <div className="px-6 py-3 border-t border-gray-50">
        <p className="text-xs text-gray-400 text-center">
          {activities.length} open activit{activities.length === 1 ? 'y' : 'ies'} total
        </p>
      </div>
    </div>
  )
}
