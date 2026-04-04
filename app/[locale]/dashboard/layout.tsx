import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { LayoutDashboard, FileText, RefreshCw, User, Zap } from 'lucide-react'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations('dashboard')

  const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: t('overview') },
    { href: '/dashboard/contract', icon: FileText, label: t('myContract') },
    { href: '/dashboard/renewal', icon: RefreshCw, label: t('renewal') },
    { href: '/dashboard/profile', icon: User, label: t('profile') },
  ] as const

  return (
    <div className="min-h-screen bg-surface-light pt-16">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-surface-border h-[calc(100vh-4rem)] sticky top-16 shrink-0">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-8">
              <div className="w-8 h-8 bg-brand-gold rounded-lg flex items-center justify-center">
                <Zap size={16} className="text-white" />
              </div>
              <span className="font-bold text-brand-blue text-sm">My Account</span>
            </div>
            <nav className="space-y-1">
              {navItems.map(({ href, icon: Icon, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:text-brand-blue hover:bg-blue-50 transition-colors"
                >
                  <Icon size={18} />
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </aside>
        {/* Main */}
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  )
}
