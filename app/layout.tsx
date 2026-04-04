import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Saigon Power - So Sánh Giá Điện Texas',
  description: 'So sánh giá điện Texas dễ dàng. Tìm gói điện phù hợp cho gia đình và doanh nghiệp.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children
}
