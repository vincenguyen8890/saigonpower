import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import Hero from '@/components/home/Hero'
import TrustBar from '@/components/home/TrustBar'
import HowItWorks from '@/components/home/HowItWorks'
import DualPath from '@/components/home/DualPath'
import FeaturedPlans from '@/components/home/FeaturedPlans'
import Benefits from '@/components/home/Benefits'
import GoogleReviews from '@/components/home/GoogleReviews'
import FAQPreview from '@/components/home/FAQPreview'
import FinalCTA from '@/components/home/FinalCTA'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return {
    title: locale === 'vi'
      ? 'Saigon Power - So Sánh Giá Điện Texas Dễ Dàng'
      : 'Saigon Power - Compare Texas Electricity Plans Easily',
  }
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustBar />
      <HowItWorks />
      <DualPath />
      <FeaturedPlans />
      <Benefits />
      <GoogleReviews />
      <FAQPreview />
      <FinalCTA />
    </>
  )
}
