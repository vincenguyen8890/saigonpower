'use client'

import { useEffect, useState } from 'react'
import { Sparkles, Loader2 } from 'lucide-react'
import type { Lead } from '@/lib/supabase/queries'
import type { LeadScore } from '@/app/api/ai/score-lead/route'

interface Props {
  lead: Lead
  showFull?: boolean
}

const tierConfig = {
  hot:  { bg: 'bg-red-50',    border: 'border-red-200',    text: 'text-red-700',    dot: 'bg-red-400',    label: 'Hot'  },
  warm: { bg: 'bg-amber-50',  border: 'border-amber-200',  text: 'text-amber-700',  dot: 'bg-amber-400',  label: 'Warm' },
  cold: { bg: 'bg-slate-50',  border: 'border-slate-200',  text: 'text-slate-500',  dot: 'bg-slate-300',  label: 'Cold' },
}

export default function LeadScoreBadge({ lead, showFull = false }: Props) {
  const [score, setScore] = useState<LeadScore | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetch('/api/ai/score-lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lead),
    })
      .then(r => r.json())
      .then(data => { if (!cancelled) setScore(data) })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [lead.id])

  if (loading) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 px-2 py-0.5 rounded-full border border-slate-200 bg-slate-50">
        <Loader2 size={9} className="animate-spin" /> Scoring…
      </span>
    )
  }

  if (!score) return null

  const cfg = tierConfig[score.tier]

  if (!showFull) {
    return (
      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.border} ${cfg.text}`}
        title={score.reasoning}>
        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
        {score.score} · {cfg.label}
      </span>
    )
  }

  // Full card for detail page
  return (
    <div className={`rounded-xl border p-4 ${cfg.bg} ${cfg.border}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className={cfg.text} />
          <span className={`text-xs font-bold uppercase tracking-wide ${cfg.text}`}>AI Lead Score</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-2xl font-bold ${cfg.text}`}>{score.score}</span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.border} ${cfg.text}`}>
            {cfg.label}
          </span>
        </div>
      </div>
      <p className="text-[12px] text-slate-600 leading-relaxed mb-3">{score.reasoning}</p>
      <div className="space-y-1.5">
        <div className="flex items-start gap-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide flex-shrink-0 mt-0.5">Action:</span>
          <span className="text-[12px] text-slate-700 font-medium">{score.recommended_action}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Queue:</span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
            score.suggested_queue === 'immediate' ? 'bg-red-100 text-red-700' :
            score.suggested_queue === 'this-week' ? 'bg-amber-100 text-amber-700' :
            'bg-slate-100 text-slate-500'
          }`}>{score.suggested_queue.replace('-', ' ')}</span>
        </div>
      </div>
    </div>
  )
}
