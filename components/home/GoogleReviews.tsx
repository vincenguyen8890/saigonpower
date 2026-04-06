'use client'

import { useRef, useState } from 'react'
import { useLocale } from 'next-intl'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { Star, ChevronLeft, ChevronRight } from 'lucide-react'

const reviews = [
  {
    name: 'Lan Nguyễn',
    location: 'Houston, TX',
    initials: 'LN',
    color: 'bg-brand-blue',
    textEn: 'Saigon Power saved me $340 last year. The team explains everything in Vietnamese — no confusing paperwork.',
    textVi: 'Saigon Power giúp tôi tiết kiệm $340 năm ngoái. Đội ngũ giải thích mọi thứ bằng tiếng Việt — không có giấy tờ phức tạp.',
  },
  {
    name: 'Minh Trần',
    location: 'Sugar Land, TX',
    initials: 'MT',
    color: 'bg-brand-green',
    textEn: 'As a nail salon owner, switching electricity was always confusing. Saigon Power handled everything for my 3 locations. Saved $80/month.',
    textVi: 'Là chủ tiệm nail, việc đổi điện luôn phức tạp. Saigon Power lo hết cho 3 địa điểm của tôi. Tiết kiệm $80/tháng.',
  },
  {
    name: 'Hoa Lê',
    location: 'Katy, TX',
    initials: 'HL',
    color: 'bg-brand-orange',
    textEn: 'They sent me a renewal reminder before my contract expired — saved me from a huge rate spike. Outstanding customer service, 10/10.',
    textVi: 'Họ nhắc nhở tôi gia hạn trước khi hết hạn — tránh bị tăng giá. Dịch vụ khách hàng xuất sắc, 10/10.',
  },
  {
    name: 'Tuấn Phạm',
    location: 'Pearland, TX',
    initials: 'TP',
    color: 'bg-purple-500',
    textEn: "I was paying 16¢/kWh. They found me a 10.5¢ plan. That's a huge difference on my monthly bill. Super easy process.",
    textVi: 'Tôi đang trả 16¢/kWh. Họ tìm được gói 10.5¢. Tiết kiệm rất lớn trên hóa đơn hàng tháng. Quy trình siêu dễ.',
  },
  {
    name: 'Mai Võ',
    location: 'Stafford, TX',
    initials: 'MV',
    color: 'bg-rose-500',
    textEn: 'My whole family uses Saigon Power now. They explained fixed vs variable rates — no one had ever explained that to me before.',
    textVi: 'Cả gia đình tôi dùng Saigon Power. Họ giải thích giá cố định và biến động mà trước đây chưa ai nói.',
  },
  {
    name: 'Dũng Ngô',
    location: 'Richmond, TX',
    initials: 'DN',
    color: 'bg-teal-500',
    textEn: 'Running a Vietnamese restaurant, electricity is our biggest expense. Saigon Power negotiated a rate that cut our bill by 22%.',
    textVi: 'Điều hành nhà hàng Việt, điện là chi phí lớn nhất. Saigon Power đàm phán được mức giá giúp giảm 22% hóa đơn.',
  },
]

const stats = [
  { value: '500+', labelEn: 'Customers Served', labelVi: 'Khách hàng' },
  { value: '4.9★', labelEn: 'Average Rating', labelVi: 'Đánh giá trung bình' },
  { value: '$150', labelEn: 'Avg Monthly Savings', labelVi: 'Tiết kiệm/tháng' },
  { value: '50+', labelEn: 'Plans Compared', labelVi: 'Gói điện so sánh' },
]

