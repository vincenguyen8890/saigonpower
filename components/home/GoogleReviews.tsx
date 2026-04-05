'use client'

import { useRef, useState } from 'react'
import { useLocale } from 'next-intl'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react'

const reviews = [
  {
    name: 'Lan Nguyễn',
    location: 'Houston, TX',
    rating: 5,
    initials: 'LN',
    color: 'bg-blue-500',
    textEn: 'Saigon Power saved me $340 last year. The team explains everything clearly in Vietnamese — no confusing paperwork. I recommend to all my friends.',
    textVi: 'Saigon Power giúp tôi tiết kiệm $340 năm ngoái. Đội ngũ giải thích mọi thứ rõ ràng bằng tiếng Việt — không có giấy tờ phức tạp.',
  },
  {
    name: 'Minh Trần',
    location: 'Sugar Land, TX',
    rating: 5,
    initials: 'MT',
    color: 'bg-green-600',
    textEn: 'As a nail salon owner, switching electricity suppliers was always confusing. Saigon Power handled everything for my 3 locations. Saved $80/month total.',
    textVi: 'Là chủ tiệm nail, việc đổi công ty điện luôn phức tạp. Saigon Power lo hết cho 3 địa điểm của tôi. Tiết kiệm $80/tháng.',
  },
  {
    name: 'Hoa Lê',
    location: 'Katy, TX',
    rating: 5,
    initials: 'HL',
    color: 'bg-purple-500',
    textEn: 'They sent me a renewal reminder before my contract expired — saved me from a huge rate spike. Their customer service is outstanding, 10/10.',
    textVi: 'Họ nhắc nhở tôi gia hạn hợp đồng trước khi hết hạn — tránh bị tăng giá đột ngột. Dịch vụ khách hàng xuất sắc, 10/10.',
  },
  {
    name: 'Tuấn Phạm',
    location: 'Pearland, TX',
    rating: 5,
    initials: 'TP',
    color: 'bg-amber-500',
    textEn: 'I was paying 16 cents per kWh. They found me a 10.5 cent plan. That\'s a huge difference on my monthly bill. Super easy process.',
    textVi: 'Tôi đang trả 16 xu/kWh. Họ tìm được gói 10.5 xu. Số tiền tiết kiệm rất lớn trên hóa đơn hàng tháng. Quy trình siêu dễ.',
  },
  {
    name: 'Mai Võ',
    location: 'Stafford, TX',
    rating: 5,
    initials: 'MV',
    color: 'bg-rose-500',
    textEn: 'My whole family uses Saigon Power now. They explained the difference between fixed and variable rates which no one ever told me before.',
    textVi: 'Cả gia đình tôi dùng Saigon Power. Họ giải thích sự khác biệt giữa giá cố định và biến động mà trước đây chưa ai nói với tôi.',
  },
  {
    name: 'Dũng Ngô',
    location: 'Richmond, TX',
    rating: 5,
    initials: 'DN',
    color: 'bg-teal-500',
    textEn: 'Running a Vietnamese restaurant, electricity is our biggest expense. Saigon Power negotiated a commercial rate that cut our bill by 22%.',
    textVi: 'Điều hành nhà hàng Việt, điện là chi phí lớn nhất. Saigon Power đàm phán được mức giá thương mại giúp giảm 22% hóa đơn.',
  },
]

export default function GoogleReviews() {
  const locale = useLocale()
  const isVi = locale === 'vi'
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const [current, setCurrent] = useState(0)

  const prev = () => setCurrent(c => (c - 1 + reviews.length) % reviews.length)
  const next = () => setCurrent(c => (c + 1) % reviews.length)

  // Show 3 on desktop, 1 on mobile
  const visible = [
    reviews[current % reviews.length],
    reviews[(current + 1) % reviews.length],
    reviews[(current + 2) % reviews.length],
  ]

  return (
    <section className="py-28 bg-[#040C0A] relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.02]"
        style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-brand-green/5 rounded-full blur-[100px] pointer-events-none" />

      <div ref={ref} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-16 gap-6"
        >
          <div>
            <div className="inline-flex items-center gap-2 bg-white/[0.05] border border-white/[0.08] rounded-full px-4 py-1.5 mb-5">
              <Star size={12} className="text-brand-gold fill-brand-gold" />
              <span className="text-white/50 text-sm font-medium uppercase tracking-widest">
                {isVi ? 'Đánh Giá Thực Tế' : 'Real Reviews'}
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
              {isVi ? 'Khách Hàng Nói Gì?' : 'What Customers Say'}
            </h2>
          </div>

          {/* Google rating badge */}
          <div className="flex items-center gap-4 bg-white/[0.04] border border-white/[0.08] rounded-2xl px-5 py-3 flex-shrink-0">
            <div className="text-center">
              <div className="text-3xl font-black text-white">4.9</div>
              <div className="flex gap-0.5 mt-1">
                {[...Array(5)].map((_, i) => <Star key={i} size={10} className="text-brand-gold fill-brand-gold" />)}
              </div>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="text-left">
              <div className="text-white/80 text-sm font-semibold">Google Reviews</div>
              <div className="text-white/35 text-xs">200+ {isVi ? 'đánh giá' : 'reviews'}</div>
            </div>
          </div>
        </motion.div>

        {/* Review cards — 3 col desktop */}
        <div className="hidden md:grid md:grid-cols-3 gap-5 mb-10">
          {visible.map((review, i) => (
            <motion.div
              key={`${current}-${i}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="bg-white/[0.04] border border-white/[0.08] rounded-3xl p-6 hover:border-white/[0.14] transition-colors group"
            >
              <Quote size={20} className="text-brand-green/40 mb-4" />
              <p className="text-white/65 text-sm leading-relaxed mb-6">
                &ldquo;{isVi ? review.textVi : review.textEn}&rdquo;
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full ${review.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                    {review.initials}
                  </div>
                  <div>
                    <div className="text-white text-sm font-semibold">{review.name}</div>
                    <div className="text-white/35 text-xs">{review.location}</div>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {[...Array(review.rating)].map((_, i) => <Star key={i} size={11} className="text-brand-gold fill-brand-gold" />)}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mobile — single card */}
        <div className="md:hidden mb-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.35 }}
              className="bg-white/[0.04] border border-white/[0.08] rounded-3xl p-6"
            >
              <Quote size={20} className="text-brand-green/40 mb-4" />
              <p className="text-white/65 text-sm leading-relaxed mb-6">
                &ldquo;{isVi ? reviews[current].textVi : reviews[current].textEn}&rdquo;
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full ${reviews[current].color} flex items-center justify-center text-white text-xs font-bold`}>
                    {reviews[current].initials}
                  </div>
                  <div>
                    <div className="text-white text-sm font-semibold">{reviews[current].name}</div>
                    <div className="text-white/35 text-xs">{reviews[current].location}</div>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {[...Array(reviews[current].rating)].map((_, i) => <Star key={i} size={11} className="text-brand-gold fill-brand-gold" />)}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Nav */}
        <div className="flex items-center justify-center gap-4">
          <button onClick={prev} className="w-10 h-10 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all">
            <ChevronLeft size={18} />
          </button>
          <div className="flex gap-2">
            {reviews.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? 'w-6 bg-brand-green' : 'w-1.5 bg-white/20 hover:bg-white/40'}`}
              />
            ))}
          </div>
          <button onClick={next} className="w-10 h-10 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </section>
  )
}
