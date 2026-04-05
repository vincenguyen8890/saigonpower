'use client'

import { useState, useTransition } from 'react'
import type { LeadStatus } from '@/data/mock-crm'
import { updateLeadStatus } from '@/app/[locale]/crm/leads/actions'

const statusOptions: { value: LeadStatus; label: string }[] = [
  { value: 'new',       label: 'New'       },
  { value: 'contacted', label: 'Contacted' },
  { value: 'quoted',    label: 'Quoted'    },
  { value: 'enrolled',  label: 'Enrolled'  },
  { value: 'lost',      label: 'Lost'      },
]

interface Props {
  leadId: string
  currentStatus: LeadStatus
}

export default function LeadStatusSelect({ leadId, currentStatus }: Props) {
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
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {isPending && <span className="text-xs text-gray-400">Saving...</span>}
    </div>
  )
}
