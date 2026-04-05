'use client'

import { useState, useTransition } from 'react'
import { Play, CheckCircle2, AlertTriangle } from 'lucide-react'
import { runRenewalReminders, type AutomationResult } from './actions'

export default function RunRenewalButton({ locale }: { locale: string }) {
  const [isPending, startTransition] = useTransition()
  const [results, setResults] = useState<AutomationResult[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  function handleRun() {
    setResults(null)
    setError(null)
    startTransition(async () => {
      try {
        const res = await runRenewalReminders()
        setResults(res)
      } catch {
        setError('Failed to run renewal engine')
      }
    })
  }

  const totalCreated = results?.reduce((s, r) => s + r.created, 0) ?? 0

  return (
    <div className="flex flex-col items-end gap-2 flex-shrink-0">
      <button
        onClick={handleRun}
        disabled={isPending}
        className="flex items-center gap-2 bg-white text-brand-greenDark text-sm px-4 py-2.5 rounded-xl font-semibold hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Play size={14} className={isPending ? 'animate-spin' : ''} />
        {isPending ? 'Running...' : 'Run Now'}
      </button>

      {results !== null && (
        <div className="bg-black/20 rounded-xl p-3 text-xs text-white text-right">
          <p className="font-semibold mb-1 flex items-center gap-1 justify-end">
            <CheckCircle2 size={12} />
            {totalCreated} activit{totalCreated === 1 ? 'y' : 'ies'} created
          </p>
          {results.map(r => (
            <p key={r.rule} className="text-green-200">
              {r.rule}: {r.created} created
            </p>
          ))}
        </div>
      )}

      {error && (
        <div className="bg-red-500/20 rounded-xl p-3 text-xs text-white flex items-center gap-1">
          <AlertTriangle size={12} />
          {error}
        </div>
      )}
    </div>
  )
}
