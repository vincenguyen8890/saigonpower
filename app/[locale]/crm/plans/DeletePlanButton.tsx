'use client'

import { useState, useTransition } from 'react'
import { Trash2, Loader2 } from 'lucide-react'
import { deletePlanAction } from './actions'

interface Props {
  planId: string
  planName: string
}

export default function DeletePlanButton({ planId, planName }: Props) {
  const [confirm, setConfirm] = useState(false)
  const [isPending, startTransition] = useTransition()

  if (confirm) {
    return (
      <div className="flex items-center gap-1">
        <span className="text-xs text-red-600 font-medium">Delete?</span>
        <button
          onClick={() => startTransition(async () => {
            await deletePlanAction(planId)
            setConfirm(false)
          })}
          disabled={isPending}
          className="text-xs bg-red-600 text-white px-2 py-1 rounded-lg hover:bg-red-700 disabled:opacity-60"
        >
          {isPending ? <Loader2 size={11} className="animate-spin" /> : 'Yes'}
        </button>
        <button
          onClick={() => setConfirm(false)}
          className="text-xs text-gray-400 hover:text-gray-600 px-1"
        >
          No
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirm(true)}
      title={`Delete ${planName}`}
      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
    >
      <Trash2 size={14} />
    </button>
  )
}
