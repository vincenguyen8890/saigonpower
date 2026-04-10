'use client'

import { useState, useTransition } from 'react'
import { Trash2, Loader2, AlertTriangle } from 'lucide-react'

export default function ResetDataButton() {
  const [phase, setPhase] = useState<'idle' | 'confirm' | 'done' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleReset() {
    setPhase('confirm')
  }

  function handleCancel() {
    setPhase('idle')
  }

  function handleConfirm() {
    startTransition(async () => {
      const res = await fetch('/api/crm/reset', { method: 'POST' })
      if (res.ok) {
        setPhase('done')
      } else {
        const body = await res.json().catch(() => ({}))
        setErrorMsg(body.error ?? 'Reset failed. Please try again.')
        setPhase('error')
      }
    })
  }

  if (phase === 'done') {
    return (
      <p className="text-sm text-[#00A846] font-medium">
        All customer, account, and deal data has been cleared.
      </p>
    )
  }

  return (
    <div className="flex items-center gap-3">
      {phase === 'error' && (
        <span className="text-xs text-red-500">{errorMsg}</span>
      )}

      {phase === 'confirm' ? (
        <>
          <span className="text-xs text-slate-500">This cannot be undone. Are you sure?</span>
          <button
            onClick={handleCancel}
            disabled={isPending}
            className="text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isPending}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
          >
            {isPending ? (
              <><Loader2 size={12} className="animate-spin" /> Resetting…</>
            ) : (
              <><AlertTriangle size={12} /> Yes, delete everything</>
            )}
          </button>
        </>
      ) : (
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
        >
          <Trash2 size={12} />
          Reset all CRM data
        </button>
      )}
    </div>
  )
}
