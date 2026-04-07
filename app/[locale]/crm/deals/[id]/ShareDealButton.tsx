'use client'

import { useState } from 'react'
import { Share2, CheckCircle2 } from 'lucide-react'

export default function ShareDealButton({ dealId, locale }: { dealId: string; locale: string }) {
  const [copied, setCopied] = useState(false)

  async function handleShare() {
    const url = `${window.location.origin}/${locale}/crm/customer/${dealId}`
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-1.5 text-sm border border-gray-200 text-gray-600 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors bg-white"
    >
      {copied ? <CheckCircle2 size={14} className="text-green-600" /> : <Share2 size={14} />}
      {copied ? 'Link copied!' : 'Share'}
    </button>
  )
}
