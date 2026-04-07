'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { TrendingUp, CheckSquare, Square, X, Clock } from 'lucide-react'
import { bulkUpdateDealsAction } from './actions'
import type { Deal, CRMAgent } from '@/lib/supabase/queries'

const stageConfig: Record<string, { label: string; color: string; bg: string }> = {
  prospect:    { label: 'Prospect',    color: 'text-gray-600',   bg: 'bg-gray-100'   },
  qualified:   { label: 'Qualified',   color: 'text-blue-700',   bg: 'bg-blue-100'   },
  proposal:    { label: 'Proposal',    color: 'text-purple-700', bg: 'bg-purple-100' },
  negotiation: { label: 'Negotiation', color: 'text-amber-700',  bg: 'bg-amber-100'  },
  won:         { label: 'Won',         color: 'text-green-700',  bg: 'bg-green-100'  },
  lost:        { label: 'Lost',        color: 'text-red-600',    bg: 'bg-red-100'    },
}

const STAGES = ['prospect', 'qualified', 'proposal', 'negotiation', 'won', 'lost']
const FINAL_STAGES = new Set(['won', 'lost'])

function agingDays(updatedAt: string): number {
  return Math.floor((Date.now() - new Date(updatedAt).getTime()) / 86_400_000)
}

interface Props {
  deals: Deal[]
  locale: string
  leadMap: Record<string, string>
  agents: CRMAgent[]
}

