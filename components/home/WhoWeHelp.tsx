import { useLocale } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { Home, Scissors, ChefHat, Briefcase, ArrowRight } from 'lucide-react'

export default function WhoWeHelp() {
  const locale = useLocale()
  const isVi = locale === 'vi'

  const segments = [
    {
      icon: Home,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-100 hover:border-blue-300',
      title: isVi ? 'Nhà Ở' : 'Homeowners',
      desc: isVi
        ? 'Gói cố định 12–24 tháng tiết kiệm nhất cho gia đình. Không phí chuyển đổi.'
        : 'Fixed-rate 12–24 month plans for maximum savings. No switching fees.',
      badge: isVi ? 'Phổ biến nhất' : 'Most popular',
      badgeClass: 'bg-blue-100 text-blue-700',
      href: '/residential',
    },
    {
      icon: Scissors,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
      border: 'border-rose-100 hover:border-rose-300',
      title: isVi ? 'Tiệm Nail & Spa' : 'Nail Salons & Spas',
      desc: isVi
        ? 'Hiểu chi phí vận hành tiệm nail. Tư vấn đặc biệt cho chủ tiệm người Việt.'
        : 'We understand nail salon operating costs. Specialized advice for Vietnamese owners.',
      badge: isVi ? 'Tư vấn riêng' : 'Specialized',
      badgeClass: 'bg-rose-100 text-rose-700',
      href: '/commercial',
    },
    {
      icon: ChefHat,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-100 hover:border-amber-300',
      title: isVi ? 'Nhà Hàng & Quán Ăn' : 'Restaurants',
      desc: isVi
        ? 'Gói thương mại tùy chỉnh. Tiết kiệm hàng trăm đô la mỗi tháng cho nhà hàng.'
        : 'Custom commercial plans. Save hundreds per month on your restaurant electric bill.',
      badge: isVi ? 'Thương mại' : 'Commercial',
      badgeClass: 'bg-amber-100 text-amber-700',
      href: '/commercial',
    },
    {
      icon: Briefcase,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      border: 'border-purple-100 hover:border-purple-300',
      title: isVi ? 'Doanh Nghiệp Nhỏ' : 'Small Businesses',
      desc: isVi
        ? 'So sánh gói điện thương mại, ký hợp đồng dài hạn và tiết kiệm ngay từ tháng đầu.'
        : 'Compare commercial plans, sign long-term contracts, save from month one.',
      badge: isVi ? 'Doanh nghiệp' : 'Business',
      badgeClass: 'bg-purple-100 text-purple-700',
      href: '/commercial',
    },
  ]

  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-brand-blue mb-3">
            {isVi ? 'Chúng Tôi Phục Vụ Ai?' : 'Who We Help'}
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            {isVi
              ? 'Giải pháp điện cho mọi nhu cầu của cộng đồng người Việt tại Texas'
              : 'Electricity solutions for every need in the Vietnamese-American community'}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {segments.map(({ icon: Icon, color, bg, border, title, desc, badge, badgeClass, href }) => (
            <Link
              key={title}
              href={href}
              className={`group bg-white rounded-2xl border-2 ${border} p-6 flex flex-col hover:shadow-card transition-all duration-300`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <Icon size={22} className={color} />
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${badgeClass}`}>
                  {badge}
                </span>
              </div>

              <h3 className="font-bold text-gray-900 text-lg mb-2">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed flex-1">{desc}</p>

              <div className="flex items-center gap-1.5 text-brand-green font-semibold text-sm mt-4 group-hover:gap-2.5 transition-all">
                {isVi ? 'Tìm hiểu thêm' : 'Learn more'}
                <ArrowRight size={15} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
