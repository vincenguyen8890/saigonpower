import type { LeadStatus } from '@/data/mock-crm'

const statusConfig: Record<LeadStatus, { label: string; className: string }> = {
  new:       { label: 'New',       className: 'bg-blue-100 text-blue-700'    },
  contacted: { label: 'Contacted', className: 'bg-amber-100 text-amber-700'  },
  quoted:    { label: 'Quoted',    className: 'bg-purple-100 text-purple-700' },
  enrolled:  { label: 'Enrolled',  className: 'bg-green-100 text-green-700'  },
  lost:      { label: 'Lost',      className: 'bg-gray-100 text-gray-500'    },
}

export default function LeadStatusBadge({ status }: { status: LeadStatus }) {
  const config = statusConfig[status]
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  )
}
