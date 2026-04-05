'use client'

import { useState, useTransition } from 'react'
import { PlusCircle, X, Loader2, ChevronDown, ChevronUp, CheckCircle2, Clock, XCircle, Star, Send } from 'lucide-react'
import { createRFPAction, updateRFPStatusAction, recordRFPResponseAction } from './actions'
import type { RFPRequest, RFPResponse, Lead } from '@/lib/supabase/queries'

interface Props {
  rfps: (RFPRequest & { responses: RFPResponse[] })[]
  leads: Lead[]
  providerNames: string[]
  locale: string
}

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string; icon: React.ReactNode }> = {
  draft:    { bg: 'bg-gray-100',    text: 'text-gray-600',   label: 'Draft',    icon: <Clock size={11} /> },
  sent:     { bg: 'bg-blue-100',    text: 'text-blue-700',   label: 'Sent',     icon: <Send size={11} /> },
  received: { bg: 'bg-green-100',   text: 'text-green-700',  label: 'Received', icon: <CheckCircle2 size={11} /> },
  closed:   { bg: 'bg-purple-100',  text: 'text-purple-700', label: 'Closed',   icon: <CheckCircle2 size={11} /> },
}

const RESP_STATUS: Record<string, { bg: string; text: string }> = {
  pending:  { bg: 'bg-gray-50',   text: 'text-gray-400'  },
  received: { bg: 'bg-green-50',  text: 'text-green-700' },
  declined: { bg: 'bg-red-50',    text: 'text-red-600'   },
}

function ResponseRow({ resp, usageKwh }: { resp: RFPResponse; usageKwh: number }) {
  const [editing, setEditing] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [form, setForm] = useState({
    plan_name:        resp.plan_name ?? '',
    rate_kwh:         resp.rate_kwh ? String(resp.rate_kwh) : '',
    term_months:      resp.term_months ? String(resp.term_months) : '12',
    cancellation_fee: resp.cancellation_fee ? String(resp.cancellation_fee) : '',
    renewable:        resp.renewable,
    notes:            resp.notes ?? '',
    status:           resp.status,
  })

  const monthlyEst = resp.rate_kwh ? Math.round(resp.rate_kwh * usageKwh) : null
  const st = RESP_STATUS[resp.status]

  function handleSave() {
    startTransition(async () => {
      await recordRFPResponseAction(resp.id, {
        plan_name:        form.plan_name || null,
        rate_kwh:         parseFloat(form.rate_kwh) || null,
        term_months:      parseInt(form.term_months) || null,
        cancellation_fee: parseFloat(form.cancellation_fee) || null,
        renewable:        form.renewable,
        notes:            form.notes || null,
        status:           form.status as RFPResponse['status'],
      })
      setEditing(false)
    })
  }

  if (editing) {
    return (
      <div className={`rounded-xl p-3 border-2 border-brand-green ${st.bg}`}>
        <p className="text-xs font-semibold text-gray-700 mb-2">{resp.provider_name}</p>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <input placeholder="Plan name" value={form.plan_name} onChange={e => setForm(f => ({ ...f, plan_name: e.target.value }))}
            className="col-span-2 text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-green" />
          <input type="number" placeholder="Rate ¢/kWh" step="0.001" value={form.rate_kwh} onChange={e => setForm(f => ({ ...f, rate_kwh: e.target.value }))}
            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-green" />
          <input type="number" placeholder="Term (mo)" value={form.term_months} onChange={e => setForm(f => ({ ...f, term_months: e.target.value }))}
            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-green" />
          <input type="number" placeholder="Cancel fee $" value={form.cancellation_fee} onChange={e => setForm(f => ({ ...f, cancellation_fee: e.target.value }))}
            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-green" />
          <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as RFPResponse['status'] }))}
            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-green">
            <option value="pending">Pending</option>
            <option value="received">Received</option>
            <option value="declined">Declined</option>
          </select>
        </div>
        <label className="flex items-center gap-1.5 text-xs text-gray-600 mb-2">
          <input type="checkbox" checked={form.renewable} onChange={e => setForm(f => ({ ...f, renewable: e.target.checked }))} />
          100% Renewable
        </label>
        <input placeholder="Notes" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
          className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 mb-2 focus:outline-none focus:ring-1 focus:ring-brand-green" />
        <div className="flex gap-2">
          <button onClick={() => setEditing(false)} className="flex-1 text-xs border border-gray-200 rounded-lg py-1.5 text-gray-600">Cancel</button>
          <button onClick={handleSave} disabled={isPending} className="flex-1 text-xs bg-brand-greenDark text-white rounded-lg py-1.5 hover:bg-brand-green disabled:opacity-50 flex items-center justify-center gap-1">
            {isPending ? <Loader2 size={11} className="animate-spin" /> : 'Save'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`rounded-xl p-3 cursor-pointer hover:shadow-sm transition-shadow ${st.bg}`} onClick={() => setEditing(true)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-700">{resp.provider_name}</p>
          {resp.plan_name && <p className="text-xs text-gray-500">{resp.plan_name}</p>}
        </div>
        {resp.status === 'declined' && <XCircle size={14} className="text-red-400 flex-shrink-0" />}
        {resp.status === 'pending'  && <Clock size={14} className="text-gray-300 flex-shrink-0" />}
      </div>
      {resp.status === 'received' && resp.rate_kwh ? (
        <div className="mt-1.5">
          <p className="text-base font-bold text-green-700">
            {(resp.rate_kwh * 100).toFixed(2)}¢/kWh
            {monthlyEst && <span className="text-xs font-normal text-gray-500 ml-1">≈ ${monthlyEst}/mo</span>}
          </p>
          <p className="text-xs text-gray-400">
            {resp.term_months ? `${resp.term_months}mo` : '—'}
            {resp.cancellation_fee ? ` · $${resp.cancellation_fee} cancel fee` : ' · No cancel fee'}
            {resp.renewable ? ' · 🌱' : ''}
          </p>
        </div>
      ) : resp.status === 'declined' ? (
        <p className="text-xs text-gray-400 mt-1">{resp.notes ?? 'No product available'}</p>
      ) : (
        <p className="text-xs text-gray-300 mt-1 italic">Awaiting response — click to enter</p>
      )}
    </div>
  )
}

