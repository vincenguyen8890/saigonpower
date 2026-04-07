'use client'

import { DollarSign, CheckCircle2, AlertCircle } from 'lucide-react'

interface CommissionRow {
  email: string
  name: string
  wonDeals: number
  feePerDeal: number
  totalOwed: number
  totalPaid: number
  balance: number
}

interface Props {
  rows: CommissionRow[]
}

export default function CommissionClient({ rows }: Props) {
  const totalOwed  = rows.reduce((s, r) => s + r.totalOwed, 0)
  const totalPaid  = rows.reduce((s, r) => s + r.totalPaid, 0)
  const totalOwing = rows.reduce((s, r) => s + r.balance, 0)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Commission Summary</h1>
        <p className="text-gray-500 text-sm mt-1">Referral fees owed and paid per agent based on won deals</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-blue-700">${totalOwed}</p>
          <p className="text-xs text-gray-500 mt-0.5">Total Earned</p>
        </div>
        <div className="bg-green-50 rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-green-700">${totalPaid}</p>
          <p className="text-xs text-gray-500 mt-0.5">Total Paid</p>
        </div>
        <div className="bg-amber-50 rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-amber-700">${totalOwing}</p>
          <p className="text-xs text-gray-500 mt-0.5">Outstanding</p>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-16 text-center text-gray-400">
          <DollarSign size={36} className="mx-auto mb-3 opacity-30" />
          <p>No commission data yet — deals must be marked Won</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="border-b border-gray-100 bg-gray-50/50">
              <tr>
                {['Agent', 'Won Deals', 'Fee/Deal', 'Total Earned', 'Paid', 'Balance'].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {rows.map(row => (
                <tr key={row.email} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-5 py-4">
                    <p className="text-sm font-semibold text-gray-900">{row.name}</p>
                    <p className="text-xs text-gray-400">{row.email}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm font-semibold text-gray-900">{row.wonDeals}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm text-gray-700">${row.feePerDeal}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm font-semibold text-blue-700">${row.totalOwed}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm font-semibold text-green-700">${row.totalPaid}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      {row.balance === 0 ? (
                        <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full font-medium">
                          <CheckCircle2 size={11} /> Settled
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full font-medium">
                          <AlertCircle size={11} /> ${row.balance} owed
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
