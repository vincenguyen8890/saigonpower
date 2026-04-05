'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, X } from 'lucide-react'
import { updateDealAction, runDealStageAutomation } from '../actions'
import type { Deal } from '@/lib/supabase/queries'

const PROVIDERS = ['Gexa Energy', 'TXU Energy', 'Reliant Energy', 'Green Mountain Energy', 'Cirro Energy', 'Payless Power']

export default function DealEditForm({ deal, locale }: { deal: Deal; locale: string }) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const get = (n: string) => (form.elements.namedItem(n) as HTMLInputElement).value
    const newStage = get('stage')

    startTransition(async () => {
      const updates = {
        title:          get('title'),
        value:          Number(get('value')) || deal.value,
        stage:          newStage as Deal['stage'],
        probability:    Number(get('probability')) || deal.probability,
        expected_close: get('expected_close') || null,
        provider:       get('provider') || null,
        plan_name:      get('plan_name') || null,
        notes:          get('notes') || null,
        assigned_to:    get('assigned_to') || null,
      }
      await updateDealAction(deal.id, updates)

      // Trigger stage automation if stage changed
      if (newStage !== deal.stage) {
        await runDealStageAutomation(deal.id, newStage, updates.title, deal.lead_id)
      }

      setOpen(false)
      router.refresh()
    })
  }

  const inputClass = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green'
  const labelClass = 'block text-xs font-medium text-gray-600 mb-1'

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 border border-gray-200 text-gray-600 text-sm px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors"
      >
        <Pencil size={14} />
        Edit Deal
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <h2 className="font-semibold text-gray-900">Edit Deal</h2>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className={labelClass}>Title *</label>
                  <input name="title" required defaultValue={deal.title} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Stage</label>
                  <select name="stage" defaultValue={deal.stage} className={inputClass}>
                    {['prospect','qualified','proposal','negotiation','won','lost'].map(s => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Probability (%)</label>
                  <input name="probability" type="number" min="0" max="100" defaultValue={deal.probability} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Value ($/mo)</label>
                  <input name="value" type="number" min="0" defaultValue={deal.value} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Expected Close</label>
                  <input name="expected_close" type="date" defaultValue={deal.expected_close ?? ''} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Provider</label>
                  <select name="provider" defaultValue={deal.provider ?? ''} className={inputClass}>
                    <option value="">— None —</option>
                    {PROVIDERS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Plan Name</label>
                  <input name="plan_name" defaultValue={deal.plan_name ?? ''} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Assigned To</label>
                  <input name="assigned_to" defaultValue={deal.assigned_to ?? ''} className={inputClass} />
                </div>
                <div className="col-span-2">
                  <label className={labelClass}>Notes</label>
                  <textarea name="notes" rows={2} defaultValue={deal.notes ?? ''} className={inputClass.replace('py-2.5','py-2') + ' resize-none'} />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setOpen(false)}
                  className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isPending}
                  className="flex-1 bg-brand-greenDark text-white py-2.5 rounded-xl text-sm hover:bg-brand-green disabled:opacity-50 font-medium">
                  {isPending ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
