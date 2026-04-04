import { useLocale } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { Calendar, Tag, ArrowRight } from 'lucide-react'

const MOCK_POSTS = [
  {
    slug: 'cach-chon-goi-dien-texas',
    title_vi: 'Cách Chọn Gói Điện Texas Phù Hợp Cho Gia Đình',
    title_en: 'How to Choose the Right Texas Electricity Plan for Your Home',
    excerpt_vi: 'Hướng dẫn đầy đủ để chọn gói điện phù hợp cho gia đình bạn ở Texas, bao gồm so sánh giá, thời hạn, và loại năng lượng.',
    excerpt_en: 'A complete guide to choosing the right electricity plan for your Texas home, including comparing rates, terms, and energy types.',
    date: '2025-01-15',
    tag_vi: 'Hướng Dẫn',
    tag_en: 'Guide',
    readTime: 5,
    color: 'bg-blue-100',
  },
  {
    slug: 'tai-sao-hoa-don-dien-cao',
    title_vi: 'Tại Sao Hóa Đơn Điện Mùa Hè Cao Đến Vậy?',
    title_en: 'Why Is Your Summer Electricity Bill So High?',
    excerpt_vi: 'Mùa hè Texas nóng bức khiến hóa đơn điện tăng vọt. Tìm hiểu nguyên nhân và cách tiết kiệm điện hiệu quả.',
    excerpt_en: 'Texas summer heat causes electricity bills to skyrocket. Learn the causes and how to save effectively.',
    date: '2025-01-10',
    tag_vi: 'Tiết Kiệm Điện',
    tag_en: 'Saving Tips',
    readTime: 4,
    color: 'bg-amber-100',
  },
  {
    slug: 'dien-sach-cho-tiem-nail',
    title_vi: 'Gói Điện Tốt Nhất Cho Tiệm Nail Tại Texas',
    title_en: 'Best Electricity Plans for Nail Salons in Texas',
    excerpt_vi: 'Tiệm nail sử dụng nhiều điện hơn bạn nghĩ. Đây là cách tìm gói điện thương mại tốt nhất để tiết kiệm chi phí.',
    excerpt_en: 'Nail salons use more electricity than you think. Here\'s how to find the best commercial plan to cut costs.',
    date: '2025-01-05',
    tag_vi: 'Thương Mại',
    tag_en: 'Commercial',
    readTime: 6,
    color: 'bg-emerald-100',
  },
  {
    slug: 'gia-han-hop-dong-dien',
    title_vi: 'Đừng Quên Gia Hạn Hợp Đồng Điện!',
    title_en: "Don't Forget to Renew Your Electricity Contract!",
    excerpt_vi: 'Hợp đồng hết hạn mà không gia hạn có thể khiến bạn trả gấp đôi. Đây là những điều cần biết về gia hạn hợp đồng.',
    excerpt_en: 'An expired contract without renewal can double your bill. Here\'s what you need to know about contract renewal.',
    date: '2024-12-28',
    tag_vi: 'Hợp Đồng',
    tag_en: 'Contract',
    readTime: 3,
    color: 'bg-purple-100',
  },
]

export default function BlogPage() {
  const locale = useLocale()

  return (
    <div className="min-h-screen bg-surface-light">
      {/* Header */}
      <section className="bg-hero-gradient text-white pt-32 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-4xl font-bold mb-4">
            {locale === 'vi' ? 'Blog Saigon Power' : 'Saigon Power Blog'}
          </h1>
          <p className="text-blue-200 text-lg">
            {locale === 'vi'
              ? 'Mẹo tiết kiệm điện, so sánh gói điện, và tin tức thị trường Texas'
              : 'Electricity saving tips, plan comparisons, and Texas market news'
            }
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid md:grid-cols-2 gap-8">
          {MOCK_POSTS.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}` as '/blog'}>
              <article className="bg-white rounded-2xl shadow-card border border-surface-border overflow-hidden hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 group">
                {/* Placeholder image */}
                <div className={`h-44 ${post.color} flex items-center justify-center relative overflow-hidden`}>
                  <span className="text-6xl opacity-30">⚡</span>
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent to-white/10" />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs font-semibold text-brand-blue bg-blue-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                      <Tag size={11} /> {locale === 'vi' ? post.tag_vi : post.tag_en}
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Calendar size={11} />
                      {new Date(post.date).toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span className="text-xs text-gray-400">{post.readTime} min</span>
                  </div>
                  <h2 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-brand-blue transition-colors">
                    {locale === 'vi' ? post.title_vi : post.title_en}
                  </h2>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    {locale === 'vi' ? post.excerpt_vi : post.excerpt_en}
                  </p>
                  <div className="flex items-center gap-1 text-brand-blue text-sm font-medium">
                    {locale === 'vi' ? 'Đọc thêm' : 'Read more'} <ArrowRight size={14} />
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
