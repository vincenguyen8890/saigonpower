'use client'

import { useState, useEffect } from 'react'
import { Loader2, TrendingUp, AlertTriangle, Info, RefreshCw } from 'lucide-react'
import type { DailySummary, Insight } from '@/app/api/ai/daily-summary/route'

const insightConfig = {
  opportunity: {
    icon: <TrendingUp size={14} className="text-[#00C853]" />,
    bg: 'bg-[#E8FFF1] border-[#A3F0C4]',
    title: 'text-[#00A846]',
  },
  risk: {
    icon: <AlertTriangle size={14} className="text-red-500" />,
    bg: 'bg-red-50 border-red-200',
    title: 'text-red-700',
  },
  info: {
    icon: <Info size={14} className="text-[#2979FF]" />,
    bg: 'bg-[#EBF2FF] border-[#93B4FF]',
    title: 'text-[#2979FF]',
  },
}

export default function AIInsights() {
  const [insights, setInsights] = useState<Insight[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    try {
      const res = await fetch('/api/ai/daily-summary')
      if (!res.ok) return
      const data: DailySummary = await res.json()
      setInsights(data.insights ?? [])
    } catch {
      // silent fail — insights are non-critical
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
        <p className="text-sm font-semibold text-[#0F172A]">AI Insights</p>
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
            <span className="text-sm">Generating insights…</span>
          </div>
        ) : insights.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-4">No insights available.</p>
        ) : (
          <div className="space-y-2.5">
            {insights.map((ins, i) => {
              const cfg = insightConfig[ins.type]
              return (
                <div key={i} className={`flex items-start gap-3 p-3 rounded-lg border ${cfg.bg}`}>
                  <div className="mt-0.5 flex-shrink-0">{cfg.icon}</div>
                  <div>
                    <p className={`text-[12px] font-bold ${cfg.title}`}>{ins.title}</p>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">{ins.description}</p>
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