function RFPCard({ rfp, locale }: { rfp: Props['rfps'][number]; locale: string }) {
  const [expanded, setExpanded] = useState(rfp.responses.some(r => r.status !== 'pending'))
  const [isPending, startTransition] = useTransition()

  const received = rfp.responses.filter(r => r.status === 'received')
  const bestResponse = received.length > 0
    ? received.reduce((a, b) => (a.rate_kwh ?? 999) < (b.rate_kwh ?? 999) ? a : b)
    : null
  const st = STATUS_STYLES[rfp.status]

  function closeRFP() {
    startTransition(() => updateRFPStatusAction(rfp.id, 'closed'))
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 text-sm truncate">{rfp.title}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {rfp.usage_kwh.toLocaleString()} kWh/mo · ZIP {rfp.zip ?? '—'} ·{' '}
              {rfp.service_type === 'commercial' ? 'Commercial' : 'Residential'}
            </p>
          </div>
          <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ${st.bg} ${st.text}`}>
            {st.icon}{st.label}
          </span>
        </div>

        {/* Summary row */}
        <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
          <span>{rfp.responses.length} providers</span>
          <span>{received.length} responded</span>
          {rfp.responses.filter(r => r.status === 'declined').length > 0 && (
            <span className="text-red-400">{rfp.responses.filter(r => r.status === 'declined').length} declined</span>
          )}
        </div>

        {/* Best rate highlight */}
        {bestResponse && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-3 flex items-center gap-3">
            <Star size={14} className="text-green-500 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-green-700">Best rate: {bestResponse.provider_name}</p>
              <p className="text-xs text-green-600">
                {bestResponse.rate_kwh ? `${(bestResponse.rate_kwh * 100).toFixed(2)}¢/kWh` : '—'} ·{' '}
                ≈ ${bestResponse.rate_kwh ? Math.round(bestResponse.rate_kwh * rfp.usage_kwh) : '—'}/mo
              </p>
            </div>
            {rfp.lead_id && (
              <a
                href={`/${locale}/crm/proposals?leadId=${rfp.lead_id}&usage=${rfp.usage_kwh}`}
                className="ml-auto text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors font-medium whitespace-nowrap"
              >
                Build Proposal →
              </a>
            )}
          </div>
        )}

        {rfp.notes && (
          <p className="text-xs text-gray-400 italic mb-3">{rfp.notes}</p>
        )}

        <div className="flex items-center justify-between">
          <button
            onClick={() => setExpanded(v => !v)}
            className="text-xs text-brand-green hover:text-brand-greenDark flex items-center gap-1"
          >
            {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            {expanded ? 'Hide' : 'Show'} responses
          </button>
          {rfp.status !== 'closed' && (
            <button
              onClick={closeRFP}
              disabled={isPending}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              {isPending ? <Loader2 size={12} className="animate-spin" /> : 'Close RFP'}
            </button>
          )}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-50 p-5 bg-gray-50/50">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Provider Responses</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {rfp.responses.map(r => (
              <ResponseRow key={r.id} resp={r} usageKwh={rfp.usage_kwh} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function NewRFPModal({ leads, providerNames, onClose }: {
  leads: Lead[]
  providerNames: string[]
  onClose: () => void
}) {
  const [isPending, startTransition] = useTransition()
  const [form, setForm] = useState({
    lead_id:      '',
    title:        '',
    service_type: 'residential' as 'residential' | 'commercial',
    usage_kwh:    '1200',
    zip:          '',
    notes:        '',
    providers:    [] as string[],
  })

  function toggleProvider(name: string) {
    setForm(f => ({
      ...f,
      providers: f.providers.includes(name) ? f.providers.filter(p => p !== name) : [...f.providers, name],
    }))
  }

  function handleLeadChange(leadId: string) {
    const lead = leads.find(l => l.id === leadId)
    setForm(f => ({
      ...f,
      lead_id:      leadId,
      service_type: lead?.service_type ?? f.service_type,
      zip:          lead?.zip ?? f.zip,
      title:        lead ? `${lead.name} — Rate RFP` : f.title,
    }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.providers.length === 0) { alert('Select at least one provider'); return }
    startTransition(async () => {
      await createRFPAction({
        lead_id:      form.lead_id || null,
        title:        form.title,
        service_type: form.service_type,
        usage_kwh:    parseInt(form.usage_kwh) || 1200,
        zip:          form.zip || null,
        notes:        form.notes || null,
        providers:    form.providers,
      })
      onClose()
    })
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-gray-900 text-lg">New Rate RFP</h3>
          <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Lead (optional)</label>
            <select value={form.lead_id} onChange={e => handleLeadChange(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green">
              <option value="">— select lead —</option>
              {leads.map(l => <option key={l.id} value={l.id}>{l.name} ({l.zip})</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">RFP Title *</label>
            <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Hoa Restaurant — Commercial Rate RFP"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Service Type</label>
              <select value={form.service_type} onChange={e => setForm(f => ({ ...f, service_type: e.target.value as 'residential' | 'commercial' }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green">
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Monthly Usage (kWh)</label>
              <input type="number" min="100" required value={form.usage_kwh} onChange={e => setForm(f => ({ ...f, usage_kwh: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">ZIP Code</label>
            <input value={form.zip} onChange={e => setForm(f => ({ ...f, zip: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-2">
              Send to Providers * <span className="text-gray-400 font-normal">(select all that apply)</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {providerNames.map(name => (
                <label key={name} className={`flex items-center gap-2 text-sm px-3 py-2 rounded-xl border cursor-pointer transition-colors ${
                  form.providers.includes(name)
                    ? 'border-brand-green bg-green-50 text-green-800'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}>
                  <input type="checkbox" className="sr-only" checked={form.providers.includes(name)} onChange={() => toggleProvider(name)} />
                  <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                    form.providers.includes(name) ? 'bg-brand-greenDark border-brand-greenDark' : 'border-gray-300'
                  }`}>
                    {form.providers.includes(name) && <svg viewBox="0 0 12 12" className="w-2.5 h-2.5 text-white fill-current"><path d="M10 3L5 8.5 2 5.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </div>
                  <span className="truncate">{name}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Notes</label>
            <textarea rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green resize-none" />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={isPending} className="flex-1 bg-brand-greenDark text-white rounded-xl py-2.5 text-sm hover:bg-brand-green disabled:opacity-50 flex items-center justify-center gap-2 font-medium">
              {isPending ? <Loader2 size={15} className="animate-spin" /> : <Send size={14} />}
              {isPending ? 'Creating…' : 'Send RFP'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function RFPClient({ rfps, leads, providerNames, locale }: Props) {
  const [showModal, setShowModal] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filtered = statusFilter === 'all' ? rfps : rfps.filter(r => r.status === statusFilter)

  const counts = {
    sent:     rfps.filter(r => r.status === 'sent').length,
    received: rfps.filter(r => r.status === 'received').length,
    open:     rfps.filter(r => !['closed'].includes(r.status)).length,
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rate RFPs</h1>
          <p className="text-gray-500 text-sm mt-1">
            {counts.open} open · {counts.sent} awaiting response · {counts.received} with responses
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-brand-greenDark text-white px-4 py-2.5 rounded-xl hover:bg-brand-green transition-colors font-medium text-sm"
        >
          <PlusCircle size={16} />
          New RFP
        </button>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 mb-5">
        {(['all', 'draft', 'sent', 'received', 'closed'] as const).map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors capitalize ${
              statusFilter === s ? 'bg-brand-greenDark text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-brand-green'
            }`}
          >
            {s === 'all' ? `All (${rfps.length})` : s}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-16 text-center text-gray-400">
          <Send size={40} className="mx-auto mb-3 opacity-30" />
          <p>No RFPs found</p>
          <button onClick={() => setShowModal(true)} className="mt-2 text-sm text-brand-green hover:underline">
            Create your first RFP →
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(rfp => (
            <RFPCard key={rfp.id} rfp={rfp} locale={locale} />
          ))}
        </div>
      )}

      {showModal && (
        <NewRFPModal
          leads={leads}
          providerNames={providerNames}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}
