import { useTranslations } from 'next-intl'
import { MessageCircle, Eye, RefreshCw, Bell } from 'lucide-react'

const icons = [MessageCircle, Eye, RefreshCw, Bell]

export default function TrustBar() {
  const t = useTranslations('trust')

  const items = [
    { titleKey: 'item1Title', descKey: 'item1Desc', icon: icons[0], color: 'text-blue-500', bg: 'bg-blue-50' },
    { titleKey: 'item2Title', descKey: 'item2Desc', icon: icons[1], color: 'text-amber-500', bg: 'bg-amber-50' },
    { titleKey: 'item3Title', descKey: 'item3Desc', icon: icons[2], color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { titleKey: 'item4Title', descKey: 'item4Desc', icon: icons[3], color: 'text-purple-500', bg: 'bg-purple-50' },
  ] as const

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-brand-blue mb-3">{t('title')}</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map(({ titleKey, descKey, icon: Icon, color, bg }) => (
            <div key={titleKey} className="group p-6 rounded-2xl border border-surface-border hover:border-brand-green/40 hover:shadow-card transition-all duration-300">
              <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <Icon size={22} className={color} />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{t(titleKey)}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{t(descKey)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
