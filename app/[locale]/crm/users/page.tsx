import { setRequestLocale } from 'next-intl/server'
import { getSession } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import { getCRMAgents } from '@/lib/supabase/queries'
import UsersClient from '@/components/crm/users/UsersClient'

interface Props {
  params: Promise<{ locale: string }>
}

export default async function UsersPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const session = await getSession()
  if (!session || session.role !== 'admin') redirect(`/${locale}/crm`)

  const agents = await getCRMAgents()

  return (
    <UsersClient agents={agents} currentEmail={session.email} />
  )
}
