import { setRequestLocale } from 'next-intl/server'
import { getLeads } from '@/lib/supabase/queries'
import { mockPlans, mockProviders } from '@/data/mock-crm'
import ProposalGenerator from './ProposalGenerator'

interface Props {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ leadId?: string; usage?: string }>
}

export default async function ProposalsPage({ params, searchParams }: Props) {
  const { locale } = await params
  const { leadId, usage } = await searchParams
  setRequestLocale(locale)

  const leads = await getLeads()

  const selectedLead = leadId ? leads.find(l => l.id === leadId) : null
  const usageKwh = usage ? parseInt(usage) : (selectedLead?.service_type === 'commercial' ? 3000 : 1200)

  const plans = selectedLead
    ? mockPlans.filter(p => p.status === 'active' && p.service_type === selectedLead.service_type)
    : []

  const providerMap = Object.fromEntries(mockProviders.map(p => [p.id, p]))

  const plansWithCost = plans.map(p => ({
    ...p,
    monthlyEstimate: Math.round(p.rate_kwh * usageKwh),
    annualEstimate:  Math.round(p.rate_kwh * usageKwh * 12),
    commission:      selectedLead?.service_type === 'commercial'
      ? (providerMap[p.provider_id]?.commission_commercial ?? 0)
      : (providerMap[p.provider_id]?.commission_residential ?? 0),
  })).sort((a, b) => a.monthlyEstimate - b.monthlyEstimate)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Proposal Generator</h1>
        <p className="text-gray-500 text-sm mt-1">Build a rate comparison proposal for any lead</p>
      </div>

      <ProposalGenerator
        locale={locale}
        leads={leads}
        selectedLead={selectedLead ?? null}
        plans={plansWithCost}
        usageKwh={usageKwh}
      />
    </div>
  )
}
