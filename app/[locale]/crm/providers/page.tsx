import { setRequestLocale } from 'next-intl/server'
import { getProvidersFromDB } from '@/lib/supabase/queries'
import { getSession } from '@/lib/auth/session'
import ProvidersClient from './ProvidersClient'

interface Props { params: Promise<{ locale: string }> }

export default async function ProvidersPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const [session, providers] = await Promise.all([getSession(), getProvidersFromDB()])
  const isAdmin = session?.role === 'admin'

  return <ProvidersClient initialProviders={providers} isAdmin={isAdmin} />
}
