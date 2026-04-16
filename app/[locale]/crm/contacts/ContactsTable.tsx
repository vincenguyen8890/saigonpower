'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, Download, SlidersHorizontal, UserPlus, Mail, Phone, ChevronLeft, ChevronRight, X, PlusCircle, TrendingUp, Trash2 } from 'lucide-react'
import type { Lead, CRMAgent } from '@/lib/supabase/queries'
import type { Provider } from '@/data/mock-crm'
import { formatDate } from '@/lib/utils'
import { createDeal } from '../deals/actions'
import { deleteCustomerAction, bulkUpdateAccountStatusAction } from './actions'
import type { Deal } from '@/lib/supabase/queries'
import ImportModal from './ImportModal'

interface Props {
  contacts: Lead[]
  locale: string
  currentUserEmail: string
  agents: CRMAgent[]
  providers: Provider[]
  isAdmin: boolean
  initialSearch?: string
}

const AVATAR_COLORS = [
  'bg-blue-500', 'bg-purple-500', 'bg-emerald-500', 'bg-red-500',
  'bg-amber-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500',
  'bg-orange-500', 'bg-cyan-500',
]

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

function getAvatarColor(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

const STATUS_STYLES: Record<string, string> = {
  new:       'bg-blue-50 text-blue-700',
  contacted: 'bg-amber-50 text-amber-700',
  quoted:    'bg-purple-50 text-purple-700',
  enrolled:  'bg-green-50 text-green-700',
  lost:      'bg-red-100 text-red-600',
}

const PRODUCT_TYPES = ['FIXED RATE', 'VARIABLE', 'INDEX', 'PREPAID', 'FREE NIGHTS', 'FREE WEEKENDS']

const PER_PAGE = 50
type View = 'all' | 'mine' | 'unassigned'

// ─── Quick Deal Modal ─────────────────────────────────────────────────────────
function QuickDealModal({
  contact, locale, agents, providers, onClose,
}: {
  contact: Lead
  locale: string
  agents: CRMAgent[]
  providers: Provider[]
  onClose: () => void
}) {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState('')

  const C = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green'
  const L = 'block text-xs font-medium text-gray-600 mb-1'

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const get = (name: string) => (form.elements.namedItem(name) as HTMLInputElement)?.value ?? ''

    setError('')
    setIsPending(true)
    try {
      const res = await createDeal({
        title:               get('title'),
        lead_id:             contact.id,
        value:               0,
        stage:               get('stage') as Deal['stage'],
        probability:         50,
        expected_close:      get('expected_close') || null,
        provider:            get('provider') || null,
        plan_name:           get('plan_name') || null,
        service_type:        (contact.service_type as 'residential' | 'commercial') || null,
        notes:               get('notes') || null,
        assigned_to:         get('assigned_to') || null,
        service_order:       get('service_order') || null,
        agent_code:          null,
        service_address:     get('service_address') || null,
        service_city:        get('service_city') || null,
        service_state:       get('service_state') || null,
        service_zip:         get('service_zip') || null,
        esid:                get('esid') || null,
        contract_start_date: get('contract_start_date') || null,
        contract_end_date:   get('contract_end_date') || null,
        rate_kwh:            Number(get('rate_kwh')) || null,
        adder_kwh:           Number(get('adder_kwh')) || null,
        term_months:         Number(get('term_months')) || null,
        product_type:        get('product_type') || null,
        usage_kwh:           Number(get('usage_kwh')) || null,
        flags:               null,
        deal_type:           null,
      })
      if (res.error) { setError(res.error); return }
      router.refresh()
      onClose()
      router.push(`/${locale}/crm/deals`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error.')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div>
            <h2 className="font-semibold text-gray-900">New Deal</h2>
            <p className="text-xs text-gray-400 mt-0.5">Customer: <span className="font-medium text-gray-600">{contact.name}</span></p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">

          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className={L}>Deal Title *</label>
              <input name="title" required
                defaultValue={`${contact.name} – ${contact.service_type === 'commercial' ? 'Commercial' : 'Residential'}`}
                className={C} />
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
              <input value={contact.service_type === 'commercial' ? 'Commercial' : 'Residential'} readOnly className={C + ' bg-gray-50'} />
              <input type="hidden" name="service_type" value={contact.service_type} />
            </div>
          </div>

          {/* Contract Details */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Contract Details</p>
            <div className="grid grid-cols-2 gap-3">
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
                <label className={L}>Product Type</label>
                <select name="product_type" defaultValue="" className={C}>
                  <option value="">— Select —</option>
                  {PRODUCT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className={L}>Contract Term (months)</label>
                <input name="term_months" type="number" min="0" placeholder="12" className={C} />
              </div>
              <div>
                <label className={L}>Contract Rate ($/kWh)</label>
                <input name="rate_kwh" type="number" step="0.00001" min="0" placeholder="0.109" className={C} />
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
                <input name="contract_start_date" type="date" className={C} />
              </div>
              <div>
                <label className={L}>Contract End Date</label>
                <input name="contract_end_date" type="date" className={C} />
              </div>
            </div>
          </div>

          {/* Property */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Property</p>
            <div className="space-y-3">
              <div>
                <label className={L}>Service Address</label>
                <input name="service_address" placeholder="123 Main St, Houston TX 77036" className={C} />
              </div>
              <div>
                <label className={L}>ESI ID</label>
                <input name="esid" placeholder="10089010238183693001" className={C} />
              </div>
            </div>
          </div>

          {/* Assignment */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Assignment</p>
            <div className="space-y-3">
              <div>
                <label className={L}>Sales Agent</label>
                <select name="assigned_to" defaultValue="" className={C}>
                  <option value="">— Unassigned —</option>
                  {agents.filter(a => a.active).map(a => (
                    <option key={a.id} value={a.email}>{a.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={L}>Notes</label>
                <textarea name="notes" rows={3} className={C.replace('py-2.5','py-2') + ' resize-none'} placeholder="Additional notes..." />
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isPending}
              className="flex-1 bg-brand-greenDark text-white py-2.5 rounded-xl text-sm hover:bg-brand-green transition-colors disabled:opacity-50 font-medium">
              {isPending ? 'Creating...' : 'Create Deal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Main Table ───────────────────────────────────────────────────────────────
export default function ContactsTable({ contacts, locale, currentUserEmail, agents, providers, isAdmin, initialSearch = '' }: Props) {
  const [view,         setView]         = useState<View>('all')
  const [search,       setSearch]       = useState(initialSearch)
  const [selected,     setSelected]     = useState<Set<string>>(new Set())
  const [page,         setPage]         = useState(1)
  const [statusFilter, setStatusFilter] = useState('all')
  const [showFilters,  setShowFilters]  = useState(false)
  const [dealContact,  setDealContact]  = useState<Lead | null>(null)
  const [deleteConfirm, setDeleteConfirm]   = useState<string | null>(null)
  const [deleting,      setDeleting]        = useState<string | null>(null)
  const [bulkPending,   setBulkPending]     = useState(false)

  const byView = useMemo(() => {
    if (view === 'mine')       return contacts.filter(c => c.assigned_to === currentUserEmail)
    if (view === 'unassigned') return contacts.filter(c => !c.assigned_to)
    return contacts
  }, [contacts, view, currentUserEmail])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return byView.filter(c => {
      if (statusFilter !== 'all' && c.status !== statusFilter) return false
      if (!q) return true
      return (
        c.name.toLowerCase().includes(q) ||
        (c.email || '').toLowerCase().includes(q) ||
        (c.phone || '').includes(q) ||
        (c.zip || '').includes(q)
      )
    })
  }, [byView, search, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const pageStart  = (page - 1) * PER_PAGE
  const pageRows   = filtered.slice(pageStart, pageStart + PER_PAGE)

  const allPageSelected = pageRows.length > 0 && pageRows.every(r => selected.has(r.id))
  function toggleAll() {
    if (allPageSelected) {
      setSelected(prev => { const s = new Set(prev); pageRows.forEach(r => s.delete(r.id)); return s })
    } else {
      setSelected(prev => { const s = new Set(prev); pageRows.forEach(r => s.add(r.id)); return s })
    }
  }
  function toggleOne(id: string) {
    setSelected(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s })
  }

  const viewCounts = {
    all:        contacts.length,
    mine:       contacts.filter(c => c.assigned_to === currentUserEmail).length,
    unassigned: contacts.filter(c => !c.assigned_to).length,
  }

  const statusOptions = ['all','new','contacted','quoted','enrolled','lost']

  async function handleDelete(id: string) {
    setDeleting(id)
    await deleteCustomerAction(id)
    setDeleteConfirm(null)
    setDeleting(null)
  }

  async function handleBulkStatus(status: 'active' | 'inactive' | 'switch_away') {
    if (selected.size === 0) return
    setBulkPending(true)
    await bulkUpdateAccountStatusAction(Array.from(selected), status)
    setSelected(new Set())
    setBulkPending(false)
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-500 text-sm mt-0.5">{filtered.length.toLocaleString()} customers</p>
        </div>
        <Link
          href={`/${locale}/crm/leads`}
          className="flex items-center gap-2 bg-brand-greenDark text-white text-sm px-4 py-2.5 rounded-xl hover:bg-brand-green transition-colors font-medium"
        >
          <UserPlus size={15} />
          Add Customer
        </Link>
      </div>

      {/* View tabs */}
      <div className="flex items-center gap-1 mb-4 border-b border-gray-200">
        {(['all', 'mine', 'unassigned'] as View[]).map(v => (
          <button
            key={v}
            onClick={() => { setView(v); setPage(1) }}
            className={`relative px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap ${
              view === v
                ? 'text-brand-greenDark border-b-2 border-brand-greenDark -mb-px'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {v === 'all' ? 'All customers' : v === 'mine' ? 'My customers' : 'Unassigned'}
            <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full font-medium ${
              view === v ? 'bg-brand-greenDark text-white' : 'bg-gray-100 text-gray-500'
            }`}>
              {viewCounts[v].toLocaleString()}
            </span>
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search customers..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green bg-white"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
              <X size={14} />
            </button>
          )}
        </div>

        <button
          onClick={() => setShowFilters(v => !v)}
          className={`flex items-center gap-1.5 text-sm px-3 py-2 rounded-xl border transition-colors ${
            showFilters ? 'bg-brand-greenDark text-white border-brand-greenDark' : 'border-gray-200 text-gray-600 hover:border-gray-300 bg-white'
          }`}
        >
          <SlidersHorizontal size={14} />
          Filters
        </button>

        <div className="ml-auto flex items-center gap-2 flex-wrap">
          {selected.size > 0 && (
            <>
              <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1.5 rounded-lg font-medium">
                {selected.size} selected
              </span>
              <span className="text-xs text-gray-400">Set status:</span>
              {(['active', 'inactive', 'switch_away'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => handleBulkStatus(s)}
                  disabled={bulkPending}
                  className={`text-xs px-2.5 py-1.5 rounded-lg font-medium border transition-colors disabled:opacity-50 ${
                    s === 'active'      ? 'border-green-200 text-green-700 hover:bg-green-50' :
                    s === 'inactive'    ? 'border-gray-200 text-gray-600 hover:bg-gray-50' :
                                         'border-amber-200 text-amber-700 hover:bg-amber-50'
                  }`}
                >
                  {s === 'switch_away' ? 'Switch Away' : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </>
          )}
          <ImportModal />
          <a
            href="/api/crm/leads/export"
            className="flex items-center gap-1.5 text-sm border border-gray-200 text-gray-600 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors bg-white"
          >
            <Download size={14} />
            Export
          </a>
        </div>
      </div>

      {/* Expanded filters */}
      {showFilters && (
        <div className="bg-white border border-gray-200 rounded-xl p-3 mb-3 flex flex-wrap gap-2 items-center">
          <span className="text-xs font-medium text-gray-500">Status:</span>
          {statusOptions.map(s => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1) }}
              className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors capitalize ${
                statusFilter === s ? 'bg-brand-greenDark text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>
      )}

      {/* Mobile card list */}
      <div className="sm:hidden bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden divide-y divide-gray-50">
        {pageRows.length === 0 ? (
          <p className="text-center py-16 text-gray-400 text-sm">No customers found</p>
        ) : pageRows.map(contact => {
          const initials = getInitials(contact.name)
          const avatarBg = getAvatarColor(contact.name)
          return (
            <div key={contact.id} className="flex items-center gap-3 px-4 py-3.5">
              <div className={`w-10 h-10 rounded-full ${avatarBg} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <Link href={`/${locale}/crm/leads/${contact.id}`} className="text-[13px] font-semibold text-blue-600 hover:underline truncate block">
                  {contact.name}
                </Link>
                <p className="text-[11px] text-gray-400 mt-0.5">{contact.phone || contact.email || '—'}</p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                  contact.service_type === 'commercial' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'
                }`}>
                  {contact.service_type === 'commercial' ? 'Comm' : 'Res'}
                </span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium capitalize ${STATUS_STYLES[contact.status] ?? STATUS_STYLES.new}`}>
                  {contact.status}
                </span>
                <button
                  onClick={() => setDealContact(contact)}
                  className="text-xs bg-brand-greenDark text-white px-2 py-1 rounded-lg font-medium"
                >
                  Deal
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-100 bg-gray-50/60">
              <tr>
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={allPageSelected}
                    onChange={toggleAll}
                    className="rounded border-gray-300 text-brand-greenDark focus:ring-brand-green"
                  />
                </th>
                {['First Name', 'Last Name', 'Email', 'Phone Number', 'ZIP', 'Service', 'Status', 'Create Date'].map((h, i) => (
                  <th key={i} className={`text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-3 ${
                    i === 2 ? 'hidden md:table-cell' :
                    i === 3 ? 'hidden sm:table-cell' :
                    i >= 4 ? 'hidden lg:table-cell' : ''
                  }`}>
                    {h}
                  </th>
                ))}
                <th className="px-4 py-3 w-24 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {pageRows.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-16 text-gray-400 text-sm">
                    No customers found
                  </td>
                </tr>
              ) : pageRows.map(contact => {
                const initials   = getInitials(contact.name)
                const avatarBg   = getAvatarColor(contact.name)
                const isSelected = selected.has(contact.id)

                return (
                  <tr
                    key={contact.id}
                    className={`hover:bg-gray-50/60 transition-colors group ${isSelected ? 'bg-blue-50/40' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleOne(contact.id)}
                        className="rounded border-gray-300 text-brand-greenDark focus:ring-brand-green"
                      />
                    </td>

                    {/* First Name */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-full ${avatarBg} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                          {initials}
                        </div>
                        <div>
                          <Link
                            href={`/${locale}/crm/leads/${contact.id}`}
                            className="text-sm font-medium text-blue-600 hover:underline"
                          >
                            {contact.name.includes(' ') ? contact.name.split(' ').slice(0, -1).join(' ') : contact.name}
                          </Link>
                          <p className="text-xs text-gray-400">
                            {contact.customer_id ?? '—'}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Last Name */}
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-800">
                        {contact.name.includes(' ') ? contact.name.split(' ').slice(-1)[0] : ''}
                      </span>
                    </td>

                    {/* Email */}
                    <td className="px-4 py-3 hidden md:table-cell">
                      {contact.email ? (
                        <a href={`mailto:${contact.email}`} className="flex items-center gap-1 text-sm text-blue-600 hover:underline max-w-[180px] truncate group/email">
                          <span className="truncate">{contact.email}</span>
                          <Mail size={11} className="opacity-0 group-hover/email:opacity-100 flex-shrink-0 transition-opacity" />
                        </a>
                      ) : <span className="text-gray-300 text-sm">—</span>}
                    </td>

                    {/* Phone */}
                    <td className="px-4 py-3 hidden sm:table-cell">
                      {contact.phone ? (
                        <a href={`tel:${contact.phone}`} className="flex items-center gap-1 text-sm text-blue-600 hover:underline">
                          <Phone size={11} className="flex-shrink-0" />
                          {contact.phone}
                        </a>
                      ) : <span className="text-gray-300 text-sm">—</span>}
                    </td>

                    {/* ZIP */}
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-sm text-gray-600">{contact.zip}</span>
                    </td>

                    {/* Service */}
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                        contact.service_type === 'commercial' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'
                      }`}>
                        {contact.service_type === 'commercial' ? 'Commercial' : 'Residential'}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${STATUS_STYLES[contact.status] ?? STATUS_STYLES.new}`}>
                        {contact.status}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-xs text-gray-500">{formatDate(contact.created_at, locale)}</span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setDealContact(contact)}
                          className="flex items-center gap-1 text-xs bg-brand-greenDark text-white px-2.5 py-1.5 rounded-lg hover:bg-brand-green transition-colors font-medium"
                          title="Create deal"
                        >
                          <PlusCircle size={11} />
                          Deal
                        </button>
                        <Link
                          href={`/${locale}/crm/leads/${contact.id}`}
                          className="text-xs text-brand-green hover:text-brand-greenDark font-medium"
                        >
                          View
                        </Link>
                        {isAdmin && (
                          deleteConfirm === contact.id ? (
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-red-600 font-medium">Delete?</span>
                              <button
                                onClick={() => handleDelete(contact.id)}
                                disabled={deleting === contact.id}
                                className="text-xs bg-red-600 text-white px-2 py-1 rounded-lg hover:bg-red-700 disabled:opacity-50"
                              >
                                Yes
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(null)}
                                className="text-xs text-gray-400 hover:text-gray-600 px-1"
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirm(contact.id)}
                              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete customer"
                            >
                              <Trash2 size={13} />
                            </button>
                          )
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50/40">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={15} />
            </button>
            <span className="text-xs text-gray-600">
              Page <strong>{page}</strong> of <strong>{totalPages}</strong>
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={15} />
            </button>
          </div>
          <span className="text-xs text-gray-400">
            {pageStart + 1}–{Math.min(pageStart + PER_PAGE, filtered.length)} of {filtered.length.toLocaleString()}
            {' '}· {PER_PAGE} per page
          </span>
        </div>
      </div>

      {/* Quick Deal Modal */}
      {dealContact && (
        <QuickDealModal
          contact={dealContact}
          locale={locale}
          agents={agents}
          providers={providers}
          onClose={() => setDealContact(null)}
        />
      )}
    </div>
  )
}
