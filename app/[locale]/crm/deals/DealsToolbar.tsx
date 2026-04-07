'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { useCallback } from 'react'

export default function DealsToolbar({ initialQ = '', initialAgent = '' }: { initialQ?: string; initialAgent?: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const push = useCallback((updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString())
    for (const [k, v] of Object.entries(updates)) {
      if (v) params.set(k, v)
      else params.delete(k)
    }
    router.push(`${pathname}?${params.toString()}`)
  }, [router, pathname, searchParams])

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          type="search"
          placeholder="Search deals…"
          defaultValue={initialQ}
          onChange={e => push({ q: e.target.value, page: '' })}
          className="pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green w-52 bg-white"
        />
        {initialQ && (
          <button
            onClick={() => push({ q: '', page: '' })}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {/* Agent filter */}
      <input
        type="search"
        placeholder="Filter by agent…"
        defaultValue={initialAgent}
        onChange={e => push({ agent: e.target.value, page: '' })}
        className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green w-44 bg-white"
      />
    </div>
  )
}
