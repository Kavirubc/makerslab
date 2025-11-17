'use client'

import { useEffect, useState } from 'react'
import { AdminHeader } from '@/components/admin/admin-header'
import { UserGrowthChart } from '@/components/admin/charts/user-growth-chart'
import { ProjectTrendsChart } from '@/components/admin/charts/project-trends-chart'
import { CategoryDistributionChart } from '@/components/admin/charts/category-distribution-chart'
import { UniversityDistributionChart } from '@/components/admin/charts/university-distribution-chart'
import { EngagementChart } from '@/components/admin/charts/engagement-chart'
import { ActivityTimeline } from '@/components/admin/charts/activity-timeline'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'

interface AnalyticsData {
  userGrowth: { date: string; count: number }[]
  projectTrends: { date: string; count: number }[]
  categoryDistribution: { category: string; count: number }[]
  universityDistribution: { university: string; count: number }[]
  engagement: { date: string; views: number; likes: number }[]
  recentActivity: Array<{
    type: 'user' | 'project'
    id: string
    title: string
    description: string
    timestamp: Date | string
  }>
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState('30')

  useEffect(() => {
    fetchAnalytics()
  }, [days])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/analytics?days=${days}`)
      if (response.ok) {
        const analyticsData = await response.json()
        setData(analyticsData)
      } else {
        console.error('Failed to fetch analytics')
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <>
        <AdminHeader
          title="Analytics"
          description="Detailed analytics and insights"
        />
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </>
    )
  }

  if (!data) {
    return (
      <>
        <AdminHeader
          title="Analytics"
          description="Detailed analytics and insights"
        />
        <div className="text-center py-12">
          <p className="text-muted-foreground">Failed to load analytics</p>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <AdminHeader
          title="Analytics"
          description="Detailed analytics and insights"
        />
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="days">Time Period:</Label>
            <Select value={days} onValueChange={setDays}>
              <SelectTrigger id="days" className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* User Growth and Project Trends */}
      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <UserGrowthChart data={data.userGrowth || []} />
        <ProjectTrendsChart data={data.projectTrends || []} />
      </div>

      {/* Category and University Distribution */}
      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <CategoryDistributionChart data={data.categoryDistribution || []} />
        <UniversityDistributionChart data={data.universityDistribution || []} />
      </div>

      {/* Engagement Metrics */}
      <div className="mb-8">
        <EngagementChart data={data.engagement || []} />
      </div>

      {/* Recent Activity */}
      <div className="mb-8">
        <ActivityTimeline data={data.recentActivity || []} />
      </div>
    </>
  )
}

