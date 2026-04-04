import { useTranslations, useLocale } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { RefreshCw, AlertTriangle, Calendar, ArrowRight, CheckCircle } from 'lucide-react'
import Button from '@/components/ui/Button'
import PlanCard from '@/components/compare/PlanCard'
import { getFeaturedPlans } from '@/data/mock-plans'
import { getDaysUntil } from '@/lib/utils'

const CONTRACT_END = '2025-04-30'

export default function RenewalPage() {
  const t = useTranslations('dashboard')
  const locale = useLocale()
  const daysLeft = getDaysUntil(CONTRACT_END)
  const renewalPlans = getFeaturedPlans(3)

  const steps = locale === 'vi' ? [
    'Xem lại gói điện hiện tại của bạn',
    'So sánh với các gói mới có sẵn',
    'Chọn gói phù hợp và đăng ký',
    'Chuyển đổi tự động, không mất điện',
  ] : [
    'Review your current electricity plan',
    'Compare with new available plans',
    'Choose the right plan and enroll',
    'Automatic switch, no power interruption',
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-brand-blue mb-1">{t('renewal')}</h1>
        <p className="text-gray-600 text-sm">
          {locale === 'vi' ? 'Quản lý gia hạn hợp đồng của bạn' : 'Manage your contract renewal'}
        </p>
      </div>

      {/* Countdown */}
      <div className="bg-brand-blue text-white rounded-2xl p-8 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <RefreshCw size={18} className="text-brand-gold" />
              <span className="text-blue-200 text-sm">{locale === 'vi' ? 'Hợp đồng hết hạn vào' : 'Contract expires on'}</span>
            </div>
            <div className="text-3xl font-bold mb-1">
              {new Date(CONTRACT_END).toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
            <div className="flex items-center gap-2 text-brand-gold font-semibold text-lg">
              <AlertTriangle size={18} />
              {t('daysLeft', { days: daysLeft })}
            </div>
          </div>
          <div className="w-24 h-24 border-4 border-brand-gold rounded-full flex items-center justify-center shrink-0">
            <div className="text-center">
              <div className="text-3xl font-bold text-brand-gold">{daysLeft}</div>
              <div className="text-blue-300 text-xs">{locale === 'vi' ? 'ngày' : 'days'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Renewal steps */}
      <div className="bg-white rounded-2xl shadow-card border border-surface-border p-6 mb-8">
        <h2 className="font-bold text-brand-blue mb-5">
          {locale === 'vi' ? 'Quy Trình Gia Hạn' : 'Renewal Process'}
        </h2>
        <div className="space-y-3">
          {steps.map((step, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-7 h-7 bg-brand-blue rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                {i + 1}
              </div>
              <span className="text-gray-700 text-sm">{step}</span>
              {i < 2 && <CheckCircle size={16} className="text-emerald-500 ml-auto" />}
            </div>
          ))}
        </div>
      </div>

      {/* Recommended renewal plans */}
      <h2 className="font-bold text-brand-blue mb-5">
        {locale === 'vi' ? 'Gói Điện Đề Xuất Cho Bạn' : 'Recommended Plans for You'}
      </h2>
      <div className="grid md:grid-cols-3 gap-5 mb-8">
        {renewalPlans.map((plan, i) => (
          <PlanCard key={plan.id} plan={plan} highlighted={i === 0} />
        ))}
      </div>

      <div className="text-center">
        <Link href="/compare">
          <Button variant="primary" size="lg">
            {locale === 'vi' ? 'Xem Tất Cả Gói' : 'View All Plans'} <ArrowRight size={16} />
          </Button>
        </Link>
      </div>
    </div>
  )
}
