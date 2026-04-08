'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, StickyNote, X, Clock } from 'lucide-react'
import { addLeadNote } from '../actions'
import type { LeadNote } from '@/lib/supabase/queries'

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  })
}

interface Props {
  leadId: string
  initialNotes: LeadNote[]
}

export default function NotesForm({ leadId, initialNotes }: Props) {
  const [notes, setNotes] = useState(initialNotes)
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
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

    const optimistic: LeadNote = {
      id: `opt-${Date.now()}`,
      lead_id: leadId,
      body,
      created_by: '…',
      created_at: new Date().toISOString(),
    }
    setNotes(prev => [optimistic, ...prev])
    setText('')
    setOpen(false)

    startTransition(async () => {
      const result = await addLeadNote(leadId, body)
      if (result.error) {
        setNotes(prev => prev.filter(n => n.id !== optimistic.id))
        setText(body)
        setOpen(true)
      } else {
        router.refresh()
      }
    })
  }

  return (
    <div className="space-y-2">
      {/* Add note row — matches "+ Log Activity" style */}
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 w-full px-3 py-2.5 border-2 border-dashed border-gray-200 text-gray-400 text-sm rounded-xl hover:border-brand-green hover:text-brand-greenDark transition-colors"
        >
          <Plus size={14} />
          Add Note
        </button>
      ) : (
        <div className="border border-gray-200 rounded-xl p-3 bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-gray-700">New Note</p>
            <button onClick={() => { setOpen(false); setText('') }} className="text-gray-400 hover:text-gray-600">
              <X size={13} />
            </button>
          </div>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            rows={3}
            placeholder="Type a note… Enter to save, Shift+Enter for new line"
            className="w-full text-sm text-gray-700 placeholder-gray-400 resize-none outline-none bg-transparent"
          />
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200">
            <span className="text-xs text-gray-400">
              <kbd className="bg-white border border-gray-200 px-1 rounded text-[10px]">Enter</kbd> to save
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setOpen(false); setText('') }}
                className="text-xs text-gray-500 px-2 py-1 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={save}
                disabled={!text.trim() || isPending}
                className="text-xs font-semibold text-white bg-brand-greenDark hover:bg-brand-green disabled:opacity-40 disabled:cursor-not-allowed px-3 py-1 rounded-lg transition-colors"
              >
                {isPending ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notes list — matches activity item style */}
      {notes.length === 0 && (
        <p className="text-xs text-gray-400 text-center py-3">No notes yet</p>
      )}
      {notes.map(note => (
        <div
          key={note.id}
          className={`flex items-start gap-3 p-3 border border-gray-100 bg-white rounded-xl transition-opacity ${
            note.id.startsWith('opt-') ? 'opacity-50' : ''
          }`}
        >
          <StickyNote size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{note.body}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-xs bg-white border border-amber-200 text-amber-700 px-1.5 py-0.5 rounded font-medium capitalize">
                {note.created_by}
              </span>
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Clock size={10} />
                {formatDateTime(note.created_at)}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
