import { useTranslations, useLocale } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { Check, Zap, Home, ArrowRight, Phone } from 'lucide-react'
import Button from '@/components/ui/Button'
import PlanCard from '@/components/compare/PlanCard'
import { getPlansByType } from '@/data/mock-plans'

export default function ResidentialPage() {
  const t = useTranslations('residential')
  const locale = useLocale()
  const plans = getPlansByType('residential').slice(0, 6)

  const features = [t('feature1'), t('feature2'), t('feature3'), t('feature4')]

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-hero-gradient text-white pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 mb-5">
                <Home size={15} className="text-brand-gold" />
                <span className="text-sm">{t('title')}</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-5">{t('heroTitle')}</h1>
              <p className="text-blue-200 text-lg mb-8 leading-relaxed">{t('heroDesc')}</p>
              <ul className="space-y-3 mb-8">
                {features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-blue-100">
                    <div className="w-5 h-5 bg-brand-gold rounded-full flex items-center justify-center shrink-0">
                      <Check size={11} className="text-white" />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-3">
                <Link href="/compare">
                  <Button variant="gold" size="lg">{t('getCTA')} <ArrowRight size={18} /></Button>
                </Link>
                <a href="tel:+18329379999">
                  <Button variant="secondary" size="lg" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
                    <Phone size={16} /> (832) 937-9999
                  </Button>
                </a>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
                <div className="text-center text-blue-200 text-sm mb-4">
                  {locale === 'vi' ? 'Ước tính tiết kiệm hàng năm' : 'Estimated annual savings'}
                </div>
                <div className="text-center">
                  <span className="text-6xl font-bold text-brand-gold">$300</span>
                  <span className="text-blue-200 text-xl ml-2">{locale === 'vi' ? '/năm' : '/year'}</span>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  {[
                    { label: locale === 'vi' ? 'Gói Cố Định' : 'Fixed Plans', value: '12+' },
                    { label: locale === 'vi' ? 'Nhà Cung Cấp' : 'Providers', value: '6+' },
                    { label: locale === 'vi' ? 'Điện Xanh' : 'Green Options', value: '5+' },
                    { label: locale === 'vi' ? 'Khách Hàng' : 'Customers', value: '500+' },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-white/10 rounded-xl p-3 text-center">
                      <div className="text-xl font-bold text-white">{value}</div>
                      <div className="text-xs text-blue-300">{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Plans section */}
      <section className="py-20 bg-surface-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-brand-blue mb-3">
              {locale === 'vi' ? 'Gói Điện Dân Cư' : 'Residential Plans'}
            </h2>
            <p className="text-gray-600">{locale === 'vi' ? 'Chọn gói phù hợp cho gia đình bạn' : 'Choose the right plan for your home'}</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan, i) => (
              <PlanCard key={plan.id} plan={plan} highlighted={i === 0} />
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/compare">
              <Button variant="outline" size="lg">
                {locale === 'vi' ? 'Xem Tất Cả Gói' : 'View All Plans'} <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
