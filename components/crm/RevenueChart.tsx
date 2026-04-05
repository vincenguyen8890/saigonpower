'use client'

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'

const data = [
  { month: 'Nov', revenue: 4200, enrolled: 12 },
  { month: 'Dec', revenue: 5800, enrolled: 17 },
  { month: 'Jan', revenue: 4900, enrolled: 14 },
  { month: 'Feb', revenue: 6700, enrolled: 22 },
  { month: 'Mar', revenue: 7400, enrolled: 25 },
  { month: 'Apr', revenue: 8100, enrolled: 28 },
]

export default function RevenueChart() {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#14532d" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#14532d" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
        <Tooltip
          contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12 }}
          formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Revenue']}
        />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="#14532d"
          strokeWidth={2}
          fill="url(#colorRevenue)"
          dot={{ r: 3, fill: '#14532d' }}
          activeDot={{ r: 5 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
