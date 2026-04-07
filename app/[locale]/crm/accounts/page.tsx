import Link from 'next/link'
import { Search, ChevronRight, Building2 } from 'lucide-react'
import { getAccounts, updateAccountStatus } from '@/lib/supabase/queries'
import { formatDate } from '@/lib/utils'
import { setRequestLocale } from 'next-intl/server'
import type { AccountStatus } from '@/lib/supabase/queries'

interface Props {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ status?: string; q?: string }>
}

const statusOptions = [
  { value: 'all',         label: 'All Accounts' },
  { value: 'active',      label: 'Active'        },
  { value: 'inactive',    label: 'Inactive'      },
  { value: 'switch_away', label: 'Switch Away'   },
]

const accountStatusStyles: Record<AccountStatus, { label: string; className: string }> = {
  active:      { label: 'Active',      className: 'bg-green-50 text-green-700 border border-green-200'  },
  inactive:    { label: 'Inactive',    className: 'bg-gray-100 text-gray-500 border border-gray-200'    },
  switch_away: { label: 'Switch Away', className: 'bg-amber-50 text-amber-700 border border-amber-200'  },
}

export default async function AccountsPage({ params, searchParams }: Props) {
  const { locale } = await params
  const { status, q } = await searchParams
  setRequestLocale(locale)

  const accounts = await getAccounts({
    status: status as AccountStatus | 'all' | undefined,
    q,
  })

  const activeStatus = status || 'all'

  const counts = {
    all:         accounts.length,
    active:      accounts.filter(a => a.account_status === 'active').length,
    inactive:    accounts.filter(a => a.account_status === 'inactive').length,
    switch_away: accounts.filter(a => a.account_status === 'switch_away').length,
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 size={20} className="text-brand-green" />
            Accounts
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Contacts with at least one deal — {accounts.length} total
          </p>
        </div>
      </div>

      {/* Stat chips */}
      <div className="flex flex-wrap gap-2 mb-5">
        {statusOptions.map(opt => {
          const count = counts[opt.value as keyof typeof counts] ?? accounts.length
          const isActive = activeStatus === opt.value
          return (
            <Link
              key={opt.value}
              href={`/${locale}/crm/accounts${opt.value !== 'all' ? `?status=${opt.value}` : ''}${q ? `${opt.value !== 'all' ? '&' : '?'}q=${q}` : ''}`}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors border ${
                isActive
                  ? 'bg-brand-green text-white border-brand-green'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              }`}
            >
              {opt.label}
              <span className={`ml-1.5 ${isActive ? 'opacity-80' : 'text-gray-400'}`}>
                {count}
              </span>
            </Link>
          )
        })}
      </div>

      {/* Search */}
      <form method="GET" className="mb-5">
        {activeStatus !== 'all' && <input type="hidden" name="status" value={activeStatus} />}
        <div className="relative w-full max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            name="q"
            defaultValue={q}
            placeholder="Search accounts..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green bg-white"
          />
        </div>
      </form>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {accounts.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <Building2 size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">No accounts found</p>
            <p className="text-xs mt-1">Contacts become accounts when a deal is linked</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Account</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Type</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Contact</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Added</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {accounts.map(account => {
                const statusInfo = account.account_status
                  ? accountStatusStyles[account.account_status]
                  : null
                return (
                  <tr key={account.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-brand-green/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-brand-green">
                            {account.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 leading-tight">{account.name}</p>
                          {account.customer_id && (
                            <p className="text-[11px] text-gray-400 font-mono mt-0.5">{account.customer_id}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 hidden sm:table-cell">
                      <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                        account.service_type === 'commercial'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-green-50 text-green-700'
                      }`}>
                        {account.service_type === 'commercial' ? 'Commercial' : 'Residential'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      {statusInfo ? (
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusInfo.className}`}>
                          {statusInfo.label}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <p className="text-gray-600">{account.phone}</p>
                      <p className="text-gray-400 text-xs truncate max-w-[180px]">{account.email}</p>
                    </td>
                    <td className="px-4 py-3.5 text-gray-400 hidden lg:table-cell text-xs">
                      {formatDate(account.created_at, locale)}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Link
                        href={`/${locale}/crm/leads/${account.id}`}
                        className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-brand-green opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        View <ChevronRight size={13} />
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
