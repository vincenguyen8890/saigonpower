'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer } from 'recharts'

const STATUS_COLORS: Record<string, string> = {
  new:       '#3b82f6',
  contacted: '#f59e0b',
  quoted:    '#8b5cf6',
  enrolled:  '#22c55e',
  lost:      '#9ca3af',
}

interface Props {
  data: { name: string; value: number; rate?: string }[]
}

export default function LeadFunnelChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 24, left: 16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
        <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fontSize: 12, fill: '#6b7280' }}
          axisLine={false}
          tickLine={false}
          width={72}
        />
        <Tooltip
          contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12 }}
          formatter={(v) => [v, 'Leads']}
        />
        <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={28}>
          {data.map((entry) => (
            <Cell key={entry.name} fill={STATUS_COLORS[entry.name] ?? '#14532d'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
