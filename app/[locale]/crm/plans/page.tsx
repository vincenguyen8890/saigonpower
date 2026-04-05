import { setRequestLocale } from 'next-intl/server'
import { mockPlans } from '@/data/mock-crm'
import { getSession } from '@/lib/auth/session'
import PlansClient from './PlansClient'

interface Props {
  params: Promise<{ locale: string }>
}

export default async function PlansPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const session = await getSession()
  const isAdmin = session?.role === 'admin'

  return <PlansClient initialPlans={mockPlans} isAdmin={isAdmin} />
}
