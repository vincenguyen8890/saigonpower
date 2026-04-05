'use client'

import { useState, useTransition } from 'react'
import { DollarSign, Loader2, CheckCircle2, X } from 'lucide-react'
import { recordPaymentAction } from './actions'
import type { Commission } from '@/lib/supabase/queries'

interface Props {
  commission: Commission
}

export default function RecordPaymentButton({ commission }: Props) {
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState(String(commission.amount_expected))
  const [isPending, startTransition] = useTransition()
  const [done, setDone] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const received = parseFloat(amount) || 0
    const status: Commission['status'] =
      received === 0 ? 'missing' :
      received >= commission.amount_expected ? 'received' : 'short_pay'

    startTransition(async () => {
      await recordPaymentAction(commission.id, received, status)
      setDone(true)
      setOpen(false)
    })
  }

  if (done || commission.status === 'received') {
    return (
      <span className="text-xs text-green-600 flex items-center gap-1">
        <CheckCircle2 size={11} /> Paid
      </span>
    )
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-brand-greenDark hover:underline flex items-center gap-1"
      >
        <DollarSign size={11} />
        Record
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-80" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Record Payment</h3>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <p className="text-xs text-gray-500 mb-1">Expected: <strong className="text-gray-800">${commission.amount_expected}</strong></p>
            <p className="text-xs text-gray-500 mb-4">Provider: {commission.provider}</p>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Amount Received ($)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 text-sm border border-gray-200 rounded-xl py-2 text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 text-sm bg-brand-greenDark text-white rounded-xl py-2 hover:bg-brand-green disabled:opacity-50 flex items-center justify-center gap-1"
                >
                  {isPending ? <Loader2 size={14} className="animate-spin" /> : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
