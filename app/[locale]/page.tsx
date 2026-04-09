import type { Metadata } from 'next'
import Hero from '@/components/home/Hero'
import TrustBar from '@/components/home/TrustBar'
import ProblemSection from '@/components/home/ProblemSection'
import SolutionSection from '@/components/home/SolutionSection'
import WhoWeHelp from '@/components/home/WhoWeHelp'
import GoogleReviews from '@/components/home/GoogleReviews'
import FAQPreview from '@/components/home/FAQPreview'
import FinalCTA from '@/components/home/FinalCTA'
import MobileStickyBar from '@/components/home/MobileStickyBar'
import StickyRateCTA from '@/components/home/StickyRateCTA'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const isVi = locale === 'vi'
  return {
    title: isVi
      ? 'Saigon Power – So Sánh Giá Điện Texas Trong 30 Giây'
      : 'Saigon Power – Compare Texas Electricity Plans | Free Service',
    description: 'Free – No Hidden Fees – Switch in 24 Hours. We compare 50+ Texas electricity providers and handle all the paperwork. Start saving today.',
  }
}

const localBusinessJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'Saigon Power',
  url: 'https://saigonpower.vercel.app',
  telephone: '+1-832-937-9999',
  email: 'info@saigonllc.com',
  description: 'Texas electricity brokerage. Compare 50+ plans, switch in 24 hours, completely free.',
  areaServed: { '@type': 'State', name: 'Texas' },
  inLanguage: ['vi', 'en'],
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    reviewCount: '200',
  },
}

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />

      {/* Sticky scroll CTA — appears after user passes hero */}
      <StickyRateCTA />

      {/* 1. Hero — dark premium, rate card, trust in-fold */}
      <Hero />

      {/* 2. Trust bar — provider names + credibility badges */}
      <TrustBar />

      {/* 3. Problem — before/after comparison (dark) */}
      <ProblemSection />

      {/* 4. Solution + How It Works — merged, with stats strip */}
      <SolutionSection />

      {/* 5. Who We Help — segment cards */}
      <WhoWeHelp />

      {/* 6. Social proof — dark, with before/after rate cards */}
      <GoogleReviews />

      {/* 7. FAQ */}
      <FAQPreview />

      {/* 8. Final CTA — urgency-driven, risk reversal */}
      <FinalCTA />

      {/* Mobile sticky bar */}
      <MobileStickyBar />
    </>
  )
}
