'use client'

import { useEffect } from 'react'
import { AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react'
import Link from 'next/link'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[Page Error]', error)
  }, [error])

  return (
    <div className="min-h-screen bg-[#0B1120] flex flex-col items-center justify-center px-5 text-center">
      <div className="w-14 h-14 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mb-5">
        <AlertTriangle size={24} className="text-red-400" />
      </div>
      <h1 className="text-white font-black text-2xl mb-2">Something went wrong</h1>
      <p className="text-white/45 text-sm mb-8 max-w-sm">
        {error.message || 'An unexpected error occurred.'}
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={reset}
          className="flex items-center gap-2 bg-[#00C853] hover:bg-[#00A846] text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all"
        >
          <RefreshCw size={14} />
          Try again
        </button>
        <Link
          href="/"
          className="flex items-center gap-2 text-white/50 hover:text-white/80 text-sm font-medium border border-white/15 hover:border-white/30 px-5 py-2.5 rounded-xl transition-all"
        >
          <ArrowLeft size={14} />
          Go home
        </Link>
      </div>
    </div>
  )
}
