'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Link2, Search, AlertCircle, X } from 'lucide-react'
import type { Deal } from '@/lib/supabase/queries'

interface Lead {
  id: string
  name: string
  email: string | null
  phone: string | null
  service_address: string | null
}

interface Props {
  deals: Deal[]
  leads: Lead[]
  locale: string
}

export default function UnlinkedDealsPanel({ deals, leads, locale }: Props) {
  const [linkingDeal, setLinkingDeal] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const unlinked = deals.filter(d => !d.lead_id)

  const filtered = search.length < 2 ? leads.slice(0, 10) : leads.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    (l.email ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (l.service_address ?? '').toLowerCase().includes(search.toLowerCase())
  ).slice(0, 20)

  function handleLink(dealId: string, leadId: string) {
    startTransition(async () => {
      const { updateDealAction } = await import('./actions')
      await updateDealAction(dealId, { lead_id: leadId } as Parameters<typeof updateDealAction>[1])
      setLinkingDeal(null)
      setSearch('')
      router.refresh()
    })
  }

  if (unlinked.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
        <p className="text-green-600 font-medium text-sm">All deals are linked to contacts.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
        <AlertCircle size={15} />
        <p className="text-sm font-medium">{unlinked.length} deals have no linked contact</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['Deal', 'Stage', 'Value', 'Assigned To', 'Action'].map(h => (
                <th key={h} className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {unlinked.map(deal => (
              <tr key={deal.id} className="hover:bg-gray-50/50">
                <td className="px-4 py-3">
                  <a href={`/${locale}/crm/deals/${deal.id}`} className="text-sm font-medium text-gray-900 hover:text-brand-green">
                    {deal.title}
                  </a>
                  {deal.service_address && (
                    <p className="text-xs text-gray-400 truncate max-w-[200px]">{deal.service_address}</p>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs capitalize text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{deal.stage}</span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">${deal.value.toLocaleString()}</td>
                <td className="px-4 py-3 text-xs text-gray-500">{deal.assigned_to?.split('@')[0] ?? '—'}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => { setLinkingDeal(deal.id); setSearch('') }}
                    className="flex items-center gap-1.5 text-xs border border-gray-200 text-gray-600 px-2.5 py-1.5 rounded-lg hover:bg-gray-50"
                  >
                    <Link2 size={11} />
                    Link Contact
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Link modal */}
      {linkingDeal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Link to Contact</h2>
              <button onClick={() => setLinkingDeal(null)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
            </div>

            <div className="relative mb-3">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                autoFocus
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name, email, or address…"
                className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
              />
            </div>

            <div className="max-h-64 overflow-y-auto space-y-1">
              {filtered.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">No contacts found</p>
              )}
              {filtered.map(lead => (
                <button
                  key={lead.id}
                  onClick={() => handleLink(linkingDeal, lead.id)}
                  disabled={isPending}
                  className="w-full text-left p-3 rounded-xl border border-gray-100 hover:bg-brand-green/5 hover:border-brand-green/30 transition-colors disabled:opacity-50"
                >
                  <p className="text-sm font-medium text-gray-900">{lead.name}</p>
                  <p className="text-xs text-gray-400">{lead.email}{lead.service_address ? ` · ${lead.service_address}` : ''}</p>
                </button>
              ))}
            </div>

            <p className="text-xs text-gray-400 mt-3">{leads.length} total contacts · {search.length < 2 ? 'showing first 10' : `${filtered.length} matches`}</p>
          </div>
        </div>
      )}
    </div>
  )
}
