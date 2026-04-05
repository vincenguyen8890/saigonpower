'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { PlusCircle, X } from 'lucide-react'

export default function NewLeadModal({ locale }: { locale: string }) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const isVi = locale === 'vi'

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
          preferredLanguage: get('preferredLanguage') || locale,
          source:            get('source') || 'manual',
          notes:             get('notes') || undefined,
        }),
      })
      setOpen(false)
      router.refresh()
    })
  }

  const inputClass = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green'
  const labelClass = 'block text-xs font-medium text-gray-600 mb-1'

  return (
    <>
      <button onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-brand-greenDark text-white text-sm px-4 py-2 rounded-xl hover:bg-brand-green transition-colors font-medium">
        <PlusCircle size={16} />
        {isVi ? 'Thêm Khách Hàng' : 'Add Lead'}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">{isVi ? 'Thêm Khách Hàng Mới' : 'Add New Lead'}</h2>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className={labelClass}>{isVi ? 'Họ Tên *' : 'Full Name *'}</label>
                  <input name="name" required placeholder="Nguyễn Văn A" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{isVi ? 'Điện Thoại' : 'Phone'}</label>
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
                  <label className={labelClass}>{isVi ? 'Dịch Vụ' : 'Service'}</label>
                  <select name="serviceType" defaultValue="residential" className={inputClass}>
                    <option value="residential">{isVi ? 'Dân Cư' : 'Residential'}</option>
                    <option value="commercial">{isVi ? 'Thương Mại' : 'Commercial'}</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{isVi ? 'Ngôn Ngữ' : 'Language'}</label>
                  <select name="preferredLanguage" defaultValue={locale} className={inputClass}>
                    <option value="vi">Tiếng Việt</option>
                    <option value="en">English</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{isVi ? 'Nguồn' : 'Source'}</label>
                  <select name="source" defaultValue="manual" className={inputClass}>
                    <option value="manual">{isVi ? 'Thủ Công' : 'Manual'}</option>
                    <option value="phone">{isVi ? 'Điện Thoại' : 'Phone'}</option>
                    <option value="referral">{isVi ? 'Giới Thiệu' : 'Referral'}</option>
                    <option value="facebook">Facebook</option>
                    <option value="google">Google</option>
                    <option value="website">Website</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className={labelClass}>{isVi ? 'Ghi Chú' : 'Notes'}</label>
                  <textarea name="notes" rows={2} className={inputClass.replace('py-2.5', 'py-2') + ' resize-none'} placeholder={isVi ? 'Ghi chú thêm...' : 'Additional notes...'} />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setOpen(false)}
                  className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors">
                  {isVi ? 'Hủy' : 'Cancel'}
                </button>
                <button type="submit" disabled={isPending}
                  className="flex-1 bg-brand-greenDark text-white py-2.5 rounded-xl text-sm hover:bg-brand-green transition-colors disabled:opacity-50 font-medium">
                  {isPending ? (isVi ? 'Đang lưu...' : 'Saving...') : (isVi ? 'Thêm Khách Hàng' : 'Add Lead')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
