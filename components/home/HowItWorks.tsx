import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { MapPin, BarChart2, CheckCircle, ArrowRight } from 'lucide-react'
import Button from '@/components/ui/Button'

export default function HowItWorks() {
  const t = useTranslations('howItWorks')

  const steps = [
    {
      number: '01',
      icon: MapPin,
      titleKey: 'step1Title' as const,
      descKey: 'step1Desc' as const,
      color: 'bg-blue-500',
    },
    {
      number: '02',
      icon: BarChart2,
      titleKey: 'step2Title' as const,
      descKey: 'step2Desc' as const,
      color: 'bg-brand-gold',
    },
    {
      number: '03',
      icon: CheckCircle,
      titleKey: 'step3Title' as const,
      descKey: 'step3Desc' as const,
      color: 'bg-brand-green',
    },
  ]

  return (
    <section className="py-20 bg-surface-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-brand-blue mb-4">{t('title')}</h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">{t('subtitle')}</p>
        </div>

        <div className="relative">
          {/* Connecting line (desktop) */}
          <div className="hidden lg:block absolute top-16 left-1/2 -translate-x-1/2 w-2/3 h-0.5 bg-gradient-to-r from-blue-500 via-brand-gold to-brand-green" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {steps.map(({ number, icon: Icon, titleKey, descKey, color }, i) => (
              <div key={number} className="relative text-center">
                <div className="flex flex-col items-center">
                  {/* Step circle */}
                  <div className={`relative w-14 h-14 ${color} rounded-2xl flex items-center justify-center shadow-lg mb-5 z-10`}>
                    <Icon size={24} className="text-white" />
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center text-xs font-bold text-gray-700 shadow-sm border border-surface-border">
                      {number}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-brand-blue mb-3">{t(titleKey)}</h3>
                  <p className="text-gray-600 leading-relaxed max-w-xs">{t(descKey)}</p>
                </div>
                {/* Arrow for mobile */}
                {i < 2 && (
                  <div className="lg:hidden flex justify-center my-4">
                    <ArrowRight size={20} className="text-gray-300 rotate-90" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-12">
          <Link href="/compare">
            <Button variant="primary" size="lg">
              {t('cta')} <ArrowRight size={18} />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
