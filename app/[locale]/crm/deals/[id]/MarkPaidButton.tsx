'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { DollarSign, CheckCircle2, X } from 'lucide-react'
import { markCommissionPaidAction } from './actions'

interface Props {
  dealId: string
  suggestedAmount: number
  isPaid: boolean
  paidAmount?: number | null
  paidAt?: string | null
}

export default function MarkPaidButton({ dealId, suggestedAmount, isPaid, paidAmount, paidAt }: Props) {
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState(String(suggestedAmount || ''))
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleConfirm() {
    startTransition(async () => {
      await markCommissionPaidAction(dealId, Number(amount))
      setOpen(false)
      router.refresh()
    })
  }

  if (isPaid) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 font-medium">
        <CheckCircle2 size={14} />
        Paid ${paidAmount?.toLocaleString()}
        {paidAt && <span className="text-xs text-green-500 font-normal">· {new Date(paidAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>}
      </div>
    )
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-sm border border-gray-200 text-gray-600 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors bg-white"
      >
        <DollarSign size={14} />
        Mark Paid
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Log Commission Payment</h2>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Amount Received ($)</label>
                <input
                  type="number" min="0" step="0.01"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
                  placeholder="0.00"
                />
              </div>
              <p className="text-xs text-gray-400">Today&apos;s date will be recorded as payment date.</p>
              <div className="flex gap-2 pt-1">
                <button onClick={() => setOpen(false)} className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-xl text-sm hover:bg-gray-50">Cancel</button>
                <button
                  onClick={handleConfirm}
                  disabled={isPending || !amount}
                  className="flex-1 bg-brand-greenDark text-white py-2 rounded-xl text-sm hover:bg-brand-green disabled:opacity-50 font-medium"
                >
                  {isPending ? 'Saving…' : 'Confirm Payment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
