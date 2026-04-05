import { useLocale } from 'next-intl'
import { MessageCircle, ShieldCheck, RefreshCw, Bell } from 'lucide-react'

export default function TrustBar() {
  const locale = useLocale()
  const isVi = locale === 'vi'

  const items = [
    {
      icon: MessageCircle,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      title: isVi ? 'Hỗ Trợ Tiếng Việt' : 'Vietnamese Support',
      desc: isVi ? 'Tư vấn 7 ngày/tuần' : '7 days a week',
    },
    {
      icon: ShieldCheck,
      color: 'text-green-600',
      bg: 'bg-green-50',
      title: isVi ? 'Không Phí Ẩn' : 'No Hidden Fees',
      desc: isVi ? 'Minh bạch 100%' : '100% transparent',
    },
    {
      icon: RefreshCw,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      title: isVi ? 'Chuyên Texas' : 'Texas Specialists',
      desc: isVi ? 'Thị trường ERCOT' : 'ERCOT market experts',
    },
    {
      icon: Bell,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      title: isVi ? 'Nhắc Gia Hạn' : 'Renewal Reminders',
      desc: isVi ? 'Tránh giá cao khi hết hạn' : 'Never pay rollover rates',
    },
  ]

  return (
    <section className="bg-white border-b border-gray-100 py-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {items.map(({ icon: Icon, color, bg, title, desc }) => (
            <div key={title} className="flex items-center gap-3">
              <div className={`w-10 h-10 ${bg} rounded-xl flex-shrink-0 flex items-center justify-center`}>
                <Icon size={18} className={color} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 leading-tight">{title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
