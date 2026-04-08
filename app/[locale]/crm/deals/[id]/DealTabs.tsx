'use client'

import { useState } from 'react'
import { LayoutDashboard, StickyNote } from 'lucide-react'

interface Props {
  overview: React.ReactNode
  notes: React.ReactNode
  noteCount: number
}

export default function DealTabs({ overview, notes, noteCount }: Props) {
  const [tab, setTab] = useState<'overview' | 'notes'>('overview')

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-5 w-fit">
        <button
          onClick={() => setTab('overview')}
          className={`flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg transition-colors ${
            tab === 'overview'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <LayoutDashboard size={14} />
          Overview
        </button>
        <button
          onClick={() => setTab('notes')}
          className={`flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg transition-colors ${
            tab === 'notes'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <StickyNote size={14} />
          Notes
          {noteCount > 0 && (
            <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-medium leading-none">
              {noteCount}
            </span>
          )}
        </button>
      </div>

      {tab === 'overview' ? overview : notes}
    </div>
  )
}
