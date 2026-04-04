import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { setRequestLocale } from 'next-intl/server'
import Link from 'next/link'
import Image from 'next/image'
import { LayoutDashboard, Users, FileText, FileSignature, Settings, LogOut, Zap } from 'lucide-react'
import type { Metadata } from 'next'

interface Props {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export const metadata: Metadata = { title: 'CRM | Saigon Power' }

const navItems = (locale: string) => [
  { href: `/${locale}/crm`,        label: 'Overview',  labelVi: 'Tổng Quan',   icon: LayoutDashboard },
  { href: `/${locale}/crm/leads`,  label: 'Leads',     labelVi: 'Khách Hàng',  icon: Users           },
  { href: `/${locale}/crm/quotes`, label: 'Quotes',    labelVi: 'Báo Giá',     icon: FileText        },
]

export default async function CRMLayout({ children, params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  // Auth check — allow access when Supabase is not yet configured (placeholder URL)
  const isPlaceholder = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')
  let userEmail = 'agent@saigonllc.com'

  if (!isPlaceholder) {
    try {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) redirect(`/${locale}/auth/login`)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: profile } = await (supabase.from('users') as any)
        .select('role, email, full_name')
        .eq('id', user.id)
        .single() as { data: { role: string; email: string; full_name: string } | null }

      if (profile && profile.role !== 'agent' && profile.role !== 'admin') {
        redirect(`/${locale}/auth/login`)
      }

      userEmail = profile?.email ?? user.email ?? userEmail
    } catch {
      redirect(`/${locale}/auth/login`)
    }
  }

  const items = navItems(locale)
  const isVi = locale === 'vi'

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-60 bg-brand-greenDark flex flex-col flex-shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-green-700">
          <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0">
            <Image src="/sg-power-logo.jpg" alt="Saigon Power" width={36} height={36} className="object-cover w-full h-full" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">Saigon Power</p>
            <span className="text-xs bg-green-500 text-white px-1.5 py-0.5 rounded font-medium">CRM</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {items.map(({ href, label, labelVi, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-green-200 hover:bg-green-700 hover:text-white transition-colors text-sm font-medium group"
            >
              <Icon size={18} className="flex-shrink-0" />
              {isVi ? labelVi : label}
            </Link>
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-3 pb-5 space-y-1 border-t border-green-700 pt-4">
          <Link
            href={`/${locale}/crm/settings`}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-green-200 hover:bg-green-700 hover:text-white transition-colors text-sm font-medium"
          >
            <Settings size={18} />
            {isVi ? 'Cài Đặt' : 'Settings'}
          </Link>

          {/* User + Signout */}
          <div className="mt-2 px-3 py-3 rounded-xl bg-green-800">
            <p className="text-white text-xs font-medium truncate">{userEmail}</p>
            <form action="/api/auth/signout" method="POST">
              <input type="hidden" name="locale" value={locale} />
              <button
                type="submit"
                className="mt-1.5 flex items-center gap-1.5 text-green-300 hover:text-white text-xs transition-colors"
              >
                <LogOut size={13} />
                {isVi ? 'Đăng Xuất' : 'Sign Out'}
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          {isPlaceholder && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-sm text-amber-700">
              <Zap size={15} />
              {isVi
                ? 'Chế độ demo — Supabase chưa được kết nối. Dữ liệu là mock.'
                : 'Demo mode — Supabase not connected. Showing mock data.'}
            </div>
          )}
          {children}
        </div>
      </main>
    </div>
  )
}
