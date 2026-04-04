import type { LeadStatus } from '@/data/mock-crm'

const statusConfig: Record<LeadStatus, { label: string; labelVi: string; className: string }> = {
  new:       { label: 'New',       labelVi: 'Mới',         className: 'bg-blue-100 text-blue-700'   },
  contacted: { label: 'Contacted', labelVi: 'Đã liên hệ', className: 'bg-amber-100 text-amber-700' },
  quoted:    { label: 'Quoted',    labelVi: 'Đã báo giá', className: 'bg-purple-100 text-purple-700'},
  enrolled:  { label: 'Enrolled',  labelVi: 'Đã đăng ký', className: 'bg-green-100 text-green-700' },
  lost:      { label: 'Lost',      labelVi: 'Đã mất',     className: 'bg-gray-100 text-gray-500'   },
}

interface Props {
  status: LeadStatus
  locale?: string
}

export default function LeadStatusBadge({ status, locale = 'en' }: Props) {
  const config = statusConfig[status]
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
      {locale === 'vi' ? config.labelVi : config.label}
    </span>
  )
}
