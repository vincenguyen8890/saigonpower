import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { Home, Building2, Check, ArrowRight } from 'lucide-react'
import Button from '@/components/ui/Button'

export default function DualPath() {
  const t = useTranslations('dualPath')

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-brand-blue mb-4">{t('title')}</h2>
          <p className="text-gray-600 text-lg">{t('subtitle')}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Residential */}
          <div className="group relative overflow-hidden rounded-3xl border-2 border-blue-100 hover:border-brand-blue p-8 transition-all duration-300 hover:shadow-card-hover">
            <div className="absolute top-0 right-0 w-40 h-40 bg-blue-50 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-100 transition-colors" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 bg-blue-100 text-brand-blue text-sm font-semibold px-3 py-1.5 rounded-full mb-5">
                <Home size={14} />
                {t('residential.badge')}
              </div>
              <h3 className="text-2xl font-bold text-brand-blue mb-3">{t('residential.title')}</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">{t('residential.desc')}</p>
              <ul className="space-y-2.5 mb-7">
                {(t.raw('residential.features') as string[]).map((feature: string) => (
                  <li key={feature} className="flex items-center gap-2.5 text-gray-700 text-sm">
                    <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                      <Check size={12} className="text-brand-blue" />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link href="/residential">
                <Button variant="primary" size="md" fullWidth>
                  {t('residential.cta')} <ArrowRight size={16} />
                </Button>
              </Link>
            </div>
          </div>

          {/* Commercial */}
          <div className="group relative overflow-hidden rounded-3xl border-2 border-amber-100 hover:border-brand-gold p-8 transition-all duration-300 hover:shadow-card-hover bg-gradient-to-br from-white to-amber-50/30">
            <div className="absolute top-0 right-0 w-40 h-40 bg-amber-50 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-amber-100 transition-colors" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 text-sm font-semibold px-3 py-1.5 rounded-full mb-5">
                <Building2 size={14} />
                {t('commercial.badge')}
              </div>
              <h3 className="text-2xl font-bold text-brand-blue mb-3">{t('commercial.title')}</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">{t('commercial.desc')}</p>
              <ul className="space-y-2.5 mb-7">
                {(t.raw('commercial.features') as string[]).map((feature: string) => (
                  <li key={feature} className="flex items-center gap-2.5 text-gray-700 text-sm">
                    <div className="w-5 h-5 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
                      <Check size={12} className="text-amber-600" />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link href="/commercial">
                <Button variant="gold" size="md" fullWidth>
                  {t('commercial.cta')} <ArrowRight size={16} />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
