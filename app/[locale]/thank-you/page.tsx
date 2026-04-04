import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { CheckCircle, Phone, ArrowRight } from 'lucide-react'
import Button from '@/components/ui/Button'

export default function ThankYouPage() {
  const t = useTranslations('quote')

  return (
    <div className="min-h-screen bg-surface-light flex items-center justify-center px-4 py-20">
      <div className="max-w-lg w-full text-center">
        <div className="bg-white rounded-3xl shadow-card-hover border border-surface-border p-12">
          {/* Success icon */}
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-emerald-500" />
          </div>

          <h1 className="text-3xl font-bold text-brand-blue mb-4">{t('successTitle')}</h1>
          <p className="text-gray-600 text-lg leading-relaxed mb-8">{t('successDesc')}</p>

          {/* Contact info */}
          <div className="bg-surface-light rounded-2xl p-5 mb-8">
            <div className="flex items-center justify-center gap-2 text-brand-blue font-semibold">
              <Phone size={18} className="text-brand-gold" />
              <a href="tel:+18329379999" className="hover:underline">(832) 937-9999</a>
            </div>
            <p className="text-gray-500 text-sm mt-1">
              Hoặc chúng tôi sẽ gọi lại trong vòng 24 giờ
            </p>
          </div>

          <div className="flex gap-3">
            <Link href="/" className="flex-1">
              <Button variant="secondary" size="lg" fullWidth>Về Trang Chủ</Button>
            </Link>
            <Link href="/compare" className="flex-1">
              <Button variant="primary" size="lg" fullWidth>
                So Sánh Gói <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
