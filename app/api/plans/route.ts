import { NextRequest, NextResponse } from 'next/server'
import { mockPlans } from '@/data/mock-plans'
import type { PlanFilter } from '@/types/plans'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)

  const zip = searchParams.get('zip')
  const planType = searchParams.get('type') as 'residential' | 'commercial' | null
  const provider = searchParams.get('provider')
  const rateType = searchParams.get('rateType')
  const termMin = searchParams.get('termMin')
  const termMax = searchParams.get('termMax')
  const minRenewable = searchParams.get('minRenewable')
  const sortBy = searchParams.get('sortBy') || 'lowestRate'

  let plans = mockPlans.filter(p => p.isActive)

  if (planType) {
    plans = plans.filter(p => p.planType === planType || p.planType === 'both')
  }
  if (provider) {
    plans = plans.filter(p => p.providerId === provider)
  }
  if (rateType && rateType !== 'all') {
    plans = plans.filter(p => p.rateType === rateType)
  }
  if (termMin) {
    plans = plans.filter(p => p.termMonths >= parseInt(termMin))
  }
  if (termMax) {
    plans = plans.filter(p => p.termMonths <= parseInt(termMax))
  }
  if (minRenewable) {
    plans = plans.filter(p => p.renewablePercent >= parseInt(minRenewable))
  }

  // Sort
  if (sortBy === 'lowestRate') {
    plans.sort((a, b) => a.rateKwh - b.rateKwh)
  } else if (sortBy === 'bestValue') {
    plans.sort((a, b) => a.avgMonthlyBill - b.avgMonthlyBill)
  } else if (sortBy === 'termAsc') {
    plans.sort((a, b) => a.termMonths - b.termMonths)
  } else if (sortBy === 'renewableHigh') {
    plans.sort((a, b) => b.renewablePercent - a.renewablePercent)
  }

  return NextResponse.json({
    data: plans,
    total: plans.length,
    zip: zip || null,
  })
}
