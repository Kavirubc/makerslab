'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { ChartWrapper } from '@/components/admin/charts/chart-wrapper'

interface UserEngagementChartProps {
  data: { date: string; views: number; likes: number }[]
}

export function UserEngagementChart({ data }: UserEngagementChartProps) {
  return (
    <ChartWrapper
      title="Engagement Metrics"
      description="Views and likes on your projects"
    >
      <ResponsiveContainer width="100%" height={250}>
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
          <Legend />
          <Line
            type="monotone"
            dataKey="views"
            stroke="hsl(var(--chart-4))"
            strokeWidth={2}
            name="Views"
            dot={{ fill: 'hsl(var(--chart-4))', r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="likes"
            stroke="hsl(var(--chart-5))"
            strokeWidth={2}
            name="Likes"
            dot={{ fill: 'hsl(var(--chart-5))', r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartWrapper>
  )
}

