import { notFound } from 'next/navigation'
import { getDealById, getLeadById } from '@/lib/supabase/queries'
import { setRequestLocale } from 'next-intl/server'
import PrintButton from './PrintButton'

interface Props {
  params: Promise<{ locale: string; dealId: string }>
}

export default async function LOAPage({ params }: Props) {
  const { locale, dealId } = await params
  setRequestLocale(locale)

  const deal = await getDealById(dealId)
  if (!deal) notFound()

  const lead = deal.lead_id ? await getLeadById(deal.lead_id) : null

  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  const rate  = deal.rate_kwh ? `${(deal.rate_kwh * 100).toFixed(4)}¢/kWh` : '___________'
  const term  = deal.term_months ? `${deal.term_months} months` : '___________'

  return (
    <>
      {/* Print controls — hidden when printing */}
      <div className="print:hidden bg-slate-50 border-b border-slate-200 px-6 py-3 flex items-center gap-3">
        <a href={`/${locale}/crm/deals/${dealId}`} className="text-sm text-slate-500 hover:text-slate-700">← Back to deal</a>
        <PrintButton />
      </div>

      {/* LOA Document */}
      <div className="max-w-[700px] mx-auto px-8 py-10 print:p-0 print:max-w-none font-serif text-[#0F172A]">

        {/* Letterhead */}
        <div className="flex items-start justify-between mb-8 pb-6 border-b-2 border-[#00C853]">
          <div>
            <p className="text-2xl font-bold tracking-tight text-[#00A846] font-sans">SAIGON POWER</p>
            <p className="text-xs text-slate-500 font-sans mt-0.5">Licensed Retail Electric Provider Broker · Texas</p>
          </div>
          <div className="text-right text-xs text-slate-500 font-sans">
            <p>Date: {today}</p>
            <p className="mt-0.5">Ref: {deal.id.slice(0, 8).toUpperCase()}</p>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-xl font-bold uppercase tracking-wider text-[#0F172A]">
            Letter of Authorization
          </h1>
          <p className="text-sm text-slate-500 font-sans mt-1">
            Texas Retail Electric Provider Enrollment Authorization
          </p>
        </div>

        {/* Authorization Body */}
        <div className="text-sm leading-relaxed space-y-4 mb-8">
          <p>
            I, <strong className="border-b border-slate-400 px-1">{lead?.name ?? '________________________________'}</strong>,
            hereby authorize <strong>Saigon Power</strong> and its licensed representatives to act as my authorized agent
            for the purpose of enrolling, switching, or renewing my retail electricity service in the state of Texas.
          </p>

          <p>
            This authorization allows Saigon Power to submit enrollment requests on my behalf to the following Retail
            Electric Provider (REP) and to execute any documents reasonably necessary to complete the enrollment:
          </p>

          {/* Deal Details Box */}
          <div className="border border-slate-300 rounded-lg p-4 bg-slate-50 font-sans space-y-2 text-[13px]">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <div>
                <p className="text-[10px] uppercase font-semibold text-slate-400 tracking-wide">Retail Electric Provider</p>
                <p className="font-semibold text-[#0F172A]">{deal.provider ?? '___________________________'}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-semibold text-slate-400 tracking-wide">Plan Name</p>
                <p className="font-semibold text-[#0F172A]">{deal.plan_name ?? '___________________________'}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-semibold text-slate-400 tracking-wide">Contract Rate</p>
                <p className="font-semibold text-[#0F172A]">{rate}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-semibold text-slate-400 tracking-wide">Contract Term</p>
                <p className="font-semibold text-[#0F172A]">{term}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-semibold text-slate-400 tracking-wide">Product Type</p>
                <p className="font-semibold text-[#0F172A]">{deal.product_type ?? '___________________________'}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-semibold text-slate-400 tracking-wide">Service Type</p>
                <p className="font-semibold text-[#0F172A] capitalize">{deal.service_type ?? '___________________________'}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200">
              <p className="text-[10px] uppercase font-semibold text-slate-400 tracking-wide">Service Address</p>
              <p className="font-semibold text-[#0F172A]">{deal.service_address ?? '___________________________________________________'}</p>
            </div>

            <div>
              <p className="text-[10px] uppercase font-semibold text-slate-400 tracking-wide">ESI ID (ESID)</p>
              <p className="font-mono font-semibold text-[#0F172A]">{deal.esid ?? '___________________________________________________'}</p>
            </div>

            {(deal.contract_start_date || deal.contract_end_date) && (
              <div className="grid grid-cols-2 gap-x-4 pt-2 border-t border-slate-200">
                {deal.contract_start_date && (
                  <div>
                    <p className="text-[10px] uppercase font-semibold text-slate-400 tracking-wide">Contract Start</p>
                    <p className="font-semibold text-[#0F172A]">{deal.contract_start_date}</p>
                  </div>
                )}
                {deal.contract_end_date && (
                  <div>
                    <p className="text-[10px] uppercase font-semibold text-slate-400 tracking-wide">Contract End</p>
                    <p className="font-semibold text-[#0F172A]">{deal.contract_end_date}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <p>
            I understand that by signing this Letter of Authorization, I am authorizing the switch of my retail electricity
            service to the provider listed above. This authorization is valid for <strong>90 days</strong> from the date
            signed below. I understand I have the right to cancel this authorization at any time before enrollment is
            complete by contacting Saigon Power directly.
          </p>

          <p>
            I confirm that I am the account holder, billing responsible party, or authorized representative for the
            service address listed above, and that the information provided is accurate to the best of my knowledge.
          </p>
        </div>

        {/* Customer Info */}
        <div className="mb-8 font-sans text-[13px]">
          <p className="text-[10px] uppercase font-semibold text-slate-400 tracking-wide mb-3">Customer Information</p>
          <div className="grid grid-cols-2 gap-x-8 gap-y-3">
            <div>
              <p className="text-slate-500 text-xs mb-0.5">Full Name</p>
              <p className="border-b border-slate-300 pb-0.5 min-h-[20px]">{lead?.name ?? ''}</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs mb-0.5">Phone Number</p>
              <p className="border-b border-slate-300 pb-0.5 min-h-[20px]">{lead?.phone ?? ''}</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs mb-0.5">Email Address</p>
              <p className="border-b border-slate-300 pb-0.5 min-h-[20px]">{lead?.email ?? ''}</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs mb-0.5">ZIP Code</p>
              <p className="border-b border-slate-300 pb-0.5 min-h-[20px]">{lead?.zip ?? ''}</p>
            </div>
          </div>
        </div>

        {/* Signatures */}
        <div className="mt-10 grid grid-cols-2 gap-12 font-sans text-[13px]">
          <div>
            <div className="border-b border-slate-400 h-12 mb-1" />
            <p className="font-semibold">Customer Signature</p>
            <p className="text-slate-500 text-xs mt-0.5">{lead?.name ?? 'Customer Name'}</p>
            <div className="mt-4">
              <div className="border-b border-slate-300 h-6 mb-1" />
              <p className="text-slate-500 text-xs">Date</p>
            </div>
          </div>
          <div>
            <div className="border-b border-slate-400 h-12 mb-1" />
            <p className="font-semibold">Agent Signature</p>
            <p className="text-slate-500 text-xs mt-0.5">Saigon Power Representative</p>
            <div className="mt-4">
              <div className="border-b border-slate-300 h-6 mb-1" />
              <p className="text-slate-500 text-xs">Date</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-4 border-t border-slate-200 text-[10px] text-slate-400 font-sans leading-relaxed">
          <p>
            Saigon Power · Licensed Retail Electric Provider Broker · Texas PUC License · contact@saigonpower.com
          </p>
          <p className="mt-0.5">
            This document is confidential and intended solely for the named customer. Unauthorized use or reproduction is prohibited.
          </p>
        </div>
      </div>
    </>
  )
}
