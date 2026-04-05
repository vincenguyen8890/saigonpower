'use client'

import {
  ComposedChart, Area, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'

interface Props {
  data: { month: string; newLeads: number; enrolled: number; revenue: number }[]
}

export default function EnrollmentTrendChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <ComposedChart data={data} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="colorEnrolled" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#14532d" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#14532d" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
        <YAxis yAxisId="left"  tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
        <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v/1000}k`} />
        <Tooltip
          contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12 }}
        />
        <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
        <Bar     yAxisId="left"  dataKey="newLeads" name="New Leads" fill="#bfdbfe" radius={[3,3,0,0]} maxBarSize={28} />
        <Bar     yAxisId="left"  dataKey="enrolled" name="Enrolled"  fill="#14532d" radius={[3,3,0,0]} maxBarSize={28} />
        <Area    yAxisId="right" dataKey="revenue"  name="Revenue"   stroke="#f59e0b" strokeWidth={2} fill="url(#colorEnrolled)" dot={false} />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
