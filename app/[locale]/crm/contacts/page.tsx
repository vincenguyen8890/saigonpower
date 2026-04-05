import { setRequestLocale } from 'next-intl/server'
import { getLeads } from '@/lib/supabase/queries'
import { getSession } from '@/lib/auth/session'
import ContactsTable from './ContactsTable'

interface Props { params: Promise<{ locale: string }> }

export default async function ContactsPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const [contacts, session] = await Promise.all([
    getLeads(),
    getSession(),
  ])

  return (
    <ContactsTable
      contacts={contacts}
      locale={locale}
      currentUserEmail={session?.email ?? ''}
    />
  )
}
