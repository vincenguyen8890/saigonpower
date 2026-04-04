import { useTranslations, useLocale } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { Leaf, Clock, DollarSign, ArrowRight, Star } from 'lucide-react'
import Button from '@/components/ui/Button'
import { getFeaturedPlans } from '@/data/mock-plans'

const BADGE_STYLES: Record<string, { label: string; labelEn: string; className: string }> = {
  popular: { label: 'Phổ Biến', labelEn: 'Popular', className: 'bg-blue-100 text-blue-700' },
  bestValue: { label: 'Giá Tốt', labelEn: 'Best Value', className: 'bg-amber-100 text-amber-700' },
  green: { label: 'Xanh 100%', labelEn: '100% Green', className: 'bg-emerald-100 text-emerald-700' },
  noFee: { label: 'Không Phí', labelEn: 'No Fee', className: 'bg-purple-100 text-purple-700' },
}

export default function FeaturedPlans() {
  const t = useTranslations('featuredPlans')
  const locale = useLocale()
  const plans = getFeaturedPlans(3)

  return (
    <section className="py-20 bg-surface-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-brand-blue mb-4">{t('title')}</h2>
          <p className="text-gray-600 text-lg">{t('subtitle')}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl shadow-card border-2 transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1 overflow-hidden ${
                i === 1 ? 'border-brand-blue ring-2 ring-brand-blue/20' : 'border-surface-border'
              }`}
            >
              {/* Top accent */}
              {i === 1 && (
                <div className="bg-brand-blue text-white text-xs font-semibold text-center py-1.5">
                  ⭐ {locale === 'vi' ? 'Được Chọn Nhiều Nhất' : 'Most Selected'}
                </div>
              )}

              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <div className="text-xs text-gray-500 mb-0.5">{plan.provider.name}</div>
                    <div className="font-bold text-gray-900">{plan.name}</div>
                  </div>
                  <div className="flex flex-wrap gap-1 justify-end">
                    {plan.badges.slice(0, 1).map((badge) => {
                      const b = BADGE_STYLES[badge]
                      return b ? (
                        <span key={badge} className={`text-xs font-semibold px-2 py-0.5 rounded-full ${b.className}`}>
                          {locale === 'vi' ? b.label : b.labelEn}
                        </span>
                      ) : null
                    })}
                  </div>
                </div>

                {/* Rate */}
                <div className="flex items-end gap-1 mb-5">
                  <span className="text-4xl font-bold text-brand-blue">{plan.rateKwh.toFixed(1)}</span>
                  <span className="text-gray-500 mb-1 text-sm">{t('perKwh')}</span>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2 mb-5">
                  <div className="bg-surface-light rounded-xl p-2.5 text-center">
                    <Clock size={14} className="text-gray-400 mx-auto mb-1" />
                    <div className="text-sm font-bold text-gray-800">{plan.termMonths}</div>
                    <div className="text-xs text-gray-500">{t('term')}</div>
                  </div>
                  <div className="bg-surface-light rounded-xl p-2.5 text-center">
                    <Leaf size={14} className={`mx-auto mb-1 ${plan.renewablePercent >= 100 ? 'text-emerald-500' : 'text-gray-400'}`} />
                    <div className="text-sm font-bold text-gray-800">{plan.renewablePercent}%</div>
                    <div className="text-xs text-gray-500">{locale === 'vi' ? 'Tái tạo' : 'Green'}</div>
                  </div>
                  <div className="bg-surface-light rounded-xl p-2.5 text-center">
                    <DollarSign size={14} className="text-gray-400 mx-auto mb-1" />
                    <div className="text-sm font-bold text-gray-800">${plan.avgMonthlyBill.toFixed(0)}</div>
                    <div className="text-xs text-gray-500">{locale === 'vi' ? '/tháng' : '/mo'}</div>
                  </div>
                </div>

                {/* Cancellation */}
                <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-5">
                  <span className={plan.cancellationFee === 0 ? 'text-emerald-600 font-medium' : 'text-gray-600'}>
                    {plan.cancellationFee === 0
                      ? (locale === 'vi' ? '✓ Không phí hủy hợp đồng' : '✓ No cancellation fee')
                      : (locale === 'vi' ? `Phí hủy: $${plan.cancellationFee}` : `Cancel fee: $${plan.cancellationFee}`)
                    }
                  </span>
                </div>

                <Link href="/compare">
                  <Button
                    variant={i === 1 ? 'primary' : 'outline'}
                    size="md"
                    fullWidth
                  >
                    {t('selectPlan')} <ArrowRight size={15} />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link href="/compare">
            <Button variant="ghost" size="lg" className="text-brand-blue hover:bg-blue-50">
              {t('viewAll')} <ArrowRight size={16} />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
