'use client'

import { useState } from 'react'
import { PlusCircle, Pencil, Trash2, Leaf, Tag, Zap } from 'lucide-react'
import type { Plan } from '@/data/mock-crm'
import PlanModal from './PlanModal'

interface Props {
  initialPlans: Plan[]
  isAdmin: boolean
}

export default function PlansClient({ initialPlans, isAdmin }: Props) {
  const [plans, setPlans]           = useState<Plan[]>(initialPlans)
  const [editingPlan, setEditingPlan] = useState<Plan | null | 'new'>(null)
  const [filterService, setFilterService] = useState('all')
  const [filterProvider, setFilterProvider] = useState('all')
  const [filterStatus, setFilterStatus] = useState<'active' | 'inactive'>('active')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const providers = [...new Map(plans.map(p => [p.provider_id, { id: p.provider_id, name: p.provider_name }])).values()]

  const visible = plans.filter(p => {
    if (p.status !== filterStatus) return false
    if (filterService !== 'all' && p.service_type !== filterService) return false
    if (filterProvider !== 'all' && p.provider_id !== filterProvider) return false
    return true
  })

  const bestRate = visible.length > 0 ? Math.min(...visible.map(p => p.rate_kwh)) : 0

  function handleSave(saved: Plan) {
    setPlans(prev => {
      const idx = prev.findIndex(p => p.id === saved.id)
      if (idx !== -1) {
        const next = [...prev]
        next[idx] = saved
        return next
      }
      return [...prev, saved]
    })
    setEditingPlan(null)
  }

  function handleDelete(id: string) {
    setPlans(prev => prev.filter(p => p.id !== id))
    setDeleteConfirm(null)
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Energy Plans</h1>
          <p className="text-gray-500 text-sm mt-1">
            {visible.length} plans shown{bestRate > 0 ? ` · Best rate: ${(bestRate * 100).toFixed(1)}¢/kWh` : ''}
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setEditingPlan('new')}
            className="flex items-center gap-2 bg-brand-greenDark text-white text-sm px-4 py-2 rounded-xl hover:bg-brand-green transition-colors"
          >
            <PlusCircle size={15} />
            Add Plan
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-5">
        <div className="flex flex-wrap gap-3 items-center">
          <select
            value={filterService}
            onChange={e => setFilterService(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-green"
          >
            <option value="all">All Services</option>
            <option value="residential">Residential</option>
            <option value="commercial">Commercial</option>
          </select>
          <select
            value={filterProvider}
            onChange={e => setFilterProvider(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-green"
          >
            <option value="all">All Providers</option>
            {providers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value as 'active' | 'inactive')}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-green"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          {(filterService !== 'all' || filterProvider !== 'all' || filterStatus !== 'active') && (
            <button
              onClick={() => { setFilterService('all'); setFilterProvider('all'); setFilterStatus('active') }}
              className="text-sm text-gray-400 hover:text-gray-600"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {visible.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Zap size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">No plans match this filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-100 bg-gray-50/50">
                <tr>
                  {['Plan', 'Provider', 'Rate', 'Term', 'Type', 'Cancel Fee', 'Promo', ...(isAdmin ? [''] : [])].map((h, i) => (
                    <th
                      key={i}
                      className={`text-left text-xs font-medium text-gray-400 uppercase tracking-wide px-5 py-3
                        ${[5, 6].includes(i) ? 'hidden lg:table-cell' : ''}
                        ${i === 3 ? 'hidden lg:table-cell' : ''}
                        ${i === 4 ? 'hidden md:table-cell' : ''}
                        ${i === 7 ? 'w-20' : ''}
                      `}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {visible.map(plan => {
                  const isBest = plan.rate_kwh === bestRate
                  return (
                    <tr key={plan.id} className={`hover:bg-gray-50/60 transition-colors ${isBest ? 'bg-green-50/30' : ''}`}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-gray-900">{plan.name}</p>
                          {isBest && <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-medium">Best Rate</span>}
                          {plan.renewable && <Leaf size={13} className="text-green-500" />}
                          {plan.status === 'inactive' && <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-medium">Inactive</span>}
                        </div>
                        {plan.promo && (
                          <p className="text-xs text-amber-600 flex items-center gap-1 mt-0.5">
                            <Tag size={10} /> {plan.promo}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm text-gray-700">{plan.provider_name}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-sm font-bold ${isBest ? 'text-green-700' : 'text-gray-900'}`}>
                          {(plan.rate_kwh * 100).toFixed(1)}¢
                        </span>
                        <span className="text-xs text-gray-400">/kWh</span>
                      </td>
                      <td className="px-5 py-4 hidden lg:table-cell">
                        <span className="text-sm text-gray-700">
                          {plan.term_months === 0 ? 'Prepaid' : `${plan.term_months} mo.`}
                        </span>
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell">
                        <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                          plan.service_type === 'commercial' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'
                        }`}>
                          {plan.service_type === 'commercial' ? 'Comm.' : 'Res.'}
                        </span>
                      </td>
                      <td className="px-5 py-4 hidden lg:table-cell">
                        <span className="text-sm text-gray-600">
                          {plan.cancellation_fee != null ? `$${plan.cancellation_fee}` : 'None'}
                        </span>
                      </td>
                      <td className="px-5 py-4 hidden lg:table-cell">
                        {plan.promo
                          ? <span className="text-xs text-amber-600 font-medium">{plan.promo}</span>
                          : <span className="text-xs text-gray-300">—</span>
                        }
                      </td>
                      {isAdmin && (
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setEditingPlan(plan)}
                              className="p-1.5 text-gray-400 hover:text-brand-greenDark hover:bg-green-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Pencil size={14} />
                            </button>
                            {deleteConfirm === plan.id ? (
                              <div className="flex items-center gap-1">
                                <span className="text-xs text-red-600 font-medium">Delete?</span>
                                <button
                                  onClick={() => handleDelete(plan.id)}
                                  className="text-xs bg-red-600 text-white px-2 py-1 rounded-lg hover:bg-red-700"
                                >
                                  Yes
                                </button>
                                <button
                                  onClick={() => setDeleteConfirm(null)}
                                  className="text-xs text-gray-400 hover:text-gray-600 px-1"
                                >
                                  No
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setDeleteConfirm(plan.id)}
                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {editingPlan !== null && (
        <PlanModal
          plan={editingPlan === 'new' ? undefined : editingPlan}
          onClose={() => setEditingPlan(null)}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
