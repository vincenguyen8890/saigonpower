import { useLocale } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { BarChart2, UserCheck, ArrowRight, Zap, Clock } from 'lucide-react'

export default function DualPath() {
  const locale = useLocale()
  const isVi = locale === 'vi'

  return (
    <section className="py-20 bg-surface-light">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">

        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-brand-blue mb-3">
            {isVi ? 'Bạn Muốn Làm Gì Hôm Nay?' : 'How Can We Help You?'}
          </h2>
          <p className="text-gray-500 text-lg">
            {isVi ? 'Chọn cách phù hợp nhất với bạn' : 'Choose the path that works best for you'}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">

          {/* Self-compare */}
          <Link
            href="/compare"
            className="group bg-white rounded-3xl border-2 border-gray-100 hover:border-brand-green hover:shadow-card-hover p-8 flex flex-col transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <BarChart2 size={26} className="text-brand-green" />
              </div>
              <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold">
                {isVi ? 'Nhanh nhất' : 'Fastest'}
              </span>
            </div>

            <h3 className="text-2xl font-bold text-brand-blue mb-3">
              {isVi ? 'Tự So Sánh Gói Điện' : 'Compare Plans Yourself'}
            </h3>
            <p className="text-gray-500 leading-relaxed mb-6 flex-1">
              {isVi
                ? 'Nhập ZIP, xem và so sánh tất cả gói điện trong khu vực của bạn. Chọn ngay trong 5 phút.'
                : 'Enter your ZIP, browse and compare all plans in your area. Enroll in 5 minutes.'}
            </p>

            <div className="flex items-center gap-2 mb-4">
              {(isVi
                ? ['Không cần gặp mặt', '50+ gói điện', 'Ngay lập tức']
                : ['No appointment', '50+ plans', 'Instant']
              ).map((label) => (
                <span key={label} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">
                  {label}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2 text-brand-green font-bold group-hover:gap-3 transition-all">
              {isVi ? 'Xem gói điện ngay' : 'Browse plans now'}
              <ArrowRight size={18} />
            </div>
          </Link>

          {/* Agent-select */}
          <Link
            href="/quote"
            className="group bg-brand-greenDark rounded-3xl border-2 border-brand-greenDark hover:shadow-card-hover p-8 flex flex-col transition-all duration-300 relative overflow-hidden"
          >
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-brand-greenDark via-brand-greenDark to-green-700 opacity-100" />

            <div className="relative flex items-start justify-between mb-6">
              <div className="w-14 h-14 bg-white/15 rounded-2xl flex items-center justify-center group-hover:bg-white/25 transition-colors">
                <UserCheck size={26} className="text-white" />
              </div>
              <span className="text-xs bg-brand-gold/20 text-brand-gold border border-brand-gold/30 px-3 py-1 rounded-full font-semibold">
                {isVi ? 'Phổ biến nhất' : 'Most popular'}
              </span>
            </div>

            <div className="relative">
              <h3 className="text-2xl font-bold text-white mb-3">
                {isVi ? 'Để Chúng Tôi Chọn Giúp' : 'Let Us Choose For You'}
              </h3>
              <p className="text-green-200 leading-relaxed mb-6">
                {isVi
                  ? 'Chuyên gia người Việt phân tích hóa đơn của bạn và chọn gói tốt nhất. Hoàn toàn miễn phí.'
                  : 'Our Vietnamese-speaking experts analyze your bill and find the best plan. Always free.'}
              </p>

              <div className="flex items-center gap-2 mb-6">
                {(isVi
                  ? ['Tư vấn 1-1', 'Tiết kiệm tối đa', 'Tiếng Việt']
                  : ['1-on-1 advice', 'Max savings', 'Vietnamese']
                ).map((label) => (
                  <span key={label} className="text-xs bg-white/10 text-green-200 px-2.5 py-1 rounded-full font-medium border border-white/20">
                    {label}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-2.5 flex-1">
                  <Clock size={15} className="text-brand-gold" />
                  <span className="text-white text-sm font-medium">
                    {isVi ? 'Phản hồi trong 24 giờ' : 'Response within 24 hours'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-brand-gold font-bold group-hover:gap-3 transition-all">
                <Zap size={16} />
                {isVi ? 'Nhận tư vấn miễn phí' : 'Get free consultation'}
                <ArrowRight size={18} />
              </div>
            </div>
          </Link>
        </div>
      </div>
    </section>
  )
}
