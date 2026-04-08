'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { StickyNote, Send } from 'lucide-react'
import { addDealNote } from '../actions'
import type { DealNote } from '@/lib/supabase/queries'

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  })
}

export default function DealNotesTab({
  dealId,
  initialNotes,
}: {
  dealId: string
  initialNotes: DealNote[]
}) {
  const [notes, setNotes] = useState(initialNotes)
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      save()
    }
  }

  function save() {
    const body = text.trim()
    if (!body || isPending) return
    setError('')

    // Optimistic — show immediately
    const optimistic: DealNote = {
      id: `opt-${Date.now()}`,
      deal_id: dealId,
      body,
      created_by: '…',
      created_at: new Date().toISOString(),
    }
    setNotes(prev => [optimistic, ...prev])
    setText('')

    startTransition(async () => {
      const result = await addDealNote(dealId, body)
      if (result.error) {
        setNotes(prev => prev.filter(n => n.id !== optimistic.id))
        setText(body)
        setError(result.error)
      } else {
        router.refresh()
      }
    })
  }

  return (
    <div className="space-y-4">
      {/* Input area */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a note and press Enter to save… (Shift+Enter for new line)"
          rows={3}
          disabled={isPending}
          className="w-full text-sm text-gray-700 placeholder-gray-400 resize-none outline-none disabled:opacity-60"
        />
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
          <p className="text-xs text-gray-400">
            Press <kbd className="bg-gray-100 border border-gray-200 px-1 py-0.5 rounded text-[10px]">Enter</kbd> to save
            &nbsp;·&nbsp;
            <kbd className="bg-gray-100 border border-gray-200 px-1 py-0.5 rounded text-[10px]">Shift+Enter</kbd> for new line
          </p>
          <button
            onClick={save}
            disabled={!text.trim() || isPending}
            className="flex items-center gap-1.5 text-xs font-semibold text-white bg-brand-greenDark hover:bg-brand-green disabled:opacity-40 disabled:cursor-not-allowed px-3 py-1.5 rounded-lg transition-colors"
          >
            <Send size={12} />
            {isPending ? 'Saving…' : 'Save'}
          </button>
        </div>
        {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
      </div>

      {/* Notes list */}
      {notes.length === 0 ? (
        <div className="text-center py-14">
          <StickyNote size={28} className="text-gray-200 mx-auto mb-2" />
          <p className="text-sm text-gray-400">No notes yet — type one above</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map(note => (
            <div
              key={note.id}
              className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-4 transition-opacity ${
                note.id.startsWith('opt-') ? 'opacity-60' : ''
              }`}
            >
              <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{note.body}</p>
              <div className="flex items-center gap-2 mt-3 pt-2 border-t border-gray-50">
                <div className="w-5 h-5 rounded-full bg-brand-greenDark flex items-center justify-center flex-shrink-0">
                  <span className="text-[9px] font-bold text-white">
                    {note.created_by.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-xs font-medium text-gray-700">{note.created_by}</span>
                <span className="text-gray-300">·</span>
                <span className="text-xs text-gray-400">{formatDateTime(note.created_at)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
