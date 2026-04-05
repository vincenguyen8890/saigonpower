'use client'

import { useState, useRef, useEffect } from 'react'
import { Bell, Users, RefreshCw, FileText, ListChecks, X } from 'lucide-react'
import Link from 'next/link'

export interface CRMNotification {
  id: string
  type: 'lead' | 'contract' | 'quote' | 'task'
  title: string
  subtitle: string
  href: string
  urgency: 'high' | 'medium' | 'low'
}

interface Props {
  notifications: CRMNotification[]
  locale: string
}

const TYPE_CONFIG = {
  lead:     { icon: Users,       color: 'text-blue-500',   bg: 'bg-blue-50'   },
  contract: { icon: RefreshCw,   color: 'text-red-500',    bg: 'bg-red-50'    },
  quote:    { icon: FileText,    color: 'text-amber-500',  bg: 'bg-amber-50'  },
  task:     { icon: ListChecks,  color: 'text-purple-500', bg: 'bg-purple-50' },
}

const URGENCY_DOT = {
  high:   'bg-red-500',
  medium: 'bg-amber-400',
  low:    'bg-blue-400',
}

export default function NotificationBell({ notifications, locale }: Props) {
  const [open, setOpen] = useState(false)
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  const ref = useRef<HTMLDivElement>(null)

  const visible = notifications.filter(n => !dismissed.has(n.id))
  const highCount = visible.filter(n => n.urgency === 'high').length
  const totalCount = visible.length

  // Close on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  function dismiss(id: string) {
    setDismissed(prev => new Set([...prev, id]))
  }

  function dismissAll() {
    setDismissed(new Set(notifications.map(n => n.id)))
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="relative p-2 rounded-xl text-green-200 hover:bg-green-700 hover:text-white transition-colors"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {totalCount > 0 && (
          <span className={`absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full text-[10px] font-bold flex items-center justify-center px-1 text-white ${
            highCount > 0 ? 'bg-red-500' : 'bg-amber-400'
          }`}>
            {totalCount > 9 ? '9+' : totalCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <p className="font-semibold text-gray-900 text-sm">
              Notifications
              {totalCount > 0 && (
                <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">{totalCount}</span>
              )}
            </p>
            {totalCount > 0 && (
              <button onClick={dismissAll} className="text-xs text-gray-400 hover:text-gray-600">
                Clear all
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {visible.length === 0 ? (
              <div className="py-10 text-center">
                <Bell size={28} className="mx-auto text-gray-200 mb-2" />
                <p className="text-sm text-gray-400">All caught up!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {visible.map(n => {
                  const cfg = TYPE_CONFIG[n.type]
                  const Icon = cfg.icon
                  return (
                    <div key={n.id} className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors group">
                      <div className={`w-8 h-8 rounded-xl ${cfg.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                        <Icon size={14} className={cfg.color} />
                      </div>
                      <Link
                        href={n.href}
                        onClick={() => { dismiss(n.id); setOpen(false) }}
                        className="flex-1 min-w-0"
                      >
                        <div className="flex items-start gap-1.5">
                          <p className="text-sm font-medium text-gray-900 leading-tight flex-1">{n.title}</p>
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${URGENCY_DOT[n.urgency]}`} />
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5 truncate">{n.subtitle}</p>
                      </Link>
                      <button
                        onClick={() => dismiss(n.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-300 hover:text-gray-500 flex-shrink-0"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {visible.length > 0 && (
            <div className="border-t border-gray-100 px-4 py-2.5 grid grid-cols-2 gap-2 bg-gray-50/50">
              <Link href={`/${locale}/crm/leads?status=new`} onClick={() => setOpen(false)}
                className="text-xs text-center text-brand-green hover:text-brand-greenDark font-medium">
                View new leads →
              </Link>
              <Link href={`/${locale}/crm/renewals`} onClick={() => setOpen(false)}
                className="text-xs text-center text-brand-green hover:text-brand-greenDark font-medium">
                View renewals →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
