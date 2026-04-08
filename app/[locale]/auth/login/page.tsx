'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { Zap, Mail, Lock, AlertCircle, ShieldCheck } from 'lucide-react'
import Image from 'next/image'

export default function LoginPage() {
  const locale = useLocale()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const isVi = locale === 'vi'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(isVi ? 'Email hoặc mật khẩu không đúng' : 'Invalid email or password')
        return
      }

      router.push(`/${locale}/crm`)
      router.refresh()
    } catch {
      setError(isVi ? 'Lỗi kết nối. Vui lòng thử lại.' : 'Connection error. Please try again.')
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
          <h1 className="text-2xl font-bold text-white">
            {isVi ? 'Đăng Nhập' : 'Sign In'}
          </h1>
          <p className="text-green-200 text-sm mt-1">
            {isVi ? 'Truy cập hệ thống CRM Saigon Power' : 'Access Saigon Power CRM'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">

          {error && (
            <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-xl flex gap-2 text-sm text-red-600">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {isVi ? 'Email' : 'Email Address'}
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@saigonllc.com"
                  required
                  autoComplete="email"
                  className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {isVi ? 'Mật Khẩu' : 'Password'}
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
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
                  {isVi ? 'Đang đăng nhập...' : 'Signing in...'}
                </>
              ) : (
                <>{isVi ? 'Đăng Nhập' : 'Sign In'}</>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center mb-3">
              {isVi ? 'Đăng nhập nhanh' : 'Quick login'}
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => { setEmail('admin@saigonllc.com'); setPassword('SaigonPower2024!') }}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-amber-200 bg-amber-50 text-amber-700 text-xs font-medium hover:bg-amber-100 transition-colors"
              >
                <ShieldCheck size={13} />
                Admin
              </button>
              <button
                type="button"
                onClick={() => { setEmail('manager@saigonllc.com'); setPassword('Manager2024!') }}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 text-xs font-medium hover:bg-blue-100 transition-colors"
              >
                <ShieldCheck size={13} />
                Manager
              </button>
              <button
                type="button"
                onClick={() => { setEmail('csr@saigonllc.com'); setPassword('CSR2024!') }}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-purple-200 bg-purple-50 text-purple-700 text-xs font-medium hover:bg-purple-100 transition-colors"
              >
                <ShieldCheck size={13} />
                CSR
              </button>
              <button
                type="button"
                onClick={() => { setEmail('agent@saigonllc.com'); setPassword('Agent2024!') }}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-green-200 bg-green-50 text-green-700 text-xs font-medium hover:bg-green-100 transition-colors"
              >
                <Zap size={13} />
                Agent
              </button>
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-4 flex items-center justify-center gap-1.5">
            <Zap size={12} />
            {isVi ? 'Chỉ dành cho nhân viên được ủy quyền' : 'Restricted to authorized staff only'}
          </p>
          <p className="text-center text-xs text-gray-400 mt-2">
            {isVi ? 'Quên mật khẩu? Liên hệ' : 'Forgot password? Contact'}{' '}
            <a href="mailto:admin@saigonllc.com" className="text-green-700 hover:underline font-medium">
              admin@saigonllc.com
            </a>
          </p>
        </div>

        {/* Secure badge */}
        <p className="text-center text-green-300 text-xs mt-4 flex items-center justify-center gap-1">
          <ShieldCheck size={13} />
          {isVi ? 'Kết nối bảo mật' : 'Secure connection'}
        </p>
      </div>
    </div>
  )
}
