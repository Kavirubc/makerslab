import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getDatabase } from '@/lib/mongodb'
import { Project } from '@/lib/models/Project'
import { User } from '@/lib/models/User'
import { University } from '@/lib/models/University'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Users, FolderKanban, Building2, AlertCircle, Flag } from 'lucide-react'
import { isAdmin } from '@/lib/utils/admin'
import { AdminHeader } from '@/components/admin/admin-header'
import { StatsCard } from '@/components/admin/stats-card'
import { UserGrowthChart } from '@/components/admin/charts/user-growth-chart'
import { ProjectTrendsChart } from '@/components/admin/charts/project-trends-chart'
import { CategoryDistributionChart } from '@/components/admin/charts/category-distribution-chart'
import { ActivityTimeline } from '@/components/admin/charts/activity-timeline'
import { ProjectReport } from '@/lib/models/ProjectReport'

export default async function AdminDashboard() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  if (!isAdmin(session)) {
    redirect('/dashboard')
  }

  const db = await getDatabase()

  // Get stats
  const totalUsers = await db.collection<User>('users').countDocuments()
  const totalProjects = await db.collection<Project>('projects').countDocuments()
  const totalUniversities = await db.collection<University>('universities').countDocuments()
  const bannedUsers = await db.collection<User>('users').countDocuments({ isBanned: true })
  const adminUsers = await db.collection<User>('users').countDocuments({ role: 'admin' })
  // Count unresolved reports (pending + reviewed, not resolved/dismissed)
  const unresolvedReports = await db.collection<ProjectReport>('projectReports').countDocuments({
    status: { $in: ['pending', 'reviewed'] }
  })

  // Get analytics data
  const { getAnalyticsData } = await import('@/lib/utils/analytics')
  const analytics = await getAnalyticsData(30)

  // Calculate trends for stats cards
  const now = new Date()
  const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const previous7Days = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

  const usersLast7Days = await db.collection<User>('users').countDocuments({
    createdAt: { $gte: last7Days }
  })
  const usersPrevious7Days = await db.collection<User>('users').countDocuments({
    createdAt: { $gte: previous7Days, $lt: last7Days }
  })
  const userGrowthRate = usersPrevious7Days > 0
    ? ((usersLast7Days - usersPrevious7Days) / usersPrevious7Days) * 100
    : 0

  const projectsLast7Days = await db.collection<Project>('projects').countDocuments({
    createdAt: { $gte: last7Days }
  })
  const projectsPrevious7Days = await db.collection<Project>('projects').countDocuments({
    createdAt: { $gte: previous7Days, $lt: last7Days }
  })
  const projectGrowthRate = projectsPrevious7Days > 0
    ? ((projectsLast7Days - projectsPrevious7Days) / projectsPrevious7Days) * 100
    : 0

  return (
    <>
      <AdminHeader
        title="Admin Dashboard"
        description="Manage users, projects, and universities"
      />

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5 mb-8">
        <StatsCard
          title="Total Users"
          value={totalUsers}
          description={`${adminUsers} admin${adminUsers !== 1 ? 's' : ''}`}
          icon={Users}
          trend={{
            value: userGrowthRate,
            label: 'vs last 7 days',
            isPositive: userGrowthRate >= 0,
          }}
        />
        <StatsCard
          title="Total Projects"
          value={totalProjects}
          description="All projects"
          icon={FolderKanban}
          trend={{
            value: projectGrowthRate,
            label: 'vs last 7 days',
            isPositive: projectGrowthRate >= 0,
          }}
        />
        <StatsCard
          title="Universities"
          value={totalUniversities}
          description="Registered universities"
          icon={Building2}
        />
        <StatsCard
          title="Banned Users"
          value={bannedUsers}
          description="Currently banned"
          icon={AlertCircle}
        />
        <StatsCard
          title="Unresolved Reports"
          value={unresolvedReports}
          description="Pending review"
          icon={Flag}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <UserGrowthChart data={analytics.userGrowth || []} />
        <ProjectTrendsChart data={analytics.projectTrends || []} />
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <CategoryDistributionChart data={analytics.categoryDistribution || []} />
        <ActivityTimeline data={analytics.recentActivity || []} />
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>Manage users, ban/unban accounts, and view user details</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/users">
              <Button className="w-full">
                <Users className="h-4 w-4 mr-2" />
                Manage Users
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Project Management</CardTitle>
            <CardDescription>View, edit, and delete all projects on the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/projects">
              <Button className="w-full">
                <FolderKanban className="h-4 w-4 mr-2" />
                Manage Projects
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Project Reports</CardTitle>
            <CardDescription>Review and manage project reports submitted by users</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/reports">
              <Button className="w-full">
                <Flag className="h-4 w-4 mr-2" />
                Manage Reports
                {unresolvedReports > 0 && (
                  <span className="ml-2 bg-destructive text-destructive-foreground text-xs px-1.5 py-0.5 rounded-full">
                    {unresolvedReports}
                  </span>
                )}
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>University Management</CardTitle>
            <CardDescription>Add, edit, and manage universities and their email domains</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/universities">
              <Button className="w-full">
                <Building2 className="h-4 w-4 mr-2" />
                Manage Universities
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
