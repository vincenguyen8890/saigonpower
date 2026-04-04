'use client'

import { useState, useTransition } from 'react'
import type { LeadStatus } from '@/data/mock-crm'
import { updateLeadStatus } from '@/app/[locale]/crm/leads/actions'

const statusOptions: { value: LeadStatus; label: string; labelVi: string }[] = [
  { value: 'new',       label: 'New',       labelVi: 'Mới'         },
  { value: 'contacted', label: 'Contacted', labelVi: 'Đã liên hệ' },
  { value: 'quoted',    label: 'Quoted',    labelVi: 'Đã báo giá' },
  { value: 'enrolled',  label: 'Enrolled',  labelVi: 'Đã đăng ký' },
  { value: 'lost',      label: 'Lost',      labelVi: 'Đã mất'     },
]

interface Props {
  leadId: string
  currentStatus: LeadStatus
  locale?: string
}

export default function LeadStatusSelect({ leadId, currentStatus, locale = 'en' }: Props) {
  const [status, setStatus] = useState(currentStatus)
  const [isPending, startTransition] = useTransition()

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newStatus = e.target.value as LeadStatus
    setStatus(newStatus)
    startTransition(async () => {
      await updateLeadStatus(leadId, newStatus)
    })
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={status}
        onChange={handleChange}
        disabled={isPending}
        className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-green disabled:opacity-50"
      >
        {statusOptions.map(opt => (
          <option key={opt.value} value={opt.value}>
            {locale === 'vi' ? opt.labelVi : opt.label}
          </option>
        ))}
      </select>
      {isPending && <span className="text-xs text-gray-400">{locale === 'vi' ? 'Đang lưu...' : 'Saving...'}</span>}
    </div>
  )
}
