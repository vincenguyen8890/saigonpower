import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  color: 'green' | 'blue' | 'yellow' | 'red' | 'purple'
  trend?: { value: number; label: string }
}

const colorMap = {
  green:  { bg: 'bg-green-50',  icon: 'text-green-600',  border: 'border-green-100' },
  blue:   { bg: 'bg-blue-50',   icon: 'text-blue-600',   border: 'border-blue-100'  },
  yellow: { bg: 'bg-amber-50',  icon: 'text-amber-600',  border: 'border-amber-100' },
  red:    { bg: 'bg-red-50',    icon: 'text-red-600',    border: 'border-red-100'   },
  purple: { bg: 'bg-purple-50', icon: 'text-purple-600', border: 'border-purple-100'},
}

export default function StatCard({ title, value, subtitle, icon: Icon, color, trend }: StatCardProps) {
  const c = colorMap[color]
  return (
    <div className={`bg-white rounded-2xl border ${c.border} p-5 shadow-sm`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
          {trend && (
            <p className={`text-xs mt-2 font-medium ${trend.value >= 0 ? 'text-green-600' : 'text-red-500'}`}>
              {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)} {trend.label}
            </p>
          )}
        </div>
        <div className={`w-12 h-12 ${c.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
          <Icon size={22} className={c.icon} />
        </div>
      </div>
    </div>
  )
}
