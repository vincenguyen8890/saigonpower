import type { LucideIcon } from 'lucide-react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import Link from 'next/link'

interface KpiCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: { value: number; label: string }
  color: 'green' | 'blue' | 'orange' | 'red' | 'purple'
  href?: string
}

const colorConfig = {
  green:  { iconBg: 'bg-[#E8FFF1]',  iconColor: 'text-[#00C853]'  },
  blue:   { iconBg: 'bg-[#EBF2FF]',  iconColor: 'text-[#2979FF]'  },
  orange: { iconBg: 'bg-[#FFF3E8]',  iconColor: 'text-[#FF6D00]'  },
  red:    { iconBg: 'bg-red-50',      iconColor: 'text-red-500'    },
  purple: { iconBg: 'bg-purple-50',   iconColor: 'text-purple-600' },
}

export default function KpiCard({ title, value, subtitle, icon: Icon, trend, color, href }: KpiCardProps) {
  const c = colorConfig[color]
  const isPositive = trend ? trend.value >= 0 : null

  const inner = (
    <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-[0_1px_3px_rgba(15,23,42,0.06)] hover:shadow-[0_4px_16px_rgba(15,23,42,0.09)] transition-all duration-200 h-full">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 ${c.iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
          <Icon size={19} className={c.iconColor} />
        </div>
        {trend && (
          <span className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full ${
            isPositive
              ? 'bg-green-50 text-green-600'
              : 'bg-red-50 text-red-500'
          }`}>
            {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            {isPositive ? '+' : ''}{trend.value}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-[#0F172A] leading-none tabular-nums">{value}</p>
      <p className="text-xs font-semibold text-slate-500 mt-1.5">{title}</p>
      {subtitle && <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>}
      {trend && <p className="text-[11px] text-slate-400 mt-1">{trend.label}</p>}
    </div>
  )

  if (href) return <Link href={href} className="block h-full">{inner}</Link>
  return inner
}
