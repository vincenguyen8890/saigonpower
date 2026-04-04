'use client'

import { useState, useTransition } from 'react'
import { updateLeadNotes } from '../actions'

interface Props {
  leadId: string
  initialNotes: string
  locale: string
}

export default function NotesForm({ leadId, initialNotes, locale }: Props) {
  const [notes, setNotes] = useState(initialNotes)
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const isVi = locale === 'vi'

  function handleSave() {
    startTransition(async () => {
      await updateLeadNotes(leadId, notes)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    })
  }

  return (
    <div>
      <textarea
        value={notes}
        onChange={e => { setNotes(e.target.value); setSaved(false) }}
        rows={5}
        placeholder={isVi ? 'Thêm ghi chú về khách hàng này...' : 'Add notes about this lead...'}
        className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green resize-none"
      />
      <div className="flex items-center justify-between mt-2">
        {saved ? (
          <span className="text-xs text-green-600 font-medium">
            {isVi ? '✓ Đã lưu' : '✓ Saved'}
          </span>
        ) : <span />}
        <button
          onClick={handleSave}
          disabled={isPending}
          className="text-sm bg-brand-greenDark text-white px-4 py-1.5 rounded-lg hover:bg-brand-green transition-colors disabled:opacity-50"
        >
          {isPending
            ? (isVi ? 'Đang lưu...' : 'Saving...')
            : (isVi ? 'Lưu Ghi Chú' : 'Save Note')}
        </button>
      </div>
    </div>
  )
}
