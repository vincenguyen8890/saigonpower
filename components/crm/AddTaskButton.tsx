'use client'

import { useState, useTransition } from 'react'
import { Plus, X, Loader2 } from 'lucide-react'
import { createLeadActivity } from '@/app/[locale]/crm/leads/actions'

const TYPES = ['call', 'email', 'meeting', 'task', 'note'] as const

export default function AddTaskButton() {
  const [open, setOpen]     = useState(false)
  const [isPending, start]  = useTransition()
  const [done, setDone]     = useState(false)

  const [form, setForm] = useState({
    type:        'task' as typeof TYPES[number],
    title:       '',
    description: '',
    due_date:    '',
  })

  function reset() {
    setForm({ type: 'task', title: '', description: '', due_date: '' })
    setDone(false)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) return
    start(async () => {
      await createLeadActivity({
        lead_id:     null,
        type:        form.type,
        title:       form.title.trim(),
        description: form.description.trim() || null,
        due_date:    form.due_date || null,
        completed:   false,
        assigned_to: null,
        created_by:  'user',
      })
      setDone(true)
      setTimeout(() => { setOpen(false); reset() }, 1200)
    })
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-xs font-semibold bg-brand-greenDark text-white px-3 py-2 rounded-xl hover:bg-green-700 transition-colors shadow-sm"
      >
        <Plus size={13} /> Add Task
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">Add Task</h2>
              <button onClick={() => { setOpen(false); reset() }} className="text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            </div>

            {done ? (
              <div className="py-10 text-center">
                <p className="text-sm font-semibold text-green-600">Task added to queue!</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Type</label>
                  <div className="flex flex-wrap gap-2">
                    {TYPES.map(t => (
                      <button key={t} type="button"
                        onClick={() => setForm(f => ({ ...f, type: t }))}
                        className={`text-xs px-3 py-1.5 rounded-lg font-medium capitalize transition-colors ${form.type === t ? 'bg-brand-greenDark text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="e.g. Follow up call with client"
                    className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500/30"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Description</label>
                  <textarea
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    rows={2}
                    placeholder="Optional notes..."
                    className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500/30 resize-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Due Date</label>
                  <input
                    type="date"
                    value={form.due_date}
                    onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))}
                    className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500/30"
                  />
                </div>

                <div className="flex gap-2 pt-1">
                  <button type="button" onClick={() => { setOpen(false); reset() }}
                    className="flex-1 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl py-2.5 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={isPending || !form.title.trim()}
                    className="flex-1 text-sm font-semibold text-white bg-brand-greenDark hover:bg-green-700 rounded-xl py-2.5 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                    {isPending ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : 'Add Task'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
