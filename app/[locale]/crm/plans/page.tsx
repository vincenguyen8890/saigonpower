import { setRequestLocale } from 'next-intl/server'
import { getPlansFromDB, getProvidersFromDB } from '@/lib/supabase/queries'
import { getSession } from '@/lib/auth/session'
import PlansClient from './PlansClient'

interface Props {
  params: Promise<{ locale: string }>
}

export default async function PlansPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const [session, plans, providers] = await Promise.all([
    getSession(),
    getPlansFromDB(),
    getProvidersFromDB(),
  ])
  const isAdmin = session?.role === 'admin'

  return <PlansClient initialPlans={plans} isAdmin={isAdmin} providers={providers} />
}
