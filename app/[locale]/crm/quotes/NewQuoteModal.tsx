'use client'

import { useState, useTransition } from 'react'
import { X, PlusCircle, Loader2 } from 'lucide-react'
import { createQuoteAction } from './actions'

export default function NewQuoteModal() {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', phone: '', zip: '',
    service_type: 'residential' as 'residential' | 'commercial',
    business_name: '', monthly_usage_kwh: '',
    preferred_language: 'vi' as 'vi' | 'en',
    notes: '',
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      await createQuoteAction({ ...form, name: `${form.first_name} ${form.last_name}`.trim() })
      setOpen(false)
      setForm({ first_name: '', last_name: '', email: '', phone: '', zip: '', service_type: 'residential', business_name: '', monthly_usage_kwh: '', preferred_language: 'vi', notes: '' })
    })
  }

  const inp = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green'

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-brand-greenDark text-white text-sm px-4 py-2 rounded-xl hover:bg-brand-green transition-colors"
      >
        <PlusCircle size={15} /> New Quote
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">New Quote Request</h2>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">First Name <span className="text-red-400">*</span></label>
                  <input type="text" value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} className={inp} required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Last Name <span className="text-red-400">*</span></label>
                  <input type="text" value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} className={inp} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
                  <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="(832) 555-0101" className={inp} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">ZIP <span className="text-red-400">*</span></label>
                  <input type="text" value={form.zip} onChange={e => setForm(f => ({ ...f, zip: e.target.value }))} placeholder="77036" maxLength={5} className={inp} required />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className={inp} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Service Type</label>
                  <select value={form.service_type} onChange={e => setForm(f => ({ ...f, service_type: e.target.value as 'residential' | 'commercial' }))} className={inp}>
                    <option value="residential">Residential</option>
                    <option value="commercial">Commercial</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Language</label>
                  <select value={form.preferred_language} onChange={e => setForm(f => ({ ...f, preferred_language: e.target.value as 'vi' | 'en' }))} className={inp}>
                    <option value="vi">Vietnamese</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>
              {form.service_type === 'commercial' && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Business Name</label>
                  <input type="text" value={form.business_name} onChange={e => setForm(f => ({ ...f, business_name: e.target.value }))} className={inp} />
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Monthly Usage (kWh) <span className="text-gray-400 font-normal">— optional</span></label>
                <input type="number" value={form.monthly_usage_kwh} onChange={e => setForm(f => ({ ...f, monthly_usage_kwh: e.target.value }))} placeholder="1200" className={inp} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} className={`${inp} resize-none`} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={isPending} className="flex-1 flex items-center justify-center gap-2 bg-brand-greenDark text-white text-sm py-2.5 rounded-xl hover:bg-brand-green transition-colors disabled:opacity-60">
                  {isPending ? <><Loader2 size={14} className="animate-spin" /> Creating…</> : 'Create Quote Request'}
                </button>
                <button type="button" onClick={() => setOpen(false)} className="px-4 border border-gray-200 text-gray-600 text-sm py-2.5 rounded-xl hover:bg-gray-50">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
