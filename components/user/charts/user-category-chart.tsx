'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { ChartWrapper } from '@/components/admin/charts/chart-wrapper'

interface UserCategoryChartProps {
  data: { category: string; count: number }[]
}

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
]

export function UserCategoryChart({ data }: UserCategoryChartProps) {
  if (data.length === 0) {
    return (
      <ChartWrapper
        title="Project Categories"
        description="Distribution of your projects by category"
      >
        <div className="flex items-center justify-center h-[250px] text-muted-foreground">
          No projects yet
        </div>
      </ChartWrapper>
    )
  }

  return (
    <ChartWrapper
      title="Project Categories"
      description="Distribution of your projects by category"
    >
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={(entry: any) => `${entry.category}: ${(entry.percent * 100).toFixed(0)}%`}
            outerRadius={70}
            fill="#8884d8"
            dataKey="count"
            nameKey="category"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: 'calc(var(--radius) - 2px)',
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </ChartWrapper>
  )
}

