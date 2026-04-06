'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, X } from 'lucide-react'
import { deleteDealAction } from '../actions'

export default function DeleteDealButton({ dealId, locale }: { dealId: string; locale: string }) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [isPending,   setIsPending]   = useState(false)
  const router = useRouter()

  async function handleDelete() {
    setIsPending(true)
    await deleteDealAction(dealId)
    router.push(`/${locale}/crm/deals`)
  }

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className="flex items-center gap-2 border border-red-200 text-red-500 text-sm px-3 py-2 rounded-xl hover:bg-red-50 transition-colors"
      >
        <Trash2 size={14} />
        Delete
      </button>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-900">Delete Deal</h2>
              <button onClick={() => setShowConfirm(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-6">This deal will be permanently deleted. This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="flex-1 bg-red-600 text-white py-2.5 rounded-xl text-sm hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
              >
                {isPending ? 'Deleting...' : 'Delete Deal'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
