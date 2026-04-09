import { NextRequest, NextResponse } from 'next/server'
import { getPlansFromDB } from '@/lib/supabase/queries'
import { mockPlans as crmMockPlans } from '@/data/mock-crm'
import { mockPlans as compareMockPlans } from '@/data/mock-plans'
import type { ElectricityPlan, Provider } from '@/types/plans'

// Static provider metadata (ratings, review counts) not stored in crm_providers
const PROVIDER_META: Record<string, Partial<Provider>> = {
  'gexa energy':           { rating: 4.1, reviewCount: 6700,  website: 'gexaenergy.com',         phone: '1-713-961-9399', description: 'Competitive rates with straightforward pricing', badge: 'Best Value' },
  'txu energy':            { rating: 4.0, reviewCount: 18200, website: 'txu.com',                 phone: '1-800-818-6132', description: 'Texas-born energy company serving millions' },
  'reliant energy':        { rating: 4.2, reviewCount: 12450, website: 'reliant.com',             phone: '1-866-222-7100', description: 'One of the largest retail electricity providers in Texas', badge: 'Top Provider' },
  'green mountain energy': { rating: 4.5, reviewCount: 8900,  website: 'greenmountainenergy.com', phone: '1-866-785-4668', description: '100% renewable electricity pioneer', badge: '100% Green' },
  'green mountain':        { rating: 4.5, reviewCount: 8900,  website: 'greenmountainenergy.com', phone: '1-866-785-4668', description: '100% renewable electricity pioneer', badge: '100% Green' },
  'cirro energy':          { rating: 3.9, reviewCount: 4200,  website: 'cirroenergy.com',         phone: '1-888-242-4776', description: 'Simple, affordable plans for Texas homes' },
  'constellation':         { rating: 4.3, reviewCount: 9100,  website: 'constellation.com',       phone: '1-888-900-7052', description: 'Flexible plans from a national energy leader' },
  'payless power':         { rating: 3.7, reviewCount: 2100,  website: 'paylesspower.com',        phone: '1-888-963-9363', description: 'Prepaid plans with no deposit required' },
  '4change energy':        { rating: 4.2, reviewCount: 3800,  website: '4changeenergy.com',       phone: '1-855-784-8426', description: 'Donate to charity when you switch' },
  'pulse power':           { rating: 4.0, reviewCount: 5100,  website: 'pulsepower.us',           phone: '1-888-875-7872', description: 'Simple, affordable Texas electricity' },
}

function providerMeta(name: string): Partial<Provider> {
  return PROVIDER_META[name.toLowerCase()] ?? {
    rating: 4.0, reviewCount: 1000, website: '', phone: '', description: name,
  }
}

function crmToComparePlan(p: (typeof crmMockPlans)[0]): ElectricityPlan {
  const meta      = providerMeta(p.provider_name)
  const rateKwh   = parseFloat((Number(p.rate_kwh) * 100).toFixed(2))  // 0.109 → 10.9
  const renewPct  = (p as { renewable_percent?: number }).renewable_percent ?? (p.renewable ? 100 : 0)
  const cancelFee = p.cancellation_fee ?? 0

  const badges: ElectricityPlan['badges'] = []
  if (cancelFee === 0)                badges.push('noFee')
  if (renewPct === 100)               badges.push('green')
  if (meta.badge === 'Best Value')    badges.push('bestValue')
  if (meta.badge === 'Top Provider')  badges.push('popular')

  const provider: Provider = {
    id:          p.provider_id || p.provider_name.toLowerCase().replace(/\s+/g, '-'),
    name:        p.provider_name,
    rating:      meta.rating      ?? 4.0,
    reviewCount: meta.reviewCount ?? 1000,
    website:     meta.website     ?? '',
    phone:       meta.phone       ?? '',
    description: meta.description ?? p.provider_name,
    badge:       meta.badge,
  }

  return {
    id:               p.id,
    providerId:       provider.id,
    provider,
    name:             p.name,
    rateKwh,
    termMonths:       p.term_months,
    rateType:         'fixed',
    planType:         p.service_type as ElectricityPlan['planType'],
    renewablePercent: renewPct,
    cancellationFee:  cancelFee,
    monthlyFee:       0,
    avgMonthlyBill:   Math.round(rateKwh * 10),  // 10.9¢ × 1000 kWh / 100 = $109
    badges,
    features:         p.promo ? [p.promo] : [],
    termsUrl:         '',
    eflUrl:           '',
    isActive:         true,
    createdAt:        new Date().toISOString(),
    updatedAt:        new Date().toISOString(),
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const planType     = searchParams.get('type')
  const provider     = searchParams.get('provider')
  const rateType     = searchParams.get('rateType')
  const termMin      = searchParams.get('termMin')
  const termMax      = searchParams.get('termMax')
  const minRenewable = searchParams.get('minRenewable')
  const sortBy       = searchParams.get('sortBy') || 'lowestRate'

  try {
    // Try live DB first; fall back to CRM mock data if table is empty / unavailable
    const dbPlans = await getPlansFromDB()
    const source  = dbPlans.length > 0 ? dbPlans : crmMockPlans

    let plans = source
      .filter(p => p.status === 'active')
      .map(crmToComparePlan)

    if (planType) plans = plans.filter(p => p.planType === planType || p.planType === 'both')
    if (provider) plans = plans.filter(p => p.providerId === provider)
    if (rateType && rateType !== 'all') plans = plans.filter(p => p.rateType === rateType)
    if (termMin)      plans = plans.filter(p => p.termMonths >= parseInt(termMin))
    if (termMax)      plans = plans.filter(p => p.termMonths <= parseInt(termMax))
    if (minRenewable) plans = plans.filter(p => p.renewablePercent >= parseInt(minRenewable))

    if (sortBy === 'lowestRate')     plans.sort((a, b) => a.rateKwh - b.rateKwh)
    else if (sortBy === 'bestValue') plans.sort((a, b) => a.avgMonthlyBill - b.avgMonthlyBill)
    else if (sortBy === 'termAsc')   plans.sort((a, b) => a.termMonths - b.termMonths)
    else if (sortBy === 'renewableHigh') plans.sort((a, b) => b.renewablePercent - a.renewablePercent)

    return NextResponse.json({ data: plans, total: plans.length })
  } catch {
    // Hard fallback: return the existing compare-page mock plans unchanged
    return NextResponse.json({ data: compareMockPlans, total: compareMockPlans.length })
  }
}
