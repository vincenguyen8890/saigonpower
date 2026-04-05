import { useLocale } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { Bell, ArrowRight, RefreshCw } from 'lucide-react'

export default function RenewalBanner() {
  const locale = useLocale()
  const isVi = locale === 'vi'

  return (
    <section className="bg-brand-greenDark relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.06]"
        style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '32px 32px' }}
      />
      <div className="absolute -right-20 -top-20 w-64 h-64 bg-brand-green/20 rounded-full blur-3xl" />
      <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-brand-greenBright/10 rounded-full blur-3xl" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-16 text-center">

        {/* Icon badge */}
        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 mb-6">
          <Bell size={14} className="text-brand-gold" />
          <span className="text-green-200 text-sm font-medium">
            {isVi ? 'Dịch vụ gia hạn hợp đồng' : 'Contract renewal service'}
          </span>
        </div>

        {/* Main message */}
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight">
          {isVi ? (
            <>
              Chúng tôi sẽ nhắc bạn <span className="text-brand-gold">trước khi</span><br />
              hợp đồng hết hạn
            </>
          ) : (
            <>
              We'll remind you <span className="text-brand-gold">before</span><br />
              your contract expires
            </>
          )}
        </h2>

        <p className="text-green-200 text-lg max-w-2xl mx-auto mb-8">
          {isVi
            ? 'Khi hợp đồng điện hết hạn mà không gia hạn, bạn sẽ bị chuyển sang giá thả nổi – cao hơn 30–50%. Saigon Power nhắc trước 60 ngày và tìm gói tốt hơn cho bạn.'
            : "When your contract expires without renewal, you're switched to variable rates — 30–50% higher. We remind you 60 days early and find you a better plan."}
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/quote"
            className="flex items-center gap-2 bg-brand-gold hover:bg-brand-goldDark text-white font-bold px-8 py-4 rounded-2xl transition-colors shadow-gold"
          >
            <Bell size={16} />
            {isVi ? 'Đăng ký nhắc nhở miễn phí' : 'Sign up for free reminders'}
            <ArrowRight size={16} />
          </Link>
          <Link
            href="/compare"
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-8 py-4 rounded-2xl transition-colors"
          >
            <RefreshCw size={16} />
            {isVi ? 'So sánh gói mới ngay' : 'Compare new plans now'}
          </Link>
        </div>

        {/* Proof */}
        <p className="text-green-400 text-sm mt-6">
          {isVi
            ? '✓ Hơn 500 khách hàng đã tránh được giá cao nhờ dịch vụ này'
            : '✓ 500+ customers have avoided high rollover rates with this service'}
        </p>
      </div>
    </section>
  )
}
