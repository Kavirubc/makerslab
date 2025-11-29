import { notFound, redirect } from "next/navigation"
import { getDatabase } from "@/lib/mongodb"
import { Project } from "@/lib/models/Project"
import { User } from "@/lib/models/User"
import { ObjectId } from "mongodb"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Eye,
  ExternalLink,
  Github,
  FileText,
  Video,
  Globe,
  Heart,
  Edit,
  Send,
  AlertTriangle,
} from "lucide-react"
import Link from "next/link"
import { VideoEmbed } from "@/components/video-embed"
import ReactMarkdown from "react-markdown"
import { auth } from "@/auth"
import { DraftBadge } from "@/components/draft-badge"

interface PreviewPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ProjectPreviewPage({ params }: PreviewPageProps) {
  const { id } = await params
  const session = await auth()

  // must be logged in to preview
  if (!session?.user) {
    redirect("/login")
  }

  if (!ObjectId.isValid(id)) {
    notFound()
  }

  const db = await getDatabase()

  const project = await db.collection<Project>("projects").findOne({
    _id: new ObjectId(id),
  })

  if (!project) {
    notFound()
  }

  // only owner can preview
  if (project.userId.toString() !== session.user.id) {
    redirect(`/projects/${id}`)
  }

  // if not a draft, redirect to normal view
  if (!project.isDraft) {
    redirect(`/projects/${id}`)
  }

  // get project owner info
  const owner = await db.collection<User>("users").findOne({
    _id: project.userId,
  })

  // NOTE: We do NOT increment view count for preview

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      {/* Preview Banner */}
      <div className="bg-amber-500/10 border-b border-amber-500/30">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <div>
                <p className="font-medium text-amber-700 dark:text-amber-400">
                  Preview Mode
                </p>
                <p className="text-sm text-muted-foreground">
                  This is how your project will look when published. Only you can see this.
                </p>
              </div>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <Link href={`/projects/${id}/edit`} className="flex-1 md:flex-none">
                <Button variant="outline" className="w-full">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </Link>
              <PublishButton projectId={id} />
            </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Hero Image/Thumbnail */}
          {project.thumbnailUrl && (
            <div className="relative w-full h-[400px] rounded-xl overflow-hidden bg-muted">
              <img
                src={project.thumbnailUrl}
                alt={project.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/80 to-transparent p-6 flex flex-col">
                <div className="flex flex-wrap gap-2 mb-3">
                  <DraftBadge />
                  <Badge
                    variant={
                      project.status === "completed" ? "default" : "secondary"
                    }
                    className="bg-primary"
                  >
                    {project.status}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="bg-white/10 backdrop-blur-sm text-white border-white/20"
                  >
                    {project.category}
                  </Badge>
                </div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  {project.title}
                </h1>
                <div className="flex md:items-center gap-4 text-white/90 text-sm flex-col md:flex-row">
                  <div className="flex w-full justify-between md:justify-start md:gap-4">
                    <span className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {project.views} views
                    </span>
                    <span className="flex items-center gap-1">
                      <span>•</span>
                      <Heart className="h-4 w-4" />
                      {project.likes || 0} likes
                    </span>
                    <span className="flex items-center gap-1">
                      <span>•</span>
                      By {owner?.name}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Header (for projects without thumbnail) */}
          {!project.thumbnailUrl && (
            <div className="relative">
              <div className="flex flex-wrap gap-2 mb-4">
                <DraftBadge />
                <Badge
                  variant={
                    project.status === "completed" ? "default" : "secondary"
                  }
                >
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
                <span className="flex items-center gap-1">
                  <Heart className="h-4 w-4" />
                  {project.likes || 0} likes
                </span>
                <span>•</span>
                <span>By {owner?.name}</span>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Pitch Video */}
              {project.pitchVideoUrl && (
                <div className="border rounded-lg p-6">
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <Video className="h-6 w-6 text-primary" />
                    Project Pitch Video
                  </h2>
                  <VideoEmbed url={project.pitchVideoUrl} />
                </div>
              )}

              {/* Description */}
              <div className="border rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-4">About this Project</h2>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown>{project.description || "No description yet."}</ReactMarkdown>
                </div>
              </div>

              {/* Technologies */}
              {project.tags && project.tags.length > 0 && (
                <div className="border rounded-lg p-6">
                  <h2 className="text-2xl font-bold mb-4">Technologies Used</h2>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
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
              <div className="mt-6 border rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-4">Resources</h2>
                <div className="space-y-2">
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
                        <p className="text-xs text-muted-foreground">
                          View on GitHub
                        </p>
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
                        <p className="text-xs text-muted-foreground">
                          View slides deck
                        </p>
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
                        <p className="text-xs text-muted-foreground">
                          Watch on YouTube
                        </p>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    </a>
                  )}

                  {!project.githubUrl &&
                    !project.slidesDeckUrl &&
                    !project.pitchVideoUrl &&
                    !project.demoUrl && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No resources available
                      </p>
                    )}
                </div>
              </div>

              {/* Project Info */}
              <div className="border rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-4">Project Info</h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Created</p>
                    <p className="text-sm font-medium">
                      {new Date(project.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  {project.endDate && (
                    <div>
                      <p className="text-sm text-muted-foreground">Completed</p>
                      <p className="text-sm font-medium">
                        {new Date(project.endDate).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Team Members */}
              {project.teamMembers && project.teamMembers.length > 0 && (
                <div className="border rounded-lg p-6">
                  <h2 className="text-2xl font-bold mb-4">Team Members</h2>
                  <div className="space-y-3">
                    {project.teamMembers.map((member, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-start py-3"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-foreground">
                              {member.name}
                            </p>
                            {member.userId && (
                              <Badge variant="secondary" className="text-xs">
                                Registered
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {member.role}
                          </p>
                          {member.indexNumber && (
                            <p className="text-xs text-muted-foreground">
                              {member.indexNumber}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// client component for publish button
function PublishButton({ projectId }: { projectId: string }) {
  return (
    <form action={`/api/projects/${projectId}/publish`} method="POST">
      <Link href={`/projects/${projectId}/edit`}>
        <Button className="w-full">
          <Send className="h-4 w-4 mr-2" />
          Edit & Publish
        </Button>
      </Link>
    </form>
  )
}
