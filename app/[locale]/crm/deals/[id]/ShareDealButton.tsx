'use client'

import { useState } from 'react'
import { Share2, CheckCircle2, Loader2 } from 'lucide-react'
import { getOrCreateShareTokenAction } from './actions'

export default function ShareDealButton({ dealId, locale }: { dealId: string; locale: string }) {
  const [state, setState] = useState<'idle' | 'loading' | 'copied'>('idle')

  async function handleShare() {
    setState('loading')
    try {
      const token = await getOrCreateShareTokenAction(dealId)
      const url = `${window.location.origin}/${locale}/crm/customer/${dealId}?token=${token}`
      await navigator.clipboard.writeText(url)
      setState('copied')
      setTimeout(() => setState('idle'), 2500)
    } catch {
      setState('idle')
    }
  }

  return (
    <button
      onClick={handleShare}
      disabled={state === 'loading'}
      className="flex items-center gap-1.5 text-sm border border-gray-200 text-gray-600 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors bg-white disabled:opacity-60"
    >
      {state === 'copied'
        ? <CheckCircle2 size={14} className="text-green-600" />
        : state === 'loading'
        ? <Loader2 size={14} className="animate-spin" />
        : <Share2 size={14} />}
      {state === 'copied' ? 'Link copied!' : 'Share'}
    </button>
  )
}
