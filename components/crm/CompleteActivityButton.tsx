'use client'

import { useState } from 'react'
import { CheckCircle, Loader2 } from 'lucide-react'
import { completeActivityAction } from '@/app/[locale]/crm/actions'

interface Props {
  activityId: string
}

export default function CompleteActivityButton({ activityId }: Props) {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleComplete() {
    setLoading(true)
    await completeActivityAction(activityId)
    setDone(true)
    setLoading(false)
  }

  if (done) {
    return (
      <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
        <CheckCircle size={13} /> Done
      </span>
    )
  }

  return (
    <button
      onClick={handleComplete}
      disabled={loading}
      className="flex items-center gap-1.5 text-xs bg-green-50 text-green-700 border border-green-200 px-2.5 py-1.5 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
    >
      {loading ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />}
      Complete
    </button>
  )
}
