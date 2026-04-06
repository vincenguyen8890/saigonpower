'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, X } from 'lucide-react'
import { updateDealAction, runDealStageAutomation } from '../actions'
import type { Deal, CRMAgent } from '@/lib/supabase/queries'
import type { Provider } from '@/data/mock-crm'

const PRODUCT_TYPES = ['FIXED RATE', 'VARIABLE', 'INDEX', 'PREPAID', 'FREE NIGHTS', 'FREE WEEKENDS']

export default function DealEditForm({ deal, locale, agents, providers }: { deal: Deal; locale: string; agents: CRMAgent[]; providers: Provider[] }) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const get  = (n: string) => (form.elements.namedItem(n) as HTMLInputElement).value
    const newStage = get('stage')

    startTransition(async () => {
      await updateDealAction(deal.id, {
        title:               get('title'),
        stage:               newStage as Deal['stage'],
        expected_close:      get('expected_close')      || null,
        provider:            get('provider')            || null,
        plan_name:           get('plan_name')           || null,
        notes:               get('notes')               || null,
        assigned_to:         get('assigned_to')         || null,
        service_address:     get('service_address')     || null,
        esid:                get('esid')                || null,
        contract_start_date: get('contract_start_date') || null,
        contract_end_date:   get('contract_end_date')   || null,
        rate_kwh:            Number(get('rate_kwh'))    || null,
        adder_kwh:           Number(get('adder_kwh'))   || null,
        term_months:         Number(get('term_months')) || null,
        product_type:        get('product_type')        || null,
        usage_kwh:           Number(get('usage_kwh'))   || null,
      })

      if (newStage !== deal.stage) {
        await runDealStageAutomation(deal.id, newStage, get('title'), deal.lead_id)
      }

      setOpen(false)
      router.refresh()
    })
  }

  const C = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green'
  const L = 'block text-xs font-medium text-gray-600 mb-1'

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
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <h2 className="font-semibold text-gray-900">Edit Deal</h2>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">

              {/* ── Basic Info ── */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Basic Info</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className={L}>Title *</label>
                    <input name="title" required defaultValue={deal.title} className={C} />
                  </div>
                  <div>
                    <label className={L}>Stage</label>
                    <select name="stage" defaultValue={deal.stage} className={C}>
                      {['prospect','qualified','proposal','negotiation','won','lost'].map(s => (
                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={L}>Expected Close Date</label>
                    <input name="expected_close" type="date" defaultValue={deal.expected_close ?? ''} className={C} />
                  </div>
                </div>
              </div>

              {/* ── Contract Details ── */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Contract Details</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={L}>Supplier</label>
                    <select name="provider" defaultValue={deal.provider ?? ''} className={C}>
                      <option value="">— None —</option>
                      {providers.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={L}>Plan Name</label>
                    <input name="plan_name" defaultValue={deal.plan_name ?? ''} className={C} />
                  </div>
                  <div>
                    <label className={L}>Product Type</label>
                    <select name="product_type" defaultValue={deal.product_type ?? ''} className={C}>
                      <option value="">— Select —</option>
                      {PRODUCT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={L}>Contract Term (months)</label>
                    <input name="term_months" type="number" min="0" defaultValue={deal.term_months ?? ''} className={C} />
                  </div>
                  <div>
                    <label className={L}>Contract Rate ($/kWh)</label>
                    <input name="rate_kwh" type="number" step="0.001" min="0" defaultValue={deal.rate_kwh ?? ''} className={C} />
                  </div>
                  <div>
                    <label className={L}>Adder ($/kWh)</label>
                    <input name="adder_kwh" type="number" step="0.001" min="0" defaultValue={deal.adder_kwh ?? ''} className={C} />
                  </div>
                  <div>
                    <label className={L}>Estimated Usage (kWh/mo)</label>
                    <input name="usage_kwh" type="number" min="0" defaultValue={deal.usage_kwh ?? ''} className={C} />
                  </div>
                  <div>
                    <label className={L}>Contract Start Date</label>
                    <input name="contract_start_date" type="date" defaultValue={deal.contract_start_date ?? ''} className={C} />
                  </div>
                  <div>
                    <label className={L}>Contract End Date</label>
                    <input name="contract_end_date" type="date" defaultValue={deal.contract_end_date ?? ''} className={C} />
                  </div>
                </div>
              </div>

              {/* ── Property ── */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Property</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className={L}>Service Address</label>
                    <input name="service_address" defaultValue={deal.service_address ?? ''} className={C} />
                  </div>
                  <div>
                    <label className={L}>ESI ID</label>
                    <input name="esid" defaultValue={deal.esid ?? ''} className={C} />
                  </div>
                </div>
              </div>

              {/* ── Assignment ── */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Assignment</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={L}>Sales Agent</label>
                    <select name="assigned_to" defaultValue={deal.assigned_to ?? ''} className={C}>
                      <option value="">— Unassigned —</option>
                      {agents.filter(a => a.active).map(a => (
                        <option key={a.id} value={a.email}>{a.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className={L}>Notes</label>
                    <textarea name="notes" rows={2} defaultValue={deal.notes ?? ''} className={C.replace('py-2.5','py-2') + ' resize-none'} />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-1">
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
