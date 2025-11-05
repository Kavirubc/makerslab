'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { X, Upload, Loader2 } from 'lucide-react'
import { TeamMemberSelector } from './team-member-selector'
import { MarkdownEditor } from './markdown-editor'
import {
  uploadFile,
  validateImageFile,
} from '@/lib/firebase-client'

const CATEGORIES = [
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

interface TeamMember {
  name: string
  email: string
  role: string
  indexNumber?: string
  userId?: string
}

interface ProjectEditFormProps {
  project: any
}

export function ProjectEditForm({ project }: ProjectEditFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [uploadProgress, setUploadProgress] = useState('')

  // Form state
  const [title, setTitle] = useState(project.title || '')
  const [description, setDescription] = useState(project.description || '')
  const [category, setCategory] = useState(project.category || '')
  const [tags, setTags] = useState<string[]>(project.tags || [])
  const [tagInput, setTagInput] = useState('')

  const [thumbnail, setThumbnail] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(
    project.thumbnailUrl || null
  )

  const [slidesDeckUrl, setSlidesDeckUrl] = useState(project.slidesDeckUrl || '')
  const [pitchVideoUrl, setPitchVideoUrl] = useState(project.pitchVideoUrl || '')
  const [demoUrl, setDemoUrl] = useState(project.demoUrl || '')
  const [githubUrl, setGithubUrl] = useState(project.githubUrl || '')

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(project.teamMembers || [])

  const [status, setStatus] = useState<'completed' | 'in-progress'>(project.status || 'completed')
  const [isPublic, setIsPublic] = useState(project.isPublic !== false)

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleThumbnailChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file
    const validation = validateImageFile(file)
    if (!validation.valid) {
      setError(validation.error || 'Invalid image file')
      return
    }

    setThumbnail(file)
    setThumbnailPreview(URL.createObjectURL(file))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      let thumbnailUrl = project.thumbnailUrl

      // Upload thumbnail if changed
      if (thumbnail) {
        setUploadProgress('Uploading thumbnail...')
        const fileName = `project_${Date.now()}.${thumbnail.name.split('.').pop()}`
        thumbnailUrl = await uploadFile(thumbnail, 'project-thumbnails', fileName)
      }

      setUploadProgress('Updating project...')

      const response = await fetch(`/api/projects/${project._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          category,
          tags,
          thumbnailUrl: thumbnailUrl || undefined,
          slidesDeckUrl: slidesDeckUrl || undefined,
          pitchVideoUrl: pitchVideoUrl || undefined,
          demoUrl: demoUrl || undefined,
          githubUrl: githubUrl || undefined,
          teamMembers,
          status,
          isPublic
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update project')
      }

      router.push(`/projects/${project._id}`)
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
      setUploadProgress('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      {error && (
        <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/50 rounded-md">
          {error}
        </div>
      )}

      {uploadProgress && (
        <div className="p-3 text-sm text-primary bg-primary/10 border border-primary/20 rounded-md flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          {uploadProgress}
        </div>
      )}

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Project Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Smart Attendance System"
              required
              disabled={isLoading}
            />
          </div>

          <MarkdownEditor
            label="Description"
            value={description}
            onChange={setDescription}
            placeholder="Describe your project, its purpose, key features, and technologies used..."
            required
            disabled={isLoading}
          />

          <div className="space-y-2">
            <Label>Project Thumbnail</Label>
            <div className="flex items-start gap-4">
              {thumbnailPreview && (
                <div className="relative w-40 h-24 rounded-lg overflow-hidden border">
                  <img
                    src={thumbnailPreview}
                    alt="Thumbnail preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1">
                <Input
                  id="thumbnail"
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                  disabled={isLoading}
                  className="hidden"
                />
                <label htmlFor="thumbnail">
                  <Button type="button" variant="outline" disabled={isLoading} asChild>
                    <span>
                      <Upload className="h-4 w-4 mr-2" />
                      {thumbnailPreview ? 'Change Thumbnail' : 'Upload Thumbnail'}
                    </span>
                  </Button>
                </label>
                <p className="text-xs text-muted-foreground mt-2">
                  Recommended: 16:9 aspect ratio, max 2MB. PNG, JPG accepted.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={category} onValueChange={setCategory} required disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select value={status} onValueChange={(v: any) => setStatus(v)} disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Technologies/Tags</Label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="React, Node.js, MongoDB..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddTag()
                  }
                }}
                disabled={isLoading}
              />
              <Button type="button" onClick={handleAddTag} disabled={isLoading}>
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => handleRemoveTag(tag)}
                  />
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <h3 className="font-semibold">Project Links</h3>

          <div className="space-y-2">
            <Label htmlFor="slidesDeckUrl">Slides Deck URL</Label>
            <Input
              id="slidesDeckUrl"
              type="url"
              value={slidesDeckUrl}
              onChange={(e) => setSlidesDeckUrl(e.target.value)}
              placeholder="https://docs.google.com/presentation/..."
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pitchVideoUrl">Pitch Video URL</Label>
            <Input
              id="pitchVideoUrl"
              type="url"
              value={pitchVideoUrl}
              onChange={(e) => setPitchVideoUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="demoUrl">Live Demo URL</Label>
            <Input
              id="demoUrl"
              type="url"
              value={demoUrl}
              onChange={(e) => setDemoUrl(e.target.value)}
              placeholder="https://your-project.vercel.app"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="githubUrl">GitHub Repository</Label>
            <Input
              id="githubUrl"
              type="url"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="https://github.com/username/repo"
              disabled={isLoading}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <h3 className="font-semibold">Team Members</h3>
          <p className="text-sm text-muted-foreground">
            Add your team members by searching for registered users or entering their details manually
          </p>

          <TeamMemberSelector
            teamMembers={teamMembers}
            onChange={setTeamMembers}
            disabled={isLoading}
          />
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading ? 'Updating...' : 'Update Project'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
