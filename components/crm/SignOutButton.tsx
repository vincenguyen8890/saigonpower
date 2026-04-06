'use client'

import { useState } from 'react'
import { LogOut, X } from 'lucide-react'

export default function SignOutButton({ locale }: { locale: string }) {
  const [showConfirm, setShowConfirm] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setShowConfirm(true)}
        className="mt-1 flex items-center gap-1.5 text-green-300 hover:text-white text-xs transition-colors"
      >
        <LogOut size={13} />
        Sign Out
      </button>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-900">Sign Out</h2>
              <button onClick={() => setShowConfirm(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-6">Are you sure you want to sign out?</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <form action="/api/auth/signout" method="POST" className="flex-1">
                <input type="hidden" name="locale" value={locale} />
                <button
                  type="submit"
                  className="w-full bg-red-600 text-white py-2.5 rounded-xl text-sm hover:bg-red-700 transition-colors font-medium"
                >
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
