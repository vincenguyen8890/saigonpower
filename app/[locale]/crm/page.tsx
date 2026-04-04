import { Users, FileText, Zap, AlertTriangle, TrendingUp, Clock } from 'lucide-react'
import Link from 'next/link'
import StatCard from '@/components/crm/StatCard'
import LeadStatusBadge from '@/components/crm/LeadStatusBadge'
import { mockCRMStats, mockLeads } from '@/data/mock-crm'
import { formatDate } from '@/lib/utils'
import { setRequestLocale } from 'next-intl/server'

interface Props {
  params: Promise<{ locale: string }>
}

export default async function CRMOverview({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const isVi = locale === 'vi'

  // TODO: Replace with Supabase queries
  const stats = mockCRMStats
  const recentLeads = mockLeads.slice(0, 6)

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {isVi ? 'Bảng Điều Khiển CRM' : 'CRM Dashboard'}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {isVi ? 'Tổng quan hoạt động hôm nay' : "Today's activity overview"}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title={isVi ? 'Khách Mới Hôm Nay' : 'New Leads Today'}
          value={stats.newLeadsToday}
          subtitle={isVi ? `${stats.newLeadsWeek} trong tuần này` : `${stats.newLeadsWeek} this week`}
          icon={Users}
          color="blue"
          trend={{ value: stats.newLeadsToday, label: isVi ? 'hôm nay' : 'today' }}
        />
        <StatCard
          title={isVi ? 'Báo Giá Chờ' : 'Pending Quotes'}
          value={stats.pendingQuotes}
          subtitle={isVi ? 'Cần xem xét' : 'Awaiting review'}
          icon={FileText}
          color="yellow"
        />
        <StatCard
          title={isVi ? 'Hợp Đồng Hiện Tại' : 'Active Contracts'}
          value={stats.activeContracts}
          subtitle={isVi ? 'Đang hoạt động' : 'Currently active'}
          icon={Zap}
          color="green"
        />
        <StatCard
          title={isVi ? 'Sắp Hết Hạn' : 'Expiring Soon'}
          value={stats.expiringSoon}
          subtitle={isVi ? 'Trong 30 ngày' : 'Within 30 days'}
          icon={AlertTriangle}
          color="red"
        />
      </div>

      {/* Second row */}
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <StatCard
          title={isVi ? 'Đăng Ký Tháng Này' : 'Enrolled This Month'}
          value={stats.enrolledThisMonth}
          subtitle={isVi ? 'Khách hàng mới' : 'New customers'}
          icon={TrendingUp}
          color="purple"
        />
        <StatCard
          title={isVi ? 'Tổng Khách Hàng' : 'Total Leads'}
          value={stats.totalLeads}
          subtitle={isVi ? 'Tất cả thời gian' : 'All time'}
          icon={Clock}
          color="blue"
        />
      </div>

      {/* Recent Leads */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">
            {isVi ? 'Khách Hàng Gần Đây' : 'Recent Leads'}
          </h2>
          <Link
            href={`/${locale}/crm/leads`}
            className="text-sm text-brand-green hover:text-brand-greenDark font-medium"
          >
            {isVi ? 'Xem tất cả →' : 'View all →'}
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide px-6 py-3">
                  {isVi ? 'Tên' : 'Name'}
                </th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide px-6 py-3 hidden sm:table-cell">
                  {isVi ? 'Liên Hệ' : 'Contact'}
                </th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide px-6 py-3">
                  {isVi ? 'Dịch Vụ' : 'Service'}
                </th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide px-6 py-3">
                  {isVi ? 'Trạng Thái' : 'Status'}
                </th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide px-6 py-3 hidden md:table-cell">
                  {isVi ? 'Ngày' : 'Date'}
                </th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentLeads.map(lead => (
                <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{lead.name}</p>
                      <p className="text-xs text-gray-400">{lead.zip}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden sm:table-cell">
                    <p className="text-sm text-gray-600">{lead.phone}</p>
                    <p className="text-xs text-gray-400">{lead.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${
                      lead.service_type === 'commercial'
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-green-50 text-green-700'
                    }`}>
                      {lead.service_type === 'commercial'
                        ? (isVi ? 'Thương Mại' : 'Commercial')
                        : (isVi ? 'Dân Cư' : 'Residential')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <LeadStatusBadge status={lead.status} locale={locale} />
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <p className="text-xs text-gray-400">
                      {formatDate(lead.created_at, locale)}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/${locale}/crm/leads/${lead.id}`}
                      className="text-xs text-brand-green hover:text-brand-greenDark font-medium"
                    >
                      {isVi ? 'Xem' : 'View'}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
