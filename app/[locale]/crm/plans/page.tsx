import { Zap, Leaf, Tag } from 'lucide-react'
import { setRequestLocale } from 'next-intl/server'
import { mockPlans } from '@/data/mock-crm'
import { getSession } from '@/lib/auth/session'
import Link from 'next/link'
import PlanActions from './PlanActions'

interface Props {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ service?: string; provider?: string; status?: string }>
}

export default async function PlansPage({ params, searchParams }: Props) {
  const { locale } = await params
  const { service, provider, status } = await searchParams
  setRequestLocale(locale)

  const session = await getSession()
  const isAdmin = session?.role === 'admin'

  let plans = status === 'inactive'
    ? mockPlans.filter(p => p.status === 'inactive')
    : mockPlans.filter(p => p.status === 'active')

  if (service && service !== 'all') plans = plans.filter(p => p.service_type === service)
  if (provider && provider !== 'all') plans = plans.filter(p => p.provider_id === provider)

  const providers = [...new Map(mockPlans.map(p => [p.provider_id, { id: p.provider_id, name: p.provider_name }])).values()]

  const bestRate = plans.length > 0 ? Math.min(...plans.map(p => p.rate_kwh)) : 0

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Energy Plans</h1>
          <p className="text-gray-500 text-sm mt-1">
            {plans.length} plans shown{bestRate > 0 ? ` · Best rate: ${(bestRate * 100).toFixed(1)}¢/kWh` : ''}
          </p>
        </div>
        {isAdmin && <PlanActions />}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-5">
        <form className="flex flex-wrap gap-3 items-center">
          <select
            name="service"
            defaultValue={service || 'all'}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-green"
          >
            <option value="all">All Services</option>
            <option value="residential">Residential</option>
            <option value="commercial">Commercial</option>
          </select>
          <select
            name="provider"
            defaultValue={provider || 'all'}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-green"
          >
            <option value="all">All Providers</option>
            {providers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select
            name="status"
            defaultValue={status || 'active'}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-green"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <button type="submit" className="bg-brand-greenDark text-white text-sm px-4 py-2 rounded-xl hover:bg-brand-green transition-colors">
            Filter
          </button>
          {(service || provider || status) && (
            <Link href={`/${locale}/crm/plans`} className="text-sm text-gray-400 hover:text-gray-600">
              Clear
            </Link>
          )}
        </form>
      </div>

      {/* Plans table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {plans.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Zap size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">No plans match this filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-100 bg-gray-50/50">
                <tr>
                  {['Plan', 'Provider', 'Rate', 'Term', 'Type', 'Cancel Fee', 'Promo', ...(isAdmin ? [''] : [])].map((h, i) => (
                    <th
                      key={i}
                      className={`text-left text-xs font-medium text-gray-400 uppercase tracking-wide px-5 py-3 ${i >= 6 ? 'hidden lg:table-cell' : ''} ${[3, 5].includes(i) ? 'hidden lg:table-cell' : ''} ${i === 4 ? 'hidden md:table-cell' : ''}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {plans.map(plan => {
                  const isBest = plan.rate_kwh === bestRate && plan.status === 'active'
                  return (
                    <tr key={plan.id} className={`hover:bg-gray-50/60 transition-colors ${isBest ? 'bg-green-50/30' : ''}`}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-gray-900">{plan.name}</p>
                          {isBest && (
                            <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-medium">
                              Best Rate
                            </span>
                          )}
                          {plan.renewable && <Leaf size={13} className="text-green-500" />}
                          {plan.status === 'inactive' && (
                            <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-medium">Inactive</span>
                          )}
                        </div>
                        {plan.promo && (
                          <p className="text-xs text-amber-600 flex items-center gap-1 mt-0.5">
                            <Tag size={10} /> {plan.promo}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm text-gray-700">{plan.provider_name}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-sm font-bold ${isBest ? 'text-green-700' : 'text-gray-900'}`}>
                          {(plan.rate_kwh * 100).toFixed(1)}¢
                        </span>
                        <span className="text-xs text-gray-400">/kWh</span>
                      </td>
                      <td className="px-5 py-4 hidden lg:table-cell">
                        <span className="text-sm text-gray-700">
                          {plan.term_months === 0 ? 'Prepaid' : `${plan.term_months} mo.`}
                        </span>
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell">
                        <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                          plan.service_type === 'commercial' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'
                        }`}>
                          {plan.service_type === 'commercial' ? 'Comm.' : 'Res.'}
                        </span>
                      </td>
                      <td className="px-5 py-4 hidden lg:table-cell">
                        <span className="text-sm text-gray-600">
                          {plan.cancellation_fee != null ? `$${plan.cancellation_fee}` : 'None'}
                        </span>
                      </td>
                      <td className="px-5 py-4 hidden lg:table-cell">
                        {plan.promo
                          ? <span className="text-xs text-amber-600 font-medium">{plan.promo}</span>
                          : <span className="text-xs text-gray-300">—</span>
                        }
                      </td>
                      {isAdmin && (
                        <td className="px-5 py-4 text-right">
                          <PlanActions plan={plan} inline />
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
