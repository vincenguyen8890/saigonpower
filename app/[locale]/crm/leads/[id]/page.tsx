import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Phone, Mail, MapPin, Globe, User, FileText, Calendar } from 'lucide-react'
import LeadStatusBadge from '@/components/crm/LeadStatusBadge'
import LeadStatusSelect from '@/components/crm/LeadStatusSelect'
import { getLeadById, getQuotesByLead } from '@/lib/supabase/queries'
import { formatDate } from '@/lib/utils'
import { setRequestLocale } from 'next-intl/server'
import NotesFormComponent from './NotesForm'

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

export default async function LeadDetailPage({ params }: Props) {
  const { locale, id } = await params
  setRequestLocale(locale)
  const isVi = locale === 'vi'

  const [lead, quotes] = await Promise.all([
    getLeadById(id),
    getQuotesByLead(id),
  ])
  if (!lead) notFound()

  return (
    <div>
      {/* Back */}
      <Link
        href={`/${locale}/crm/leads`}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-5"
      >
        <ArrowLeft size={15} />
        {isVi ? 'Quay lại danh sách' : 'Back to leads'}
      </Link>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{lead.name}</h1>
          <div className="flex items-center gap-3 mt-2">
            <LeadStatusBadge status={lead.status} locale={locale} />
            <span className={`text-xs px-2 py-0.5 rounded font-medium ${
              lead.service_type === 'commercial' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'
            }`}>
              {lead.service_type === 'commercial'
                ? (isVi ? 'Thương Mại' : 'Commercial')
                : (isVi ? 'Dân Cư' : 'Residential')}
            </span>
            <span className="text-xs text-gray-400">
              {isVi ? 'Tạo lúc' : 'Created'} {formatDate(lead.created_at, locale)}
            </span>
          </div>
        </div>

        {/* Status update */}
        <div>
          <p className="text-xs text-gray-500 mb-1 font-medium">
            {isVi ? 'Cập nhật trạng thái' : 'Update Status'}
          </p>
          <LeadStatusSelect leadId={lead.id} currentStatus={lead.status} locale={locale} />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Contact Info */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User size={16} className="text-brand-green" />
              {isVi ? 'Thông Tin Liên Hệ' : 'Contact Information'}
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Phone size={15} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">{isVi ? 'Số Điện Thoại' : 'Phone'}</p>
                  <a href={`tel:${lead.phone}`} className="text-sm font-medium text-gray-900 hover:text-brand-green">
                    {lead.phone}
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail size={15} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Email</p>
                  <a href={`mailto:${lead.email}`} className="text-sm font-medium text-gray-900 hover:text-brand-green truncate block">
                    {lead.email}
                  </a>
                </div>
              </div>
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
                  <p className="text-xs text-gray-400 mb-0.5">{isVi ? 'Ngôn ngữ' : 'Language'}</p>
                  <p className="text-sm font-medium text-gray-900 uppercase">{lead.preferred_language}</p>
                </div>
              </div>
              {lead.source && (
                <div className="flex items-start gap-3">
                  <FileText size={15} className="text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">{isVi ? 'Nguồn' : 'Source'}</p>
                    <p className="text-sm font-medium text-gray-900 capitalize">{lead.source}</p>
                  </div>
                </div>
              )}
              {lead.assigned_to && (
                <div className="flex items-start gap-3">
                  <User size={15} className="text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">{isVi ? 'Phụ Trách' : 'Assigned To'}</p>
                    <p className="text-sm font-medium text-gray-900">{lead.assigned_to}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quote Requests */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText size={16} className="text-brand-green" />
              {isVi ? 'Yêu Cầu Báo Giá' : 'Quote Requests'}
              {quotes.length > 0 && (
                <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                  {quotes.length}
                </span>
              )}
            </h2>
            {quotes.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">
                {isVi ? 'Chưa có yêu cầu báo giá' : 'No quote requests yet'}
              </p>
            ) : (
              <div className="space-y-3">
                {quotes.map(q => (
                  <div key={q.id} className="border border-gray-100 rounded-xl p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {q.business_name || (isVi ? 'Khách Hàng Cá Nhân' : 'Individual Customer')}
                        </p>
                        {q.monthly_usage_kwh && (
                          <p className="text-xs text-gray-500">
                            ~{q.monthly_usage_kwh.toLocaleString()} kWh/mo
                          </p>
                        )}
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${quoteStatusColor[q.status]}`}>
                        {q.status}
                      </span>
                    </div>
                    {q.notes && (
                      <p className="text-xs text-gray-500 italic border-t border-gray-50 pt-2">"{q.notes}"</p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                      {formatDate(q.created_at, locale)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column — Notes */}
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar size={16} className="text-brand-green" />
              {isVi ? 'Ghi Chú' : 'Notes'}
            </h2>
            <NotesFormComponent leadId={lead.id} initialNotes={lead.notes || ''} locale={locale} />
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-4 text-sm">
              {isVi ? 'Lịch Sử' : 'Timeline'}
            </h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-brand-green mt-1.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-gray-700">
                    {isVi ? 'Khách hàng được tạo' : 'Lead created'}
                  </p>
                  <p className="text-xs text-gray-400">{formatDate(lead.created_at, locale)}</p>
                </div>
              </div>
              {lead.updated_at !== lead.created_at && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-gray-700">
                      {isVi ? 'Cập nhật lần cuối' : 'Last updated'}
                    </p>
                    <p className="text-xs text-gray-400">{formatDate(lead.updated_at, locale)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-3 text-sm">
              {isVi ? 'Thao Tác Nhanh' : 'Quick Actions'}
            </h2>
            <div className="space-y-2">
              <a
                href={`tel:${lead.phone}`}
                className="flex items-center gap-2 w-full px-3 py-2 bg-brand-greenDark text-white text-sm rounded-xl hover:bg-brand-green transition-colors"
              >
                <Phone size={14} />
                {isVi ? 'Gọi Ngay' : 'Call Now'}
              </a>
              <a
                href={`mailto:${lead.email}`}
                className="flex items-center gap-2 w-full px-3 py-2 border border-gray-200 text-gray-700 text-sm rounded-xl hover:bg-gray-50 transition-colors"
              >
                <Mail size={14} />
                {isVi ? 'Gửi Email' : 'Send Email'}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
