'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  LayoutDashboard, Users, FileText, Settings,
  ShieldCheck, UserCheck, Zap, RefreshCw, Building2,
  TrendingUp, BarChart3, Bot, ListChecks, DollarSign,
  Inbox, Contact2, Sparkles, Landmark, Headset, BriefcaseBusiness,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import SignOutButton from './SignOutButton'
import { can, isAdmin, ROLE_LABELS, ROLE_COLORS } from '@/lib/auth/permissions'
import type { CRMRole } from '@/lib/auth/permissions'

interface NavItem {
  href: string
  label: string
  icon: LucideIcon
  badge?: number
  requireFeature?: Parameters<typeof can>[1]
}

interface NavGroup {
  label: string | null
  items: NavItem[]
}

interface SidebarProps {
  locale: string
  email: string
  role: CRMRole
  name?: string
  newLeadsCount?: number
  expiringCount?: number
}

export default function Sidebar({
  locale,
  email,
  role,
  name,
  newLeadsCount = 0,
  expiringCount = 0,
}: SidebarProps) {
  const pathname = usePathname()
  const rc = ROLE_COLORS[role]

  const roleIcon = role === 'admin'
    ? <ShieldCheck size={10} />
    : role === 'office_manager'
    ? <BriefcaseBusiness size={10} />
    : role === 'csr'
    ? <Headset size={10} />
    : <UserCheck size={10} />

  const navGroups: NavGroup[] = [
    {
      label: null,
      items: [
        { href: `/${locale}/crm`, label: 'Dashboard', icon: LayoutDashboard },
      ],
    },
    {
      label: 'People',
      items: [
        { href: `/${locale}/crm/contacts`, label: 'Customers',    icon: Contact2 },
        { href: `/${locale}/crm/agents`,   label: 'Sales Agents', icon: Users,    requireFeature: 'agents' },
      ],
    },
    {
      label: 'Pipeline',
      items: [
        { href: `/${locale}/crm/leads`,    label: 'Leads',       icon: Users,      badge: newLeadsCount || undefined },
        { href: `/${locale}/crm/deals`,    label: 'Deals',       icon: TrendingUp  },
        { href: `/${locale}/crm/accounts`, label: 'Accounts',    icon: Landmark    },
        { href: `/${locale}/crm/tasks`,    label: 'Work Queue',  icon: ListChecks  },
        { href: `/${locale}/crm/proposals`,label: 'Proposals',   icon: FileText    },
        { href: `/${locale}/crm/rfp`,      label: 'Rate RFPs',   icon: Inbox,      requireFeature: 'rfp' },
      ],
    },
    {
      label: 'Contracts',
      items: [
        { href: `/${locale}/crm/contracts`, label: 'Contracts', icon: FileText  },
        { href: `/${locale}/crm/renewals`,  label: 'Renewals',  icon: RefreshCw, badge: expiringCount || undefined },
      ],
    },
    {
      label: 'Catalog',
      items: [
        { href: `/${locale}/crm/providers`, label: 'Providers', icon: Building2, requireFeature: 'providers' },
        { href: `/${locale}/crm/plans`,     label: 'Plans',     icon: Zap,       requireFeature: 'plans'     },
      ],
    },
    {
      label: 'Analytics',
      items: [
        { href: `/${locale}/crm/reports`,    label: 'Reports',    icon: BarChart3,  requireFeature: 'reports'    },
        { href: `/${locale}/crm/accounting`, label: 'Accounting', icon: DollarSign, requireFeature: 'accounting' },
      ],
    },
    {
      label: 'Intelligence',
      items: [
        { href: `/${locale}/crm/ai`,         label: 'AI Manager',  icon: Sparkles, requireFeature: 'ai_manager' },
        { href: `/${locale}/crm/automation`, label: 'Automation',  icon: Bot,      requireFeature: 'automation' },
      ],
    },
  ]

  const isActive = (href: string) => {
    if (href === `/${locale}/crm`) {
      return pathname === href || pathname === `/${locale}/crm/`
    }
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <aside className="hidden lg:flex w-60 bg-white border-r border-slate-100 flex-col flex-shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-14 border-b border-slate-100 flex-shrink-0">
        <div className="w-7 h-7 rounded-md overflow-hidden flex-shrink-0 ring-1 ring-slate-100">
          <Image src="/sg-power-logo.jpg" alt="Saigon Power" width={28} height={28} className="object-cover w-full h-full" />
        </div>
        <div>
          <p className="text-[#0F172A] font-bold text-sm leading-none">Saigon Power</p>
          <p className="text-slate-400 text-[10px] mt-0.5">CRM Platform</p>
        </div>
      </div>

      {/* Role chip */}
      <div className="px-4 py-3">
        <span className={`inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full font-semibold border ${rc.bg} ${rc.text} ${rc.border}`}>
          {roleIcon}
          {ROLE_LABELS[role]}
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 pb-3 overflow-y-auto">
        {navGroups.map((group, gi) => {
          const visible = group.items.filter(
            item => !item.requireFeature || can(role, item.requireFeature)
          )
          if (visible.length === 0) return null
          return (
            <div key={gi} className={gi > 0 ? 'mt-5' : ''}>
              {group.label && (
                <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  {group.label}
                </p>
              )}
              <div className="space-y-0.5">
                {visible.map(({ href, label, icon: Icon, badge }) => {
                  const active = isActive(href)
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all ${
                        active ? 'bg-[#E8FFF1] text-[#00A846]' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                      }`}
                    >
                      <Icon size={15} className={`flex-shrink-0 ${active ? 'text-[#00C853]' : ''}`} />
                      <span className="flex-1 truncate">{label}</span>
                      {badge != null && badge > 0 && (
                        <span className="text-[10px] bg-[#FF6D00] text-white px-1.5 py-0.5 rounded-full font-bold min-w-[18px] text-center leading-none">
                          {badge > 99 ? '99+' : badge}
                        </span>
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })}

        {/* Admin-only section */}
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
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all ${
                    pathname.startsWith(href) ? 'bg-[#E8FFF1] text-[#00A846]' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  <Icon size={15} className="flex-shrink-0" />
                  {label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* User footer */}
      <div className="px-4 py-4 border-t border-slate-100">
        <div className="flex items-center gap-2.5 mb-3">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${rc.bg} ${rc.text}`}>
            {(name || email).charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-semibold text-slate-700 truncate">{name || email}</p>
            <p className={`text-[10px] ${rc.text}`}>{ROLE_LABELS[role]}</p>
          </div>
        </div>
        <SignOutButton locale={locale} />
      </div>
    </aside>
  )
}
