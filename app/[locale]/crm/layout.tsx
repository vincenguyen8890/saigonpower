import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'
import { getLeads, getContracts, getActivities } from '@/lib/supabase/queries'
import MobileNavDrawer from '@/components/crm/MobileNavDrawer'
import Sidebar from '@/components/crm/Sidebar'
import TopBar from '@/components/crm/TopBar'
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

  // ── Notification data ────────────────────────────────────────────────────────
  const now = new Date()

  const [newLeads, expiringContracts, pendingActivities] = await Promise.all([
    getLeads({ status: 'new' }),
    getContracts('active'),
    getActivities({ completed: false, limit: 100 }),
  ])

  // New leads this week
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString()
  const recentNewLeads = newLeads.filter(l => l.created_at > weekAgo)

  // Contracts expiring within 30 days
  const expiring = expiringContracts.filter(c => {
    const d = Math.ceil((new Date(c.end_date).getTime() - now.getTime()) / 86400000)
    return d >= 0 && d <= 30
  })

  // Overdue activities
  const overdueTasks = pendingActivities.filter(
    a => a.due_date && a.due_date < now.toISOString(),
  )

  const notifications: CRMNotification[] = []

  if (recentNewLeads.length > 0) {
    notifications.push({
      id:       'new-leads',
      type:     'lead',
      title:    `${recentNewLeads.length} new lead${recentNewLeads.length > 1 ? 's' : ''} this week`,
      subtitle: recentNewLeads.slice(0, 2).map(l => l.name).join(', ') +
                (recentNewLeads.length > 2 ? ` +${recentNewLeads.length - 2} more` : ''),
      href:     `/${locale}/crm/leads?status=new`,
      urgency:  'medium',
    })
  }

  if (expiring.length > 0) {
    notifications.push({
      id:       'expiring-contracts',
      type:     'contract',
      title:    `${expiring.length} contract${expiring.length > 1 ? 's' : ''} expiring within 30 days`,
      subtitle: expiring.slice(0, 2).map(c => c.customer_name ?? c.provider).join(', ') +
                (expiring.length > 2 ? ` +${expiring.length - 2} more` : ''),
      href:     `/${locale}/crm/renewals`,
      urgency:  'high',
    })
  }

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

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      {/* Desktop sidebar */}
      <Sidebar
        locale={locale}
        email={email}
        isAdmin={isAdmin}
        newLeadsCount={recentNewLeads.length}
        expiringCount={expiring.length}
      />

      {/* Mobile nav drawer (unchanged) */}
      <MobileNavDrawer
        locale={locale}
        email={email}
        isAdmin={isAdmin}
        notifications={notifications}
      />

      {/* Main column */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar
          locale={locale}
          email={email}
          isAdmin={isAdmin}
          notifications={notifications}
        />
        <main className="flex-1 overflow-y-auto">
          <div className="p-5 lg:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
