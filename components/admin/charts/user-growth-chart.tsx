'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { ChartWrapper } from './chart-wrapper'

interface UserGrowthChartProps {
  data: { date: string; count: number }[]
}

export function UserGrowthChart({ data }: UserGrowthChartProps) {
  return (
    <ChartWrapper
      title="User Growth"
      description="New user registrations over time"
    >
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="date"
            className="text-xs"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
          />
          <YAxis
            className="text-xs"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: 'calc(var(--radius) - 2px)',
            }}
          />
          <Line
            type="monotone"
            dataKey="count"
            stroke="hsl(var(--chart-1))"
            strokeWidth={2}
            dot={{ fill: 'hsl(var(--chart-1))', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartWrapper>
  )
}

