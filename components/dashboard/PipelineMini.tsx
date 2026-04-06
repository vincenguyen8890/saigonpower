import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export interface PipelineStage {
  key: string
  label: string
  count: number
  value: number
  barColor: string
  bg: string
  textColor: string
}

interface PipelineMiniProps {
  stages: PipelineStage[]
  locale: string
}

export default function PipelineMini({ stages, locale }: PipelineMiniProps) {
  const total = stages.reduce((s, x) => s + x.count, 0)

  return (
    <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-[0_1px_3px_rgba(15,23,42,0.06)] h-full flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-[#0F172A]">Pipeline Snapshot</h2>
          <p className="text-xs text-slate-400 mt-0.5">{total} active deal{total !== 1 ? 's' : ''}</p>
        </div>
        <Link
          href={`/${locale}/crm/deals`}
          className="flex items-center gap-1 text-xs text-[#00C853] hover:text-[#00A846] font-semibold transition-colors"
        >
          Full board <ArrowRight size={11} />
        </Link>
      </div>

      {/* Stacked progress bar */}
      <div className="flex rounded-full overflow-hidden h-1.5 mb-5 bg-slate-100 gap-px">
        {total > 0
          ? stages.filter(s => s.count > 0).map(s => (
            <div
              key={s.key}
              className={`${s.barColor} transition-all duration-700`}
              style={{ width: `${(s.count / total) * 100}%` }}
            />
          ))
          : <div className="w-full bg-slate-100" />
        }
      </div>

      {/* Stage grid */}
      <div className="grid grid-cols-4 gap-2 flex-1">
        {stages.map(s => (
          <div key={s.key} className={`${s.bg} rounded-lg p-3 text-center flex flex-col items-center justify-center`}>
            <p className={`text-xl font-bold ${s.textColor} tabular-nums`}>{s.count}</p>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 leading-none">{s.label}</p>
            <p className="text-[11px] text-slate-400 mt-1.5 tabular-nums">
              {s.count > 0 ? `$${(s.value / 1000).toFixed(0)}k` : '—'}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
