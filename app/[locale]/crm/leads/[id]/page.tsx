import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Phone, Mail, MapPin, Globe, User, FileText, Calendar, CheckCircle2, Clock, RefreshCw, TrendingUp } from 'lucide-react'
import LeadStatusBadge from '@/components/crm/LeadStatusBadge'
import LeadStatusSelect from '@/components/crm/LeadStatusSelect'
import { getLeadById, getQuotesByLead, getActivities, getDealsByLead } from '@/lib/supabase/queries'
import { formatDate } from '@/lib/utils'
import { setRequestLocale } from 'next-intl/server'
import NotesFormComponent from './NotesForm'
import EditLeadModal from './EditLeadModal'
import AddActivityForm from './AddActivityForm'

interface Props {
  params: Promise<{ locale: string; id: string }>
}

const quoteStatusColor: Record<string, string> = {
  pending:  'bg-amber-100 text-amber-700',
  reviewed: 'bg-blue-100 text-blue-700',
  sent:     'bg-purple-100 text-purple-700',
  accepted: 'bg-green-100 text-green-700',
  rejected: 'bg-gray-100 text-gray-500',
}

const activityTypeIcon: Record<string, string> = {
  call: '📞', email: '📧', meeting: '📅', note: '📝', task: '✅', renewal: '🔄',
}

