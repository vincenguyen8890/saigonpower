'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, Download, SlidersHorizontal, UserPlus, Mail, Phone, ChevronLeft, ChevronRight, X } from 'lucide-react'
import type { Lead } from '@/lib/supabase/queries'
import { formatDate } from '@/lib/utils'

interface Props {
  contacts: Lead[]
  locale: string
  currentUserEmail: string
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
  lost:      'bg-gray-100 text-gray-500',
}

const PER_PAGE = 50

type View = 'all' | 'mine' | 'unassigned'

export default function ContactsTable({ contacts, locale, currentUserEmail }: Props) {
  const [view,       setView]       = useState<View>('all')
  const [search,     setSearch]     = useState('')
  const [selected,   setSelected]   = useState<Set<string>>(new Set())
  const [page,       setPage]       = useState(1)
  const [statusFilter, setStatusFilter] = useState('all')
  const [showFilters, setShowFilters] = useState(false)

  // Filter by view
  const byView = useMemo(() => {
    if (view === 'mine')       return contacts.filter(c => c.assigned_to === currentUserEmail)
    if (view === 'unassigned') return contacts.filter(c => !c.assigned_to)
    return contacts
  }, [contacts, view, currentUserEmail])

  // Filter by search + status
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

  // Paginate
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const pageStart  = (page - 1) * PER_PAGE
  const pageRows   = filtered.slice(pageStart, pageStart + PER_PAGE)

  // Selection helpers
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

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
          <p className="text-gray-500 text-sm mt-0.5">{filtered.length.toLocaleString()} contacts</p>
        </div>
        <Link
          href={`/${locale}/crm/leads`}
          className="flex items-center gap-2 bg-brand-greenDark text-white text-sm px-4 py-2.5 rounded-xl hover:bg-brand-green transition-colors font-medium"
        >
          <UserPlus size={15} />
          Add Contact
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
            {v === 'all' ? 'All contacts' : v === 'mine' ? 'My contacts' : 'Unassigned contacts'}
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
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search contacts..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green bg-white"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filter toggle */}
        <button
          onClick={() => setShowFilters(v => !v)}
          className={`flex items-center gap-1.5 text-sm px-3 py-2 rounded-xl border transition-colors ${
            showFilters ? 'bg-brand-greenDark text-white border-brand-greenDark' : 'border-gray-200 text-gray-600 hover:border-gray-300 bg-white'
          }`}
        >
          <SlidersHorizontal size={14} />
          Filters
        </button>

        <div className="ml-auto flex items-center gap-2">
          {selected.size > 0 && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1.5 rounded-lg">
              {selected.size} selected
            </span>
          )}
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
          <span className="text-xs font-medium text-gray-500">Lead Status:</span>
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

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
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
                {['Name', 'Email', 'Phone Number', 'ZIP', 'Service', 'Status', 'Create Date'].map((h, i) => (
                  <th key={i} className={`text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-3 ${
                    i === 1 ? 'hidden md:table-cell' :
                    i === 2 ? 'hidden sm:table-cell' :
                    i >= 3 ? 'hidden lg:table-cell' : ''
                  }`}>
                    {h}
                  </th>
                ))}
                <th className="px-4 py-3 w-16" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {pageRows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-16 text-gray-400 text-sm">
                    No contacts found
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

                    {/* Name + avatar */}
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
                            {contact.name}
                          </Link>
                          <p className="text-xs text-gray-400">ZIP {contact.zip}</p>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-4 py-3 hidden md:table-cell">
                      {contact.email ? (
                        <a
                          href={`mailto:${contact.email}`}
                          className="flex items-center gap-1 text-sm text-blue-600 hover:underline max-w-[180px] truncate group/email"
                        >
                          <span className="truncate">{contact.email}</span>
                          <Mail size={11} className="opacity-0 group-hover/email:opacity-100 flex-shrink-0 transition-opacity" />
                        </a>
                      ) : (
                        <span className="text-gray-300 text-sm">—</span>
                      )}
                    </td>

                    {/* Phone */}
                    <td className="px-4 py-3 hidden sm:table-cell">
                      {contact.phone ? (
                        <a href={`tel:${contact.phone}`} className="flex items-center gap-1 text-sm text-blue-600 hover:underline">
                          <Phone size={11} className="flex-shrink-0" />
                          {contact.phone}
                        </a>
                      ) : (
                        <span className="text-gray-300 text-sm">—</span>
                      )}
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
                      <Link
                        href={`/${locale}/crm/leads/${contact.id}`}
                        className="text-xs text-brand-green opacity-0 group-hover:opacity-100 hover:text-brand-greenDark font-medium transition-opacity"
                      >
                        View
                      </Link>
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
    </div>
  )
}
