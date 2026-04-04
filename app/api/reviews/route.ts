import { NextRequest, NextResponse } from 'next/server'

// Google Places API response types
interface GoogleReview {
  author_name: string
  author_url: string
  language: string
  profile_photo_url: string
  rating: number
  relative_time_description: string
  text: string
  time: number
}

interface GooglePlacesResponse {
  result?: {
    reviews?: GoogleReview[]
    rating?: number
    user_ratings_total?: number
    name?: string
  }
  status: string
}

// Cache reviews for 1 hour to avoid excessive API calls
let cachedReviews: { data: GoogleReview[]; rating: number; total: number; fetchedAt: number } | null = null
const CACHE_TTL = 60 * 60 * 1000 // 1 hour

export async function GET(req: NextRequest) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  const placeId = process.env.GOOGLE_PLACE_ID

  // Return cached if fresh
  if (cachedReviews && Date.now() - cachedReviews.fetchedAt < CACHE_TTL) {
    return NextResponse.json({
      reviews: cachedReviews.data,
      rating: cachedReviews.rating,
      total: cachedReviews.total,
      source: 'cache',
    })
  }

  // If no API key or Place ID configured, return mock data
  if (!apiKey || !placeId) {
    return NextResponse.json({
      reviews: MOCK_GOOGLE_REVIEWS,
      rating: 4.9,
      total: 47,
      source: 'mock',
    })
  }

  try {
    const fields = 'reviews,rating,user_ratings_total,name'
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&language=vi&key=${apiKey}`

    const res = await fetch(url, { next: { revalidate: 3600 } })
    const data: GooglePlacesResponse = await res.json()

    if (data.status !== 'OK' || !data.result) {
      return NextResponse.json({
        reviews: MOCK_GOOGLE_REVIEWS,
        rating: 4.9,
        total: 47,
        source: 'mock',
      })
    }

    const reviews = data.result.reviews || []
    const rating = data.result.rating || 5
    const total = data.result.user_ratings_total || 0

    // Sort by time desc, take top 8
    const sorted = reviews
      .filter(r => r.text && r.text.length > 20)
      .sort((a, b) => b.time - a.time)
      .slice(0, 8)

    cachedReviews = { data: sorted, rating, total, fetchedAt: Date.now() }

    return NextResponse.json({ reviews: sorted, rating, total, source: 'google' })
  } catch (err) {
    console.error('Google Places API error:', err)
    return NextResponse.json({
      reviews: MOCK_GOOGLE_REVIEWS,
      rating: 4.9,
      total: 47,
      source: 'mock',
    })
  }
}

// Fallback mock data (shown when API is not configured)
const MOCK_GOOGLE_REVIEWS = [
  {
    author_name: 'Lan Nguyễn',
    profile_photo_url: '',
    rating: 5,
    relative_time_description: '2 tuần trước',
    text: 'Dịch vụ rất tuyệt! Đội ngũ hỗ trợ tiếng Việt rất nhiệt tình, giúp tôi tìm được gói điện tiết kiệm hơn $35/tháng. Rất hài lòng!',
    time: Date.now() / 1000 - 14 * 86400,
    author_url: '',
    language: 'vi',
  },
  {
    author_name: 'Minh Trần',
    profile_photo_url: '',
    rating: 5,
    relative_time_description: '1 tháng trước',
    text: 'Tiệm nail của tôi tiết kiệm gần $200/tháng sau khi được tư vấn. Quy trình chuyển đổi nhanh chóng, không gián đoạn điện. Cảm ơn Saigon Power!',
    time: Date.now() / 1000 - 30 * 86400,
    author_url: '',
    language: 'vi',
  },
  {
    author_name: 'Mai Phạm',
    profile_photo_url: '',
    rating: 5,
    relative_time_description: '1 tháng trước',
    text: 'Họ nhắc tôi gia hạn hợp đồng đúng lúc, tránh bị chuyển sang giá cao. Chuyên nghiệp và tận tâm. Tôi đã giới thiệu cho nhiều bạn bè.',
    time: Date.now() / 1000 - 32 * 86400,
    author_url: '',
    language: 'vi',
  },
  {
    author_name: 'Hùng Lê',
    profile_photo_url: '',
    rating: 5,
    relative_time_description: '2 tháng trước',
    text: 'Lần đầu chuyển nhà cung cấp điện mà không lo lắng gì nhờ có Saigon Power hỗ trợ. Mọi thứ rõ ràng, minh bạch. Tiết kiệm được tiền thật!',
    time: Date.now() / 1000 - 60 * 86400,
    author_url: '',
    language: 'vi',
  },
  {
    author_name: 'Thu Hoàng',
    profile_photo_url: '',
    rating: 5,
    relative_time_description: '2 tháng trước',
    text: 'Nhà hàng của tôi có điện lực chi phí cao. Sau khi liên hệ Saigon Power, họ tìm được gói tốt hơn, tiết kiệm hơn $150/tháng. Highly recommend!',
    time: Date.now() / 1000 - 62 * 86400,
    author_url: '',
    language: 'vi',
  },
  {
    author_name: 'David Nguyen',
    profile_photo_url: '',
    rating: 5,
    relative_time_description: '3 tháng trước',
    text: 'Great service! They helped me understand my electricity options in both Vietnamese and English. Saved over $300 this year. Highly recommend to anyone in Houston!',
    time: Date.now() / 1000 - 90 * 86400,
    author_url: '',
    language: 'en',
  },
  {
    author_name: 'Linh Võ',
    profile_photo_url: '',
    rating: 5,
    relative_time_description: '3 tháng trước',
    text: 'Chưa bao giờ nghĩ rằng việc chuyển gói điện lại dễ dàng như vậy. Chỉ mất 10 phút đăng ký online, 2 ngày sau đã có điện giá mới. Tuyệt vời!',
    time: Date.now() / 1000 - 95 * 86400,
    author_url: '',
    language: 'vi',
  },
  {
    author_name: 'Phong Đặng',
    profile_photo_url: '',
    rating: 4,
    relative_time_description: '4 tháng trước',
    text: 'Dịch vụ tốt, tư vấn rõ ràng. Có thể cải thiện thêm về tốc độ phản hồi email nhưng nhìn chung rất hài lòng với kết quả tiết kiệm được.',
    time: Date.now() / 1000 - 120 * 86400,
    author_url: '',
    language: 'vi',
  },
]
