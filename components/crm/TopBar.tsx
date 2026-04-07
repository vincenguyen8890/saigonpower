'use client'

import { usePathname } from 'next/navigation'
import { useState, useRef, useEffect, useCallback } from 'react'
import { Search, Plus, X, ChevronDown, UserPlus, TrendingUp, FilePlus, User, Briefcase, Loader2 } from 'lucide-react'
import Link from 'next/link'
import NotificationBell from './NotificationBell'
import type { CRMNotification } from './NotificationBell'
import type { SearchResult } from '@/app/api/crm/search/route'

import type { CRMRole } from '@/lib/auth/permissions'
import { ROLE_COLORS } from '@/lib/auth/permissions'

interface TopBarProps {
  locale: string
  email: string
  isAdmin: boolean
  role?: CRMRole
  name?: string
  notifications: CRMNotification[]
}

const pageLabels: Record<string, string> = {
  '':           'Dashboard',
  'leads':      'Leads',
  'deals':      'Deals',
  'contacts':   'Customers',
  'agents':     'Sales Agents',
  'tasks':      'Work Queue',
  'proposals':  'Proposals',
  'rfp':        'Rate RFPs',
  'contracts':  'Contracts',
  'renewals':   'Renewals',
  'providers':  'Providers',
  'plans':      'Plans',
  'reports':    'Reports',
  'accounting': 'Accounting',
  'automation': 'Automation',
  'settings':   'Settings',
}

function GlobalSearch({ locale }: { locale: string }) {
  const [query,    setQuery]    = useState('')
  const [results,  setResults]  = useState<SearchResult[]>([])
  const [loading,  setLoading]  = useState(false)
  const [open,     setOpen]     = useState(false)
  const searchRef  = useRef<HTMLDivElement>(null)
  const timerRef   = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchResults = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); setOpen(false); return }
    setLoading(true)
    try {
      const res  = await fetch(`/api/crm/search?q=${encodeURIComponent(q)}`)
      const json = await res.json()
      setResults(json.results ?? [])
      setOpen(true)
    } finally {
      setLoading(false)
    }
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setQuery(val)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => fetchResults(val), 250)
  }

  function clear() {
    setQuery('')
    setResults([])
    setOpen(false)
  }

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={searchRef} className="relative flex-1 max-w-md">
      <div className="relative flex items-center">
        {loading
          ? <Loader2 size={13} className="absolute left-3 text-slate-400 animate-spin" />
          : <Search size={13} className="absolute left-3 text-slate-400 pointer-events-none" />
        }
        <input
          type="text"
          placeholder="Search leads, deals…"
          value={query}
          onChange={handleChange}
          onFocus={() => results.length > 0 && setOpen(true)}
          className="w-full pl-8 pr-8 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C853]/30 focus:border-[#00C853] text-slate-700 placeholder:text-slate-400 transition-all"
        />
        {query && (
          <button type="button" onClick={clear} className="absolute right-2.5 text-slate-400 hover:text-slate-600">
            <X size={13} />
          </button>
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-100 rounded-xl shadow-[0_8px_32px_rgba(15,23,42,0.12)] z-50 overflow-hidden">
          {['lead', 'deal'].map(type => {
            const group = results.filter(r => r.type === type)
            if (group.length === 0) return null
            return (
              <div key={type}>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border-b border-slate-100">
                  {type === 'lead'
                    ? <User size={11} className="text-[#2979FF]" />
                    : <Briefcase size={11} className="text-[#00C853]" />
                  }
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {type === 'lead' ? 'Leads' : 'Deals'}
                  </span>
                </div>
                {group.map(r => (
                  <Link
                    key={r.id}
                    href={`/${locale}${r.href}`}
                    onClick={clear}
                    className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                      type === 'lead' ? 'bg-[#EBF2FF]' : 'bg-[#E8FFF1]'
                    }`}>
                      {type === 'lead'
                        ? <User size={11} className="text-[#2979FF]" />
                        : <Briefcase size={11} className="text-[#00C853]" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-slate-800 truncate">{r.title}</p>
                      <p className="text-[11px] text-slate-400 truncate">{r.subtitle}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )
          })}
          {results.length === 0 && !loading && (
            <p className="text-sm text-slate-400 text-center py-4">No results</p>
          )}
        </div>
      )}

      {open && query.length >= 2 && results.length === 0 && !loading && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-100 rounded-xl shadow-[0_8px_32px_rgba(15,23,42,0.12)] z-50 py-4 text-center">
          <p className="text-sm text-slate-400">No results for &ldquo;{query}&rdquo;</p>
        </div>
      )}
    </div>
  )
}

export default function TopBar({ locale, email, isAdmin, role, name, notifications }: TopBarProps) {
  const rc = role ? ROLE_COLORS[role] : (isAdmin ? ROLE_COLORS.admin : ROLE_COLORS.agent)
  const pathname = usePathname()
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const segment = pathname.replace(`/${locale}/crm`, '').replace(/^\//, '').split('/')[0]
  const pageTitle = pageLabels[segment] ?? 'CRM'

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowQuickAdd(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <header className="hidden lg:flex h-14 bg-white border-b border-slate-100 items-center gap-3 px-6 flex-shrink-0">
      {/* Page label */}
      <div className="hidden md:block w-32 flex-shrink-0">
        <p className="text-sm font-semibold text-[#0F172A]">{pageTitle}</p>
      </div>

      {/* Global search */}
      <GlobalSearch locale={locale} />

      {/* Quick add */}
      <div className="relative flex-shrink-0" ref={dropdownRef}>
        <button
          onClick={() => setShowQuickAdd(v => !v)}
          className="flex items-center gap-1.5 text-xs font-semibold bg-[#00C853] hover:bg-[#00A846] text-white px-3 py-[7px] rounded-lg transition-colors shadow-sm shadow-[#00C853]/20"
        >
          <Plus size={14} />
          <span className="hidden sm:inline">Quick Add</span>
          <ChevronDown size={12} className={`transition-transform duration-150 ${showQuickAdd ? 'rotate-180' : ''}`} />
        </button>

        {showQuickAdd && (
          <div className="absolute right-0 mt-1.5 w-44 bg-white border border-slate-100 rounded-xl shadow-[0_8px_32px_rgba(15,23,42,0.10)] py-1 z-50 animate-fade-in">
            <Link
              href={`/${locale}/crm/leads?action=new`}
              onClick={() => setShowQuickAdd(false)}
              className="flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <UserPlus size={14} className="text-[#2979FF]" />
              Add Lead
            </Link>
            <Link
              href={`/${locale}/crm/deals?action=new`}
              onClick={() => setShowQuickAdd(false)}
              className="flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <TrendingUp size={14} className="text-[#00C853]" />
              Create Deal
            </Link>
            <Link
              href={`/${locale}/crm/contracts?action=new`}
              onClick={() => setShowQuickAdd(false)}
              className="flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <FilePlus size={14} className="text-[#FF6D00]" />
              New Contract
            </Link>
          </div>
        )}
      </div>

      {/* Notifications */}
      <NotificationBell notifications={notifications} locale={locale} />

      {/* Avatar */}
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ring-2 ring-white shadow-sm cursor-pointer ${rc.bg} ${rc.text}`}
        title={name || email}
      >
        {(name || email).charAt(0).toUpperCase()}
      </div>
    </header>
  )
}