export default function DealsTable({ deals, locale, leadMap, agents }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [isPending, startTransition] = useTransition()
  const [bulkStage, setBulkStage] = useState('')
  const [bulkAgent, setBulkAgent] = useState('')
  const router = useRouter()

  const allSelected = deals.length > 0 && selected.size === deals.length
  const someSelected = selected.size > 0

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(deals.map(d => d.id)))
  }

  function toggleOne(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function applyBulk() {
    const ids = [...selected]
    const updates: Partial<Deal> = {}
    if (bulkStage) updates.stage = bulkStage as Deal['stage']
    if (bulkAgent !== undefined && bulkAgent !== '') updates.assigned_to = bulkAgent || null
    if (Object.keys(updates).length === 0) return

    startTransition(async () => {
      await bulkUpdateDealsAction(ids, updates)
      setSelected(new Set())
      setBulkStage('')
      setBulkAgent('')
      router.refresh()
    })
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Bulk action bar */}
      {someSelected && (
        <div className="flex items-center gap-3 px-5 py-3 bg-brand-greenDark/5 border-b border-brand-greenDark/10">
          <span className="text-sm font-medium text-gray-700">{selected.size} selected</span>
          <div className="flex items-center gap-2 flex-1 flex-wrap">
            <select
              value={bulkStage}
              onChange={e => setBulkStage(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-brand-green"
            >
              <option value="">Change stage…</option>
              {STAGES.map(s => <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
            <select
              value={bulkAgent}
              onChange={e => setBulkAgent(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-brand-green"
            >
              <option value="">Reassign agent…</option>
              <option value="">— Unassigned —</option>
              {agents.filter(a => a.active).map(a => <option key={a.id} value={a.email}>{a.name}</option>)}
            </select>
            <button
              onClick={applyBulk}
              disabled={isPending || (!bulkStage && bulkAgent === '')}
              className="text-sm bg-brand-greenDark text-white px-3 py-1.5 rounded-lg hover:bg-brand-green disabled:opacity-40 transition-colors font-medium"
            >
              {isPending ? 'Applying…' : 'Apply'}
            </button>
          </div>
          <button onClick={() => setSelected(new Set())} className="text-gray-400 hover:text-gray-600 ml-auto">
            <X size={16} />
          </button>
        </div>
      )}

      {deals.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <TrendingUp size={32} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">No deals found</p>
        </div>
      ) : (
        <>
          {/* Mobile cards (below md) */}
          <div className="md:hidden divide-y divide-gray-50">
            {deals.map(deal => {
              const cfg = stageConfig[deal.stage] ?? stageConfig.prospect
              const isChecked = selected.has(deal.id)
              const days = agingDays(deal.updated_at)
              const stale = !FINAL_STAGES.has(deal.stage) && days >= 7
              return (
                <div key={deal.id} className={`px-4 py-3 ${isChecked ? 'bg-green-50/40' : ''}`}>
                  <div className="flex items-start gap-3">
                    <button onClick={() => toggleOne(deal.id)} className="mt-0.5 flex-shrink-0 text-gray-400 hover:text-gray-600">
                      {isChecked ? <CheckSquare size={15} className="text-brand-greenDark" /> : <Square size={15} />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{deal.title}</p>
                          {stale && (
                            <span className="flex items-center gap-0.5 text-[10px] text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full flex-shrink-0 font-medium">
                              <Clock size={9} />{days}d
                            </span>
                          )}
                        </div>
                        <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium capitalize flex-shrink-0 ${cfg.bg} ${cfg.color}`}>
                          {cfg.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mb-1">{deal.lead_id ? (leadMap[deal.lead_id] ?? '—') : '—'}</p>
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-900">${deal.value}<span className="text-xs font-normal text-gray-400">/mo</span></p>
                        <Link
                          href={`/${locale}/crm/deals/${deal.id}`}
                          className="text-xs bg-brand-greenDark text-white px-3 py-1 rounded-lg hover:bg-brand-green transition-colors font-medium"
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Desktop table (md+) */}
          <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-100 bg-gray-50/50">
              <tr>
                <th className="px-4 py-3 w-10">
                  <button onClick={toggleAll} className="text-gray-400 hover:text-gray-600">
                    {allSelected ? <CheckSquare size={16} className="text-brand-greenDark" /> : <Square size={16} />}
                  </button>
                </th>
                {['Deal', 'Lead', 'Stage', 'Value', 'Agent', 'Expected Close', ''].map((h, i) => (
                  <th key={i} className={`text-left text-xs font-medium text-gray-400 uppercase tracking-wide px-4 py-3 ${[4,5].includes(i) ? 'hidden lg:table-cell' : ''} ${[1].includes(i) ? 'hidden md:table-cell' : ''}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {deals.map(deal => {
                const cfg = stageConfig[deal.stage] ?? stageConfig.prospect
                const isChecked = selected.has(deal.id)
                const days = agingDays(deal.updated_at)
                const stale = !FINAL_STAGES.has(deal.stage) && days >= 7

                return (
                  <tr key={deal.id} className={`hover:bg-gray-50/60 transition-colors ${isChecked ? 'bg-green-50/40' : ''}`}>
                    <td className="px-4 py-4">
                      <button onClick={() => toggleOne(deal.id)} className="text-gray-400 hover:text-gray-600">
                        {isChecked ? <CheckSquare size={16} className="text-brand-greenDark" /> : <Square size={16} />}
                      </button>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-semibold text-gray-900">{deal.title}</p>
                        {stale && (
                          <span className="flex items-center gap-0.5 text-[10px] text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full font-medium" title={`No activity for ${days} days`}>
                            <Clock size={9} />{days}d
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 capitalize">{deal.service_type ?? '—'}</p>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <p className="text-sm text-gray-700">{deal.lead_id ? (leadMap[deal.lead_id] ?? '—') : '—'}</p>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium capitalize ${cfg.bg} ${cfg.color}`}>
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm font-semibold text-gray-900">${deal.value}<span className="text-xs font-normal text-gray-400">/mo</span></p>
                    </td>
                    <td className="px-4 py-4 hidden lg:table-cell">
                      <p className="text-xs text-gray-500 truncate max-w-[120px]">{deal.assigned_to ? deal.assigned_to.split('@')[0] : '—'}</p>
                    </td>
                    <td className="px-4 py-4 hidden lg:table-cell">
                      <p className="text-xs text-gray-500">{deal.expected_close ?? 'TBD'}</p>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Link
                        href={`/${locale}/crm/deals/${deal.id}`}
                        className="text-xs bg-brand-greenDark text-white px-3 py-1.5 rounded-lg hover:bg-brand-green transition-colors font-medium"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          </div>
          </>
      )}
    </div>
  )
}
