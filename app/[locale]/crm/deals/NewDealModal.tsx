'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PlusCircle, X } from 'lucide-react'
import { createDeal } from './actions'
import type { Lead } from '@/data/mock-crm'
import type { Deal } from '@/lib/supabase/queries'
import type { CRMAgent } from '@/lib/supabase/queries'
import type { Provider } from '@/data/mock-crm'

const PRODUCT_TYPES = ['FIXED RATE', 'VARIABLE', 'INDEX', 'PREPAID', 'FREE NIGHTS', 'FREE WEEKENDS']

const DEAL_FLAGS = ['TOS', 'TOAO', 'Deposit', 'Special Deal', '10% Promo']

export default function NewDealModal({ locale, leads, agents, providers }: { locale: string; leads: Lead[]; agents: CRMAgent[]; providers: Provider[] }) {
  const [open, setOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [selectedFlags, setSelectedFlags] = useState<string[]>([])
  const [term, setTerm] = useState<string>('12')
  const [contractStart, setContractStart] = useState<string>('')
  const [title, setTitle] = useState<string>('')
  const router = useRouter()

  function toggleFlag(flag: string) {
    setSelectedFlags(prev => prev.includes(flag) ? prev.filter(f => f !== flag) : [...prev, flag])
  }

  function handleLeadChange(leadId: string) {
    const lead = leads.find(l => l.id === leadId)
    if (!lead) { setTitle(''); return }
    const firstName = lead.name.trim().split(' ')[0]
    const address = lead.service_address || lead.zip || ''
    setTitle(address ? `${firstName} – ${address}` : firstName)
  }

  function calcEndDate(start: string, months: string): string {
    if (!start || months === 'mtm') return ''
    const d = new Date(start)
    d.setMonth(d.getMonth() + parseInt(months))
    return d.toISOString().split('T')[0]
  }

  const computedEndDate = calcEndDate(contractStart, term)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const get  = (name: string) => (form.elements.namedItem(name) as HTMLInputElement)?.value ?? ''

    const assignedEmail = get('assigned_to') || null
    const selectedAgent = agents.find(a => a.email === assignedEmail)

    setSubmitError('')
    setIsPending(true)

    try {
      const res = await createDeal({
        title:               get('title'),
        lead_id:             get('lead_id') || null,
        value:               0,
        stage:               get('stage') as Deal['stage'],
        probability:         50,
        expected_close:      get('expected_close') || null,
        provider:            get('provider') || null,
        plan_name:           get('plan_name') || null,
        service_type:        (get('service_type') as 'residential' | 'commercial') || null,
        notes:               get('notes') || null,
        assigned_to:         assignedEmail,
        agent_code:          selectedAgent?.id ?? null,
        service_order:       get('service_order') || null,
        service_address:     get('service_address') || null,
        esid:                get('esid') || null,
        contract_start_date: contractStart || null,
        contract_end_date:   term === 'mtm' ? (get('contract_end_date') || null) : (computedEndDate || null),
        rate_kwh:            Number(get('rate_kwh')) || null,
        adder_kwh:           Number(get('adder_kwh')) || null,
        term_months:         term === 'mtm' ? null : Number(term) || null,
        product_type:        get('product_type') || null,
        usage_kwh:           Number(get('usage_kwh')) || null,
        flags:               selectedFlags.length > 0 ? selectedFlags : null,
      })
      if (res.error) {
        setSubmitError(res.error)
      } else {
        setOpen(false)
        router.refresh()
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Unexpected error. Please try again.')
    } finally {
      setIsPending(false)
    }
  }

  const C = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green'
  const L = 'block text-xs font-medium text-gray-600 mb-1'

  return (
    <>
      <button
        onClick={() => { setOpen(true); setTitle(''); setSelectedFlags([]); setTerm('12'); setContractStart('') }}
        className="flex items-center gap-2 bg-brand-greenDark text-white text-sm px-4 py-2 rounded-xl hover:bg-brand-green transition-colors font-medium"
      >
        <PlusCircle size={16} />
        New Deal
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <h2 className="font-semibold text-gray-900">New Deal</h2>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">

              {/* ── Basic Info ── */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Basic Info</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className={L}>Linked Contact</label>
                    <select
                      name="lead_id"
                      defaultValue=""
                      className={C}
                      onChange={e => handleLeadChange(e.target.value)}
                    >
                      <option value="">— None —</option>
                      {leads.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className={L}>Deal Title *</label>
                    <input
                      name="title"
                      required
                      placeholder="Auto-filled from contact, or type manually"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      className={C}
                    />
                  </div>
                  <div>
                    <label className={L}>Stage</label>
                    <select name="stage" defaultValue="prospect" className={C}>
                      {['prospect','qualified','proposal','negotiation','won','lost'].map(s => (
                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={L}>Service Type</label>
                    <select name="service_type" defaultValue="residential" className={C}>
                      <option value="residential">Residential</option>
                      <option value="commercial">Commercial</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className={L}>Flags</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {DEAL_FLAGS.map(flag => (
                        <button
                          key={flag}
                          type="button"
                          onClick={() => toggleFlag(flag)}
                          className={`text-xs px-3 py-1.5 rounded-lg border transition-colors font-medium ${
                            selectedFlags.includes(flag)
                              ? 'border-orange-300 text-orange-700 bg-orange-50'
                              : 'border-gray-200 text-gray-500 hover:border-gray-300'
                          }`}
                        >
                          {flag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Contract Details ── */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Contract Details</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={L}>Service Order</label>
                    <select name="service_order" defaultValue="" className={C}>
                      <option value="">— Select —</option>
                      <option value="Switch">Switch</option>
                      <option value="MVI">MVI</option>
                      <option value="PMVI">PMVI</option>
                      <option value="Renewal">Renewal</option>
                    </select>
                  </div>
                  <div>
                    <label className={L}>Supplier</label>
                    <select name="provider" defaultValue="" className={C}>
                      <option value="">— Select —</option>
                      {providers.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={L}>Plan Name</label>
                    <input name="plan_name" placeholder="e.g. Gexa Saver 12" className={C} />
                  </div>
                  <div>
                    <label className={L}>Product Type</label>
                    <select name="product_type" defaultValue="" className={C}>
                      <option value="">— Select —</option>
                      {PRODUCT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={L}>Contract Term</label>
                    <select name="term_months" value={term} onChange={e => setTerm(e.target.value)} className={C}>
                      <option value="3">3 Months</option>
                      <option value="6">6 Months</option>
                      <option value="12">12 Months</option>
                      <option value="18">18 Months</option>
                      <option value="24">24 Months</option>
                      <option value="36">36 Months</option>
                      <option value="48">48 Months</option>
                      <option value="60">60 Months</option>
                      <option value="mtm">Month to Month</option>
                    </select>
                  </div>
                  <div>
                    <label className={L}>Contract Rate ($/kWh)</label>
                    <input name="rate_kwh" type="number" step="0.001" min="0" placeholder="0.109" className={C} />
                  </div>
                  <div>
                    <label className={L}>Adder ($/kWh)</label>
                    <input name="adder_kwh" type="number" step="0.001" min="0" placeholder="0.008" className={C} />
                  </div>
                  <div>
                    <label className={L}>Estimated Usage (kWh/mo)</label>
                    <input name="usage_kwh" type="number" min="0" placeholder="1200" className={C} />
                  </div>
                  <div>
                    <label className={L}>Expected Close Date</label>
                    <input name="expected_close" type="date" className={C} />
                  </div>
                  <div>
                    <label className={L}>Contract Start Date</label>
                    <input
                      name="contract_start_date"
                      type="date"
                      value={contractStart}
                      onChange={e => setContractStart(e.target.value)}
                      className={C}
                    />
                  </div>
                  <div>
                    <label className={L}>Contract End Date</label>
                    {term === 'mtm' ? (
                      <input name="contract_end_date" type="date" className={C} />
                    ) : (
                      <input
                        name="contract_end_date"
                        type="date"
                        value={computedEndDate}
                        readOnly
                        className={C + ' bg-gray-50 text-gray-500 cursor-default'}
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* ── Property ── */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Property</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className={L}>Service Address</label>
                    <input name="service_address" placeholder="123 Main St, Houston TX 77036" className={C} />
                  </div>
                  <div>
                    <label className={L}>ESI ID</label>
                    <input name="esid" placeholder="10089010238183693001" className={C} />
                  </div>
                </div>
              </div>

              {/* ── Assignment ── */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Assignment</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={L}>Sales Agent</label>
                    <select name="assigned_to" defaultValue="" className={C}>
                      <option value="">— Unassigned —</option>
                      {agents.filter(a => a.active).map(a => (
                        <option key={a.id} value={a.email}>{a.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className={L}>Notes</label>
                    <textarea name="notes" rows={2} className={C.replace('py-2.5','py-2') + ' resize-none'} placeholder="Additional notes..." />
                  </div>
                </div>
              </div>

              {submitError && (
                <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                  {submitError}
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setOpen(false)}
                  className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isPending}
                  className="flex-1 bg-brand-greenDark text-white py-2.5 rounded-xl text-sm hover:bg-brand-green transition-colors disabled:opacity-50 font-medium">
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
