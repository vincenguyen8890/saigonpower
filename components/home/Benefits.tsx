import { useLocale } from 'next-intl'
import { TrendingDown, Lightbulb, Globe, Briefcase, Check, X } from 'lucide-react'

export default function Benefits() {
  const locale = useLocale()
  const isVi = locale === 'vi'

  const benefits = [
    {
      icon: TrendingDown,
      color: 'text-blue-500',
      bg: 'bg-blue-50',
      border: 'border-blue-100',
      title: isVi ? 'Tiết Kiệm $200–$400/Năm' : 'Save $200–$400/Year',
      desc: isVi
        ? 'Khách hàng trung bình tiết kiệm $200–$400 mỗi năm khi chuyển qua Saigon Power.'
        : 'Our average customer saves $200–$400 per year after switching through Saigon Power.',
    },
    {
      icon: Lightbulb,
      color: 'text-amber-500',
      bg: 'bg-amber-50',
      border: 'border-amber-100',
      title: isVi ? 'Dễ Hiểu, Không Thuật Ngữ' : 'Plain Language, No Jargon',
      desc: isVi
        ? 'Giải thích rõ ràng bằng tiếng Việt. Không có thuật ngữ điện lực phức tạp.'
        : 'Clear explanations in Vietnamese. No confusing electricity industry jargon.',
    },
    {
      icon: Globe,
      color: 'text-emerald-500',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
      title: isVi ? 'Người Việt Phục Vụ Người Việt' : 'Vietnamese-Owned & Operated',
      desc: isVi
        ? 'Đội ngũ người Việt hiểu văn hóa, hiểu cộng đồng, và hiểu nhu cầu của bạn.'
        : 'Our team understands Vietnamese culture, community, and your specific needs.',
    },
    {
      icon: Briefcase,
      color: 'text-purple-500',
      bg: 'bg-purple-50',
      border: 'border-purple-100',
      title: isVi ? 'Chuyên Gia Thương Mại' : 'Commercial Specialists',
      desc: isVi
        ? 'Chuyên gia riêng cho tiệm nail, nhà hàng và doanh nghiệp nhỏ người Việt.'
        : 'Dedicated experts for Vietnamese nail salons, restaurants, and small businesses.',
    },
  ]

  const comparison = [
    { feature: isVi ? 'Hỗ trợ tiếng Việt'        : 'Vietnamese support',          saigon: true,  ogre: false },
    { feature: isVi ? 'Không phí đăng ký'         : 'No subscription fee',          saigon: true,  ogre: false },
    { feature: isVi ? 'Bạn chọn nhà cung cấp'     : 'You choose the provider',      saigon: true,  ogre: false },
    { feature: isVi ? 'So sánh minh bạch'          : 'Transparent comparison',       saigon: true,  ogre: false },
    { feature: isVi ? 'Nhắc gia hạn tự động'       : 'Automatic renewal reminders',  saigon: true,  ogre: true  },
    { feature: isVi ? 'Tư vấn thương mại'          : 'Commercial consulting',         saigon: true,  ogre: false },
    { feature: isVi ? 'Không phí ẩn'               : 'No hidden fees',               saigon: true,  ogre: false },
  ]

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-start">

          {/* Left — Benefits */}
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-brand-blue mb-3">
              {isVi ? 'Tại Sao Chọn Saigon Power?' : 'Why Choose Saigon Power?'}
            </h2>
            <p className="text-gray-500 text-lg mb-10">
              {isVi
                ? 'Chúng tôi không chỉ so sánh giá — chúng tôi là đối tác điện lực lâu dài của bạn.'
                : "We don't just compare prices — we're your long-term electricity partner."}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {benefits.map(({ icon: Icon, color, bg, border, title, desc }) => (
                <div key={title} className={`p-5 rounded-2xl border ${border} ${bg} hover:shadow-md transition-shadow`}>
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mb-3 shadow-sm">
                    <Icon size={20} className={color} />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1.5 text-sm">{title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — vs Energy Ogre */}
          <div>
            <div className="bg-sg-gradient rounded-3xl p-7 text-white">
              <div className="mb-6">
                <p className="text-green-300 text-sm font-medium mb-1">
                  {isVi ? 'So sánh với đối thủ' : 'How we compare'}
                </p>
                <h3 className="text-2xl font-bold text-white">
                  Saigon Power vs Energy Ogre
                </h3>
                <p className="text-green-300 text-sm mt-1">
                  {isVi
                    ? 'Energy Ogre tính $10–$15/tháng. Chúng tôi miễn phí.'
                    : 'Energy Ogre charges $10–$15/month. We are free.'}
                </p>
              </div>

              {/* Header row */}
              <div className="grid grid-cols-[1fr_80px_80px] gap-2 pb-2 border-b border-white/10 mb-1">
                <div />
                <div className="text-center">
                  <p className="text-xs font-bold text-brand-gold">Saigon</p>
                  <p className="text-xs text-green-400">{isVi ? 'Miễn phí' : 'Free'}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs font-semibold text-blue-300">Energy Ogre</p>
                  <p className="text-xs text-red-400">$10–$15/mo</p>
                </div>
              </div>

              <div className="space-y-1">
                {comparison.map(({ feature, saigon, ogre }) => (
                  <div key={feature} className="grid grid-cols-[1fr_80px_80px] gap-2 items-center py-2.5 border-b border-white/5">
                    <span className="text-green-200 text-sm">{feature}</span>
                    <div className="flex justify-center">
                      {saigon
                        ? <span className="w-6 h-6 bg-brand-gold/20 rounded-full flex items-center justify-center"><Check size={13} className="text-brand-gold" /></span>
                        : <span className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center"><X size={13} className="text-red-400" /></span>
                      }
                    </div>
                    <div className="flex justify-center">
                      {ogre
                        ? <span className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center"><Check size={13} className="text-blue-300" /></span>
                        : <span className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center"><X size={13} className="text-red-400/70" /></span>
                      }
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 bg-brand-gold/10 border border-brand-gold/30 rounded-xl px-4 py-3">
                <p className="text-brand-gold font-bold text-sm">
                  {isVi
                    ? '💡 Không có phí đăng ký hàng tháng. Luôn luôn.'
                    : '💡 No monthly subscription. Ever.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
