'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  Menu, X, LayoutDashboard, Users, FileText, Settings, LogOut,
  ShieldCheck, UserCheck, Zap, RefreshCw, Building2,
  TrendingUp, BarChart3, Bot, ListChecks, DollarSign, Inbox, Contact2,
} from 'lucide-react'
import NotificationBell from './NotificationBell'
import SignOutButton from './SignOutButton'
import type { CRMNotification } from './NotificationBell'

interface NavItem {
  href: string
  label: string
  icon: React.FC<{ size?: number; className?: string }>
}

interface NavGroup {
  label: string | null
  items: NavItem[]
}

interface Props {
  locale: string
  email: string
  isAdmin: boolean
  notifications: CRMNotification[]
}

export default function MobileNavDrawer({ locale, email, isAdmin, notifications }: Props) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // Close on route change
  useEffect(() => { setOpen(false) }, [pathname])

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const navGroups: NavGroup[] = [
    {
      label: null,
      items: [{ href: `/${locale}/crm`, label: 'Dashboard', icon: LayoutDashboard }],
    },
    {
      label: 'People',
      items: [
        { href: `/${locale}/crm/contacts`, label: 'Customers',    icon: Contact2   },
        { href: `/${locale}/crm/agents`,   label: 'Sales Agents', icon: Users      },
      ],
    },
    {
      label: 'Pipeline',
      items: [
        { href: `/${locale}/crm/leads`,     label: 'Leads',       icon: Users      },
        { href: `/${locale}/crm/deals`,     label: 'Deals',       icon: TrendingUp },
        { href: `/${locale}/crm/tasks`,     label: 'Work Queue',  icon: ListChecks },
        { href: `/${locale}/crm/proposals`, label: 'Proposals',   icon: FileText   },
        { href: `/${locale}/crm/rfp`,       label: 'Rate RFPs',   icon: Inbox      },
      ],
    },
    {
      label: 'Contracts',
      items: [
        { href: `/${locale}/crm/contracts`, label: 'Contracts',        icon: FileText  },
        { href: `/${locale}/crm/renewals`,  label: 'Renewal Calendar', icon: RefreshCw },
      ],
    },
    {
      label: 'Catalog',
      items: [
        { href: `/${locale}/crm/providers`, label: 'Providers', icon: Building2 },
        { href: `/${locale}/crm/plans`,     label: 'Plans',     icon: Zap       },
      ],
    },
    {
      label: 'Analytics',
      items: [
        { href: `/${locale}/crm/reports`,    label: 'Reports',    icon: BarChart3  },
        { href: `/${locale}/crm/accounting`, label: 'Accounting', icon: DollarSign },
      ],
    },
    {
      label: 'Automation',
      items: [{ href: `/${locale}/crm/automation`, label: 'Automation', icon: Bot }],
    },
  ]

  const isActive = (href: string) =>
    href === `/${locale}/crm` ? pathname === href : pathname.startsWith(href)

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-brand-greenDark border-b border-green-700 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setOpen(true)}
            className="p-1.5 rounded-lg text-green-200 hover:bg-green-700 hover:text-white transition-colors"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md overflow-hidden flex-shrink-0">
              <Image src="/sg-power-logo.jpg" alt="Saigon Power" width={28} height={28} className="object-cover w-full h-full" />
            </div>
            <p className="text-white font-bold text-sm">Saigon Power</p>
          </div>
        </div>
        <NotificationBell notifications={notifications} locale={locale} />
      </div>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div className={`fixed top-0 left-0 h-full w-72 bg-brand-greenDark z-50 flex flex-col transition-transform duration-300 ease-in-out lg:hidden ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-green-700 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0">
              <Image src="/sg-power-logo.jpg" alt="Saigon Power" width={36} height={36} className="object-cover w-full h-full" />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">Saigon Power</p>
              <span className={`text-xs px-1.5 py-0.5 rounded font-medium inline-flex items-center gap-1 ${
                isAdmin ? 'bg-amber-400 text-amber-900' : 'bg-green-500 text-white'
              }`}>
                {isAdmin ? <ShieldCheck size={10} /> : <UserCheck size={10} />}
                {isAdmin ? 'Admin' : 'Agent'}
              </span>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 rounded-lg text-green-300 hover:bg-green-700 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          {navGroups.map((group, gi) => (
            <div key={gi} className={gi > 0 ? 'pt-3' : ''}>
              {group.label && (
                <p className="px-3 text-xs font-semibold text-green-500 uppercase tracking-wider mb-1">
                  {group.label}
                </p>
              )}
              {group.items.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive(href)
                      ? 'bg-green-700 text-white'
                      : 'text-green-200 hover:bg-green-700 hover:text-white'
                  }`}
                >
                  <Icon size={18} className="flex-shrink-0" />
                  {label}
                </Link>
              ))}
            </div>
          ))}

          {isAdmin && (
            <div className="pt-3">
              <p className="px-3 text-xs font-semibold text-green-500 uppercase tracking-wider mb-1">Admin</p>
              <Link
                href={`/${locale}/crm/settings`}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive(`/${locale}/crm/settings`)
                    ? 'bg-green-700 text-white'
                    : 'text-green-200 hover:bg-green-700 hover:text-white'
                }`}
              >
                <Settings size={18} className="flex-shrink-0" />
                Settings
              </Link>
            </div>
          )}
        </nav>

        {/* User footer */}
        <div className="px-3 pb-5 border-t border-green-700 pt-4 flex-shrink-0">
          <div className="px-3 py-3 rounded-xl bg-green-800">
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                isAdmin ? 'bg-amber-400 text-amber-900' : 'bg-green-500 text-white'
              }`}>
                {email.charAt(0).toUpperCase()}
              </div>
              <p className="text-white text-xs font-medium truncate">{email}</p>
            </div>
            <SignOutButton locale={locale} />
          </div>
        </div>
      </div>
    </>
  )
}
