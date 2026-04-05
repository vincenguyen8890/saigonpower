'use client'

import { useState } from 'react'
import { useLocale } from 'next-intl'
import { useRouter } from '@/i18n/navigation'
import { Link } from '@/i18n/navigation'
import { Phone, ArrowRight, Shield, MapPin, Star } from 'lucide-react'
import { isValidZip } from '@/lib/utils'

export default function FinalCTA() {
  const locale = useLocale()
  const router = useRouter()
  const [zip, setZip] = useState('')
  const [error, setError] = useState('')
  const isVi = locale === 'vi'

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValidZip(zip)) {
      setError(isVi ? 'ZIP không hợp lệ (5 chữ số)' : 'Invalid ZIP code (5 digits)')
      return
    }
    router.push({ pathname: '/compare', query: { zip } } as Parameters<typeof router.push>[0])
  }

  return (
    <section className="py-24 bg-surface-light">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">

        {/* Star rating */}
        <div className="flex items-center justify-center gap-1 mb-6">
          {[1,2,3,4,5].map(i => (
            <Star key={i} size={20} className="text-brand-gold fill-brand-gold" />
          ))}
          <span className="text-gray-500 text-sm ml-2">
            {isVi ? '4.9/5 từ 200+ đánh giá Google' : '4.9/5 from 200+ Google reviews'}
          </span>
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-blue mb-4">
          {isVi ? 'Sẵn Sàng Tiết Kiệm Tiền Điện?' : 'Ready to Save on Electricity?'}
        </h2>
        <p className="text-gray-500 text-lg mb-10 max-w-2xl mx-auto">
          {isVi
            ? 'Hơn 500 gia đình và doanh nghiệp người Việt đã tiết kiệm được. Tư vấn 100% miễn phí, không ràng buộc.'
            : 'Over 500 Vietnamese families and businesses have already saved. 100% free, no commitment.'}
        </p>

        {/* ZIP Form */}
        <form onSubmit={handleSubmit} className="max-w-lg mx-auto mb-6">
          <div className="flex flex-col sm:flex-row gap-3 shadow-card">
            <div className="flex-1 relative">
              <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                inputMode="numeric"
                value={zip}
                onChange={(e) => { setZip(e.target.value.replace(/\D/g, '')); setError('') }}
                placeholder={isVi ? 'Nhập mã ZIP...' : 'Enter ZIP code...'}
                maxLength={5}
                className="w-full pl-10 pr-4 py-4 rounded-2xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 text-base focus:outline-none focus:ring-2 focus:ring-brand-green"
              />
            </div>
            <button
              type="submit"
              className="sm:shrink-0 bg-brand-greenDark hover:bg-brand-green text-white font-bold py-4 px-7 rounded-2xl text-base transition-colors flex items-center justify-center gap-2"
            >
              {isVi ? 'Xem Gói Điện Ngay' : 'View Plans Now'}
              <ArrowRight size={18} />
            </button>
          </div>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </form>

        {/* OR divider */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="h-px w-16 bg-gray-200" />
          <span className="text-gray-400 text-sm">{isVi ? 'hoặc' : 'or'}</span>
          <div className="h-px w-16 bg-gray-200" />
        </div>

        {/* Phone + Quote links */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
          <a
            href="tel:+18329379999"
            className="flex items-center gap-2.5 bg-white border-2 border-gray-200 hover:border-brand-green text-brand-blue font-bold px-6 py-3 rounded-2xl transition-colors text-sm"
          >
            <Phone size={16} className="text-brand-green" />
            {isVi ? 'Gọi (832) 937-9999' : 'Call (832) 937-9999'}
          </a>
          <Link
            href="/quote"
            className="flex items-center gap-2 text-brand-green font-bold text-sm hover:underline"
          >
            {isVi ? 'Hoặc điền form nhận báo giá' : 'Or fill out quote form'}
            <ArrowRight size={15} />
          </Link>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-gray-400 text-xs">
          <span className="flex items-center gap-1.5">
            <Shield size={13} className="text-brand-green" />
            {isVi ? 'Thông tin bảo mật tuyệt đối' : 'Your data is fully secure'}
          </span>
          <span className="flex items-center gap-1.5">
            <Shield size={13} className="text-brand-green" />
            {isVi ? 'Dịch vụ tư vấn miễn phí' : 'Consultation always free'}
          </span>
          <span className="flex items-center gap-1.5">
            <Shield size={13} className="text-brand-green" />
            {isVi ? 'Không spam, không chia sẻ thông tin' : 'No spam, no data sharing'}
          </span>
        </div>
      </div>
    </section>
  )
}
