'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { updateDealAction } from './actions'
import type { Deal } from '@/lib/supabase/queries'

const STAGES = ['prospect', 'qualified', 'proposal', 'negotiation', 'won', 'lost'] as const
type Stage = typeof STAGES[number]

const STAGE_CONFIG: Record<Stage, { label: string; header: string; card: string; dot: string }> = {
  prospect:    { label: 'Prospect',    header: 'bg-gray-50   border-gray-200',  card: 'border-gray-200',   dot: 'bg-gray-400'   },
  qualified:   { label: 'Qualified',   header: 'bg-blue-50   border-blue-200',  card: 'border-blue-200',   dot: 'bg-blue-500'   },
  proposal:    { label: 'Proposal',    header: 'bg-purple-50 border-purple-200',card: 'border-purple-200', dot: 'bg-purple-500' },
  negotiation: { label: 'Negotiation', header: 'bg-amber-50  border-amber-200', card: 'border-amber-200',  dot: 'bg-amber-500'  },
  won:         { label: 'Won',         header: 'bg-green-50  border-green-200', card: 'border-green-200',  dot: 'bg-green-500'  },
  lost:        { label: 'Lost',        header: 'bg-red-50    border-red-200',   card: 'border-red-200',    dot: 'bg-red-400'    },
}

interface Props {
  deals: Deal[]
  locale: string
  leadMap: Record<string, string>
}

export default function DealsKanban({ deals: initial, locale, leadMap }: Props) {
  const [deals, setDeals] = useState(initial)
  const [moving, setMoving] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState<Stage | null>(null)
  const dragId = useRef<string | null>(null)

  function handleDragStart(e: React.DragEvent, dealId: string) {
    dragId.current = dealId
    setMoving(dealId)
    e.dataTransfer.effectAllowed = 'move'
  }

  function handleDragEnd() {
    dragId.current = null
    setMoving(null)
    setDragOver(null)
  }

  async function handleDrop(stage: Stage) {
    const id = dragId.current
    setDragOver(null)
    if (!id) return
    const deal = deals.find(d => d.id === id)
    if (!deal || deal.stage === stage) { setMoving(null); return }

    // Optimistic update
    setDeals(prev => prev.map(d => d.id === id ? { ...d, stage } : d))
    setMoving(null)

    await updateDealAction(id, { stage })
  }

  const byStage = (stage: Stage) => deals.filter(d => d.stage === stage)

  return (
    <div className="flex gap-3 overflow-x-auto pb-4" style={{ minHeight: 500 }}>
      {STAGES.map(stage => {
        const cfg = STAGE_CONFIG[stage]
        const stagDeals = byStage(stage)
        const stageValue = stagDeals.reduce((s, d) => s + d.value, 0)

        return (
          <div
            key={stage}
            className={`flex-shrink-0 w-64 rounded-2xl border flex flex-col transition-colors ${
              dragOver === stage ? 'border-brand-green bg-green-50/30' : 'border-gray-200 bg-gray-50/50'
            }`}
            onDragOver={e => { e.preventDefault(); setDragOver(stage) }}
            onDragLeave={() => setDragOver(null)}
            onDrop={() => handleDrop(stage)}
          >
            {/* Column header */}
            <div className={`px-3 py-2.5 rounded-t-2xl border-b ${cfg.header} flex items-center justify-between`}>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                <span className="text-xs font-semibold text-gray-700">{cfg.label}</span>
                <span className="text-xs text-gray-400 bg-white border border-gray-200 rounded-full px-1.5 py-0.5 font-medium">
                  {stagDeals.length}
                </span>
              </div>
              {stageValue > 0 && (
                <span className="text-xs font-medium text-gray-500">${stageValue.toLocaleString()}</span>
              )}
            </div>

            {/* Cards */}
            <div className="flex-1 p-2 space-y-2 overflow-y-auto" style={{ maxHeight: 560 }}>
              {stagDeals.map(deal => (
                <div
                  key={deal.id}
                  draggable
                  onDragStart={e => handleDragStart(e, deal.id)}
                  onDragEnd={handleDragEnd}
                  className={`bg-white rounded-xl border p-3 cursor-grab active:cursor-grabbing transition-all select-none ${cfg.card} ${
                    moving === deal.id ? 'opacity-40 scale-95' : 'hover:shadow-md shadow-sm'
                  }`}
                >
                  <p className="text-xs font-semibold text-gray-900 leading-snug mb-1 line-clamp-2">{deal.title}</p>

                  {deal.lead_id && leadMap[deal.lead_id] && (
                    <p className="text-xs text-gray-400 mb-1.5 truncate">{leadMap[deal.lead_id]}</p>
                  )}

                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs font-bold text-gray-800">${deal.value}<span className="text-gray-400 font-normal">/mo</span></span>
                    {deal.provider && (
                      <span className="text-xs text-gray-400 truncate max-w-[90px]">{deal.provider}</span>
                    )}
                  </div>

                  {deal.contract_end_date && (
                    <p className="text-xs text-gray-400 mt-1">Exp {deal.contract_end_date}</p>
                  )}

                  <Link
                    href={`/${locale}/crm/deals/${deal.id}`}
                    className="mt-2 block text-center text-xs text-brand-greenDark hover:text-brand-green font-medium"
                    onClick={e => e.stopPropagation()}
                  >
                    View →
                  </Link>
                </div>
              ))}

              {stagDeals.length === 0 && (
                <div className={`h-16 border-2 border-dashed rounded-xl flex items-center justify-center transition-colors ${
                  dragOver === stage ? 'border-brand-green bg-green-50' : 'border-gray-200'
                }`}>
                  <p className="text-xs text-gray-300">Drop here</p>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
