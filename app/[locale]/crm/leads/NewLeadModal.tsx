'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { PlusCircle, X } from 'lucide-react'

export default function NewLeadModal({ locale }: { locale: string }) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const get = (name: string) => (form.elements.namedItem(name) as HTMLInputElement).value

    startTransition(async () => {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:              get('name'),
          email:             get('email') || undefined,
          phone:             get('phone') || undefined,
          zip:               get('zip'),
          serviceType:       get('serviceType') || 'residential',
          preferredLanguage: get('preferredLanguage') || 'vi',
          source:            get('source') || 'manual',
          referral_by:       get('referral_by') || undefined,
          service_address:   get('service_address') || undefined,
          mailing_address:   get('mailing_address') || undefined,
          dob:               get('dob') || undefined,
          anxh:              get('anxh') || undefined,
          notes:             get('notes') || undefined,
        }),
      })
      setOpen(false)
      router.refresh()
    })
  }

  const inputClass = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green'
  const labelClass = 'block text-xs font-medium text-gray-600 mb-1'
  const sectionClass = 'text-xs font-semibold text-gray-400 uppercase tracking-widest pt-1'

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-brand-greenDark text-white text-sm px-4 py-2 rounded-xl hover:bg-brand-green transition-colors font-medium"
      >
        <PlusCircle size={16} />
        Add Lead
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Add New Lead</h2>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">

              {/* CONTACT INFO */}
              <p className={sectionClass}>Contact Info</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className={labelClass}>Full Name *</label>
                  <input name="name" required placeholder="Nguyen Van A" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Phone</label>
                  <input name="phone" type="tel" placeholder="(832) 555-0100" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>ZIP *</label>
                  <input name="zip" required maxLength={5} placeholder="77036" className={inputClass} />
                </div>
                <div className="col-span-2">
                  <label className={labelClass}>Email</label>
                  <input name="email" type="email" placeholder="email@example.com" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Date of Birth</label>
                  <input name="dob" type="date" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>ANXH</label>
                  <input name="anxh" placeholder="ANXH number" className={inputClass} />
                </div>
              </div>

              {/* ADDRESS */}
              <p className={sectionClass}>Address</p>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className={labelClass}>Service Address</label>
                  <input name="service_address" placeholder="123 Main St, Houston TX 77036" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Mailing Address</label>
                  <input name="mailing_address" placeholder="Same as service address if blank" className={inputClass} />
                </div>
              </div>

              {/* SERVICE & SOURCE */}
              <p className={sectionClass}>Service & Source</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Service Type</label>
                  <select name="serviceType" defaultValue="residential" className={inputClass}>
                    <option value="residential">Residential</option>
                    <option value="commercial">Commercial</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Language</label>
                  <select name="preferredLanguage" defaultValue="vi" className={inputClass}>
                    <option value="vi">Vietnamese</option>
                    <option value="en">English</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Source</label>
                  <select name="source" defaultValue="manual" className={inputClass}>
                    <option value="manual">Manual Entry</option>
                    <option value="phone">Phone Call</option>
                    <option value="referral">Referral</option>
                    <option value="facebook">Facebook</option>
                    <option value="google">Google</option>
                    <option value="website">Website</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Referral By</label>
                  <input name="referral_by" placeholder="Referred by name" className={inputClass} />
                </div>
                <div className="col-span-2">
                  <label className={labelClass}>Notes</label>
                  <textarea
                    name="notes"
                    rows={2}
                    className={inputClass.replace('py-2.5', 'py-2') + ' resize-none'}
                    placeholder="Additional notes..."
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
                  {isPending ? 'Saving...' : 'Add Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
