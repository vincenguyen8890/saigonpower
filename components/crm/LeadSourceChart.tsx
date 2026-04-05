'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const COLORS = ['#14532d', '#4ade80', '#86efac', '#bbf7d0', '#f59e0b', '#93c5fd']

interface Props {
  data: { name: string; value: number }[]
}

export default function LeadSourceChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="45%"
          innerRadius={55}
          outerRadius={85}
          paddingAngle={3}
          dataKey="value"
        >
          {data.map((_entry, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12 }}
          formatter={(v, name) => [`${v} leads`, name]}
        />
        <Legend
          wrapperStyle={{ fontSize: 11 }}
          formatter={(value) => String(value).charAt(0).toUpperCase() + String(value).slice(1)}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
