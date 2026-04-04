import { useLocale } from 'next-intl'
import { FileText, Download, Calendar, Zap, DollarSign } from 'lucide-react'
import Button from '@/components/ui/Button'

const CONTRACT = {
  id: 'CTR-2024-001',
  planName: 'Gexa Saver 12',
  provider: 'Gexa Energy',
  rateKwh: 11.5,
  monthlyFee: 0,
  termMonths: 12,
  startDate: '2024-04-01',
  endDate: '2025-04-30',
  serviceAddress: '1234 Main St, Houston TX 77036',
  esid: '10443720002451428',
  status: 'active',
  cancellationFee: 0,
  renewablePercent: 0,
}

const BILLING_HISTORY = [
  { month: 'Mar 2025', usage: 1050, bill: 124.75 },
  { month: 'Feb 2025', usage: 940, bill: 112.30 },
  { month: 'Jan 2025', usage: 1120, bill: 132.90 },
  { month: 'Dec 2024', usage: 880, bill: 106.20 },
  { month: 'Nov 2024', usage: 790, bill: 97.85 },
  { month: 'Oct 2024', usage: 920, bill: 110.40 },
]

export default function ContractPage() {
  const locale = useLocale()

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-brand-blue mb-1">
            {locale === 'vi' ? 'Hợp Đồng Của Tôi' : 'My Contract'}
          </h1>
          <p className="text-gray-600 text-sm">#{CONTRACT.id}</p>
        </div>
        <Button variant="secondary" size="sm">
          <Download size={15} /> {locale === 'vi' ? 'Tải Hợp Đồng' : 'Download Contract'}
        </Button>
      </div>

      {/* Status badge */}
      <div className="bg-white rounded-2xl shadow-card border border-surface-border p-6 mb-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse" />
          <span className="font-semibold text-emerald-700">
            {locale === 'vi' ? 'Đang Hoạt Động' : 'Active'}
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { icon: FileText, label: locale === 'vi' ? 'Gói Điện' : 'Plan', value: CONTRACT.planName },
            { icon: Zap, label: locale === 'vi' ? 'Nhà Cung Cấp' : 'Provider', value: CONTRACT.provider },
            { icon: DollarSign, label: locale === 'vi' ? 'Giá Điện' : 'Rate', value: `${CONTRACT.rateKwh}¢/kWh` },
            { icon: Calendar, label: locale === 'vi' ? 'Ngày Bắt Đầu' : 'Start Date', value: new Date(CONTRACT.startDate).toLocaleDateString() },
            { icon: Calendar, label: locale === 'vi' ? 'Ngày Kết Thúc' : 'End Date', value: new Date(CONTRACT.endDate).toLocaleDateString() },
            { icon: FileText, label: 'ESID', value: CONTRACT.esid },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="bg-surface-light rounded-xl p-4">
              <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                <Icon size={12} /> {label}
              </div>
              <div className="font-semibold text-gray-800 text-sm">{value}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-surface-border">
          <div className="text-xs text-gray-500 mb-1">{locale === 'vi' ? 'Địa Chỉ Dịch Vụ' : 'Service Address'}</div>
          <div className="font-medium text-gray-800">{CONTRACT.serviceAddress}</div>
        </div>
      </div>

      {/* Billing history */}
      <div className="bg-white rounded-2xl shadow-card border border-surface-border p-6">
        <h2 className="font-bold text-brand-blue mb-5">
          {locale === 'vi' ? 'Lịch Sử Hóa Đơn' : 'Billing History'}
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-border">
                <th className="text-left py-3 px-2 text-gray-500 font-medium">{locale === 'vi' ? 'Tháng' : 'Month'}</th>
                <th className="text-right py-3 px-2 text-gray-500 font-medium">{locale === 'vi' ? 'Sử Dụng' : 'Usage'}</th>
                <th className="text-right py-3 px-2 text-gray-500 font-medium">{locale === 'vi' ? 'Hóa Đơn' : 'Bill'}</th>
                <th className="text-right py-3 px-2 text-gray-500 font-medium">{locale === 'vi' ? 'Giá/kWh' : 'Rate/kWh'}</th>
              </tr>
            </thead>
            <tbody>
              {BILLING_HISTORY.map(({ month, usage, bill }) => (
                <tr key={month} className="border-b border-surface-border/50 hover:bg-surface-light">
                  <td className="py-3 px-2 font-medium text-gray-800">{month}</td>
                  <td className="py-3 px-2 text-right text-gray-600">{usage.toLocaleString()} kWh</td>
                  <td className="py-3 px-2 text-right font-semibold text-brand-blue">${bill.toFixed(2)}</td>
                  <td className="py-3 px-2 text-right text-gray-500">{((bill / usage) * 100).toFixed(1)}¢</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
