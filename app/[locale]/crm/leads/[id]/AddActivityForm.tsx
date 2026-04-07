'use client'

import { useState, useTransition } from 'react'
import { Plus, X } from 'lucide-react'
import { createLeadActivity } from '../actions'
import type { Activity } from '@/lib/supabase/queries'

const activityTypes: Activity['type'][] = ['call', 'email', 'meeting', 'task', 'note', 'renewal']

export default function AddActivityForm({ leadId }: { leadId: string | null }) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const get = (n: string) => (form.elements.namedItem(n) as HTMLInputElement).value

    startTransition(async () => {
      await createLeadActivity({
        lead_id:     leadId,
        type:        get('type') as Activity['type'],
        title:       get('title'),
        description: get('description') || null,
        due_date:    get('due_date') ? new Date(get('due_date')).toISOString() : null,
        completed:   false,
        assigned_to: get('assigned_to') || null,
        created_by:  null,
      })
      form.reset()
      setSaved(true)
      setTimeout(() => { setSaved(false); setOpen(false) }, 1500)
    })
  }

  const inputClass = 'w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green'

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 w-full px-3 py-2.5 border-2 border-dashed border-gray-200 text-gray-400 text-sm rounded-xl hover:border-brand-green hover:text-brand-greenDark transition-colors"
      >
        <Plus size={14} />
        Log Activity
      </button>
    )
  }

  return (
    <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-gray-900">Log Activity</p>
        <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
          <X size={14} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
            <select name="type" defaultValue="call" className={inputClass}>
              {activityTypes.map(t => (
                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Due Date</label>
            <input name="due_date" type="datetime-local" className={inputClass} />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Title *</label>
          <input name="title" required placeholder="e.g. Follow-up call" className={inputClass} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
          <textarea name="description" rows={2} placeholder="Optional details..." className={inputClass + ' resize-none'} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Assigned To</label>
          <input name="assigned_to" placeholder="agent@saigonllc.com" className={inputClass} />
        </div>

        <div className="flex items-center gap-2 pt-1">
          <button
            type="submit"
            disabled={isPending}
            className="flex-1 bg-brand-greenDark text-white text-sm py-2 rounded-xl hover:bg-brand-green transition-colors disabled:opacity-50"
          >
            {isPending ? 'Saving...' : saved ? '✓ Saved' : 'Log Activity'}
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="px-3 py-2 border border-gray-200 text-gray-600 text-sm rounded-xl hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
