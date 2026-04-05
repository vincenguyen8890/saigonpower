import Link from 'next/link'
import { FileText, Phone, Mail, Building2 } from 'lucide-react'
import { getQuotes } from '@/lib/supabase/queries'
import { formatDate } from '@/lib/utils'
import { setRequestLocale } from 'next-intl/server'
import NewQuoteModal from './NewQuoteModal'
import QuoteStatusSelect from './QuoteStatusSelect'

interface Props {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ status?: string }>
}

const quoteStatusConfig: Record<string, { label: string; className: string }> = {
  pending:  { label: 'Pending',  className: 'bg-amber-100 text-amber-700'   },
  reviewed: { label: 'Reviewed', className: 'bg-blue-100 text-blue-700'     },
  sent:     { label: 'Sent',     className: 'bg-purple-100 text-purple-700' },
  accepted: { label: 'Accepted', className: 'bg-green-100 text-green-700'   },
  rejected: { label: 'Rejected', className: 'bg-gray-100 text-gray-500'     },
}

const statusOptions = [
  { value: 'all',      label: 'All'      },
  { value: 'pending',  label: 'Pending'  },
  { value: 'reviewed', label: 'Reviewed' },
  { value: 'sent',     label: 'Sent'     },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
]

export default async function QuotesPage({ params, searchParams }: Props) {
  const { locale } = await params
  const { status } = await searchParams
  setRequestLocale(locale)

  const quotes = await getQuotes(status)
  const pendingCount = quotes.filter(q => q.status === 'pending').length

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quote Requests</h1>
          <p className="text-gray-500 text-sm mt-1">
            {pendingCount > 0 ? `${pendingCount} pending` : 'No pending requests'} · {quotes.length} total
          </p>
        </div>
        <div className="flex items-center gap-2">
          <NewQuoteModal />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-5">
        {statusOptions.map(opt => (
          <Link
            key={opt.value}
            href={opt.value === 'all' ? `/${locale}/crm/quotes` : `/${locale}/crm/quotes?status=${opt.value}`}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
              (status || 'all') === opt.value
                ? 'bg-brand-greenDark text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-brand-green'
            }`}
          >
            {opt.label}
          </Link>
        ))}
      </div>

      {quotes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-16 text-center text-gray-400">
          <FileText size={40} className="mx-auto mb-3 opacity-30" />
          <p>No quote requests found</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {quotes.map(quote => {
            const sc = quoteStatusConfig[quote.status] ?? quoteStatusConfig.pending
            return (
              <div key={quote.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{quote.name}</p>
                    {quote.business_name && (
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <Building2 size={11} /> {quote.business_name}
                      </p>
                    )}
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${sc.className}`}>
                    {sc.label}
                  </span>
                </div>

                <div className="space-y-1.5 mb-4">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Phone size={12} /><span>{quote.phone || '—'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Mail size={12} /><span className="truncate">{quote.email || '—'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                      quote.service_type === 'commercial' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'
                    }`}>
                      {quote.service_type === 'commercial' ? 'Commercial' : 'Residential'}
                    </span>
                    <span>ZIP: {quote.zip}</span>
                    {quote.monthly_usage_kwh && <span>· ~{quote.monthly_usage_kwh.toLocaleString()} kWh</span>}
                  </div>
                </div>

                {quote.notes && (
                  <p className="text-xs text-gray-500 italic bg-gray-50 rounded-lg p-2.5 mb-4 line-clamp-2">
                    &ldquo;{quote.notes}&rdquo;
                  </p>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-gray-50 gap-2">
                  <span className="text-xs text-gray-400 flex-shrink-0">{formatDate(quote.created_at, locale)}</span>
                  <div className="flex items-center gap-2">
                    <QuoteStatusSelect quoteId={quote.id} currentStatus={quote.status} />
                    {quote.lead_id && (
                      <Link
                        href={`/${locale}/crm/leads/${quote.lead_id}`}
                        className="text-xs bg-brand-greenDark text-white px-3 py-1.5 rounded-lg hover:bg-brand-green transition-colors font-medium flex-shrink-0"
                      >
                        Lead →
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
