'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { Zap, Mail, Lock, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'

export default function LoginPage() {
  const locale = useLocale()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const t = {
    title:       locale === 'vi' ? 'Đăng Nhập Agent'            : 'Agent Login',
    subtitle:    locale === 'vi' ? 'Truy cập hệ thống CRM'       : 'Access the Saigon Power CRM',
    email:       locale === 'vi' ? 'Email'                        : 'Email Address',
    password:    locale === 'vi' ? 'Mật Khẩu'                    : 'Password',
    emailPh:     locale === 'vi' ? 'agent@saigonllc.com'          : 'agent@saigonllc.com',
    passwordPh:  locale === 'vi' ? '••••••••'                     : '••••••••',
    submit:      locale === 'vi' ? 'Đăng Nhập'                   : 'Sign In',
    submitting:  locale === 'vi' ? 'Đang đăng nhập...'           : 'Signing in...',
    errorInvalid: locale === 'vi' ? 'Email hoặc mật khẩu không đúng' : 'Invalid email or password',
    errorAccess:  locale === 'vi' ? 'Tài khoản không có quyền truy cập CRM' : 'Account does not have CRM access',
    restricted:   locale === 'vi' ? 'Chỉ dành cho nhân viên được ủy quyền' : 'Restricted to authorized agents only',
    notConfigured: locale === 'vi'
      ? 'Supabase chưa được kết nối. Vui lòng thêm thông tin đăng nhập thực.'
      : 'Supabase not configured. Please add real credentials to .env.local.',
  }

  const isPlaceholder = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const supabase = createClient()
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (authError || !data.user) {
        setError(t.errorInvalid)
        return
      }

      // Check if user has agent or admin role
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: profile } = await (supabase.from('users') as any)
        .select('role')
        .eq('id', data.user.id)
        .single()

      if (profile && (profile as { role: string }).role !== 'agent' && (profile as { role: string }).role !== 'admin') {
        await supabase.auth.signOut()
        setError(t.errorAccess)
        return
      }

      router.push(`/${locale}/crm`)
      router.refresh()
    } catch {
      setError(t.errorInvalid)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-greenDark via-green-800 to-green-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-4 overflow-hidden">
            <Image src="/sg-power-logo.jpg" alt="Saigon Power" width={64} height={64} className="object-cover" />
          </div>
          <h1 className="text-2xl font-bold text-white">{t.title}</h1>
          <p className="text-green-200 text-sm mt-1">{t.subtitle}</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {isPlaceholder && (
            <div className="mb-5 p-3 bg-amber-50 border border-amber-200 rounded-lg flex gap-2 text-sm text-amber-700">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <p>{t.notConfigured}</p>
            </div>
          )}

          {error && (
            <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2 text-sm text-red-600">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t.email}
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder={t.emailPh}
                  required
                  className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t.password}
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={t.passwordPh}
                  required
                  className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full bg-brand-greenDark hover:bg-brand-green text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {t.submitting}
                </>
              ) : (
                <>{t.submit}</>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-6 flex items-center justify-center gap-1.5">
            <Zap size={12} />
            {t.restricted}
          </p>
        </div>
      </div>
    </div>
  )
}
