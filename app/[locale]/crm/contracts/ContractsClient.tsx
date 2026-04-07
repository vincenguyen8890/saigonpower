'use client'

import { useState, useTransition } from 'react'
import { PlusCircle, Pencil, Trash2, X, Calendar, MapPin, Loader2, FileSignature, Mail } from 'lucide-react'
import type { Contract } from '@/lib/supabase/queries'
import { saveContractAction, deleteContractAction } from './actions'

interface Props {
  initialContracts: Contract[]
  leads: { id: string; name: string }[]
  isAdmin: boolean
  locale: string
}

const STATUS_STYLES = {
  active:    'bg-green-100 text-green-700',
  expired:   'bg-gray-100 text-gray-500',
  cancelled: 'bg-red-50 text-red-600',
  pending:   'bg-amber-50 text-amber-700',
}

function ContractModal({ contract, leads, onClose, onSave }: {
  contract?: Contract
  leads: { id: string; name: string }[]
  onClose: () => void
  onSave: (c: Contract) => void
}) {
  const isEdit = !!contract
  const [form, setForm] = useState({
    lead_id:      contract?.lead_id      ?? '',
    customer_name:contract?.customer_name ?? '',
    provider:     contract?.provider     ?? '',
    plan_name:    contract?.plan_name    ?? '',
    service_type: contract?.service_type ?? 'residential' as 'residential' | 'commercial',
    address:      contract?.address      ?? '',
    zip:          contract?.zip          ?? '',
    esid:         contract?.esid         ?? '',
    start_date:   contract?.start_date   ?? '',
    end_date:     contract?.end_date     ?? '',
    rate_kwh:     contract?.rate_kwh     ?? '' as number | '',
    term_months:  contract?.term_months  ?? 12,
    status:       contract?.status       ?? 'active' as Contract['status'],
    notes:        contract?.notes        ?? '',
  })

  function handleLeadChange(leadId: string) {
    const lead = leads.find(l => l.id === leadId)
    setForm(f => ({ ...f, lead_id: leadId, customer_name: lead?.name ?? '' }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSave({
      id:           isEdit ? contract.id : `ctr-${Date.now()}`,
      lead_id:      form.lead_id || null,
      customer_name:form.customer_name,
      provider:     form.provider,
      plan_name:    form.plan_name || null,
      service_type: form.service_type,
      address:      form.address || null,
      zip:          form.zip || null,
      esid:         form.esid || null,
      start_date:   form.start_date,
      end_date:     form.end_date,
      rate_kwh:     form.rate_kwh !== '' ? Number(form.rate_kwh) : null,
      term_months:  Number(form.term_months),
      status:       form.status,
      notes:        form.notes || null,
      created_at:   contract?.created_at ?? new Date().toISOString(),
      updated_at:   new Date().toISOString(),
    })
  }

  const inp = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green'

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">{isEdit ? 'Edit Contract' : 'New Contract'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

          {/* Lead */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Linked Lead</label>
            <select value={form.lead_id} onChange={e => handleLeadChange(e.target.value)} className={inp}>
              <option value="">— None —</option>
              {leads.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </div>

          {/* Customer name (if no lead linked) */}
          {!form.lead_id && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Customer Name <span className="text-red-400">*</span></label>
              <input type="text" value={form.customer_name} onChange={e => setForm(f => ({ ...f, customer_name: e.target.value }))} className={inp} required />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Provider <span className="text-red-400">*</span></label>
              <input type="text" value={form.provider} onChange={e => setForm(f => ({ ...f, provider: e.target.value }))} placeholder="e.g. Gexa Energy" className={inp} required />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Plan Name</label>
              <input type="text" value={form.plan_name} onChange={e => setForm(f => ({ ...f, plan_name: e.target.value }))} placeholder="e.g. Gexa Saver 12" className={inp} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Start Date <span className="text-red-400">*</span></label>
              <input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} className={inp} required />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">End Date <span className="text-red-400">*</span></label>
              <input type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} className={inp} required />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Rate ($/kWh)</label>
              <input type="number" step="0.001" min="0" value={form.rate_kwh} onChange={e => setForm(f => ({ ...f, rate_kwh: e.target.value === '' ? '' : parseFloat(e.target.value) }))} placeholder="0.109" className={inp} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Term (mo.)</label>
              <input type="number" min="1" max="60" value={form.term_months} onChange={e => setForm(f => ({ ...f, term_months: parseInt(e.target.value) }))} className={inp} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Service Type</label>
              <select value={form.service_type} onChange={e => setForm(f => ({ ...f, service_type: e.target.value as 'residential' | 'commercial' }))} className={inp}>
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Service Address</label>
            <input type="text" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="1234 Main St, Houston TX" className={inp} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">ZIP</label>
              <input type="text" value={form.zip} onChange={e => setForm(f => ({ ...f, zip: e.target.value }))} placeholder="77036" className={inp} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">ESID</label>
              <input type="text" value={form.esid} onChange={e => setForm(f => ({ ...f, esid: e.target.value }))} placeholder="Electric Service ID" className={inp} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as Contract['status'] }))} className={inp}>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="expired">Expired</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} className={`${inp} resize-none`} />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" className="flex-1 bg-brand-greenDark text-white text-sm py-2.5 rounded-xl hover:bg-brand-green transition-colors">
              {isEdit ? 'Save Changes' : 'Create Contract'}
            </button>
            <button type="button" onClick={onClose} className="px-4 border border-gray-200 text-gray-600 text-sm py-2.5 rounded-xl hover:bg-gray-50">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function ContractsClient({ initialContracts, leads, isAdmin, locale }: Props) {
  const [contracts, setContracts]     = useState<Contract[]>(initialContracts)
  const [editing, setEditing]         = useState<Contract | null | 'new'>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [isPending, startTransition]  = useTransition()

  const now      = new Date()
  const in30Days = new Date(now.getTime() + 30 * 86400000)
  const active   = contracts.filter(c => c.status === 'active').length
  const expiring = contracts.filter(c => c.status === 'active' && new Date(c.end_date) <= in30Days).length

  function handleSave(saved: Contract) {
    setContracts(prev => {
      const idx = prev.findIndex(c => c.id === saved.id)
      if (idx !== -1) { const next = [...prev]; next[idx] = saved; return next }
      return [...prev, saved]
    })
    setEditing(null)
    startTransition(() => saveContractAction(saved))
  }

  function handleDelete(id: string) {
    setContracts(prev => prev.filter(c => c.id !== id))
    setDeleteConfirm(null)
    startTransition(() => deleteContractAction(id))
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contracts</h1>
          <p className="text-gray-500 text-sm mt-1">
            {active} active · {expiring > 0 ? <span className="text-amber-600 font-medium">{expiring} expiring soon</span> : '0 expiring'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isPending && <span className="flex items-center gap-1.5 text-xs text-gray-400"><Loader2 size={12} className="animate-spin" /> Saving…</span>}
          <button
            onClick={() => setEditing('new')}
            className="flex items-center gap-2 bg-brand-greenDark text-white text-sm px-4 py-2 rounded-xl hover:bg-brand-green transition-colors"
          >
            <PlusCircle size={15} /> New Contract
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {contracts.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <FileSignature size={36} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No contracts yet. Add the first one.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-100 bg-gray-50/50">
                <tr>
                  {['Customer', 'Plan / Provider', 'Rate', 'Expires', 'Sequence', 'Service', 'Status', ''].map((h, i) => (
                    <th key={i} className={`text-left text-xs font-medium text-gray-400 uppercase tracking-wide px-5 py-3 ${i === 4 ? 'hidden md:table-cell' : ''} ${i === 1 ? 'hidden md:table-cell' : ''}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {contracts.map(c => {
                  const daysLeft = Math.ceil((new Date(c.end_date).getTime() - now.getTime()) / 86400000)
                  const urgency  = daysLeft <= 30 ? 'text-red-500' : daysLeft <= 60 ? 'text-amber-500' : 'text-gray-400'
                  const name     = c.customer_name || leads.find(l => l.id === c.lead_id)?.name || '—'
                  return (
                    <tr key={c.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-gray-900">{name}</p>
                        {c.address && <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5"><MapPin size={10} />{c.address.split(',').slice(-2).join(',').trim()}</p>}
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell">
                        <p className="text-sm text-gray-700">{c.plan_name || '—'}</p>
                        <p className="text-xs text-gray-400">{c.provider}</p>
                      </td>
                      <td className="px-5 py-4">
                        {c.rate_kwh ? <><span className="text-sm font-medium text-gray-900">{(c.rate_kwh * 100).toFixed(1)}¢</span><span className="text-xs text-gray-400">/kWh</span></> : <span className="text-xs text-gray-400">—</span>}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={13} className={urgency} />
                          <div>
                            <p className="text-xs text-gray-700">{formatDate(c.end_date)}</p>
                            <p className={`text-xs font-medium ${urgency}`}>{daysLeft > 0 ? `${daysLeft}d left` : 'Expired'}</p>
                          </div>
                        </div>
                      </td>
                      {/* Renewal sequence dots */}
                      <td className="px-5 py-4 hidden md:table-cell">
                        {c.status === 'active' && daysLeft <= 95 && daysLeft > 0 ? (
                          <div className="flex items-center gap-1" title="Renewal sequence: 90d / 60d / 30d / 7d">
                            {[
                              { label: '90d', sent: daysLeft <= 90 },
                              { label: '60d', sent: daysLeft <= 60 },
                              { label: '30d', sent: daysLeft <= 30 },
                              { label: '7d',  sent: daysLeft <= 7  },
                            ].map(step => (
                              <span
                                key={step.label}
                                title={`${step.label} touchpoint${step.sent ? ' sent' : ' pending'}`}
                                className={`flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${
                                  step.sent
                                    ? 'bg-green-100 text-green-700 border-green-300'
                                    : 'bg-slate-100 text-slate-400 border-slate-200'
                                }`}
                              >
                                {step.sent && <Mail size={8} />}
                                {step.label}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-300">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell">
                        <span className={`text-xs px-2 py-0.5 rounded font-medium ${c.service_type === 'commercial' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'}`}>
                          {c.service_type === 'commercial' ? 'Comm.' : 'Res.'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_STYLES[c.status]}`}>
                          {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => setEditing(c)} className="p-1.5 text-gray-400 hover:text-brand-greenDark hover:bg-green-50 rounded-lg transition-colors"><Pencil size={14} /></button>
                          {deleteConfirm === c.id ? (
                            <div className="flex items-center gap-1">
                              <button onClick={() => handleDelete(c.id)} className="text-xs bg-red-600 text-white px-2 py-1 rounded-lg hover:bg-red-700">Yes</button>
                              <button onClick={() => setDeleteConfirm(null)} className="text-xs text-gray-400 hover:text-gray-600">No</button>
                            </div>
                          ) : (
                            <button onClick={() => setDeleteConfirm(c.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editing !== null && (
        <ContractModal
          contract={editing === 'new' ? undefined : editing}
          leads={leads}
          onClose={() => setEditing(null)}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
