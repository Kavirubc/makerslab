import { notFound } from 'next/navigation'
import { getDatabase } from '@/lib/mongodb'
import { Project } from '@/lib/models/Project'
import { User } from '@/lib/models/User'
import { ObjectId } from 'mongodb'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Eye, ExternalLink, Github, FileText, Video, Calendar, Users, Globe } from 'lucide-react'
import Link from 'next/link'
import { VideoEmbed } from '@/components/video-embed'
import ReactMarkdown from 'react-markdown'

interface ProjectPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params

  if (!ObjectId.isValid(id)) {
    notFound()
  }

  const db = await getDatabase()

  const project = await db.collection<Project>('projects').findOne({
    _id: new ObjectId(id)
  })

  if (!project) {
    notFound()
  }

  // Get project owner info
  const owner = await db.collection<User>('users').findOne({
    _id: project.userId
  })

  // Increment view count
  await db.collection<Project>('projects').updateOne(
    { _id: new ObjectId(id) },
    { $inc: { views: 1 } }
  )

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant={project.status === 'completed' ? 'default' : 'secondary'}>
                {project.status}
              </Badge>
              <Badge variant="outline">{project.category}</Badge>
            </div>
            <h1 className="text-4xl font-bold mb-4">{project.title}</h1>
            <div className="flex items-center gap-4 text-muted-foreground text-sm">
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {project.views} views
              </span>
              <span>•</span>
              <span>
                By{' '}
                <Link
                  href={`/profile/${owner?._id}`}
                  className="text-primary hover:underline"
                >
                  {owner?.name}
                </Link>
              </span>
            </div>
          </div>

          {/* Pitch Video */}
          {project.pitchVideoUrl && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  Project Pitch Video
                </CardTitle>
              </CardHeader>
              <CardContent>
                <VideoEmbed url={project.pitchVideoUrl} />
              </CardContent>
            </Card>
          )}

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle>About this Project</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown>{project.description}</ReactMarkdown>
                  </div>
                </CardContent>
              </Card>

              {/* Technologies */}
              {project.tags.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Technologies Used</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {project.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Team Members */}
              {project.teamMembers.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Team Members
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {project.teamMembers.map((member, index) => (
                        <div key={index} className="flex justify-between items-start p-3 border rounded-md">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              {member.userId ? (
                                <Link
                                  href={`/profile/${member.userId}`}
                                  className="font-medium text-primary hover:underline"
                                >
                                  {member.name}
                                </Link>
                              ) : (
                                <p className="font-medium">{member.name}</p>
                              )}
                              {member.userId && (
                                <Badge variant="secondary" className="text-xs">
                                  Registered
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{member.role}</p>
                            {member.indexNumber && (
                              <p className="text-xs text-muted-foreground">
                                {member.indexNumber}
                              </p>
                            )}
                          </div>
                          <a
                            href={`mailto:${member.email}`}
                            className="text-sm text-primary hover:underline"
                          >
                            Contact
                          </a>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Primary Action */}
              {project.demoUrl && (
                <a
                  href={project.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button size="lg" className="w-full">
                    <Globe className="h-5 w-5 mr-2" />
                    View Live Demo
                  </Button>
                </a>
              )}

              {/* Links */}
              <Card>
                <CardHeader>
                  <CardTitle>Resources</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 hover:bg-accent rounded-md transition-colors group"
                    >
                      <div className="p-2 rounded-md bg-muted group-hover:bg-background">
                        <Github className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Source Code</p>
                        <p className="text-xs text-muted-foreground">View on GitHub</p>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    </a>
                  )}

                  {project.slidesDeckUrl && (
                    <a
                      href={project.slidesDeckUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 hover:bg-accent rounded-md transition-colors group"
                    >
                      <div className="p-2 rounded-md bg-muted group-hover:bg-background">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Presentation</p>
                        <p className="text-xs text-muted-foreground">View slides deck</p>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    </a>
                  )}

                  {project.pitchVideoUrl && (
                    <a
                      href={project.pitchVideoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 hover:bg-accent rounded-md transition-colors group"
                    >
                      <div className="p-2 rounded-md bg-muted group-hover:bg-background">
                        <Video className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Pitch Video</p>
                        <p className="text-xs text-muted-foreground">Watch on YouTube</p>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    </a>
                  )}

                  {!project.githubUrl && !project.slidesDeckUrl && !project.pitchVideoUrl && !project.demoUrl && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No resources available
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Project Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Project Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Created</p>
                    <p className="text-sm font-medium">
                      {new Date(project.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  {project.endDate && (
                    <div>
                      <p className="text-sm text-muted-foreground">Completed</p>
                      <p className="text-sm font-medium">
                        {new Date(project.endDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
