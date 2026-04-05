'use client'

import { useTransition } from 'react'
import { updateQuoteStatusAction } from './actions'

interface Props {
  quoteId: string
  currentStatus: string
}

const STATUSES = ['pending', 'reviewed', 'sent', 'accepted', 'rejected']

export default function QuoteStatusSelect({ quoteId, currentStatus }: Props) {
  const [isPending, startTransition] = useTransition()

  return (
    <select
      value={currentStatus}
      disabled={isPending}
      onChange={e => startTransition(() => updateQuoteStatusAction(quoteId, e.target.value))}
      className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-brand-green disabled:opacity-50 cursor-pointer"
    >
      {STATUSES.map(s => (
        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
      ))}
    </select>
  )
}
