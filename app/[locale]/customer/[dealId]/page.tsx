import { notFound } from 'next/navigation'
import { getDealById, getLeadById } from '@/lib/supabase/queries'
import { setRequestLocale } from 'next-intl/server'
import { Phone, Mail, Zap, FileText, CheckCircle2, Calendar, MapPin } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface Props {
  params: Promise<{ locale: string; dealId: string }>
  searchParams: Promise<{ token?: string }>
}

export default async function CustomerPortalPage({ params, searchParams }: Props) {
  const { locale, dealId } = await params
  const { token } = await searchParams
  setRequestLocale(locale)

  const deal = await getDealById(dealId)
  if (!deal) notFound()

  // If deal has a share token, validate it
  if (deal.share_token && token !== deal.share_token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-sm w-full text-center">
          <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText size={20} className="text-red-400" />
          </div>
          <h1 className="text-lg font-bold text-gray-900">Link Expired</h1>
          <p className="text-sm text-gray-500 mt-2">This link is no longer valid. Please contact your Saigon Power agent.</p>
          <a href="tel:8329379999" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-green-700 hover:text-green-800">
            <Phone size={14} /> (832) 937-9999
          </a>
        </div>
      </div>
    )
  }

  const lead = deal.lead_id ? await getLeadById(deal.lead_id) : null
  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  const isWon = deal.stage === 'won'
  const statusLabel = {
    prospect:    'In Progress',
    qualified:   'In Progress',
    proposal:    'Proposal Ready',
    negotiation: 'Under Review',
    won:         'Enrolled',
    lost:        'Closed',
  }[deal.stage] ?? 'In Progress'

  const statusColor = isWon
    ? 'bg-green-100 text-green-700'
    : deal.stage === 'lost'
    ? 'bg-gray-100 text-gray-500'
    : 'bg-blue-100 text-blue-700'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50/30">

      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-green-700 rounded-lg flex items-center justify-center overflow-hidden">
              <Image src="/sg-power-logo.jpg" alt="Saigon Power" width={32} height={32} className="object-cover" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Saigon Power</p>
              <p className="text-xs text-gray-400">Energy Broker · Texas</p>
            </div>
          </div>
          <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${statusColor}`}>
            {statusLabel}
          </span>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">

        {/* Welcome */}
        <div className="bg-green-700 rounded-2xl p-5 text-white">
          <p className="text-green-200 text-xs font-medium uppercase tracking-wide mb-1">Your Energy Plan</p>
          <h1 className="text-xl font-bold">{lead?.name ?? 'Hello!'}</h1>
          <p className="text-green-200 text-sm mt-1">
            {deal.service_type === 'commercial' ? 'Commercial' : 'Residential'} · {lead?.zip ?? ''} · {today}
          </p>
        </div>

        {/* Plan details */}
        {(deal.provider || deal.plan_name) && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                <Zap size={15} className="text-green-700" />
              </div>
              <h2 className="text-sm font-bold text-gray-900">Your Plan</h2>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Provider',    value: deal.provider    },
                { label: 'Plan',        value: deal.plan_name   },
                { label: 'Rate',        value: deal.rate_kwh ? `${(deal.rate_kwh * 100).toFixed(4)}¢/kWh` : null },
                { label: 'Term',        value: deal.term_months ? `${deal.term_months} months` : null },
                { label: 'Product',     value: deal.product_type },
                { label: 'Monthly Est', value: deal.value ? `$${deal.value}/mo` : null },
              ].filter(r => r.value).map(row => (
                <div key={row.label} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-[10px] uppercase font-semibold text-gray-400 tracking-wide">{row.label}</p>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5">{row.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contract dates */}
        {(deal.contract_start_date || deal.contract_end_date) && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                <Calendar size={15} className="text-blue-600" />
              </div>
              <h2 className="text-sm font-bold text-gray-900">Contract Period</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {deal.contract_start_date && (
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-[10px] uppercase font-semibold text-gray-400 tracking-wide">Start Date</p>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5">{deal.contract_start_date}</p>
                </div>
              )}
              {deal.contract_end_date && (
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-[10px] uppercase font-semibold text-gray-400 tracking-wide">End Date</p>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5">{deal.contract_end_date}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Service address */}
        {(deal.service_address || deal.service_city) && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
                <MapPin size={15} className="text-amber-600" />
              </div>
              <h2 className="text-sm font-bold text-gray-900">Service Address</h2>
            </div>
            <p className="text-sm text-gray-700">
              {[deal.service_address, deal.service_city, deal.service_state, deal.service_zip].filter(Boolean).join(', ')}
            </p>
            {deal.esid && <p className="text-xs text-gray-400 mt-1 font-mono">ESI ID: {deal.esid}</p>}
          </div>
        )}

        {/* LOA link */}
        <Link
          href={`/${locale}/loa/${dealId}`}
          className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:border-green-200 transition-colors group"
        >
          <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-green-100 transition-colors">
            <FileText size={18} className="text-green-700" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">View Letter of Authorization</p>
            <p className="text-xs text-gray-400 mt-0.5">Sign & authorize your enrollment</p>
          </div>
        </Link>

        {/* Enrolled confirmation */}
        {isWon && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-5 flex items-start gap-3">
            <CheckCircle2 size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-green-800">You&apos;re enrolled!</p>
              <p className="text-xs text-green-600 mt-0.5">Your electricity service has been set up. Questions? Contact us anytime.</p>
            </div>
          </div>
        )}

        {/* Contact CTA */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm font-bold text-gray-900 mb-4">Need help?</p>
          <div className="space-y-2.5">
            <a
              href="tel:8329379999"
              className="flex items-center gap-3 p-3 bg-green-700 text-white rounded-xl hover:bg-green-800 transition-colors"
            >
              <Phone size={16} />
              <div>
                <p className="text-sm font-semibold">(832) 937-9999</p>
                <p className="text-xs text-green-200">Call us — Mon–Sat 9am–6pm</p>
              </div>
            </a>
            <a
              href="mailto:info@saigonllc.com"
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <Mail size={16} className="text-gray-500" />
              <p className="text-sm font-semibold text-gray-700">info@saigonllc.com</p>
            </a>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 pb-4">
          Saigon Power · Licensed Energy Broker · Texas
        </p>
      </div>
    </div>
  )
}
