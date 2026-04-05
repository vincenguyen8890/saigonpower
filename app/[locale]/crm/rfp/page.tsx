import { setRequestLocale } from 'next-intl/server'
import { getRFPs, getRFPResponses, getLeads, getProvidersFromDB } from '@/lib/supabase/queries'
import RFPClient from './RFPClient'

interface Props { params: Promise<{ locale: string }> }

export default async function RFPPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const [rfpList, leads, providers] = await Promise.all([
    getRFPs(),
    getLeads(),
    getProvidersFromDB(),
  ])

  // Hydrate each RFP with its responses
  const rfps = await Promise.all(
    rfpList.map(async rfp => ({
      ...rfp,
      responses: await getRFPResponses(rfp.id),
    }))
  )

  const providerNames = providers.filter(p => p.status === 'active').map(p => p.name)

  return (
    <RFPClient
      rfps={rfps}
      leads={leads}
      providerNames={providerNames}
      locale={locale}
    />
  )
}
