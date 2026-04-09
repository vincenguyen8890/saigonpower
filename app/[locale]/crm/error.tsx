'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function CRMError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[CRM Error]', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="w-14 h-14 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mb-5">
        <AlertTriangle size={24} className="text-red-400" />
      </div>
      <h2 className="text-white font-bold text-xl mb-2">Something went wrong</h2>
      <p className="text-white/45 text-sm mb-6 max-w-sm">
        {error.message || 'An unexpected error occurred. Please try again.'}
      </p>
      <button
        onClick={reset}
        className="flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/15 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all"
      >
        <RefreshCw size={14} />
        Try again
      </button>
    </div>
  )
}
