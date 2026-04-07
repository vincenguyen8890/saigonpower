import { notFound } from 'next/navigation'
import { getDealById, getLeadById } from '@/lib/supabase/queries'
import { setRequestLocale } from 'next-intl/server'
import { formatDate } from '@/lib/utils'
import EsidInfo from '@/components/crm/EsidInfo'
import { Zap, MapPin, Calendar, FileText, Phone, Mail } from 'lucide-react'

interface Props {
  params: Promise<{ locale: string; dealId: string }>
}

export default async function CustomerContractPage({ params }: Props) {
  const { locale, dealId } = await params
  setRequestLocale(locale)

  const deal = await getDealById(dealId)
  if (!deal || !['won', 'proposal', 'negotiation'].includes(deal.stage)) notFound()

  const lead = deal.lead_id ? await getLeadById(deal.lead_id) : null

  const isActive = deal.stage === 'won'
  const daysLeft = deal.contract_end_date
    ? Math.ceil((new Date(deal.contract_end_date).getTime() - Date.now()) / 86400000)
    : null

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-5">

        {/* Header */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Zap size={18} className="text-brand-greenDark" />
                <span className="text-sm font-bold text-brand-greenDark tracking-wide">SAIGON POWER</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900 mt-2">
                {lead?.name ?? deal.title}
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">Contract Summary</p>
            </div>
            <span className={`text-xs px-3 py-1.5 rounded-full font-semibold ${
              isActive ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
            }`}>
              {isActive ? 'Active' : deal.stage.charAt(0).toUpperCase() + deal.stage.slice(1)}
            </span>
          </div>

          {lead && (
            <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-50">
              {lead.email && (
                <a href={`mailto:${lead.email}`} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-greenDark">
                  <Mail size={14} /> {lead.email}
                </a>
              )}
              {lead.phone && (
                <a href={`tel:${lead.phone}`} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-greenDark">
                  <Phone size={14} /> {lead.phone}
                </a>
              )}
            </div>
          )}
        </div>

        {/* Plan Details */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText size={16} className="text-brand-green" />
            Plan Details
          </h2>
          <div className="divide-y divide-gray-50">
            {[
              { label: 'Supplier',       value: deal.provider      ?? '—' },
              { label: 'Plan Name',      value: deal.plan_name     ?? '—' },
              { label: 'Product Type',   value: deal.product_type  ?? '—' },
              { label: 'Contract Term',  value: deal.term_months   ? `${deal.term_months} months` : 'Month-to-Month' },
              { label: 'Contract Rate',  value: deal.rate_kwh      ? `${(deal.rate_kwh * 100).toFixed(3)}¢/kWh` : '—' },
              { label: 'Est. Usage',     value: deal.usage_kwh     ? `${deal.usage_kwh.toLocaleString()} kWh/mo` : '—' },
              { label: 'Monthly Value',  value: deal.value > 0     ? `$${deal.value}/mo` : '—' },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between py-3">
                <span className="text-sm text-gray-400">{label}</span>
                <span className="text-sm font-semibold text-gray-900">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Contract Dates */}
        {(deal.contract_start_date || deal.contract_end_date) && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar size={16} className="text-brand-green" />
              Contract Period
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {deal.contract_start_date && (
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-xs text-gray-400 mb-1">Start Date</p>
                  <p className="text-sm font-bold text-gray-900">{formatDate(deal.contract_start_date, locale)}</p>
                </div>
              )}
              {deal.contract_end_date && (
                <div className={`rounded-xl p-4 text-center ${
                  daysLeft !== null && daysLeft <= 30 ? 'bg-red-50' : daysLeft !== null && daysLeft <= 60 ? 'bg-amber-50' : 'bg-gray-50'
                }`}>
                  <p className="text-xs text-gray-400 mb-1">End Date</p>
                  <p className="text-sm font-bold text-gray-900">{formatDate(deal.contract_end_date, locale)}</p>
                  {daysLeft !== null && (
                    <p className={`text-xs mt-1 font-medium ${
                      daysLeft <= 0 ? 'text-red-500' : daysLeft <= 30 ? 'text-red-500' : daysLeft <= 60 ? 'text-amber-600' : 'text-gray-400'
                    }`}>
                      {daysLeft <= 0 ? 'Expired' : `${daysLeft} days remaining`}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Property */}
        {(deal.service_address || deal.esid) && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin size={16} className="text-brand-green" />
              Service Location
            </h2>
            {deal.service_address && (
              <p className="text-sm text-gray-700 mb-3">{deal.service_address}</p>
            )}
            {deal.esid && <EsidInfo esid={deal.esid} />}
          </div>
        )}

        {/* Footer */}
        <div className="text-center py-4">
          <p className="text-xs text-gray-400">Generated by Saigon Power CRM · {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p className="text-xs text-gray-400 mt-1">Questions? Contact your agent directly.</p>
        </div>
      </div>
    </div>
  )
}
