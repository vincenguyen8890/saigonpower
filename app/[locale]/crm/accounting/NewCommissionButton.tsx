'use client'

import { useState, useTransition } from 'react'
import { PlusCircle, X, Loader2 } from 'lucide-react'
import { createCommissionAction } from './actions'
import type { Deal } from '@/lib/supabase/queries'

interface Props {
  deals: Deal[]
}

export default function NewCommissionButton({ deals }: Props) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [form, setForm] = useState({
    deal_id: '',
    provider: '',
    period_start: new Date().toISOString().split('T')[0].slice(0, 7) + '-01',
    amount_expected: '',
    amount_received: '0',
    notes: '',
  })

  const activeDeals = deals.filter(d => !['won', 'lost'].includes(d.stage))

  function handleDealChange(dealId: string) {
    const deal = activeDeals.find(d => d.id === dealId)
    setForm(f => ({
      ...f,
      deal_id: dealId,
      provider: deal?.provider ?? f.provider,
      amount_expected: deal ? String(deal.value) : f.amount_expected,
    }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const deal = activeDeals.find(d => d.id === form.deal_id)
      await createCommissionAction({
        deal_id:         form.deal_id || null,
        lead_id:         deal?.lead_id ?? null,
        provider:        form.provider,
        period_start:    form.period_start,
        period_end:      null,
        amount_expected: parseFloat(form.amount_expected) || 0,
        amount_received: parseFloat(form.amount_received) || 0,
        status:          'pending',
        notes:           form.notes || null,
      })
      setOpen(false)
      setForm({ deal_id: '', provider: '', period_start: new Date().toISOString().split('T')[0].slice(0, 7) + '-01', amount_expected: '', amount_received: '0', notes: '' })
    })
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs flex items-center gap-1.5 bg-brand-greenDark text-white px-3 py-1.5 rounded-lg hover:bg-brand-green transition-colors font-medium"
      >
        <PlusCircle size={13} />
        Add Record
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Add Commission Record</h3>
              <button onClick={() => setOpen(false)}><X size={18} className="text-gray-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Deal</label>
                <select
                  value={form.deal_id}
                  onChange={e => handleDealChange(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
                >
                  <option value="">— select deal —</option>
                  {activeDeals.map(d => (
                    <option key={d.id} value={d.id}>{d.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Provider</label>
                <input
                  required
                  value={form.provider}
                  onChange={e => setForm(f => ({ ...f, provider: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Period Start</label>
                  <input
                    type="date"
                    required
                    value={form.period_start}
                    onChange={e => setForm(f => ({ ...f, period_start: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Expected ($)</label>
                  <input
                    type="number" min="0" step="0.01" required
                    value={form.amount_expected}
                    onChange={e => setForm(f => ({ ...f, amount_expected: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Notes</label>
                <input
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setOpen(false)} className="flex-1 border border-gray-200 rounded-xl py-2 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={isPending} className="flex-1 bg-brand-greenDark text-white rounded-xl py-2 text-sm hover:bg-brand-green disabled:opacity-50 flex items-center justify-center gap-1">
                  {isPending ? <Loader2 size={14} className="animate-spin" /> : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
