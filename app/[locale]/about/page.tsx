import { useTranslations, useLocale } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { Zap, Target, Eye, Heart, Users, ArrowRight } from 'lucide-react'
import Button from '@/components/ui/Button'

export default function AboutPage() {
  const t = useTranslations('about')
  const locale = useLocale()

  const stats = [
    { value: '500+', label: locale === 'vi' ? 'Khách hàng' : 'Customers' },
    { value: '$300', label: locale === 'vi' ? 'Tiết kiệm TB/năm' : 'Avg savings/year' },
    { value: '15+', label: locale === 'vi' ? 'Nhà cung cấp' : 'Providers' },
    { value: '3+', label: locale === 'vi' ? 'Năm kinh nghiệm' : 'Years experience' },
  ]

  const values = [
    { key: 'v1', icon: Eye },
    { key: 'v2', icon: Heart },
    { key: 'v3', icon: Users },
    { key: 'v4', icon: Zap },
  ] as const

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-hero-gradient text-white pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-16 h-16 bg-brand-gold rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Zap size={32} className="text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-5">{t('heroTitle')}</h1>
          <p className="text-blue-200 text-xl max-w-3xl mx-auto leading-relaxed">{t('heroDesc')}</p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map(({ value, label }) => (
              <div key={label} className="p-5 rounded-2xl bg-surface-light">
                <div className="text-3xl font-bold text-brand-blue mb-1">{value}</div>
                <div className="text-gray-600 text-sm">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission + Vision */}
      <section className="py-16 bg-surface-light">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-card border border-surface-border">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-5">
                <Target size={22} className="text-brand-blue" />
              </div>
              <h2 className="text-xl font-bold text-brand-blue mb-4">{t('missionTitle')}</h2>
              <p className="text-gray-600 leading-relaxed">{t('missionDesc')}</p>
            </div>
            <div className="bg-brand-blue text-white rounded-2xl p-8 shadow-card">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-5">
                <Eye size={22} className="text-brand-gold" />
              </div>
              <h2 className="text-xl font-bold mb-4">{t('visionTitle')}</h2>
              <p className="text-blue-200 leading-relaxed">{t('visionDesc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-brand-blue mb-10 text-center">{t('valuesTitle')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {values.map(({ key, icon: Icon }) => (
              <div key={key} className="text-center p-6 rounded-2xl border border-surface-border hover:border-brand-blue hover:shadow-card transition-all">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Icon size={22} className="text-brand-blue" />
                </div>
                <div className="font-bold text-gray-900">{t(key)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-surface-light">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl font-bold text-brand-blue mb-4">
            {locale === 'vi' ? 'Bắt đầu tiết kiệm ngay hôm nay' : 'Start saving today'}
          </h2>
          <p className="text-gray-600 mb-8">
            {locale === 'vi'
              ? 'Hàng trăm gia đình và doanh nghiệp Việt đã tin tưởng chúng tôi. Bạn tiếp theo nhé?'
              : 'Hundreds of Vietnamese families and businesses have trusted us. Be next?'
            }
          </p>
          <Link href="/compare">
            <Button variant="primary" size="xl">
              {locale === 'vi' ? 'So Sánh Gói Điện' : 'Compare Plans'} <ArrowRight size={18} />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
