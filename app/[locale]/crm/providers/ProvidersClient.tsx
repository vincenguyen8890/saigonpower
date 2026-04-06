'use client'

import { useState, useTransition } from 'react'
import { Building2, Phone, Globe, Zap, DollarSign, PlusCircle, Pencil, Trash2, X, Loader2 } from 'lucide-react'
import type { Provider } from '@/data/mock-crm'
import { saveProviderAction, deleteProviderAction } from './actions'

interface Props {
  initialProviders: Provider[]
  isAdmin: boolean
}

const EMPTY: Omit<Provider, 'id'> = {
  name: '', short_name: '', website: '', phone: '',
  commission_residential: 75, commission_commercial: 150,
  active_plans: 0, notes: '', status: 'active',
}

function ProviderModal({
  provider, onClose, onSave,
}: { provider?: Provider; onClose: () => void; onSave: (p: Provider) => void }) {
  const isEdit = !!provider
  const [form, setForm] = useState<Omit<Provider, 'id'>>({
    name:                   provider?.name                   ?? '',
    short_name:             provider?.short_name             ?? '',
    website:                provider?.website                ?? '',
    phone:                  provider?.phone                  ?? '',
    commission_residential: provider?.commission_residential ?? 75,
    commission_commercial:  provider?.commission_commercial  ?? 150,
    active_plans:           provider?.active_plans           ?? 0,
    notes:                  provider?.notes                  ?? '',
    status:                 provider?.status                 ?? 'active',
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSave({
      id: isEdit ? provider.id : `prv-${Date.now()}`,
      ...form,
      commission_residential: Number(form.commission_residential),
      commission_commercial:  Number(form.commission_commercial),
      active_plans:           Number(form.active_plans),
    })
  }

  const field = (label: string, key: keyof Omit<typeof form, 'notes' | 'status'>, type = 'text', placeholder = '') => {
    const isCommission = key === 'commission_residential' || key === 'commission_commercial'
    return (
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
        <input
          type={type}
          value={form[key] as string | number}
          onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
          placeholder={placeholder}
          step={isCommission ? '0.0001' : undefined}
          min={type === 'number' ? '0' : undefined}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
          required={['name', 'short_name'].includes(key as string)}
        />
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">
            {isEdit ? 'Edit Provider' : 'Add Provider'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {field('Provider Name', 'name', 'text', 'e.g. Gexa Energy')}
            {field('Short Name', 'short_name', 'text', 'e.g. Gexa')}
          </div>
          {field('Website', 'website', 'text', 'e.g. gexaenergy.com')}
          {field('Phone', 'phone', 'tel', 'e.g. 1-855-639-2727')}

          <div className="grid grid-cols-2 gap-3">
            {field('Residential Commission ($)', 'commission_residential', 'number')}
            {field('Commercial Commission ($)', 'commission_commercial', 'number')}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {field('Active Plans', 'active_plans', 'number')}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
              <select
                value={form.status}
                onChange={e => setForm(f => ({ ...f, status: e.target.value as Provider['status'] }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Notes <span className="text-gray-400 font-normal">— optional</span></label>
            <textarea
              value={form.notes ?? ''}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              rows={2}
              placeholder="e.g. Best residential rates in Houston area"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" className="flex-1 bg-brand-greenDark text-white text-sm py-2.5 rounded-xl hover:bg-brand-green transition-colors">
              {isEdit ? 'Save Changes' : 'Add Provider'}
            </button>
            <button type="button" onClick={onClose} className="px-4 border border-gray-200 text-gray-600 text-sm py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function ProvidersClient({ initialProviders, isAdmin }: Props) {
  const [providers, setProviders] = useState<Provider[]>(initialProviders)
  const [editing, setEditing]     = useState<Provider | null | 'new'>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSave(saved: Provider) {
    // Optimistically update UI
    setProviders(prev => {
      const idx = prev.findIndex(p => p.id === saved.id)
      if (idx !== -1) { const next = [...prev]; next[idx] = saved; return next }
      return [...prev, saved]
    })
    setEditing(null)
    startTransition(async () => {
      const result = await saveProviderAction(saved)
      if (result.error) {
        // Revert optimistic update on error
        setProviders(prev => {
          const idx = prev.findIndex(p => p.id === saved.id)
          if (idx !== -1) { const next = [...prev]; next[idx] = saved; return next }
          return prev
        })
        alert(`Save failed: ${result.error}`)
        return
      }
      // For new providers, replace temp ID with real Supabase ID
      if (result.data && result.data.id !== saved.id) {
        setProviders(prev => prev.map(p => p.id === saved.id ? result.data! : p))
      }
    })
  }

  function handleDelete(id: string) {
    setProviders(prev => prev.filter(p => p.id !== id))
    setDeleteConfirm(null)
    startTransition(() => deleteProviderAction(id))
  }

  const active = providers.filter(p => p.status === 'active')

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Energy Providers</h1>
          <p className="text-gray-500 text-sm mt-1">{active.length} active provider partnerships</p>
        </div>
        <div className="flex items-center gap-3">
          {isPending && (
            <span className="flex items-center gap-1.5 text-xs text-gray-400">
              <Loader2 size={12} className="animate-spin" /> Saving…
            </span>
          )}
          {isAdmin && (
            <button
              onClick={() => setEditing('new')}
              className="flex items-center gap-2 bg-brand-greenDark text-white text-sm px-4 py-2 rounded-xl hover:bg-brand-green transition-colors"
            >
              <PlusCircle size={15} /> Add Provider
            </button>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {providers.map(p => (
          <div key={p.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-greenDark/10 flex items-center justify-center flex-shrink-0">
                  <Zap size={18} className="text-brand-greenDark" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{p.name}</p>
                  <p className="text-xs text-gray-400">{p.short_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  p.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {p.status === 'active' ? 'Active' : 'Inactive'}
                </span>
                {isAdmin && (
                  <div className="flex items-center gap-0.5">
                    <button
                      onClick={() => setEditing(p)}
                      className="p-1.5 text-gray-400 hover:text-brand-greenDark hover:bg-green-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Pencil size={13} />
                    </button>
                    {deleteConfirm === p.id ? (
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleDelete(p.id)} className="text-xs bg-red-600 text-white px-2 py-1 rounded-lg hover:bg-red-700">Yes</button>
                        <button onClick={() => setDeleteConfirm(null)} className="text-xs text-gray-400 hover:text-gray-600">No</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(p.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="bg-green-50 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500 mb-0.5">Res. Commission</p>
                <p className="text-lg font-bold text-green-700">${Number(p.commission_residential).toFixed(4).replace(/\.?0+$/, '') || '0'}</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500 mb-0.5">Comm. Commission</p>
                <p className="text-lg font-bold text-blue-700">
                  {p.commission_commercial > 0 ? `$${Number(p.commission_commercial).toFixed(4).replace(/\.?0+$/, '')}` : '—'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
              <Building2 size={13} />
              <span>{p.active_plans} active plans</span>
            </div>

            <div className="space-y-1.5 pt-3 border-t border-gray-50">
              <a href={`tel:${p.phone}`} className="flex items-center gap-2 text-xs text-gray-500 hover:text-brand-greenDark transition-colors">
                <Phone size={12} />{p.phone}
              </a>
              <a href={`https://${p.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-gray-500 hover:text-brand-greenDark transition-colors">
                <Globe size={12} />{p.website}
              </a>
            </div>

            {p.notes && (
              <p className="text-xs text-gray-400 italic mt-3 pt-3 border-t border-gray-50">{p.notes}</p>
            )}
          </div>
        ))}
      </div>

      {/* Commission summary */}
      <div className="mt-8 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <DollarSign size={16} className="text-brand-green" /> Commission Overview
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {['Provider', 'Residential', 'Commercial', 'Plans'].map((h, i) => (
                  <th key={i} className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide py-2 pr-6">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {active.map(p => (
                <tr key={p.id}>
                  <td className="py-3 pr-6 font-medium text-gray-900">{p.name}</td>
                  <td className="py-3 pr-6 text-green-700 font-semibold">${Number(p.commission_residential).toFixed(4).replace(/\.?0+$/, '') || '0'}</td>
                  <td className="py-3 pr-6 text-blue-700 font-semibold">{p.commission_commercial > 0 ? `$${Number(p.commission_commercial).toFixed(4).replace(/\.?0+$/, '')}` : '—'}</td>
                  <td className="py-3 pr-6 text-gray-500">{p.active_plans}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editing !== null && (
        <ProviderModal
          provider={editing === 'new' ? undefined : editing}
          onClose={() => setEditing(null)}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
