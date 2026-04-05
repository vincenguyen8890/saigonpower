'use client'

import { useState, useTransition } from 'react'
import { X, Loader2 } from 'lucide-react'
import { createPlanAction, updatePlanAction } from './actions'
import type { Plan } from '@/data/mock-crm'
import { mockProviders } from '@/data/mock-crm'

interface Props {
  plan?: Plan        // undefined = create mode
  onClose: () => void
}

const PROVIDERS = mockProviders.filter(p => p.status === 'active')

export default function PlanModal({ plan, onClose }: Props) {
  const isEdit = !!plan
  const [isPending, startTransition] = useTransition()

  const [form, setForm] = useState({
    provider_id:       plan?.provider_id       ?? PROVIDERS[0]?.id ?? '',
    provider_name:     plan?.provider_name     ?? PROVIDERS[0]?.name ?? '',
    name:              plan?.name              ?? '',
    rate_kwh:          plan?.rate_kwh          ?? 0.109,
    term_months:       plan?.term_months       ?? 12,
    service_type:      plan?.service_type      ?? 'residential',
    cancellation_fee:  plan?.cancellation_fee  ?? null,
    renewable:         plan?.renewable         ?? false,
    promo:             plan?.promo             ?? '',
    status:            plan?.status            ?? 'active',
  })

  function handleProviderChange(id: string) {
    const prov = PROVIDERS.find(p => p.id === id)
    setForm(f => ({ ...f, provider_id: id, provider_name: prov?.name ?? '' }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const payload = {
      ...form,
      rate_kwh:         Number(form.rate_kwh),
      term_months:      Number(form.term_months),
      cancellation_fee: form.cancellation_fee !== null ? Number(form.cancellation_fee) : null,
      promo:            form.promo.trim() || null,
      service_type:     form.service_type as Plan['service_type'],
      status:           form.status as Plan['status'],
    }
    startTransition(async () => {
      if (isEdit) {
        await updatePlanAction(plan.id, payload)
      } else {
        await createPlanAction(payload)
      }
      onClose()
    })
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">
            {isEdit ? 'Edit Plan' : 'Add New Plan'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Provider */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Provider</label>
            <select
              value={form.provider_id}
              onChange={e => handleProviderChange(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
              required
            >
              {PROVIDERS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          {/* Plan name */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Plan Name</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Gexa Saver 12"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
              required
            />
          </div>

          {/* Rate + Term */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Rate ($/kWh)</label>
              <input
                type="number"
                step="0.001"
                min="0.05"
                max="0.50"
                value={form.rate_kwh}
                onChange={e => setForm(f => ({ ...f, rate_kwh: parseFloat(e.target.value) }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
                required
              />
              <p className="text-xs text-gray-400 mt-1">
                {form.rate_kwh ? `${(Number(form.rate_kwh) * 100).toFixed(2)}¢/kWh` : ''}
              </p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Term (months)</label>
              <input
                type="number"
                min="0"
                max="60"
                value={form.term_months}
                onChange={e => setForm(f => ({ ...f, term_months: parseInt(e.target.value) }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
                required
              />
              <p className="text-xs text-gray-400 mt-1">0 = prepaid</p>
            </div>
          </div>

          {/* Service type + Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Service Type</label>
              <select
                value={form.service_type}
                onChange={e => setForm(f => ({ ...f, service_type: e.target.value as Plan['service_type'] }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
              >
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
              <select
                value={form.status}
                onChange={e => setForm(f => ({ ...f, status: e.target.value as Plan['status'] }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Cancel fee */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Cancellation Fee ($) <span className="text-gray-400 font-normal">— leave blank for none</span>
            </label>
            <input
              type="number"
              min="0"
              value={form.cancellation_fee ?? ''}
              onChange={e => setForm(f => ({ ...f, cancellation_fee: e.target.value === '' ? null : Number(e.target.value) }))}
              placeholder="e.g. 150"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
            />
          </div>

          {/* Promo */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Promo <span className="text-gray-400 font-normal">— optional</span>
            </label>
            <input
              type="text"
              value={form.promo}
              onChange={e => setForm(f => ({ ...f, promo: e.target.value }))}
              placeholder="e.g. $50 bill credit"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
            />
          </div>

          {/* Renewable */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.renewable}
              onChange={e => setForm(f => ({ ...f, renewable: e.target.checked }))}
              className="accent-green-700 w-4 h-4"
            />
            <span className="text-sm text-gray-700">100% Renewable energy</span>
          </label>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 flex items-center justify-center gap-2 bg-brand-greenDark text-white text-sm py-2.5 rounded-xl hover:bg-brand-green transition-colors disabled:opacity-60"
            >
              {isPending ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : isEdit ? 'Save Changes' : 'Add Plan'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 border border-gray-200 text-gray-600 text-sm py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
