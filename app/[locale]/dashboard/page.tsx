import { useTranslations, useLocale } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { Zap, TrendingDown, Calendar, AlertTriangle, ArrowRight, DollarSign } from 'lucide-react'
import Button from '@/components/ui/Button'
import { getDaysUntil, getRenewalUrgency, formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'

// Mock contract data
const MOCK_CONTRACT = {
  planName: 'Gexa Saver 12',
  provider: 'Gexa Energy',
  rateKwh: 11.5,
  startDate: '2024-04-01',
  endDate: '2025-04-30',
  monthlyUsage: 1050,
  lastBill: 124.75,
  totalSavings: 320,
}

export default function DashboardPage() {
  const t = useTranslations('dashboard')
  const locale = useLocale()

  const daysLeft = getDaysUntil(MOCK_CONTRACT.endDate)
  const urgency = getRenewalUrgency(daysLeft)

  return (
    <div>
      {/* Welcome header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-brand-blue mb-1">
          {t('welcome')}, Anh Minh! 👋
        </h1>
        <p className="text-gray-600 text-sm">
          {locale === 'vi' ? 'Đây là tổng quan tài khoản của bạn' : 'Here is your account overview'}
        </p>
      </div>

      {/* Renewal alert */}
      {urgency !== 'ok' && (
        <div className={cn(
          'rounded-2xl p-5 mb-6 flex items-start gap-4',
          urgency === 'urgent' ? 'bg-red-50 border border-red-200' : 'bg-amber-50 border border-amber-200'
        )}>
          <AlertTriangle size={22} className={urgency === 'urgent' ? 'text-red-500' : 'text-amber-500'} />
          <div className="flex-1">
            <div className={`font-bold mb-1 ${urgency === 'urgent' ? 'text-red-700' : 'text-amber-700'}`}>
              {t('urgentRenewal')}
            </div>
            <p className={`text-sm ${urgency === 'urgent' ? 'text-red-600' : 'text-amber-600'}`}>
              {locale === 'vi'
                ? `Hợp đồng của bạn hết hạn sau ${daysLeft} ngày. Gia hạn ngay để tránh giá cao.`
                : `Your contract expires in ${daysLeft} days. Renew now to avoid higher rates.`
              }
            </p>
          </div>
          <Link href="/dashboard/renewal">
            <Button variant={urgency === 'urgent' ? 'danger' : 'gold'} size="sm">{t('renewNow')}</Button>
          </Link>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {[
          {
            icon: Zap,
            label: t('currentPlan'),
            value: MOCK_CONTRACT.planName,
            sub: `${MOCK_CONTRACT.rateKwh}¢/kWh`,
            color: 'bg-blue-50 text-brand-blue',
          },
          {
            icon: Calendar,
            label: t('expires'),
            value: new Date(MOCK_CONTRACT.endDate).toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US'),
            sub: t('daysLeft', { days: daysLeft }),
            color: urgency === 'urgent' ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-500',
          },
          {
            icon: TrendingDown,
            label: t('monthlyUsage'),
            value: `${MOCK_CONTRACT.monthlyUsage} kWh`,
            sub: locale === 'vi' ? 'Tháng này' : 'This month',
            color: 'bg-emerald-50 text-emerald-500',
          },
          {
            icon: DollarSign,
            label: t('savings'),
            value: formatCurrency(MOCK_CONTRACT.totalSavings),
            sub: locale === 'vi' ? 'Từ khi tham gia' : 'Since joining',
            color: 'bg-purple-50 text-purple-500',
          },
        ].map(({ icon: Icon, label, value, sub, color }) => (
          <div key={label} className="bg-white rounded-2xl p-5 shadow-card border border-surface-border">
            <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center mb-3`}>
              <Icon size={18} />
            </div>
            <div className="text-xs text-gray-500 mb-0.5">{label}</div>
            <div className="font-bold text-gray-900">{value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{sub}</div>
          </div>
        ))}
      </div>

      {/* Contract summary */}
      <div className="bg-white rounded-2xl shadow-card border border-surface-border p-6 mb-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-brand-blue">{t('myContract')}</h2>
          <Link href="/dashboard/contract">
            <Button variant="ghost" size="sm">
              {locale === 'vi' ? 'Xem chi tiết' : 'View details'} <ArrowRight size={14} />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: locale === 'vi' ? 'Nhà cung cấp' : 'Provider', value: MOCK_CONTRACT.provider },
            { label: locale === 'vi' ? 'Giá điện' : 'Rate', value: `${MOCK_CONTRACT.rateKwh}¢/kWh` },
            { label: locale === 'vi' ? 'Ngày bắt đầu' : 'Start date', value: new Date(MOCK_CONTRACT.startDate).toLocaleDateString() },
            { label: locale === 'vi' ? 'Ngày kết thúc' : 'End date', value: new Date(MOCK_CONTRACT.endDate).toLocaleDateString() },
          ].map(({ label, value }) => (
            <div key={label} className="bg-surface-light rounded-xl p-3">
              <div className="text-xs text-gray-500 mb-0.5">{label}</div>
              <div className="font-semibold text-gray-800 text-sm">{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Compare CTA */}
      <div className="bg-hero-gradient rounded-2xl p-6 text-white flex items-center justify-between">
        <div>
          <h3 className="font-bold mb-1">{t('comparePlans')}</h3>
          <p className="text-blue-200 text-sm">
            {locale === 'vi' ? 'Tìm gói mới khi hợp đồng sắp hết hạn' : 'Find a new plan as your contract approaches expiration'}
          </p>
        </div>
        <Link href="/compare">
          <Button variant="gold" size="md">{t('comparePlans')} <ArrowRight size={16} /></Button>
        </Link>
      </div>
    </div>
  )
}
