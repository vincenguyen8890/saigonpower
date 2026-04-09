'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, X } from 'lucide-react'
import { updateLeadFull } from '../actions'
import type { Lead, LeadTag } from '@/data/mock-crm'

const TAG_OPTIONS: { value: LeadTag; label: string; selectedClass: string }[] = [
  { value: 'assistant_program', label: 'Assistant Program', selectedClass: 'border-blue-300 text-blue-700 bg-blue-50' },
  { value: '65+',               label: '65+',               selectedClass: 'border-purple-300 text-purple-700 bg-purple-50' },
  { value: 'red_flag',          label: 'Red Flag',          selectedClass: 'border-red-300 text-red-700 bg-red-50' },
  { value: 'vip',               label: 'VIP',               selectedClass: 'border-amber-300 text-amber-700 bg-amber-50' },
]

export default function EditLeadModal({ lead }: { lead: Lead }) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [selectedTags, setSelectedTags] = useState<LeadTag[]>(lead.tags ?? [])
  const router = useRouter()

  function toggleTag(tag: LeadTag) {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const get = (name: string) => (form.elements.namedItem(name) as HTMLInputElement).value

    startTransition(async () => {
      await updateLeadFull(lead.id, {
        name:               get('name'),
        email:              get('email'),
        email2:             get('email2') || null,
        phone:              get('phone'),
        phone2:             get('phone2') || null,
        zip:                get('zip'),
        dob:                get('dob') || null,
        anxh:               get('anxh') || null,
        service_type:       get('service_type'),
        preferred_language: get('preferred_language'),
        source:             get('source'),
        notes:              get('notes'),
        assigned_to:        get('assigned_to'),
        tags:               selectedTags,
      })
      setOpen(false)
      router.refresh()
    })
  }

  const inputClass = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green'
  const labelClass = 'block text-xs font-medium text-gray-600 mb-1'

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 border border-gray-200 text-gray-600 text-sm px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors"
      >
        <Pencil size={14} />
        Edit Lead
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <h2 className="font-semibold text-gray-900">Edit Lead — {lead.name}</h2>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className={labelClass}>Full Name *</label>
                  <input name="name" required defaultValue={lead.name} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Phone 1</label>
                  <input name="phone" type="tel" defaultValue={lead.phone} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Phone 2</label>
                  <input name="phone2" type="tel" defaultValue={lead.phone2 ?? ''} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Email 1</label>
                  <input name="email" type="email" defaultValue={lead.email} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Email 2</label>
                  <input name="email2" type="email" defaultValue={lead.email2 ?? ''} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>ZIP</label>
                  <input name="zip" maxLength={5} defaultValue={lead.zip} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Date of Birth</label>
                  <input name="dob" type="date" defaultValue={lead.dob ?? ''} className={inputClass} />
                </div>
                <div className="col-span-2">
                  <label className={labelClass}>ANXH</label>
                  <input name="anxh" defaultValue={lead.anxh ?? ''} placeholder="ANXH number" className={inputClass} />
                </div>
                <div className="col-span-2">
                  <label className={labelClass}>Tags</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {TAG_OPTIONS.map(({ value, label, selectedClass }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => toggleTag(value)}
                        className={`text-xs px-3 py-1.5 rounded-lg border transition-colors font-medium ${
                          selectedTags.includes(value)
                            ? selectedClass
                            : 'border-gray-200 text-gray-500 hover:border-gray-300'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Account Type</label>
                  <select name="service_type" defaultValue={lead.service_type} className={inputClass}>
                    <option value="residential">Residential</option>
                    <option value="commercial">Commercial</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Language</label>
                  <select name="preferred_language" defaultValue={lead.preferred_language} className={inputClass}>
                    <option value="vi">Vietnamese</option>
                    <option value="en">English</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Source</label>
                  <select name="source" defaultValue={lead.source || 'manual'} className={inputClass}>
                    <option value="manual">Manual Entry</option>
                    <option value="phone">Phone Call</option>
                    <option value="referral">Referral</option>
                    <option value="facebook">Facebook</option>
                    <option value="google">Google</option>
                    <option value="website">Website</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Assigned To</label>
                  <input name="assigned_to" defaultValue={lead.assigned_to || ''} placeholder="agent@saigonllc.com" className={inputClass} />
                </div>
                <div className="col-span-2">
                  <label className={labelClass}>Notes</label>
                  <textarea
                    name="notes"
                    rows={3}
                    defaultValue={lead.notes || ''}
                    className={inputClass.replace('py-2.5', 'py-2') + ' resize-none'}
                    placeholder="Internal notes..."
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 bg-brand-greenDark text-white py-2.5 rounded-xl text-sm hover:bg-brand-green transition-colors disabled:opacity-50 font-medium"
                >
                  {isPending ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
