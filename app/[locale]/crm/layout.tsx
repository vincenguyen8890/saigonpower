import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { setRequestLocale } from 'next-intl/server'
import Link from 'next/link'
import Image from 'next/image'
import { LayoutDashboard, Users, FileText, Settings, LogOut, ShieldCheck, UserCheck } from 'lucide-react'
import type { Metadata } from 'next'

interface Props {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export const metadata: Metadata = { title: 'CRM | Saigon Power' }

export default async function CRMLayout({ children, params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  // Check session (HMAC-signed cookie — works with or without Supabase)
  const session = await getSession()
  if (!session) {
    redirect(`/${locale}/auth/login`)
  }

  const { email, role } = session
  const isAdmin = role === 'admin'
  const isVi = locale === 'vi'

  const navItems = [
    { href: `/${locale}/crm`,        label: 'Overview',  labelVi: 'Tổng Quan',   icon: LayoutDashboard },
    { href: `/${locale}/crm/leads`,  label: 'Leads',     labelVi: 'Khách Hàng',  icon: Users           },
    { href: `/${locale}/crm/quotes`, label: 'Quotes',    labelVi: 'Báo Giá',     icon: FileText        },
  ]

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {/* Sidebar */}
      <aside className="w-60 bg-brand-greenDark flex flex-col flex-shrink-0">

        {/* Logo + role badge */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-green-700">
          <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0">
            <Image src="/sg-power-logo.jpg" alt="Saigon Power" width={36} height={36} className="object-cover w-full h-full" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">Saigon Power</p>
            <span className={`text-xs px-1.5 py-0.5 rounded font-medium inline-flex items-center gap-1 ${
              isAdmin ? 'bg-amber-400 text-amber-900' : 'bg-green-500 text-white'
            }`}>
              {isAdmin ? <ShieldCheck size={10} /> : <UserCheck size={10} />}
              {isAdmin ? (isVi ? 'Quản Trị' : 'Admin') : (isVi ? 'Nhân Viên' : 'Agent')}
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ href, label, labelVi, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-green-200 hover:bg-green-700 hover:text-white transition-colors text-sm font-medium"
            >
              <Icon size={18} className="flex-shrink-0" />
              {isVi ? labelVi : label}
            </Link>
          ))}

          {/* Admin-only section */}
          {isAdmin && (
            <>
              <div className="pt-3 pb-1">
                <p className="px-3 text-xs font-semibold text-green-500 uppercase tracking-wider">
                  {isVi ? 'Quản Trị' : 'Admin'}
                </p>
              </div>
              <Link
                href={`/${locale}/crm/settings`}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-green-200 hover:bg-green-700 hover:text-white transition-colors text-sm font-medium"
              >
                <Settings size={18} className="flex-shrink-0" />
                {isVi ? 'Cài Đặt' : 'Settings'}
              </Link>
            </>
          )}
        </nav>

        {/* User info + signout */}
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

            <form action="/api/auth/signout" method="POST">
              <input type="hidden" name="locale" value={locale} />
              <button
                type="submit"
                className="mt-1 flex items-center gap-1.5 text-green-300 hover:text-white text-xs transition-colors"
              >
                <LogOut size={13} />
                {isVi ? 'Đăng Xuất' : 'Sign Out'}
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
