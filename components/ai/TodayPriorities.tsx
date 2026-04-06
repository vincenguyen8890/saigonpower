'use client'

import { useState, useEffect } from 'react'
import { Loader2, RefreshCw, AlertTriangle, TrendingUp, FileText, ListChecks, Zap } from 'lucide-react'
import type { DailySummary, Priority } from '@/app/api/ai/daily-summary/route'

const urgencyConfig = {
  high:   { dot: 'bg-red-400',    label: 'bg-red-50 text-red-600 border border-red-200'    },
  medium: { dot: 'bg-amber-400',  label: 'bg-amber-50 text-amber-600 border border-amber-200' },
  low:    { dot: 'bg-slate-300',  label: 'bg-slate-50 text-slate-500 border border-slate-200' },
}

const typeIcon: Record<Priority['type'], React.ReactNode> = {
  lead:     <TrendingUp size={13} className="text-[#2979FF]" />,
  deal:     <Zap size={13} className="text-[#00C853]" />,
  contract: <FileText size={13} className="text-amber-600" />,
  task:     <ListChecks size={13} className="text-purple-500" />,
}

export default function TodayPriorities() {
  const [data, setData] = useState<DailySummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/ai/daily-summary')
      if (!res.ok) throw new Error('Failed to load')
      setData(await res.json())
    } catch {
      setError('Could not load priorities.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
        <div>
          <p className="text-sm font-semibold text-[#0F172A]">Today's Priorities</p>
          {data?.date && <p className="text-xs text-slate-400 mt-0.5">{data.date}</p>}
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="p-1.5 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="p-5">
        {loading ? (
          <div className="flex items-center gap-2 text-slate-400 py-4">
            <Loader2 size={15} className="animate-spin" />
            <span className="text-sm">Analyzing CRM data…</span>
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 text-red-500 text-sm py-4">
            <AlertTriangle size={14} />
            {error}
          </div>
        ) : data ? (
          <>
            {data.summary && (
              <p className="text-xs text-slate-500 mb-4 leading-relaxed bg-slate-50 rounded-lg px-3 py-2.5">
                {data.summary}
              </p>
            )}
            {data.priorities.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">All caught up! No urgent items.</p>
            ) : (
              <div className="space-y-2.5">
                {data.priorities.map((p, i) => {
                  const cfg = urgencyConfig[p.urgency]
                  return (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors">
                      <div className="mt-0.5 flex-shrink-0">{typeIcon[p.type]}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-[#0F172A] truncate">{p.title}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{p.action}</p>
                      </div>
                      <span className={`flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${cfg.label}`}>
                        {p.urgency}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  )
}
