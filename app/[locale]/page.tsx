import type { Metadata } from 'next'
import Hero from '@/components/home/Hero'
import TrustBar from '@/components/home/TrustBar'
import DualPath from '@/components/home/DualPath'
import WhoWeHelp from '@/components/home/WhoWeHelp'
import HowItWorks from '@/components/home/HowItWorks'
import FeaturedPlans from '@/components/home/FeaturedPlans'
import RenewalBanner from '@/components/home/RenewalBanner'
import Benefits from '@/components/home/Benefits'
import GoogleReviews from '@/components/home/GoogleReviews'
import FAQPreview from '@/components/home/FAQPreview'
import FinalCTA from '@/components/home/FinalCTA'
import MobileStickyBar from '@/components/home/MobileStickyBar'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const isVi = locale === 'vi'
  return {
    title: isVi
      ? 'Saigon Power – So Sánh Giá Điện Texas Trong 30 Giây'
      : 'Saigon Power – Compare Texas Electricity in 30 Seconds',
    description: isVi
      ? 'Miễn phí – Không phí ẩn – Hỗ trợ tiếng Việt 100%. So sánh 50+ gói điện Texas ngay hôm nay.'
      : 'Free – No Hidden Fees – Vietnamese Support Available. Compare 50+ Texas electricity plans today.',
  }
}

const localBusinessJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'Saigon Power',
  url: 'https://giadienre.com',
  telephone: '+1-832-937-9999',
  email: 'info@giadienre.com',
  description: 'Texas electricity brokerage serving the Vietnamese community. Compare plans, save money, renewal reminders included.',
  areaServed: { '@type': 'State', name: 'Texas' },
  inLanguage: ['vi', 'en'],
  sameAs: ['https://giadienre.com'],
}

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />

      {/* 1. Hero — centered ZIP dominant */}
      <Hero />

      {/* 2. Trust strip — immediately below fold */}
      <TrustBar />

      {/* 3. Dual mode — self-compare vs agent-assisted */}
      <DualPath />

      {/* 4. Who we help — Nhà ở / Nail / Nhà hàng / Doanh nghiệp */}
      <WhoWeHelp />

      {/* 5. How it works — 3 steps */}
      <HowItWorks />

      {/* 6. Featured plans — top 3 */}
      <FeaturedPlans />

      {/* 7. Renewal promise banner */}
      <RenewalBanner />

      {/* 8. Benefits + Energy Ogre comparison */}
      <Benefits />

      {/* 9. Google reviews */}
      <GoogleReviews />

      {/* 10. FAQ */}
      <FAQPreview />

      {/* 11. Final CTA */}
      <FinalCTA />

      {/* 12. Mobile sticky bar — call + quote */}
      <MobileStickyBar />

      {/* Spacer for mobile sticky bar */}
      <div className="h-16 sm:hidden" />
    </>
  )
}
