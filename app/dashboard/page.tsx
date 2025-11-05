import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PortfolioLinkCard } from '@/components/portfolio-link-card'
import { getDatabase } from '@/lib/mongodb'
import { Project } from '@/lib/models/Project'
import { ObjectId } from 'mongodb'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Eye, Edit } from 'lucide-react'

export default async function Dashboard() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  const db = await getDatabase()
  const userId = new ObjectId(session.user.id)

  // Get stats
  const projectsCount = await db.collection<Project>('projects').countDocuments({
    userId: userId
  })

  const collaborationsCount = await db.collection<Project>('projects').countDocuments({
    'teamMembers.userId': session.user.id,
    userId: { $ne: userId }
  })

  // Calculate total views across all user's projects
  const totalViewsResult = await db.collection<Project>('projects').aggregate([
    { $match: { userId: userId } },
    { $group: { _id: null, totalViews: { $sum: '$views' } } }
  ]).toArray()
  const totalViews = totalViewsResult[0]?.totalViews || 0

  // Get recent projects
  const recentProjects = await db.collection<Project>('projects')
    .find({ userId: userId })
    .sort({ createdAt: -1 })
    .limit(5)
    .toArray()

  const portfolioUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/profile/${session.user.id}`

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-900">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {session.user.name}!</p>
        </div>

        {/* Portfolio Link Card */}
        <PortfolioLinkCard userId={session.user.id} portfolioUrl={portfolioUrl} />

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Your account details</CardDescription>
                </div>
                <Link href="/profile/edit">
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                <p className="text-base">{session.user.name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="text-base">{session.user.email}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Index Number</p>
                <p className="text-base">{(session.user as any).indexNumber}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Registration Number</p>
                <p className="text-base">{(session.user as any).registrationNumber}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
              <CardDescription>Your activity overview</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Projects</span>
                <span className="text-2xl font-bold">{projectsCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Collaborations</span>
                <span className="text-2xl font-bold">{collaborationsCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Views</span>
                <span className="text-2xl font-bold">{totalViews}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Recent Projects</h2>
            <Link href="/projects">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </div>

          {recentProjects.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  No projects yet. Start by creating your first project!
                </p>
                <Link href="/projects/new">
                  <Button>Create Your First Project</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentProjects.map((project) => (
                <Card key={project._id!.toString()} className="flex flex-col overflow-hidden">
                  {project.thumbnailUrl && (
                    <div className="relative w-full h-48 bg-muted overflow-hidden">
                      <img
                        src={project.thumbnailUrl}
                        alt={project.title}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant={project.status === 'completed' ? 'default' : 'secondary'}>
                        {project.status}
                      </Badge>
                      <Badge variant="outline">{project.category}</Badge>
                    </div>
                    <CardTitle className="line-clamp-1">{project.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {project.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {project.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{project.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {project.views}
                      </span>
                      <span>•</span>
                      <span>
                        {project.teamMembers.length} member
                        {project.teamMembers.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </CardContent>
                  <CardContent className="pt-0">
                    <Link href={`/projects/${project._id!.toString()}`}>
                      <Button variant="outline" size="sm" className="w-full">
                        <Eye className="h-4 w-4 mr-2" />
                        View Project
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
