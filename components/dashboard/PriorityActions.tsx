import Link from 'next/link'
import { ArrowRight, Clock, Phone, RefreshCw, AlertTriangle, Users, CheckCircle2, Sparkles } from 'lucide-react'

export interface PriorityAction {
  id: string
  type: 'follow_up' | 'expiring' | 'stuck_deal' | 'new_lead'
  title: string
  description: string
  urgency: 'high' | 'medium' | 'low'
  href: string
  timeLabel?: string
}

const urgencyConfig = {
  high:   { dot: 'bg-red-500',      iconBg: 'bg-red-50',      textColor: 'text-red-500'    },
  medium: { dot: 'bg-amber-500',    iconBg: 'bg-amber-50',    textColor: 'text-amber-600'  },
  low:    { dot: 'bg-[#00C853]',    iconBg: 'bg-[#E8FFF1]',   textColor: 'text-[#00A846]'  },
}

const typeIcons = {
  follow_up:  Phone,
  expiring:   RefreshCw,
  stuck_deal: AlertTriangle,
  new_lead:   Users,
}

export default function PriorityActions({
  actions,
  locale,
}: {
  actions: PriorityAction[]
  locale: string
}) {
  if (actions.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-100 shadow-[0_1px_3px_rgba(15,23,42,0.06)] flex flex-col items-center justify-center text-center p-8 min-h-[200px]">
        <div className="w-12 h-12 bg-[#E8FFF1] rounded-full flex items-center justify-center mb-3">
          <CheckCircle2 size={22} className="text-[#00C853]" />
        </div>
        <p className="text-sm font-semibold text-[#0F172A]">All caught up!</p>
        <p className="text-xs text-slate-400 mt-1">No priority actions right now. Nice work.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-[0_1px_3px_rgba(15,23,42,0.06)] overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2">
        <Sparkles size={14} className="text-[#FF6D00]" />
        <h2 className="text-sm font-semibold text-[#0F172A]">Priority Actions</h2>
        <span className="text-[11px] bg-[#FFF3E8] text-[#FF6D00] font-semibold px-2 py-0.5 rounded-full border border-[#FFBC85] ml-1">
          {actions.length} today
        </span>
      </div>

      {/* Action list */}
      <div className="divide-y divide-slate-50">
        {actions.slice(0, 6).map(action => {
          const c = urgencyConfig[action.urgency]
          const Icon = typeIcons[action.type]
          return (
            <Link
              key={action.id}
              href={action.href}
              className="flex items-start gap-3 px-5 py-3 hover:bg-slate-50 transition-colors group"
            >
              <div className={`w-7 h-7 ${c.iconBg} rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5`}>
                <Icon size={13} className={c.textColor} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-[#0F172A] leading-snug">{action.title}</p>
                <p className="text-xs text-slate-500 mt-0.5 truncate">{action.description}</p>
                {action.timeLabel && (
                  <p className={`text-[11px] mt-0.5 flex items-center gap-1 font-semibold ${c.textColor}`}>
                    <Clock size={9} />
                    {action.timeLabel}
                  </p>
                )}
              </div>
              <ArrowRight
                size={13}
                className="text-slate-300 group-hover:text-slate-500 transition-colors mt-1 flex-shrink-0"
              />
            </Link>
          )
        })}
      </div>

      {actions.length > 6 && (
        <div className="px-5 py-2.5 border-t border-slate-50">
          <Link
            href={`/${locale}/crm/tasks`}
            className="text-[11px] text-[#00C853] hover:text-[#00A846] font-semibold"
          >
            + {actions.length - 6} more actions →
          </Link>
        </div>
      )}
    </div>
  )
}
