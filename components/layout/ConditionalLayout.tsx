'use client'

import { usePathname } from 'next/navigation'
import Header from './Header'
import Footer from './Footer'

interface Props {
  children: React.ReactNode
}

export default function ConditionalLayout({ children }: Props) {
  const pathname = usePathname()
  const isAppRoute = pathname.includes('/crm') || pathname.includes('/auth/login')

  if (isAppRoute) {
    return <>{children}</>
  }

  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  )
}
