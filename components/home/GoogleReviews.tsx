'use client'

import { useRef, useState } from 'react'
import { useLocale } from 'next-intl'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react'

const reviews = [
  { name: 'Lan Nguyễn',  location: 'Houston, TX',  rating: 5, initials: 'LN', color: 'bg-brand-blue',   textEn: 'Saigon Power saved me $340 last year. The team explains everything in Vietnamese — no confusing paperwork. I recommend to all my friends.',          textVi: 'Saigon Power giúp tôi tiết kiệm $340 năm ngoái. Đội ngũ giải thích mọi thứ bằng tiếng Việt — không có giấy tờ phức tạp.' },
  { name: 'Minh Trần',   location: 'Sugar Land, TX',rating: 5, initials: 'MT', color: 'bg-brand-green',  textEn: 'As a nail salon owner, switching electricity was always confusing. Saigon Power handled everything for my 3 locations. Saved $80/month total.',       textVi: 'Là chủ tiệm nail, việc đổi điện luôn phức tạp. Saigon Power lo hết cho 3 địa điểm của tôi. Tiết kiệm $80/tháng.' },
  { name: 'Hoa Lê',      location: 'Katy, TX',      rating: 5, initials: 'HL', color: 'bg-brand-orange', textEn: 'They sent me a renewal reminder before my contract expired — saved me from a huge rate spike. Their customer service is outstanding, 10/10.',     textVi: 'Họ nhắc nhở tôi gia hạn trước khi hết hạn — tránh bị tăng giá. Dịch vụ khách hàng xuất sắc, 10/10.' },
  { name: 'Tuấn Phạm',   location: 'Pearland, TX',  rating: 5, initials: 'TP', color: 'bg-purple-500',   textEn: "I was paying 16 cents per kWh. They found me a 10.5-cent plan. That's a huge difference on my monthly bill. Super easy process.",                textVi: 'Tôi đang trả 16 xu/kWh. Họ tìm được gói 10.5 xu. Tiết kiệm rất lớn trên hóa đơn hàng tháng. Quy trình siêu dễ.' },
  { name: 'Mai Võ',       location: 'Stafford, TX',  rating: 5, initials: 'MV', color: 'bg-rose-500',     textEn: 'My whole family uses Saigon Power now. They explained the difference between fixed and variable rates which no one ever told me before.',        textVi: 'Cả gia đình tôi dùng Saigon Power. Họ giải thích sự khác biệt giữa giá cố định và biến động mà trước đây chưa ai nói.' },
  { name: 'Dũng Ngô',    location: 'Richmond, TX',  rating: 5, initials: 'DN', color: 'bg-teal-500',     textEn: 'Running a Vietnamese restaurant, electricity is our biggest expense. Saigon Power negotiated a commercial rate that cut our bill by 22%.',        textVi: 'Điều hành nhà hàng Việt, điện là chi phí lớn nhất. Saigon Power đàm phán được mức giá giúp giảm 22% hóa đơn.' },
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
    <section className="py-24 bg-white">
      <div ref={ref} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 gap-6"
        >
          <div>
            <div className="section-eyebrow w-fit mb-4">
              <Star size={12} className="fill-yellow-500 text-yellow-500" /> {isVi ? 'Đánh Giá Thực Tế' : 'Real Reviews'}
            </div>
            <h2 className="section-title">{isVi ? 'Khách Hàng Nói Gì?' : 'What Customers Say'}</h2>
          </div>

          {/* Google badge */}
          <div className="flex items-center gap-4 card px-5 py-3.5 flex-shrink-0">
            <div className="text-center">
              <div className="text-2xl font-black text-brand-dark">4.9</div>
              <div className="flex gap-0.5 mt-0.5">
                {[...Array(5)].map((_, i) => <Star key={i} size={10} className="text-yellow-400 fill-yellow-400" />)}
              </div>
            </div>
            <div className="h-8 w-px bg-surface-border" />
            <div>
              <div className="text-brand-dark text-sm font-bold">Google Reviews</div>
              <div className="text-brand-muted text-xs">200+ {isVi ? 'đánh giá' : 'reviews'}</div>
            </div>
          </div>
        </motion.div>

        {/* Desktop: 3 cards */}
        <div className="hidden md:grid md:grid-cols-3 gap-5 mb-8">
          {visible.map((r, i) => (
            <motion.div key={`${current}-${i}`}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: i * 0.07 }}
              className="card card-hover p-6"
            >
              <Quote size={20} className="text-brand-greenBorder mb-4" />
              <p className="text-brand-muted text-sm leading-relaxed mb-5">
                &ldquo;{isVi ? r.textVi : r.textEn}&rdquo;
              </p>
              <div className="flex items-center justify-between pt-4 border-t border-surface-border">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full ${r.color} flex items-center justify-center text-white text-xs font-bold`}>
                    {r.initials}
                  </div>
                  <div>
                    <div className="text-brand-dark text-sm font-bold">{r.name}</div>
                    <div className="text-brand-muted text-xs">{r.location}</div>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {[...Array(r.rating)].map((_, i) => <Star key={i} size={11} className="text-yellow-400 fill-yellow-400" />)}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mobile: single card */}
        <div className="md:hidden mb-8">
          <AnimatePresence mode="wait">
            <motion.div key={current}
              initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
              className="card p-6"
            >
              <Quote size={20} className="text-brand-greenBorder mb-4" />
              <p className="text-brand-muted text-sm leading-relaxed mb-5">
                &ldquo;{isVi ? reviews[current].textVi : reviews[current].textEn}&rdquo;
              </p>
              <div className="flex items-center justify-between pt-4 border-t border-surface-border">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full ${reviews[current].color} flex items-center justify-center text-white text-xs font-bold`}>
                    {reviews[current].initials}
                  </div>
                  <div>
                    <div className="text-brand-dark text-sm font-bold">{reviews[current].name}</div>
                    <div className="text-brand-muted text-xs">{reviews[current].location}</div>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {[...Array(reviews[current].rating)].map((_, i) => <Star key={i} size={11} className="text-yellow-400 fill-yellow-400" />)}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center gap-4">
          <button onClick={() => setCurrent(c => (c - 1 + reviews.length) % reviews.length)}
            className="w-9 h-9 rounded-full border border-surface-border bg-white hover:border-brand-green hover:text-brand-green flex items-center justify-center text-brand-muted transition-all">
            <ChevronLeft size={16} />
          </button>
          <div className="flex gap-1.5">
            {reviews.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? 'w-6 bg-brand-green' : 'w-1.5 bg-surface-border hover:bg-brand-muted'}`} />
            ))}
          </div>
          <button onClick={() => setCurrent(c => (c + 1) % reviews.length)}
            className="w-9 h-9 rounded-full border border-surface-border bg-white hover:border-brand-green hover:text-brand-green flex items-center justify-center text-brand-muted transition-all">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </section>
  )
}
