'use client'

import { useState } from 'react'
import { BookmarkPlus, X, CheckCircle2 } from 'lucide-react'
import { saveDealAsTemplateAction } from './actions'

export default function SaveTemplateButton({ dealId, suggestedName }: { dealId: string; suggestedName: string }) {
  const [open,    setOpen]    = useState(false)
  const [name,    setName]    = useState(suggestedName)
  const [saving,  setSaving]  = useState(false)
  const [saved,   setSaved]   = useState(false)

  async function handleSave() {
    if (!name.trim()) return
    setSaving(true)
    await saveDealAsTemplateAction(dealId, name.trim())
    setSaving(false)
    setSaved(true)
    setTimeout(() => { setSaved(false); setOpen(false) }, 1500)
  }

  return (
    <>
      <button
        onClick={() => { setOpen(true); setName(suggestedName) }}
        className="flex items-center gap-1.5 text-sm border border-gray-200 text-gray-600 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors bg-white"
        title="Save as deal template"
      >
        <BookmarkPlus size={14} />
        Template
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Save as Template</h2>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
            </div>
            <p className="text-xs text-gray-500 mb-3">Saves provider, plan, rate, adder, and term as a reusable template for new deals.</p>
            <label className="block text-xs font-medium text-gray-600 mb-1">Template Name</label>
            <input
              autoFocus
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Gexa 12mo Fixed Res"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green mb-4"
            />
            <div className="flex gap-2">
              <button onClick={() => setOpen(false)} className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-xl text-sm hover:bg-gray-50">Cancel</button>
              <button
                onClick={handleSave}
                disabled={saving || !name.trim()}
                className="flex-1 bg-brand-greenDark text-white py-2 rounded-xl text-sm hover:bg-brand-green disabled:opacity-50 font-medium flex items-center justify-center gap-1.5"
              >
                {saved ? <><CheckCircle2 size={14} /> Saved!</> : saving ? 'Saving…' : 'Save Template'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
