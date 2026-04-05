'use client'

import { useState, useTransition } from 'react'
import { RefreshCw, Bell, CheckCircle2, Loader2 } from 'lucide-react'
import { startRenewalAction, sendRenewalReminderAction } from './actions'

interface Props {
  contractId: string
  leadId: string | null
  customerName: string
  provider: string
  planName: string | null
  serviceType: 'residential' | 'commercial'
  currentRate: number | null
  endDate: string
}

export default function StartRenewalButton({
  contractId, leadId, customerName, provider, planName, serviceType, currentRate, endDate,
}: Props) {
  const [isPending, startTransition] = useTransition()
  const [renewalDone, setRenewalDone] = useState(false)
  const [reminderDone, setReminderDone] = useState(false)

  function handleRenew() {
    startTransition(async () => {
      await startRenewalAction({ contractId, leadId, customerName, provider, planName, serviceType, currentRate })
      setRenewalDone(true)
    })
  }

  function handleRemind() {
    startTransition(async () => {
      await sendRenewalReminderAction({ contractId, leadId, customerName, provider, endDate })
      setReminderDone(true)
    })
  }

  return (
    <div className="flex items-center gap-2 flex-shrink-0">
      {reminderDone ? (
        <span className="text-xs text-green-600 flex items-center gap-1"><CheckCircle2 size={11} /> Reminded</span>
      ) : (
        <button
          onClick={handleRemind}
          disabled={isPending}
          className="text-xs text-gray-400 hover:text-brand-greenDark flex items-center gap-1 transition-colors disabled:opacity-40"
        >
          {isPending ? <Loader2 size={11} className="animate-spin" /> : <Bell size={12} />}
          Remind
        </button>
      )}

      {renewalDone ? (
        <span className="text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-lg font-medium flex items-center gap-1">
          <CheckCircle2 size={11} /> Deal created
        </span>
      ) : (
        <button
          onClick={handleRenew}
          disabled={isPending}
          className="text-xs bg-brand-greenDark text-white px-3 py-1.5 rounded-lg hover:bg-brand-green transition-colors font-medium flex items-center gap-1 disabled:opacity-50"
        >
          {isPending ? <Loader2 size={11} className="animate-spin" /> : <RefreshCw size={11} />}
          Renew
        </button>
      )}
    </div>
  )
}
