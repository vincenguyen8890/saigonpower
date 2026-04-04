'use client'

import { useEffect, useState } from 'react'
import { useLocale } from 'next-intl'
import { Star, ExternalLink, ChevronLeft, ChevronRight, Quote } from 'lucide-react'
import Image from 'next/image'

interface Review {
  author_name: string
  profile_photo_url: string
  rating: number
  relative_time_description: string
  text: string
  time: number
  author_url: string
  language: string
}

interface ReviewsData {
  reviews: Review[]
  rating: number
  total: number
  source: 'google' | 'mock' | 'cache'
}

function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill={i <= rating ? '#f59e0b' : '#e5e7eb'}
          className="shrink-0"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  )
}

function AvatarInitials({ name, index }: { name: string; index: number }) {
  const colors = [
    'bg-green-600', 'bg-emerald-600', 'bg-teal-600',
    'bg-green-700', 'bg-lime-600', 'bg-cyan-600',
    'bg-green-500', 'bg-emerald-500',
  ]
  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
  return (
    <div className={`w-10 h-10 ${colors[index % colors.length]} rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0`}>
      {initials}
    </div>
  )
}

export default function GoogleReviews() {
  const locale = useLocale()
  const [data, setData] = useState<ReviewsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const PER_PAGE = 3

  useEffect(() => {
    fetch('/api/reviews')
      .then(r => r.json())
      .then((d: ReviewsData) => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-surface-light rounded-2xl p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-3 w-2/3" />
                <div className="h-3 bg-gray-200 rounded mb-2" />
                <div className="h-3 bg-gray-200 rounded mb-2 w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (!data || data.reviews.length === 0) return null

  const totalPages = Math.ceil(data.reviews.length / PER_PAGE)
  const visible = data.reviews.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE)

  const GOOGLE_REVIEW_URL = `https://search.google.com/local/writereview?placeid=${process.env.NEXT_PUBLIC_GOOGLE_PLACE_ID || 'ChIJ...'}`

  return (
    <section className="py-20 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {/* Google G icon */}
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="text-sm font-semibold text-gray-600">Google Reviews</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-brand-greenDark mb-2">
              {locale === 'vi' ? 'Khách Hàng Nói Gì' : 'What Customers Say'}
            </h2>
            {/* Overall rating */}
            <div className="flex items-center gap-3">
              <span className="text-4xl font-bold text-gray-900">{data.rating.toFixed(1)}</span>
              <div>
                <StarRating rating={Math.round(data.rating)} size={18} />
                <div className="text-sm text-gray-500 mt-0.5">
                  {locale === 'vi'
                    ? `${data.total} đánh giá trên Google`
                    : `${data.total} reviews on Google`
                  }
                </div>
              </div>
            </div>
          </div>

          {/* Write a review CTA */}
          <a
            href="https://g.page/r/saigon-power/review"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white border-2 border-green-200 hover:border-brand-green text-brand-greenDark font-semibold text-sm px-4 py-2.5 rounded-xl transition-all hover:shadow-green shrink-0"
          >
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {locale === 'vi' ? 'Viết Đánh Giá' : 'Write a Review'}
            <ExternalLink size={13} />
          </a>
        </div>

        {/* Reviews grid */}
        <div className="grid md:grid-cols-3 gap-5 mb-6">
          {visible.map((review, i) => (
            <ReviewCard key={`${review.author_name}-${i}`} review={review} index={page * PER_PAGE + i} />
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-6">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="w-9 h-9 rounded-full border border-surface-border flex items-center justify-center hover:border-brand-green hover:text-brand-green transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="flex gap-1.5">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === page ? 'bg-brand-green w-5' : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="w-9 h-9 rounded-full border border-surface-border flex items-center justify-center hover:border-brand-green hover:text-brand-green transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* Google badge */}
        <div className="flex items-center justify-center gap-2 mt-8 text-xs text-gray-400">
          <svg width="12" height="12" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {locale === 'vi' ? 'Đánh giá từ Google' : 'Reviews from Google'}
        </div>
      </div>
    </section>
  )
}

function ReviewCard({ review, index }: { review: Review; index: number }) {
  const [expanded, setExpanded] = useState(false)
  const MAX_LEN = 160
  const isLong = review.text.length > MAX_LEN

  return (
    <div className="bg-white rounded-2xl p-5 shadow-card border border-surface-border hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          {review.profile_photo_url ? (
            <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 ring-2 ring-green-100">
              <img
                src={review.profile_photo_url}
                alt={review.author_name}
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
            </div>
          ) : (
            <AvatarInitials name={review.author_name} index={index} />
          )}
          <div>
            <div className="font-semibold text-gray-900 text-sm">{review.author_name}</div>
            <div className="text-xs text-gray-400">{review.relative_time_description}</div>
          </div>
        </div>
        {/* Google icon */}
        <svg width="16" height="16" viewBox="0 0 24 24" className="shrink-0 opacity-60">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
      </div>

      {/* Stars */}
      <StarRating rating={review.rating} size={14} />

      {/* Review text */}
      <div className="mt-3">
        <p className="text-gray-700 text-sm leading-relaxed">
          {isLong && !expanded
            ? `${review.text.slice(0, MAX_LEN)}...`
            : review.text
          }
        </p>
        {isLong && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-brand-green text-xs font-medium mt-1 hover:underline"
          >
            {expanded ? 'Thu gọn ↑' : 'Xem thêm ↓'}
          </button>
        )}
      </div>
    </div>
  )
}
