'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  Menu, X, LayoutDashboard, Users, FileText, Settings,
  ShieldCheck, UserCheck, Zap, RefreshCw, Building2,
  TrendingUp, BarChart3, Bot, ListChecks, DollarSign,
  Inbox, Contact2, Plus, Landmark, Search,
  Sparkles, Headset, BriefcaseBusiness,
} from 'lucide-react'
import NotificationBell from './NotificationBell'
import SignOutButton from './SignOutButton'
import { can, ROLE_LABELS, ROLE_COLORS } from '@/lib/auth/permissions'
import type { CRMRole } from '@/lib/auth/permissions'
import type { CRMNotification } from './NotificationBell'

interface Props {
  locale: string
  email: string
  role: CRMRole
  name?: string
  notifications: CRMNotification[]
}

export default function MobileNavDrawer({ locale, email, role, name, notifications }: Props) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const rc = ROLE_COLORS[role]

  useEffect(() => { setOpen(false) }, [pathname])
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const roleIcon = role === 'admin'
    ? <ShieldCheck size={10} />
    : role === 'office_manager'
    ? <BriefcaseBusiness size={10} />
    : role === 'csr'
    ? <Headset size={10} />
    : <UserCheck size={10} />

  const navGroups = [
    {
      label: null,
      items: [{ href: `/${locale}/crm`, label: 'Dashboard', icon: LayoutDashboard, feature: null }],
    },
    {
      label: 'People',
      items: [
        { href: `/${locale}/crm/contacts`, label: 'Customers',    icon: Contact2,  feature: null        },
        { href: `/${locale}/crm/agents`,   label: 'Sales Agents', icon: Users,     feature: 'agents' as const },
      ],
    },
    {
      label: 'Pipeline',
      items: [
        { href: `/${locale}/crm/leads`,     label: 'Leads',      icon: Users,      feature: null },
        { href: `/${locale}/crm/deals`,     label: 'Deals',      icon: TrendingUp, feature: null },
        { href: `/${locale}/crm/accounts`,  label: 'Accounts',   icon: Landmark,   feature: null },
        { href: `/${locale}/crm/tasks`,     label: 'Work Queue', icon: ListChecks, feature: null },
        { href: `/${locale}/crm/proposals`, label: 'Proposals',  icon: FileText,   feature: null },
        { href: `/${locale}/crm/rfp`,       label: 'Rate RFPs',  icon: Inbox,      feature: 'rfp' as const },
      ],
    },
    {
      label: 'Contracts',
      items: [
        { href: `/${locale}/crm/contracts`, label: 'Contracts', icon: FileText,  feature: null },
        { href: `/${locale}/crm/renewals`,  label: 'Renewals',  icon: RefreshCw, feature: null },
      ],
    },
    {
      label: 'Catalog',
      items: [
        { href: `/${locale}/crm/providers`, label: 'Providers', icon: Building2, feature: 'providers' as const },
        { href: `/${locale}/crm/plans`,     label: 'Plans',     icon: Zap,       feature: 'plans' as const     },
      ],
    },
    {
      label: 'Analytics',
      items: [
        { href: `/${locale}/crm/reports`,    label: 'Reports',    icon: BarChart3,  feature: 'reports' as const    },
        { href: `/${locale}/crm/accounting`, label: 'Accounting', icon: DollarSign, feature: 'accounting' as const },
      ],
    },
    {
      label: 'Intelligence',
      items: [
        { href: `/${locale}/crm/ai`,         label: 'AI Manager', icon: Sparkles, feature: 'ai_manager' as const },
        { href: `/${locale}/crm/automation`, label: 'Automation', icon: Bot,      feature: 'automation' as const },
      ],
    },
  ]

  const isActive = (href: string) =>
    href === `/${locale}/crm`
      ? pathname === href || pathname === `/${locale}/crm/`
      : pathname === href || pathname.startsWith(href + '/')

  return (
    <>
      {/* ── Mobile top bar ── */}
      <div className="lg:hidden flex items-center justify-between px-4 h-14 bg-white border-b border-slate-100 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setOpen(true)}
            className="p-2 -ml-1 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md overflow-hidden flex-shrink-0 ring-1 ring-slate-100">
              <Image src="/sg-power-logo.jpg" alt="Saigon Power" width={24} height={24} className="object-cover w-full h-full" />
            </div>
            <p className="text-[#0F172A] font-bold text-sm">Saigon Power</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/${locale}/crm/leads?action=new`}
            className="flex items-center justify-center w-8 h-8 bg-[#00C853] hover:bg-[#00A846] text-white rounded-lg transition-colors"
            aria-label="Add lead"
          >
            <Plus size={16} />
          </Link>
          <NotificationBell notifications={notifications} locale={locale} />
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${rc.bg} ${rc.text}`}>
            {(name || email).charAt(0).toUpperCase()}
          </div>
        </div>
      </div>

      {/* ── Backdrop ── */}
      {open && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden" onClick={() => setOpen(false)} />
      )}

      {/* ── Drawer ── */}
      <div className={`fixed top-0 left-0 h-full w-72 bg-white z-50 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out lg:hidden ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 h-14 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md overflow-hidden flex-shrink-0 ring-1 ring-slate-100">
              <Image src="/sg-power-logo.jpg" alt="Saigon Power" width={28} height={28} className="object-cover w-full h-full" />
            </div>
            <div>
              <p className="text-[#0F172A] font-bold text-sm leading-none">Saigon Power</p>
              <p className="text-slate-400 text-[10px] mt-0.5">CRM Platform</p>
            </div>
          </div>
          <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Search shortcut */}
        <div className="px-4 pt-3 pb-2">
          <Link
            href={`/${locale}/crm/contacts`}
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-400 hover:border-[#00C853]/50 transition-colors"
          >
            <Search size={14} />
            Search customers…
          </Link>
        </div>

        {/* Role chip */}
        <div className="px-4 py-3 border-b border-slate-50">
          <span className={`inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full font-semibold border ${rc.bg} ${rc.text} ${rc.border}`}>
            {roleIcon}
            {ROLE_LABELS[role]}
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 overflow-y-auto">
          {navGroups.map((group, gi) => {
            const visible = group.items.filter(item => !item.feature || can(role, item.feature))
            if (visible.length === 0) return null
            return (
              <div key={gi} className={gi > 0 ? 'mt-5' : ''}>
                {group.label && (
                  <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    {group.label}
                  </p>
                )}
                <div className="space-y-0.5">
                  {visible.map(({ href, label, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all ${
                        isActive(href) ? 'bg-[#E8FFF1] text-[#00A846]' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                      }`}
                    >
                      <Icon size={16} className={`flex-shrink-0 ${isActive(href) ? 'text-[#00C853]' : ''}`} />
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
            )
          })}

          {can(role, 'users') && (
            <div className="mt-5">
              <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Admin</p>
              <div className="space-y-0.5">
                {[
                  { href: `/${locale}/crm/users`,    label: 'Users',    icon: Users    },
                  { href: `/${locale}/crm/settings`, label: 'Settings', icon: Settings },
                ].map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all ${
                      isActive(href) ? 'bg-[#E8FFF1] text-[#00A846]' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                    }`}
                  >
                    <Icon size={16} className={`flex-shrink-0 ${isActive(href) ? 'text-[#00C853]' : ''}`} />
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-2.5 mb-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${rc.bg} ${rc.text}`}>
              {(name || email).charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-slate-700 truncate">{name || email}</p>
              <p className={`text-[10px] ${rc.text}`}>{ROLE_LABELS[role]}</p>
            </div>
          </div>
          <SignOutButton locale={locale} />
        </div>
      </div>
    </>
  )
}
