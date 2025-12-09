'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Eye, ExternalLink, Github, FileText, Video, Heart, Filter, X } from 'lucide-react'
import Link from 'next/link'
import { Project } from '@/lib/models/Project'
import { ProjectCardSkeleton } from '@/components/ui/project-card-skeleton'
import { Skeleton } from '@/components/ui/skeleton'
import {
  generateAcademicPeriods,
  TEAM_SIZE_OPTIONS,
  ACADEMIC_TYPE_OPTIONS,
} from '@/lib/constants/courses'

const CATEGORIES = [
  'All',
  'Web Development',
  'Mobile App',
  'AI/ML',
  'Data Science',
  'IoT',
  'Game Development',
  'Cybersecurity',
  'Blockchain',
  'Cloud Computing',
  'Other'
]

export function ExploreProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [hasMore, setHasMore] = useState(false)

  // Course/academic filter state
  const [showFilters, setShowFilters] = useState(false)
  const [courseCode, setCourseCode] = useState('')
  const [academicPeriod, setAcademicPeriod] = useState('')
  const [teamSize, setTeamSize] = useState('')
  const [academicType, setAcademicType] = useState('')

  useEffect(() => {
    fetchProjects()
  }, [category, courseCode, academicPeriod, teamSize, academicType])

  const fetchProjects = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (category !== 'All') params.append('category', category)
      if (search) params.append('search', search)
      // Course/academic filters
      if (courseCode) params.append('courseCode', courseCode)
      if (academicPeriod) params.append('academicPeriod', academicPeriod)
      if (teamSize) params.append('teamSize', teamSize)
      if (academicType) params.append('academicType', academicType)

      const response = await fetch(`/api/projects/explore?${params}`)
      const data = await response.json()
      setProjects(data.projects || [])
      setHasMore(data.hasMore || false)
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Check if any filters are active
  const hasActiveFilters = courseCode || academicPeriod || teamSize || academicType

  // Clear all course/academic filters
  const clearFilters = () => {
    setCourseCode('')
    setAcademicPeriod('')
    setTeamSize('')
    setAcademicType('')
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchProjects()
  }



  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4">
           <div className="flex gap-2 flex-1">
             <Skeleton className="h-10 flex-1" />
             <Skeleton className="h-10 w-20" />
           </div>
           <Skeleton className="h-10 w-full sm:w-[200px]" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <ProjectCardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects..."
            className="flex-1"
          />
          <Button type="submit">Search</Button>
        </form>

        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Filter toggle button */}
        <Button
          type="button"
          variant={showFilters ? 'default' : 'outline'}
          onClick={() => setShowFilters(!showFilters)}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
              !
            </Badge>
          )}
        </Button>
      </div>

      {/* Course/Academic Filters Panel */}
      {showFilters && (
        <div className="p-4 bg-muted/50 rounded-lg space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Academic Filters</h3>
            {hasActiveFilters && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-8 text-xs"
              >
                <X className="h-3 w-3 mr-1" />
                Clear filters
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Course Code Filter */}
            <div className="space-y-2">
              <Label className="text-sm">Course Code</Label>
              <Input
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
                placeholder="e.g., SCS2201"
                className="h-9"
              />
            </div>

            {/* Academic Period Filter */}
            <div className="space-y-2">
              <Label className="text-sm">Academic Period</Label>
              <Select value={academicPeriod} onValueChange={setAcademicPeriod}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="All periods" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All periods</SelectItem>
                  {generateAcademicPeriods(5).map((period) => (
                    <SelectItem key={period} value={period}>
                      {period}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Team Size Filter */}
            <div className="space-y-2">
              <Label className="text-sm">Team Size</Label>
              <Select value={teamSize} onValueChange={setTeamSize}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="All sizes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All sizes</SelectItem>
                  {TEAM_SIZE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Academic Type Filter */}
            <div className="space-y-2">
              <Label className="text-sm">Academic Type</Label>
              <Select value={academicType} onValueChange={setAcademicType}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All types</SelectItem>
                  {ACADEMIC_TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {projects.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <p className="text-muted-foreground">
              No projects found. Try adjusting your filters.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card key={project._id?.toString()} className="flex flex-col hover:shadow-lg transition-shadow overflow-hidden">
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
                  <Badge
                    variant={project.status === 'completed' ? 'default' : 'secondary'}
                  >
                    {project.status}
                  </Badge>
                  <Badge variant="outline">{project.category}</Badge>
                </div>
                <CardTitle className="line-clamp-2">{project.title}</CardTitle>
                <CardDescription className="line-clamp-3">
                  {project.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow space-y-4">
                <div className="flex flex-wrap gap-2">
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

                {/* Course/Academic info badges */}
                {(project.courseCode || project.academicPeriod) && (
                  <div className="flex flex-wrap gap-1">
                    {project.courseCode && (
                      <Badge variant="outline" className="text-xs">
                        {project.courseCode}
                      </Badge>
                    )}
                    {project.academicPeriod && (
                      <Badge variant="outline" className="text-xs">
                        {project.academicPeriod}
                      </Badge>
                    )}
                  </div>
                )}

                <div className="flex gap-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {project.views}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Heart className="h-3 w-3" />
                    {project.likes || 0}
                  </span>
                  <span>•</span>
                  <span>
                    {project.teamMembers.length} member
                    {project.teamMembers.length !== 1 ? 's' : ''}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Github className="h-4 w-4" />
                    </a>
                  )}
                  {project.demoUrl && (
                    <a
                      href={project.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                  {project.slidesDeckUrl && (
                    <a
                      href={project.slidesDeckUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <FileText className="h-4 w-4" />
                    </a>
                  )}
                  {project.pitchVideoUrl && (
                    <a
                      href={project.pitchVideoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Video className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </CardContent>
              <div className="p-6 pt-0">
                <Link href={`/projects/${project._id}`}>
                  <Button className="w-full">
                    View Project
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
