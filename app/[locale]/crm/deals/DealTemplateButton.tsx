'use client'

import { useState, useEffect } from 'react'
import { BookOpen, Trash2, ChevronDown } from 'lucide-react'
import type { DealTemplate } from '@/lib/supabase/queries'

interface Props {
  onApply: (tpl: DealTemplate) => void
}

export default function DealTemplateButton({ onApply }: Props) {
  const [open,      setOpen]      = useState(false)
  const [templates, setTemplates] = useState<DealTemplate[]>([])
  const [loading,   setLoading]   = useState(false)

  async function load() {
    if (templates.length > 0) { setOpen(v => !v); return }
    setLoading(true)
    try {
      const res  = await fetch('/api/crm/deal-templates')
      const json = await res.json()
      setTemplates(json.templates ?? [])
      setOpen(true)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    await fetch(`/api/crm/deal-templates?id=${id}`, { method: 'DELETE' })
    setTemplates(prev => prev.filter(t => t.id !== id))
  }

  if (templates.length === 0 && !loading && !open) {
    return (
      <button
        type="button"
        onClick={load}
        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 border border-gray-200 px-2.5 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <BookOpen size={12} />
        Load template
      </button>
    )
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        disabled={loading}
        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 border border-gray-200 px-2.5 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <BookOpen size={12} />
        Templates
        <ChevronDown size={11} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
          {templates.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-4">No templates saved yet</p>
          ) : (
            <div className="divide-y divide-gray-50 max-h-52 overflow-y-auto">
              {templates.map(tpl => (
                <div key={tpl.id} className="flex items-center group hover:bg-gray-50">
                  <button
                    type="button"
                    onClick={() => { onApply(tpl); setOpen(false) }}
                    className="flex-1 text-left px-3 py-2.5"
                  >
                    <p className="text-xs font-medium text-gray-900">{tpl.name}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5 truncate">
                      {[tpl.provider, tpl.plan_name, tpl.term_months ? `${tpl.term_months}mo` : null].filter(Boolean).join(' · ')}
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={e => handleDelete(tpl.id, e)}
                    className="p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all mr-1"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
