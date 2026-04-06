import type { Metadata } from 'next'
import Hero from '@/components/home/Hero'
import ProblemSection from '@/components/home/ProblemSection'
import SolutionSection from '@/components/home/SolutionSection'
import SavingsImpact from '@/components/home/SavingsImpact'
import HowItWorks from '@/components/home/HowItWorks'
import GoogleReviews from '@/components/home/GoogleReviews'
import FinalCTA from '@/components/home/FinalCTA'

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

      {/* 1. Hero — full-screen, cinematic entry */}
      <Hero />

      {/* 2. Problem — dark, "you're overpaying" impact moment */}
      <ProblemSection />

      {/* 3. Solution — "we handle it for you" */}
      <SolutionSection />

      {/* 4. Savings Impact — big green number moment */}
      <SavingsImpact />

      {/* 5. How It Works — 3 simple steps */}
      <HowItWorks />

      {/* 6. Social proof — stats + testimonials */}
      <GoogleReviews />

      {/* 7. Final CTA — dark, "start saving today" */}
      <FinalCTA />
    </>
  )
}
