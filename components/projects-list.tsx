'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Edit, Trash2, Eye, ExternalLink, Github } from 'lucide-react'
import Link from 'next/link'
import { Project } from '@/lib/models/Project'

interface ProjectsListProps {
  userId: string
}

export function ProjectsList({ userId }: ProjectsListProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects')
      const data = await response.json()
      setProjects(data.projects || [])
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setProjects(projects.filter((p) => p._id?.toString() !== projectId))
      }
    } catch (error) {
      console.error('Error deleting project:', error)
    }
  }

  if (isLoading) {
    return <div className="text-center py-12">Loading projects...</div>
  }

  if (projects.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <p className="text-muted-foreground mb-4">
            You haven&apos;t created any projects yet.
          </p>
          <Link href="/projects/new">
            <Button>Create Your First Project</Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <Card key={project._id?.toString()} className="flex flex-col overflow-hidden">
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
              <span>{project.teamMembers.length} member{project.teamMembers.length !== 1 ? 's' : ''}</span>
            </div>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Link href={`/projects/${project._id}`} className="flex-1">
              <Button variant="outline" size="sm" className="w-full">
                <Eye className="h-4 w-4 mr-2" />
                View
              </Button>
            </Link>
            <Link href={`/projects/${project._id}/edit`}>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4" />
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDelete(project._id!.toString())}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
