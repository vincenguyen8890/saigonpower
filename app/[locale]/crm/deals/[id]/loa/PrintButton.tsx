'use client'

import { Printer } from 'lucide-react'

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="flex items-center gap-1.5 text-sm bg-[#00C853] hover:bg-[#00A846] text-white px-4 py-2 rounded-lg font-medium transition-colors"
    >
      <Printer size={15} />
      Print / Save PDF
    </button>
  )
}
