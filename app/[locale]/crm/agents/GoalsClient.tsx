'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Target, Save, ChevronLeft, ChevronRight } from 'lucide-react'
import type { CRMAgent, AgentGoal } from '@/lib/supabase/queries'

function monthLabel(ym: string) {
  const [y, m] = ym.split('-')
  return new Date(Number(y), Number(m) - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

function prevMonth(ym: string) {
  const [y, m] = ym.split('-').map(Number)
  const d = new Date(y, m - 2)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}
function nextMonth(ym: string) {
  const [y, m] = ym.split('-').map(Number)
  const d = new Date(y, m)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

interface Props {
  agents: CRMAgent[]
  goals: AgentGoal[]
  currentMonth: string
  wonThisMonth: Record<string, { deals: number; value: number }>
}

export default function GoalsClient({ agents, goals, currentMonth, wonThisMonth }: Props) {
  const [month, setMonth] = useState(currentMonth)
  const [edits, setEdits] = useState<Record<string, { deals: string; value: string }>>({})
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const activeAgents = agents.filter(a => a.active)

  function getGoal(email: string) {
    return goals.find(g => g.agent_email === email && g.month === month)
  }

  function getEdit(email: string) {
    return edits[email] ?? {
      deals: String(getGoal(email)?.target_deals ?? ''),
      value: String(getGoal(email)?.target_value ?? ''),
    }
  }

  function handleSave() {
    startTransition(async () => {
      const { upsertAgentGoalAction } = await import('./actions')
      await Promise.all(
        activeAgents.map(a => {
          const e = getEdit(a.email)
          if (!e.deals && !e.value) return Promise.resolve()
          return upsertAgentGoalAction({
            agent_email: a.email,
            month,
            target_deals: Number(e.deals) || 0,
            target_value: Number(e.value) || 0,
          })
        })
      )
      setEdits({})
      router.refresh()
    })
  }

  const C = 'w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-green text-right'

  return (
    <div className="space-y-5">
      {/* Month navigator */}
      <div className="flex items-center gap-3">
        <button onClick={() => setMonth(prevMonth(month))} className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50">
          <ChevronLeft size={16} />
        </button>
        <span className="font-semibold text-gray-900 w-44 text-center">{monthLabel(month)}</span>
        <button onClick={() => setMonth(nextMonth(month))} className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50">
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Goals table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['Agent', 'Won Deals', 'Deal Target', 'Won Value', 'Value Target ($)', 'Progress'].map(h => (
                <th key={h} className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {activeAgents.map(agent => {
              const actual = wonThisMonth[agent.email] ?? { deals: 0, value: 0 }
              const e = getEdit(agent.email)
              const targetDeals = Number(e.deals) || 0
              const targetValue = Number(e.value) || 0
              const dealPct = targetDeals > 0 ? Math.min(100, Math.round(actual.deals / targetDeals * 100)) : null
              const valuePct = targetValue > 0 ? Math.min(100, Math.round(actual.value / targetValue * 100)) : null

              return (
                <tr key={agent.email} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-900">{agent.name}</p>
                    <p className="text-xs text-gray-400">{agent.email.split('@')[0]}</p>
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">{actual.deals}</td>
                  <td className="px-4 py-3 w-28">
                    <input
                      type="number" min="0" placeholder="—"
                      value={e.deals}
                      onChange={ev => setEdits(prev => ({ ...prev, [agent.email]: { ...getEdit(agent.email), deals: ev.target.value } }))}
                      className={C}
                    />
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-green-700">${actual.value.toLocaleString()}</td>
                  <td className="px-4 py-3 w-32">
                    <input
                      type="number" min="0" placeholder="—"
                      value={e.value}
                      onChange={ev => setEdits(prev => ({ ...prev, [agent.email]: { ...getEdit(agent.email), value: ev.target.value } }))}
                      className={C}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-1 min-w-[100px]">
                      {dealPct !== null && (
                        <div>
                          <div className="flex justify-between text-xs text-gray-400 mb-0.5">
                            <span>Deals</span><span>{dealPct}%</span>
                          </div>
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${dealPct >= 100 ? 'bg-green-500' : dealPct >= 70 ? 'bg-amber-400' : 'bg-red-400'}`} style={{ width: `${dealPct}%` }} />
                          </div>
                        </div>
                      )}
                      {valuePct !== null && (
                        <div>
                          <div className="flex justify-between text-xs text-gray-400 mb-0.5">
                            <span>Value</span><span>{valuePct}%</span>
                          </div>
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${valuePct >= 100 ? 'bg-green-500' : valuePct >= 70 ? 'bg-amber-400' : 'bg-red-400'}`} style={{ width: `${valuePct}%` }} />
                          </div>
                        </div>
                      )}
                      {dealPct === null && valuePct === null && (
                        <span className="text-xs text-gray-300">No target set</span>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <button
        onClick={handleSave}
        disabled={isPending}
        className="flex items-center gap-2 bg-brand-greenDark text-white px-4 py-2 rounded-xl text-sm hover:bg-brand-green disabled:opacity-50 font-medium"
      >
        <Save size={14} />
        {isPending ? 'Saving…' : 'Save Goals'}
      </button>

      <p className="text-xs text-gray-400">Goals are per-month. Won deals/value counts only closed-won deals assigned to each agent this month.</p>
    </div>
  )
}
