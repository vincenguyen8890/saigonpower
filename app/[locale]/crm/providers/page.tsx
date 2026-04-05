import { setRequestLocale } from 'next-intl/server'
import { mockProviders } from '@/data/mock-crm'
import { getSession } from '@/lib/auth/session'
import ProvidersClient from './ProvidersClient'

interface Props { params: Promise<{ locale: string }> }

export default async function ProvidersPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const session = await getSession()
  const isAdmin = session?.role === 'admin'

  return <ProvidersClient initialProviders={mockProviders} isAdmin={isAdmin} />
}