export default function GoogleReviews() {
  const locale = useLocale()
  const isVi = locale === 'vi'
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const [current, setCurrent] = useState(0)

  const visible = [
    reviews[current % reviews.length],
    reviews[(current + 1) % reviews.length],
    reviews[(current + 2) % reviews.length],
  ]

  return (
    <section className="bg-white py-24 lg:py-32">
      <div ref={ref} className="max-w-6xl mx-auto px-6 lg:px-12">

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-px bg-surface-border rounded-3xl overflow-hidden mb-20 shadow-card"
        >
          {stats.map(({ value, labelEn, labelVi }) => (
            <div key={value} className="bg-white px-8 py-7 text-center">
              <div className="text-3xl font-black text-brand-dark mb-1">{value}</div>
              <div className="text-sm text-brand-muted font-medium">{isVi ? labelVi : labelEn}</div>
            </div>
          ))}
        </motion.div>

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, delay: 0.1 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 gap-4"
        >
          <div>
            <h2 className="text-[clamp(1.8rem,4vw,3rem)] font-black text-brand-dark tracking-tight">
              {isVi ? 'Khách Hàng Nói Gì?' : 'What Customers Say'}
            </h2>
            <p className="text-brand-muted mt-1">
              {isVi ? '200+ đánh giá Google thực tế' : '200+ real Google reviews'}
            </p>
          </div>

          {/* Google badge */}
          <div className="flex items-center gap-3 bg-surface-bg border border-surface-border rounded-2xl px-5 py-3 flex-shrink-0">
            <div className="text-2xl font-black text-brand-dark">4.9</div>
            <div>
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={11} className="text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <div className="text-xs text-brand-muted mt-0.5">Google Reviews</div>
            </div>
          </div>
        </motion.div>

        {/* Desktop: 3 cards */}
        <div className="hidden md:grid md:grid-cols-3 gap-5 mb-8">
          {visible.map((r, i) => (
            <motion.div
              key={`${current}-${i}`}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              className="bg-white rounded-2xl border border-surface-border shadow-card p-7 hover:shadow-card-hover transition-shadow duration-200"
            >
              <div className="flex gap-0.5 mb-5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={13} className="text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-brand-muted text-sm leading-relaxed mb-6">
                &ldquo;{isVi ? r.textVi : r.textEn}&rdquo;
              </p>
              <div className="flex items-center gap-3 pt-5 border-t border-surface-border">
                <div className={`w-9 h-9 rounded-full ${r.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                  {r.initials}
                </div>
                <div>
                  <div className="text-brand-dark text-sm font-bold">{r.name}</div>
                  <div className="text-brand-muted text-xs">{r.location}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mobile: single card */}
        <div className="md:hidden mb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.28 }}
              className="bg-white rounded-2xl border border-surface-border shadow-card p-6"
            >
              <div className="flex gap-0.5 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={13} className="text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-brand-muted text-sm leading-relaxed mb-5">
                &ldquo;{isVi ? reviews[current].textVi : reviews[current].textEn}&rdquo;
              </p>
              <div className="flex items-center gap-3 pt-4 border-t border-surface-border">
                <div className={`w-9 h-9 rounded-full ${reviews[current].color} flex items-center justify-center text-white text-xs font-bold`}>
                  {reviews[current].initials}
                </div>
                <div>
                  <div className="text-brand-dark text-sm font-bold">{reviews[current].name}</div>
                  <div className="text-brand-muted text-xs">{reviews[current].location}</div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setCurrent(c => (c - 1 + reviews.length) % reviews.length)}
            className="w-9 h-9 rounded-full border border-surface-border bg-white hover:border-brand-green hover:text-brand-green flex items-center justify-center text-brand-muted transition-all"
          >
            <ChevronLeft size={16} />
          </button>
          <div className="flex gap-1.5">
            {reviews.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === current ? 'w-6 bg-brand-green' : 'w-1.5 bg-surface-border hover:bg-brand-muted'
                }`}
              />
            ))}
          </div>
          <button
            onClick={() => setCurrent(c => (c + 1) % reviews.length)}
            className="w-9 h-9 rounded-full border border-surface-border bg-white hover:border-brand-green hover:text-brand-green flex items-center justify-center text-brand-muted transition-all"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </section>
  )
}
