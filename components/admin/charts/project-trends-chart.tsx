'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { ChartWrapper } from './chart-wrapper'

interface ProjectTrendsChartProps {
  data: { date: string; count: number }[]
}

export function ProjectTrendsChart({ data }: ProjectTrendsChartProps) {
  return (
    <ChartWrapper
      title="Project Trends"
      description="Project creation over time"
    >
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
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
          <Area
            type="monotone"
            dataKey="count"
            stroke="hsl(var(--chart-2))"
            fillOpacity={1}
            fill="url(#colorCount)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartWrapper>
  )
}

