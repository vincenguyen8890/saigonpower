import { setRequestLocale } from 'next-intl/server'
import { getContracts, getLeads } from '@/lib/supabase/queries'
import { getSession } from '@/lib/auth/session'
import ContractsClient from './ContractsClient'

interface Props { params: Promise<{ locale: string }> }

export default async function ContractsPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const [session, contracts, leads] = await Promise.all([
    getSession(),
    getContracts(),
    getLeads(),
  ])

  const isAdmin = session?.role === 'admin'
  const leadList = leads.map(l => ({ id: l.id, name: l.name }))

  return <ContractsClient initialContracts={contracts} leads={leadList} isAdmin={isAdmin} locale={locale} />
}
