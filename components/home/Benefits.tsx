import { useTranslations } from 'next-intl'
import { TrendingDown, Lightbulb, Globe, Briefcase } from 'lucide-react'

const icons = [TrendingDown, Lightbulb, Globe, Briefcase]
const colors = [
  { icon: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-100' },
  { icon: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-100' },
  { icon: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100' },
  { icon: 'text-purple-500', bg: 'bg-purple-50', border: 'border-purple-100' },
]

export default function Benefits() {
  const t = useTranslations('benefits')

  const items = [
    { titleKey: 'b1Title' as const, descKey: 'b1Desc' as const },
    { titleKey: 'b2Title' as const, descKey: 'b2Desc' as const },
    { titleKey: 'b3Title' as const, descKey: 'b3Desc' as const },
    { titleKey: 'b4Title' as const, descKey: 'b4Desc' as const },
  ]

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-brand-blue mb-4">{t('title')}</h2>
            <p className="text-gray-600 text-lg mb-10">{t('subtitle')}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {items.map(({ titleKey, descKey }, i) => {
                const Icon = icons[i]
                const c = colors[i]
                return (
                  <div
                    key={titleKey}
                    className={`p-5 rounded-2xl border ${c.border} ${c.bg} hover:shadow-md transition-shadow`}
                  >
                    <div className={`w-10 h-10 bg-white rounded-xl flex items-center justify-center mb-3 shadow-sm`}>
                      <Icon size={20} className={c.icon} />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-1.5">{t(titleKey)}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{t(descKey)}</p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right - Visual */}
          <div className="relative">
            <div className="bg-sg-gradient rounded-3xl p-8 text-white border border-green-800/30">
              <h3 className="text-2xl font-bold mb-6">
                So sánh với đối thủ
              </h3>
              {/* Comparison table */}
              <div className="space-y-3">
                {[
                  { feature: 'Hỗ trợ tiếng Việt', saigon: true, others: false },
                  { feature: 'So sánh minh bạch', saigon: true, others: false },
                  { feature: 'Không phí ẩn', saigon: true, others: false },
                  { feature: 'Nhắc gia hạn tự động', saigon: true, others: true },
                  { feature: 'Tư vấn miễn phí', saigon: true, others: true },
                  { feature: 'Gói thương mại', saigon: true, others: false },
                ].map(({ feature, saigon, others }) => (
                  <div key={feature} className="flex items-center justify-between py-2.5 border-b border-white/10">
                    <span className="text-blue-200 text-sm">{feature}</span>
                    <div className="flex items-center gap-6">
                      <div className="text-center w-16">
                        <span className={`text-sm font-bold ${saigon ? 'text-brand-gold' : 'text-red-400'}`}>
                          {saigon ? '✓' : '✗'}
                        </span>
                        <div className="text-xs text-blue-300 mt-0.5">Saigon</div>
                      </div>
                      <div className="text-center w-16">
                        <span className={`text-sm font-bold ${others ? 'text-blue-300' : 'text-red-400/70'}`}>
                          {others ? '✓' : '✗'}
                        </span>
                        <div className="text-xs text-blue-400 mt-0.5">Khác</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
