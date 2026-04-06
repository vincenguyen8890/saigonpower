import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { setRequestLocale } from 'next-intl/server'
import Link from 'next/link'
import Image from 'next/image'
import {
  LayoutDashboard, Users, FileText, Settings, LogOut,
  ShieldCheck, UserCheck, Zap, RefreshCw, Building2,
  TrendingUp, BarChart3, Bot, ListChecks, DollarSign, Inbox, Contact2,
} from 'lucide-react'
import type { Metadata } from 'next'
import { getLeads, getContracts, getActivities } from '@/lib/supabase/queries'
import NotificationBell from '@/components/crm/NotificationBell'
import MobileNavDrawer from '@/components/crm/MobileNavDrawer'
import SignOutButton from '@/components/crm/SignOutButton'
import type { CRMNotification } from '@/components/crm/NotificationBell'

interface Props {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export const metadata: Metadata = { title: 'CRM | Saigon Power' }

export default async function CRMLayout({ children, params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const session = await getSession()
  if (!session) redirect(`/${locale}/auth/login`)

  const { email, role } = session
  const isAdmin = role === 'admin'

  // ── Fetch notification data ────────────────────────────────────────────────
  const now = new Date()
  const in30 = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]

  const [newLeads, expiringContracts, pendingActivities] = await Promise.all([
    getLeads({ status: 'new' }),
    getContracts('active'),
    getActivities({ completed: false, limit: 100 }),
  ])

  const notifications: CRMNotification[] = []

  // New leads (created in last 7 days)
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString()
  const recentNewLeads = newLeads.filter(l => l.created_at > weekAgo)
  if (recentNewLeads.length > 0) {
    notifications.push({
      id:       'new-leads',
      type:     'lead',
      title:    `${recentNewLeads.length} new lead${recentNewLeads.length > 1 ? 's' : ''} this week`,
      subtitle: recentNewLeads.slice(0, 2).map(l => l.name).join(', ') + (recentNewLeads.length > 2 ? ` +${recentNewLeads.length - 2} more` : ''),
      href:     `/${locale}/crm/leads?status=new`,
      urgency:  'medium',
    })
  }

  // Expiring contracts ≤ 30 days
  const expiring = expiringContracts.filter(c => {
    const d = Math.ceil((new Date(c.end_date).getTime() - now.getTime()) / 86400000)
    return d >= 0 && d <= 30
  })
  if (expiring.length > 0) {
    notifications.push({
      id:       'expiring-contracts',
      type:     'contract',
      title:    `${expiring.length} contract${expiring.length > 1 ? 's' : ''} expiring within 30 days`,
      subtitle: expiring.slice(0, 2).map(c => c.customer_name ?? c.provider).join(', ') + (expiring.length > 2 ? ` +${expiring.length - 2} more` : ''),
      href:     `/${locale}/crm/renewals`,
      urgency:  'high',
    })
  }

  // Overdue tasks
  const overdueTasks = pendingActivities.filter(a => a.due_date && a.due_date < now.toISOString())
  if (overdueTasks.length > 0) {
    notifications.push({
      id:       'overdue-tasks',
      type:     'task',
      title:    `${overdueTasks.length} overdue task${overdueTasks.length > 1 ? 's' : ''}`,
      subtitle: overdueTasks.slice(0, 2).map(a => a.title).join(', '),
      href:     `/${locale}/crm/tasks`,
      urgency:  overdueTasks.length > 3 ? 'high' : 'medium',
    })
  }

  // ── Nav groups ──────────────────────────────────────────────────────────────
  const navGroups = [
    {
      label: null,
      items: [
        { href: `/${locale}/crm`,             label: 'Dashboard',        icon: LayoutDashboard },
      ],
    },
    {
      label: 'People',
      items: [
        { href: `/${locale}/crm/contacts`,    label: 'Customers',        icon: Contact2        },
        { href: `/${locale}/crm/agents`,      label: 'Sales Agents',     icon: Users           },
      ],
    },
    {
      label: 'Pipeline',
      items: [
        { href: `/${locale}/crm/leads`,       label: 'Leads',            icon: Users           },
        { href: `/${locale}/crm/deals`,       label: 'Deals',            icon: TrendingUp      },
        { href: `/${locale}/crm/tasks`,       label: 'Work Queue',       icon: ListChecks      },
        { href: `/${locale}/crm/proposals`,   label: 'Proposals',        icon: FileText        },
        { href: `/${locale}/crm/rfp`,         label: 'Rate RFPs',        icon: Inbox           },
      ],
    },
    {
      label: 'Contracts',
      items: [
        { href: `/${locale}/crm/contracts`,   label: 'Contracts',        icon: FileText        },
        { href: `/${locale}/crm/renewals`,    label: 'Renewal Calendar', icon: RefreshCw       },
      ],
    },
    {
      label: 'Catalog',
      items: [
        { href: `/${locale}/crm/providers`,   label: 'Providers',        icon: Building2       },
        { href: `/${locale}/crm/plans`,       label: 'Plans',            icon: Zap             },
      ],
    },
    {
      label: 'Analytics',
      items: [
        { href: `/${locale}/crm/reports`,     label: 'Reports',          icon: BarChart3       },
        { href: `/${locale}/crm/accounting`,  label: 'Accounting',       icon: DollarSign      },
      ],
    },
    {
      label: 'Automation',
      items: [
        { href: `/${locale}/crm/automation`,  label: 'Automation',       icon: Bot             },
      ],
    },
  ]

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gray-50 overflow-hidden">
      {/* ── Mobile top bar + drawer ── */}
      <MobileNavDrawer
        locale={locale}
        email={email}
        isAdmin={isAdmin}
        notifications={notifications}
      />

      {/* ── Desktop Sidebar ── */}
      <aside className="hidden lg:flex w-60 bg-brand-greenDark flex-col flex-shrink-0">
        {/* Logo + bell */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-green-700">
          <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0">
            <Image src="/sg-power-logo.jpg" alt="Saigon Power" width={36} height={36} className="object-cover w-full h-full" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-sm leading-tight">Saigon Power</p>
            <span className={`text-xs px-1.5 py-0.5 rounded font-medium inline-flex items-center gap-1 ${
              isAdmin ? 'bg-amber-400 text-amber-900' : 'bg-green-500 text-white'
            }`}>
              {isAdmin ? <ShieldCheck size={10} /> : <UserCheck size={10} />}
              {isAdmin ? 'Admin' : 'Agent'}
            </span>
          </div>
          <NotificationBell notifications={notifications} locale={locale} />
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
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-green-200 hover:bg-green-700 hover:text-white transition-colors text-sm font-medium"
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
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-green-200 hover:bg-green-700 hover:text-white transition-colors text-sm font-medium"
              >
                <Settings size={18} className="flex-shrink-0" />
                Settings
              </Link>
            </div>
          )}
        </nav>

        {/* User info */}
        <div className="px-3 pb-5 border-t border-green-700 pt-4">
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
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-4 lg:p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
