'use client'

import { useState, useTransition } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Check, Loader2, AlertCircle } from 'lucide-react'
import { saveSettings } from '@/app/[locale]/crm/settings/actions'

export interface SettingsField {
  key: string
  label: string
  description?: string
  value: string | boolean
  type: 'text' | 'email' | 'toggle' | 'readonly' | 'password'
}

interface SettingsSectionProps {
  icon: LucideIcon
  title: string
  description: string
  fields: SettingsField[]
  sectionKey: string
}

export default function SettingsSection({
  icon: Icon,
  title,
  description,
  fields,
  sectionKey,
}: SettingsSectionProps) {
  const [values, setValues] = useState<Record<string, string | boolean>>(
    Object.fromEntries(fields.map(f => [f.key, f.value])),
  )
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [isPending, startTransition] = useTransition()

  const isDirty = fields.some(f => values[f.key] !== f.value)

  function handleText(key: string, val: string) {
    setValues(v => ({ ...v, [key]: val }))
    if (status !== 'idle') setStatus('idle')
  }

  function handleToggle(key: string) {
    setValues(v => ({ ...v, [key]: !v[key] }))
    if (status !== 'idle') setStatus('idle')
  }

  function handleSave() {
    setStatus('saving')
    setErrorMsg('')
    startTransition(async () => {
      const result = await saveSettings({ section: sectionKey, data: values })
      if (result.ok) {
        setStatus('saved')
        setTimeout(() => setStatus('idle'), 2500)
      } else {
        setStatus('error')
        setErrorMsg(result.error ?? 'Unknown error')
      }
    })
  }

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-[0_1px_3px_rgba(15,23,42,0.06)] overflow-hidden">
      {/* Section header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white rounded-lg border border-slate-100 flex items-center justify-center shadow-sm">
            <Icon size={15} className="text-slate-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#0F172A]">{title}</p>
            <p className="text-xs text-slate-400">{description}</p>
          </div>
        </div>

        {/* Save button — only editable sections */}
        {fields.some(f => f.type !== 'readonly') && (
          <button
            onClick={handleSave}
            disabled={!isDirty || isPending || status === 'saving'}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
              status === 'saved'
                ? 'bg-[#E8FFF1] text-[#00A846] border border-[#A3F0C4]'
                : status === 'error'
                ? 'bg-red-50 text-red-600 border border-red-200'
                : isDirty
                ? 'bg-[#00C853] hover:bg-[#00A846] text-white shadow-sm shadow-[#00C853]/20'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            {status === 'saving' || isPending ? (
              <><Loader2 size={12} className="animate-spin" /> Saving…</>
            ) : status === 'saved' ? (
              <><Check size={12} /> Saved</>
            ) : status === 'error' ? (
              <><AlertCircle size={12} /> Error</>
            ) : (
              'Save changes'
            )}
          </button>
        )}
      </div>

      {/* Error banner */}
      {status === 'error' && errorMsg && (
        <div className="flex items-center gap-2 px-6 py-2.5 bg-red-50 border-b border-red-100 text-xs text-red-600">
          <AlertCircle size={12} />
          {errorMsg}
        </div>
      )}

      {/* Fields */}
      <div className="divide-y divide-slate-50">
        {fields.map(field => (
          <div key={field.key} className="flex items-center justify-between px-6 py-4 gap-6">
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-700">{field.label}</p>
              {field.description && (
                <p className="text-xs text-slate-400 mt-0.5">{field.description}</p>
              )}
            </div>

            <div className="flex-shrink-0">
              {field.type === 'readonly' ? (
                <span className={`text-sm font-semibold ${
                  String(values[field.key]).includes('Not') || String(values[field.key]) === 'Not set'
                    ? 'text-amber-600'
                    : 'text-[#00A846]'
                }`}>
                  {String(values[field.key])}
                </span>

              ) : field.type === 'toggle' ? (
                <button
                  role="switch"
                  aria-checked={!!values[field.key]}
                  onClick={() => handleToggle(field.key)}
                  className={`relative w-10 h-5 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00C853] focus-visible:ring-offset-2 ${
                    values[field.key] ? 'bg-[#00C853]' : 'bg-slate-200'
                  }`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
                    values[field.key] ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>

              ) : field.type === 'password' ? (
                <input
                  type="password"
                  value={String(values[field.key])}
                  onChange={e => handleText(field.key, e.target.value)}
                  placeholder="••••••••"
                  className="w-56 px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C853]/30 focus:border-[#00C853] text-slate-700 transition-all"
                />

              ) : (
                /* text / email */
                <input
                  type={field.type}
                  value={String(values[field.key])}
                  onChange={e => handleText(field.key, e.target.value)}
                  className="w-56 px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C853]/30 focus:border-[#00C853] text-slate-700 transition-all"
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
