'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { ChartWrapper } from './chart-wrapper'

interface UniversityDistributionChartProps {
  data: { university: string; count: number }[]
}

export function UniversityDistributionChart({ data }: UniversityDistributionChartProps) {
  // Truncate long university names for display
  const formattedData = data.map(item => ({
    ...item,
    university: item.university.length > 20 
      ? item.university.substring(0, 20) + '...' 
      : item.university
  }))

  return (
    <ChartWrapper
      title="University Distribution"
      description="Users by university (top 10)"
    >
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={formattedData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            type="number"
            className="text-xs"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
          />
          <YAxis
            type="category"
            dataKey="university"
            width={120}
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
          <Bar
            dataKey="count"
            fill="hsl(var(--chart-3))"
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartWrapper>
  )
}

