'use client'

import { useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { ChevronDown, Search, Phone, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import Button from '@/components/ui/Button'

const FAQ_DATA = {
  general: [
    { q_vi: 'Saigon Power là gì?', q_en: 'What is Saigon Power?', a_vi: 'Saigon Power là nền tảng so sánh giá điện Texas dành cho cộng đồng người Việt. Chúng tôi giúp bạn tìm gói điện phù hợp nhất với giá tốt nhất.', a_en: 'Saigon Power is a Texas electricity comparison platform for the Vietnamese community. We help you find the best electricity plan at the best price.' },
    { q_vi: 'Dịch vụ của Saigon Power có miễn phí không?', q_en: 'Is Saigon Power free?', a_vi: 'Hoàn toàn miễn phí! Chúng tôi kiếm tiền từ hoa hồng của nhà cung cấp điện, không thu phí từ khách hàng.', a_en: 'Completely free! We earn commissions from electricity providers, not from customers.' },
  ],
  switching: [
    { q_vi: 'Tôi có thể chuyển đổi nhà cung cấp điện không?', q_en: 'Can I switch electricity providers?', a_vi: 'Có! Texas là thị trường điện tự do (deregulated), bạn có thể tự do chọn nhà cung cấp phù hợp mà không cần thông báo trước.', a_en: 'Yes! Texas is a deregulated electricity market, so you can freely choose your provider without any prior notice.' },
    { q_vi: 'Chuyển đổi có mất điện không?', q_en: 'Will switching cause a power outage?', a_vi: 'Không. Việc chuyển đổi nhà cung cấp điện hoàn toàn liền mạch, đường dây điện vẫn do TDU (Oncor, CenterPoint...) quản lý.', a_en: 'No. Switching providers is completely seamless — the power lines are still managed by your local TDU (Oncor, CenterPoint, etc.).' },
    { q_vi: 'Mất bao lâu để chuyển đổi?', q_en: 'How long does switching take?', a_vi: 'Quá trình chuyển đổi thường mất 1-3 ngày làm việc sau khi đăng ký.', a_en: 'The switching process usually takes 1-3 business days after enrollment.' },
  ],
  billing: [
    { q_vi: 'Hóa đơn điện của tôi bao gồm những gì?', q_en: 'What is included in my electricity bill?', a_vi: 'Hóa đơn bao gồm: giá điện (kWh × rate), phí phân phối (TDU charges), phí cơ bản hàng tháng, và thuế.', a_en: 'Your bill includes: electricity cost (kWh × rate), distribution fees (TDU charges), monthly base fee, and taxes.' },
    { q_vi: 'Tại sao hóa đơn của tôi cao bất thường?', q_en: 'Why is my bill unusually high?', a_vi: 'Có thể do thời tiết nóng làm tăng sử dụng điều hòa, hoặc do hợp đồng hết hạn và bạn bị chuyển sang giá thị trường cao hơn.', a_en: 'It could be due to hot weather increasing AC usage, or your contract expired and you rolled to higher market rates.' },
  ],
  contract: [
    { q_vi: 'Phí hủy hợp đồng là gì?', q_en: 'What is a cancellation fee?', a_vi: 'Phí hủy hợp đồng là số tiền bạn phải trả nếu hủy hợp đồng trước khi hết hạn. Một số gói không có phí này.', a_en: 'A cancellation fee is the amount you pay if you cancel your contract before it expires. Some plans have no cancellation fee.' },
    { q_vi: 'Điều gì xảy ra khi hợp đồng hết hạn?', q_en: 'What happens when my contract expires?', a_vi: 'Bạn sẽ tự động chuyển sang giá thị trường thả nổi, thường cao hơn nhiều. Vì vậy, quan trọng là gia hạn trước 30-60 ngày.', a_en: "You'll automatically roll to variable market rates, which are often much higher. That's why it's important to renew 30-60 days early." },
  ],
  commercial: [
    { q_vi: 'Doanh nghiệp nhỏ có cần hợp đồng dài không?', q_en: 'Do small businesses need long contracts?', a_vi: 'Không nhất thiết. Chúng tôi cung cấp gói 6-12 tháng phù hợp cho doanh nghiệp nhỏ muốn linh hoạt.', a_en: 'Not necessarily. We offer 6-12 month plans suitable for small businesses that want flexibility.' },
    { q_vi: 'Tiệm nail có thể tiết kiệm bao nhiêu?', q_en: 'How much can a nail salon save?', a_vi: 'Trung bình một tiệm nail tiết kiệm $100-$250/tháng khi chuyển sang gói điện phù hợp. Liên hệ chúng tôi để có báo giá cụ thể.', a_en: 'The average nail salon saves $100-$250/month by switching to the right plan. Contact us for a specific quote.' },
  ],
}

type Category = keyof typeof FAQ_DATA | 'all'

export default function FAQPage() {
  const t = useTranslations('faq')
  const locale = useLocale()
  const [activeCategory, setActiveCategory] = useState<Category>('all')
  const [search, setSearch] = useState('')
  const [openIdx, setOpenIdx] = useState<string | null>(null)

  const categories: { key: Category; label: string }[] = [
    { key: 'all', label: t('categories.all') },
    { key: 'general', label: t('categories.general') },
    { key: 'switching', label: t('categories.switching') },
    { key: 'billing', label: t('categories.billing') },
    { key: 'contract', label: t('categories.contract') },
    { key: 'commercial', label: t('categories.commercial') },
  ]

  const allFaqs = activeCategory === 'all'
    ? Object.entries(FAQ_DATA).flatMap(([cat, items]) => items.map((item, i) => ({ ...item, id: `${cat}-${i}` })))
    : FAQ_DATA[activeCategory as keyof typeof FAQ_DATA].map((item, i) => ({ ...item, id: `${activeCategory}-${i}` }))

  const filtered = search
    ? allFaqs.filter((faq) =>
        (locale === 'vi' ? faq.q_vi : faq.q_en).toLowerCase().includes(search.toLowerCase())
      )
    : allFaqs

  return (
    <div className="min-h-screen bg-surface-light">
      {/* Header */}
      <section className="bg-hero-gradient text-white pt-32 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-4xl font-bold mb-4">{t('title')}</h1>
          <p className="text-blue-200 text-lg mb-8">{t('subtitle')}</p>
          <div className="relative max-w-md mx-auto">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-gold shadow-lg"
            />
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium transition-all',
                activeCategory === key
                  ? 'bg-brand-blue text-white shadow-blue'
                  : 'bg-white text-gray-700 border border-surface-border hover:border-brand-blue'
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* FAQ list */}
        <div className="space-y-3 mb-12">
          {filtered.map(({ id, q_vi, q_en, a_vi, a_en }) => (
            <div key={id} className="bg-white rounded-2xl border border-surface-border overflow-hidden">
              <button
                className="w-full flex items-center justify-between p-5 text-left hover:bg-surface-light transition-colors"
                onClick={() => setOpenIdx(openIdx === id ? null : id)}
              >
                <span className="font-semibold text-gray-900 pr-4">{locale === 'vi' ? q_vi : q_en}</span>
                <ChevronDown size={18} className={cn('text-brand-blue shrink-0 transition-transform', openIdx === id && 'rotate-180')} />
              </button>
              {openIdx === id && (
                <div className="px-5 pb-5 border-t border-surface-border">
                  <p className="pt-4 text-gray-600 leading-relaxed">{locale === 'vi' ? a_vi : a_en}</p>
                </div>
              )}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Search size={40} className="mx-auto mb-4 opacity-30" />
              <p>{locale === 'vi' ? 'Không tìm thấy kết quả' : 'No results found'}</p>
            </div>
          )}
        </div>

        {/* Contact CTA */}
        <div className="bg-brand-blue rounded-2xl p-8 text-white text-center">
          <h3 className="text-xl font-bold mb-3">{t('stillHaveQ')}</h3>
          <p className="text-blue-200 mb-6">
            {locale === 'vi' ? 'Đội ngũ hỗ trợ tiếng Việt của chúng tôi luôn sẵn sàng giúp bạn.' : 'Our Vietnamese support team is always ready to help.'}
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a href="tel:+18329379999">
              <Button variant="gold" size="md"><Phone size={16} /> (832) 937-9999</Button>
            </a>
            <Link href="/contact">
              <Button variant="secondary" size="md" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <MessageCircle size={16} /> {t('contactUs')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
