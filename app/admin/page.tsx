import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getDatabase } from '@/lib/mongodb'
import { Project } from '@/lib/models/Project'
import { User } from '@/lib/models/User'
import { University } from '@/lib/models/University'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Users, FolderKanban, Building2, AlertCircle } from 'lucide-react'
import { isAdmin } from '@/lib/utils/admin'

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

  // Get recent activity
  const recentUsers = await db.collection<User>('users')
    .find({}, { projection: { password: 0 } })
    .sort({ createdAt: -1 })
    .limit(5)
    .toArray()

  const recentProjects = await db.collection<Project>('projects')
    .find({})
    .sort({ createdAt: -1 })
    .limit(5)
    .toArray()

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-900">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage users, projects, and universities</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                {adminUsers} admin{adminUsers !== 1 ? 's' : ''}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              <FolderKanban className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProjects}</div>
              <p className="text-xs text-muted-foreground">
                All projects
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Universities</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUniversities}</div>
              <p className="text-xs text-muted-foreground">
                Registered universities
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Banned Users</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bannedUsers}</div>
              <p className="text-xs text-muted-foreground">
                Currently banned
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-6 md:grid-cols-3">
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

        {/* Recent Activity */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Recent Users</CardTitle>
                  <CardDescription>Latest registered users</CardDescription>
                </div>
                <Link href="/admin/users">
                  <Button variant="outline" size="sm">View All</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {recentUsers.length === 0 ? (
                <p className="text-sm text-muted-foreground">No users yet</p>
              ) : (
                <div className="space-y-4">
                  {recentUsers.map((user) => (
                    <div key={user._id!.toString()} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {user.role === 'admin' && (
                          <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                            Admin
                          </span>
                        )}
                        {user.isBanned && (
                          <span className="text-xs bg-destructive text-destructive-foreground px-2 py-1 rounded">
                            Banned
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Recent Projects</CardTitle>
                  <CardDescription>Latest created projects</CardDescription>
                </div>
                <Link href="/admin/projects">
                  <Button variant="outline" size="sm">View All</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {recentProjects.length === 0 ? (
                <p className="text-sm text-muted-foreground">No projects yet</p>
              ) : (
                <div className="space-y-4">
                  {recentProjects.map((project) => (
                    <div key={project._id!.toString()} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{project.title}</p>
                        <p className="text-xs text-muted-foreground">{project.category}</p>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {project.views} views
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

