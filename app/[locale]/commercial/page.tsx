import { useTranslations, useLocale } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { Building2, Scissors, UtensilsCrossed, ShoppingBag, Warehouse, ArrowRight, Phone, Check } from 'lucide-react'
import Button from '@/components/ui/Button'
import { getPlansByType } from '@/data/mock-plans'
import PlanCard from '@/components/compare/PlanCard'

export default function CommercialPage() {
  const t = useTranslations('commercial')
  const locale = useLocale()
  const plans = getPlansByType('commercial')

  const targets = [
    { key: 'target1', icon: Scissors },
    { key: 'target2', icon: UtensilsCrossed },
    { key: 'target3', icon: ShoppingBag },
    { key: 'target4', icon: Building2 },
    { key: 'target5', icon: Warehouse },
    { key: 'target6', icon: Building2 },
  ] as const

  const services = [
    { key: 's1', titleKey: 's1Title' as const, descKey: 's1Desc' as const },
    { key: 's2', titleKey: 's2Title' as const, descKey: 's2Desc' as const },
    { key: 's3', titleKey: 's3Title' as const, descKey: 's3Desc' as const },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-hero-gradient text-white pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-brand-gold/20 border border-brand-gold/30 rounded-full px-4 py-2 mb-5">
              <Building2 size={15} className="text-brand-gold" />
              <span className="text-sm text-brand-gold font-medium">{t('title')}</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-5">{t('heroTitle')}</h1>
            <p className="text-blue-200 text-xl mb-8 leading-relaxed max-w-2xl">{t('heroDesc')}</p>
            <div className="flex flex-wrap gap-3">
              <Link href="/quote">
                <Button variant="gold" size="lg">{t('getCTA')} <ArrowRight size={18} /></Button>
              </Link>
              <a href="tel:+18329379999">
                <Button variant="secondary" size="lg" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                  <Phone size={16} /> (832) 937-9999
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Targets */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-brand-blue mb-8 text-center">{t('targetTitle')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {targets.map(({ key, icon: Icon }) => (
              <div key={key} className="text-center p-4 rounded-2xl border border-surface-border hover:border-brand-gold hover:shadow-card transition-all group">
                <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-amber-100 transition-colors">
                  <Icon size={22} className="text-amber-600" />
                </div>
                <div className="text-sm font-medium text-gray-700">{t(key)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-16 bg-surface-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-brand-blue mb-10 text-center">{t('services')}</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {services.map(({ key, titleKey, descKey }, i) => (
              <div key={key} className="bg-white rounded-2xl p-6 shadow-card border border-surface-border">
                <div className="w-10 h-10 bg-brand-blue rounded-xl flex items-center justify-center mb-4 text-white font-bold text-lg">
                  {i + 1}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{t(titleKey)}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{t(descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Commercial plans */}
      {plans.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-brand-blue mb-8 text-center">
              {locale === 'vi' ? 'Gói Điện Thương Mại' : 'Commercial Electricity Plans'}
            </h2>
            <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {plans.map((plan, i) => (
                <PlanCard key={plan.id} plan={plan} highlighted={i === 0} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16 bg-brand-blue text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">{t('getCTA')}</h2>
          <p className="text-blue-200 mb-8">
            {locale === 'vi'
              ? 'Chuyên gia của chúng tôi sẽ phân tích hóa đơn điện hiện tại và tìm gói tốt hơn cho bạn.'
              : 'Our experts will analyze your current bill and find a better plan for your business.'
            }
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/quote">
              <Button variant="gold" size="xl">{t('getCTA')} <ArrowRight size={20} /></Button>
            </Link>
            <a href="tel:+18329379999">
              <Button variant="secondary" size="xl" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <Phone size={18} /> (832) 937-9999
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