export default async function LeadDetailPage({ params }: Props) {
  const { locale, id } = await params
  setRequestLocale(locale)

  const [lead, quotes, activities, deals] = await Promise.all([
    getLeadById(id),
    getQuotesByLead(id),
    getActivities({ leadId: id, limit: 20 }),
    getDealsByLead(id),
  ])
  if (!lead) notFound()

  const openActivities = activities.filter(a => !a.completed)
  const doneActivities = activities.filter(a => a.completed)

  return (
    <div>
      <Link
        href={`/${locale}/crm/leads`}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-5"
      >
        <ArrowLeft size={15} />
        Back to leads
      </Link>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-gray-900">{lead.name}</h1>
            {lead.customer_id && (
              <span className="text-xs font-mono bg-gray-100 text-gray-500 px-2 py-0.5 rounded-lg">{lead.customer_id}</span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-2">
            <LeadStatusBadge status={lead.status} />
            <span className={`text-xs px-2 py-0.5 rounded font-medium ${
              lead.service_type === 'commercial' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'
            }`}>
              {lead.service_type === 'commercial' ? 'Commercial' : 'Residential'}
            </span>
            <span className="text-xs text-gray-400">Created {formatDate(lead.created_at, locale)}</span>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div>
            <p className="text-xs text-gray-500 mb-1 font-medium">Update Status</p>
            <LeadStatusSelect leadId={lead.id} currentStatus={lead.status} />
          </div>
          <EditLeadModal lead={lead} />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Left — 2 cols */}
        <div className="lg:col-span-2 space-y-5">
          {/* Contact Info */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User size={16} className="text-brand-green" />
              Contact Information
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Phone size={15} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Phone 1</p>
                  <a href={`tel:${lead.phone}`} className="text-sm font-medium text-gray-900 hover:text-brand-green">
                    {lead.phone}
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail size={15} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Email 1</p>
                  <a href={`mailto:${lead.email}`} className="text-sm font-medium text-gray-900 hover:text-brand-green truncate block">
                    {lead.email}
                  </a>
                </div>
              </div>
              {lead.phone2 && (
                <div className="flex items-start gap-3">
                  <Phone size={15} className="text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Phone 2</p>
                    <a href={`tel:${lead.phone2}`} className="text-sm font-medium text-gray-900 hover:text-brand-green">
                      {lead.phone2}
                    </a>
                  </div>
                </div>
              )}
              {lead.email2 && (
                <div className="flex items-start gap-3">
                  <Mail size={15} className="text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Email 2</p>
                    <a href={`mailto:${lead.email2}`} className="text-sm font-medium text-gray-900 hover:text-brand-green truncate block">
                      {lead.email2}
                    </a>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3">
                <MapPin size={15} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">ZIP Code</p>
                  <p className="text-sm font-medium text-gray-900">{lead.zip}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Globe size={15} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Language</p>
                  <p className="text-sm font-medium text-gray-900 uppercase">{lead.preferred_language}</p>
                </div>
              </div>
              {lead.dob && (
                <div className="flex items-start gap-3">
                  <Calendar size={15} className="text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Date of Birth</p>
                    <p className="text-sm font-medium text-gray-900">{lead.dob}</p>
                  </div>
                </div>
              )}
              {lead.anxh && (
                <div className="flex items-start gap-3">
                  <FileText size={15} className="text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">ANXH</p>
                    <p className="text-sm font-medium text-gray-900">{lead.anxh}</p>
                  </div>
                </div>
              )}
              {lead.tags && lead.tags.length > 0 && (
                <div className="flex items-start gap-3 sm:col-span-2">
                  <FileText size={15} className="text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 mb-1.5">Tags</p>
                    <div className="flex flex-wrap gap-1.5">
                      {lead.tags.map(tag => {
                        const tagStyles: Record<string, string> = {
                          assistant_program: 'bg-blue-50 text-blue-700',
                          '65+':             'bg-purple-50 text-purple-700',
                          red_flag:          'bg-red-50 text-red-700',
                          vip:               'bg-amber-50 text-amber-700',
                        }
                        const tagLabels: Record<string, string> = {
                          assistant_program: 'Assistant Program',
                          '65+':             '65+',
                          red_flag:          'Red Flag',
                          vip:               'VIP',
                        }
                        return (
                          <span key={tag} className={`text-xs px-2 py-0.5 rounded font-medium ${tagStyles[tag] ?? 'bg-gray-100 text-gray-600'}`}>
                            {tagLabels[tag] ?? tag}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}
              {(lead as { service_address?: string | null }).service_address && (
                <div className="flex items-start gap-3 sm:col-span-2">
                  <MapPin size={15} className="text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Service Address</p>
                    <p className="text-sm font-medium text-gray-900">{(lead as { service_address?: string | null }).service_address}</p>
                  </div>
                </div>
              )}
              {(lead as { mailing_address?: string | null }).mailing_address && (
                <div className="flex items-start gap-3 sm:col-span-2">
                  <MapPin size={15} className="text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Mailing Address</p>
                    <p className="text-sm font-medium text-gray-900">{(lead as { mailing_address?: string | null }).mailing_address}</p>
                  </div>
                </div>
              )}
              {lead.source && (
                <div className="flex items-start gap-3">
                  <FileText size={15} className="text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Source</p>
                    <p className="text-sm font-medium text-gray-900 capitalize">{lead.source}</p>
                  </div>
                </div>
              )}
              {(lead as { referral_by?: string | null }).referral_by && (
                <div className="flex items-start gap-3">
                  <User size={15} className="text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Referral By</p>
                    <p className="text-sm font-medium text-gray-900">{(lead as { referral_by?: string | null }).referral_by}</p>
                  </div>
                </div>
              )}
              {lead.assigned_to && (
                <div className="flex items-start gap-3">
                  <User size={15} className="text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Assigned To</p>
                    <p className="text-sm font-medium text-gray-900">{lead.assigned_to}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Linked Deals */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <TrendingUp size={16} className="text-brand-green" />
                Deals
                {deals.length > 0 && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                    {deals.length}
                  </span>
                )}
              </h2>
              <Link
                href={`/${locale}/crm/deals`}
                className="text-xs text-brand-green hover:text-brand-greenDark font-medium"
              >
                View all deals →
              </Link>
            </div>
            {deals.length === 0 ? (
              <p className="text-sm text-gray-400 py-2 text-center">No deals yet</p>
            ) : (
              <div className="space-y-2">
                {deals.map(deal => {
                  const stageColors: Record<string, string> = {
                    prospect: 'bg-gray-100 text-gray-600',
                    qualified: 'bg-blue-100 text-blue-700',
                    proposal: 'bg-purple-100 text-purple-700',
                    negotiation: 'bg-amber-100 text-amber-700',
                    won: 'bg-green-100 text-green-700',
                    lost: 'bg-red-100 text-red-600',
                  }
                  return (
                    <Link
                      key={deal.id}
                      href={`/${locale}/crm/deals/${deal.id}`}
                      className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors group"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate group-hover:text-brand-greenDark">{deal.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{deal.provider ?? '—'} {deal.plan_name ? `· ${deal.plan_name}` : ''}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${stageColors[deal.stage] ?? stageColors.prospect}`}>
                          {deal.stage}
                        </span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>

          {/* Activities */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-brand-green" />
                Activities
                {openActivities.length > 0 && (
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                    {openActivities.length} open
                  </span>
                )}
              </h2>
            </div>

            <AddActivityForm leadId={lead.id} />

            {activities.length > 0 && (
              <div className="mt-4 space-y-2">
                {/* Open activities */}
                {openActivities.map(a => (
                  <div key={a.id} className="flex items-start gap-3 p-3 border border-amber-100 bg-amber-50/40 rounded-xl">
                    <span className="text-base flex-shrink-0">{activityTypeIcon[a.type] ?? '📌'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{a.title}</p>
                      {a.description && <p className="text-xs text-gray-500 truncate">{a.description}</p>}
                      {a.due_date && (
                        <p className="text-xs text-amber-600 flex items-center gap-1 mt-0.5">
                          <Clock size={10} />
                          {new Date(a.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      )}
                    </div>
                    <span className="text-xs capitalize bg-white border border-amber-200 text-amber-700 px-1.5 py-0.5 rounded font-medium flex-shrink-0">
                      {a.type}
                    </span>
                  </div>
                ))}

                {/* Done activities (collapsed) */}
                {doneActivities.length > 0 && (
                  <details className="mt-2">
                    <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600 select-none">
                      {doneActivities.length} completed activit{doneActivities.length === 1 ? 'y' : 'ies'}
                    </summary>
                    <div className="mt-2 space-y-2">
                      {doneActivities.map(a => (
                        <div key={a.id} className="flex items-start gap-3 p-3 border border-gray-100 rounded-xl opacity-60">
                          <span className="text-base flex-shrink-0">{activityTypeIcon[a.type] ?? '📌'}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-500 line-through">{a.title}</p>
                            {a.completed_at && (
                              <p className="text-xs text-gray-400">
                                Completed {new Date(a.completed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </details>
                )}
              </div>
            )}
          </div>

          {/* Quote Requests */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText size={16} className="text-brand-green" />
              Quote Requests
              {quotes.length > 0 && (
                <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                  {quotes.length}
                </span>
              )}
            </h2>
            {quotes.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">No quote requests yet</p>
            ) : (
              <div className="space-y-3">
                {quotes.map(q => (
                  <div key={q.id} className="border border-gray-100 rounded-xl p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {q.business_name || 'Individual Customer'}
                        </p>
                        {q.monthly_usage_kwh && (
                          <p className="text-xs text-gray-500">~{q.monthly_usage_kwh.toLocaleString()} kWh/mo</p>
                        )}
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${quoteStatusColor[q.status]}`}>
                        {q.status}
                      </span>
                    </div>
                    {q.notes && (
                      <p className="text-xs text-gray-500 italic border-t border-gray-50 pt-2">"{q.notes}"</p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">{formatDate(q.created_at, locale)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right — 1 col */}
        <div className="space-y-5">
          {/* Notes */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar size={16} className="text-brand-green" />
              Notes
            </h2>
            <NotesFormComponent leadId={lead.id} initialNotes={lead.notes || ''} />
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-4 text-sm">Timeline</h2>
            <div className="space-y-3">
              {activities.slice(0, 4).map(a => (
                <div key={a.id} className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                    a.completed ? 'bg-green-400' : 'bg-amber-400'
                  }`} />
                  <div>
                    <p className="text-xs font-medium text-gray-700">{a.title}</p>
                    {a.due_date && (
                      <p className="text-xs text-gray-400">{formatDate(a.due_date, locale)}</p>
                    )}
                  </div>
                </div>
              ))}
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-brand-green mt-1.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-gray-700">Lead created</p>
                  <p className="text-xs text-gray-400">{formatDate(lead.created_at, locale)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-3 text-sm">Quick Actions</h2>
            <div className="space-y-2">
              <a
                href={`tel:${lead.phone}`}
                className="flex items-center gap-2 w-full px-3 py-2 bg-brand-greenDark text-white text-sm rounded-xl hover:bg-brand-green transition-colors"
              >
                <Phone size={14} />
                Call Now
              </a>
              <a
                href={`mailto:${lead.email}`}
                className="flex items-center gap-2 w-full px-3 py-2 border border-gray-200 text-gray-700 text-sm rounded-xl hover:bg-gray-50 transition-colors"
              >
                <Mail size={14} />
                Send Email
              </a>
              <Link
                href={`/${locale}/crm/renewals`}
                className="flex items-center gap-2 w-full px-3 py-2 border border-gray-200 text-gray-700 text-sm rounded-xl hover:bg-gray-50 transition-colors"
              >
                <RefreshCw size={14} />
                Check Renewal
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
