'use client'

import { useState } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { TrendingUp, TrendingDown } from 'lucide-react'

type Period = '7d' | '30d' | '6m'
type Metric = 'revenue' | 'enrolled'

const allData: Record<Period, { label: string; revenue: number; enrolled: number }[]> = {
  '7d': [
    { label: 'Mon', revenue: 980,  enrolled: 2 },
    { label: 'Tue', revenue: 1340, enrolled: 4 },
    { label: 'Wed', revenue: 890,  enrolled: 2 },
    { label: 'Thu', revenue: 1620, enrolled: 5 },
    { label: 'Fri', revenue: 2100, enrolled: 6 },
    { label: 'Sat', revenue: 780,  enrolled: 1 },
    { label: 'Sun', revenue: 390,  enrolled: 1 },
  ],
  '30d': [
    { label: 'W1', revenue: 5400, enrolled: 14 },
    { label: 'W2', revenue: 7200, enrolled: 19 },
    { label: 'W3', revenue: 6100, enrolled: 16 },
    { label: 'W4', revenue: 8900, enrolled: 24 },
  ],
  '6m': [
    { label: 'Nov', revenue: 4200, enrolled: 12 },
    { label: 'Dec', revenue: 5800, enrolled: 17 },
    { label: 'Jan', revenue: 4900, enrolled: 14 },
    { label: 'Feb', revenue: 6700, enrolled: 22 },
    { label: 'Mar', revenue: 7400, enrolled: 25 },
    { label: 'Apr', revenue: 8100, enrolled: 28 },
  ],
}

const metricColor: Record<Metric, string> = {
  revenue:  '#00C853',
  enrolled: '#2979FF',
}

const periods: { key: Period; label: string }[] = [
  { key: '7d', label: '7D' },
  { key: '30d', label: '30D' },
  { key: '6m', label: '6M' },
]

const metrics: { key: Metric; label: string }[] = [
  { key: 'revenue',  label: 'Revenue'  },
  { key: 'enrolled', label: 'Enrolled' },
]

export default function RevenueChart() {
  const [period, setPeriod] = useState<Period>('6m')
  const [metric, setMetric] = useState<Metric>('revenue')

  const data = allData[period]
  const color = metricColor[metric]

  const total = data.reduce((s, d) => s + d[metric], 0)
  const prevTotal = total * 0.87
  const growth = Math.round(((total - prevTotal) / prevTotal) * 100)

  return (
    <div>
      {/* Summary row */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs text-slate-400">
            {metric === 'revenue' ? 'Total Revenue' : 'Enrollments'}
            {' · '}
            {period === '7d' ? 'Last 7 days' : period === '30d' ? 'Last 30 days' : 'Last 6 months'}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-xl font-bold text-[#0F172A] tabular-nums">
              {metric === 'revenue' ? `$${total.toLocaleString()}` : total}
            </p>
            <span className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
              growth >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'
            }`}>
              {growth >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
              {growth >= 0 ? '+' : ''}{growth}%
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Metric toggle */}
          <div className="flex bg-slate-50 rounded-lg p-0.5 gap-0.5">
            {metrics.map(m => (
              <button
                key={m.key}
                onClick={() => setMetric(m.key)}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all ${
                  metric === m.key
                    ? 'bg-white text-[#0F172A] shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
          {/* Period picker */}
          <div className="flex bg-slate-50 rounded-lg p-0.5 gap-0.5">
            {periods.map(p => (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all ${
                  period === p.key
                    ? 'bg-white text-[#0F172A] shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={190}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={color} stopOpacity={0.15} />
              <stop offset="95%" stopColor={color} stopOpacity={0}    />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={v =>
              metric === 'revenue' ? `$${(v / 1000).toFixed(0)}k` : String(v)
            }
          />
          <Tooltip
            contentStyle={{
              background: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: 10,
              fontSize: 12,
              boxShadow: '0 4px 16px rgba(15,23,42,0.08)',
            }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: any) => [
              metric === 'revenue' ? `$${Number(value).toLocaleString()}` : value,
              metric === 'revenue' ? 'Revenue' : 'Enrolled',
            ]}
          />
          <Area
            type="monotone"
            dataKey={metric}
            stroke={color}
            strokeWidth={2.5}
            fill="url(#colorMetric)"
            dot={false}
            activeDot={{ r: 4, fill: color, strokeWidth: 2, stroke: '#fff' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
