import { useTranslations } from 'next-intl'
import { Star, Quote } from 'lucide-react'

export default function Testimonials() {
  const t = useTranslations('testimonials')

  const testimonials = [
    { nameKey: 't1Name' as const, locationKey: 't1Location' as const, textKey: 't1Text' as const },
    { nameKey: 't2Name' as const, locationKey: 't2Location' as const, textKey: 't2Text' as const },
    { nameKey: 't3Name' as const, locationKey: 't3Location' as const, textKey: 't3Text' as const },
    { nameKey: 't4Name' as const, locationKey: 't4Location' as const, textKey: 't4Text' as const },
  ]

  const avatarColors = ['bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-amber-500']

  return (
    <section className="py-20 bg-surface-light overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-brand-blue mb-4">{t('title')}</h2>
          <p className="text-gray-600 text-lg">{t('subtitle')}</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map(({ nameKey, locationKey, textKey }, i) => (
            <div
              key={nameKey}
              className="bg-white rounded-2xl p-6 shadow-card border border-surface-border hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1"
            >
              {/* Quote icon */}
              <Quote size={28} className="text-brand-blue/20 mb-3" />

              {/* Stars */}
              <div className="flex gap-0.5 mb-3">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} size={14} className="text-brand-gold fill-brand-gold" />
                ))}
              </div>

              {/* Text */}
              <p className="text-gray-700 text-sm leading-relaxed mb-5">
                "{t(textKey)}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 ${avatarColors[i]} rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                  {t(nameKey).split(' ').slice(-1)[0].charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">{t(nameKey)}</div>
                  <div className="text-gray-500 text-xs">{t(locationKey)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats bar */}
        <div className="mt-14 bg-brand-blue rounded-2xl p-8 text-white">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: '500+', label: 'Khách Hàng Hài Lòng' },
              { value: '4.9★', label: 'Đánh Giá Trung Bình' },
              { value: '$300', label: 'Tiết Kiệm TB/năm' },
              { value: '97%', label: 'Tỷ Lệ Giới Thiệu' },
            ].map(({ value, label }) => (
              <div key={label}>
                <div className="text-3xl font-bold text-brand-gold mb-1">{value}</div>
                <div className="text-blue-200 text-sm">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
