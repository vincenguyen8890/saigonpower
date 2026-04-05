'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { PlusCircle, X } from 'lucide-react'
import { createDeal } from './actions'
import type { Lead } from '@/data/mock-crm'
import type { Deal } from '@/lib/supabase/queries'

const PROVIDERS = ['Gexa Energy', 'TXU Energy', 'Reliant Energy', 'Green Mountain Energy', 'Cirro Energy', 'Payless Power']

export default function NewDealModal({ locale, leads }: { locale: string; leads: Lead[] }) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const get = (name: string) => (form.elements.namedItem(name) as HTMLInputElement).value

    startTransition(async () => {
      await createDeal({
        title:          get('title'),
        lead_id:        get('lead_id') || null,
        value:          Number(get('value')) || 0,
        stage:          get('stage') as Deal['stage'],
        probability:    Number(get('probability')) || 50,
        expected_close: get('expected_close') || null,
        provider:       get('provider') || null,
        plan_name:      get('plan_name') || null,
        service_type:   (get('service_type') as 'residential' | 'commercial') || null,
        notes:          get('notes') || null,
        assigned_to:    get('assigned_to') || null,
      })
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
        className="flex items-center gap-2 bg-brand-greenDark text-white text-sm px-4 py-2 rounded-xl hover:bg-brand-green transition-colors font-medium"
      >
        <PlusCircle size={16} />
        New Deal
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <h2 className="font-semibold text-gray-900">New Deal</h2>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className={labelClass}>Deal Title *</label>
                  <input name="title" required placeholder="e.g. Nguyen – Residential 12mo" className={inputClass} />
                </div>
                <div className="col-span-2">
                  <label className={labelClass}>Linked Lead</label>
                  <select name="lead_id" defaultValue="" className={inputClass}>
                    <option value="">— None —</option>
                    {leads.map(l => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Value ($/mo)</label>
                  <input name="value" type="number" min="0" defaultValue="75" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Probability (%)</label>
                  <input name="probability" type="number" min="0" max="100" defaultValue="50" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Stage</label>
                  <select name="stage" defaultValue="prospect" className={inputClass}>
                    <option value="prospect">Prospect</option>
                    <option value="qualified">Qualified</option>
                    <option value="proposal">Proposal</option>
                    <option value="negotiation">Negotiation</option>
                    <option value="won">Won</option>
                    <option value="lost">Lost</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Service Type</label>
                  <select name="service_type" defaultValue="residential" className={inputClass}>
                    <option value="residential">Residential</option>
                    <option value="commercial">Commercial</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Provider</label>
                  <select name="provider" defaultValue="" className={inputClass}>
                    <option value="">— Select —</option>
                    {PROVIDERS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Plan Name</label>
                  <input name="plan_name" placeholder="e.g. Gexa Saver 12" className={inputClass} />
                </div>
                <div className="col-span-2">
                  <label className={labelClass}>Expected Close Date</label>
                  <input name="expected_close" type="date" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Assigned To</label>
                  <input name="assigned_to" placeholder="agent@saigonllc.com" className={inputClass} />
                </div>
                <div className="col-span-2">
                  <label className={labelClass}>Notes</label>
                  <textarea name="notes" rows={2} className={inputClass.replace('py-2.5', 'py-2') + ' resize-none'} placeholder="Additional notes..." />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 bg-brand-greenDark text-white py-2.5 rounded-xl text-sm hover:bg-brand-green transition-colors disabled:opacity-50 font-medium"
                >
                  {isPending ? 'Saving...' : 'Create Deal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
