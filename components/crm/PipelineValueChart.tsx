'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const STAGE_COLORS: Record<string, string> = {
  prospect:    '#d1d5db',
  qualified:   '#93c5fd',
  proposal:    '#c4b5fd',
  negotiation: '#fcd34d',
  won:         '#4ade80',
  lost:        '#fca5a5',
}

interface Props {
  data: { stage: string; value: number; count: number }[]
}

export default function PipelineValueChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 0, right: 8, left: -12, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
        <XAxis
          dataKey="stage"
          tick={{ fontSize: 11, fill: '#9ca3af' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#9ca3af' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={v => `$${v}`}
        />
        <Tooltip
          contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12 }}
          formatter={(v, _name, entry) => [`$${Number(v)}/mo · ${entry.payload.count} deals`, 'Pipeline']}
          labelFormatter={l => String(l).charAt(0).toUpperCase() + String(l).slice(1)}
        />
        <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={48}>
          {data.map((entry) => (
            <Cell key={entry.stage} fill={STAGE_COLORS[entry.stage] ?? '#14532d'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
