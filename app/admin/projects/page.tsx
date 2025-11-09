'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Search, Edit, Trash2, Eye } from 'lucide-react'
import Link from 'next/link'

interface ProjectData {
  _id: string
  title: string
  description: string
  category: string
  status: 'completed' | 'in-progress' | 'archived'
  views: number
  isPublic: boolean
  createdAt: Date
  creator?: {
    name: string
    email: string
  }
}

export default function AdminProjectsPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<ProjectData[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null)

  useEffect(() => {
    fetchProjects()
  }, [page, search, categoryFilter, statusFilter])

  const fetchProjects = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      })
      if (search) params.append('search', search)
      if (categoryFilter && categoryFilter !== 'all') params.append('category', categoryFilter)
      if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter)

      const response = await fetch(`/api/admin/projects?${params}`)
      if (response.status === 401 || response.status === 403) {
        router.push('/dashboard')
        return
      }
      
      if (!response.ok) {
        console.error('Failed to fetch projects:', response.statusText)
        setProjects([])
        setTotalPages(1)
        return
      }

      const data = await response.json()
      
      if (data.error) {
        console.error('Error from API:', data.error)
        setProjects([])
        setTotalPages(1)
        return
      }

      setProjects(data.projects || [])
      setTotalPages(data.pagination?.totalPages || 1)
    } catch (error) {
      console.error('Error fetching projects:', error)
      setProjects([])
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (project: ProjectData) => {
    try {
      const response = await fetch(`/api/admin/projects/${project._id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchProjects()
        setDeleteDialogOpen(false)
        setSelectedProject(null)
      }
    } catch (error) {
      console.error('Error deleting project:', error)
    }
  }

  // Get unique categories from projects
  const categories = projects && projects.length > 0
    ? Array.from(new Set(projects.map(p => p.category))).filter(Boolean)
    : []

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-900">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Project Management</h1>
            <p className="text-muted-foreground">View, edit, and delete all projects on the platform</p>
          </div>
          <Link href="/admin">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by title, description, or tags..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value)
                      setPage(1)
                    }}
                    className="pl-8"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select value={categoryFilter} onValueChange={(value) => {
                  setCategoryFilter(value)
                  setPage(1)
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={statusFilter} onValueChange={(value) => {
                  setStatusFilter(value)
                  setPage(1)
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Projects Table */}
        <Card>
          <CardHeader>
            <CardTitle>Projects</CardTitle>
            <CardDescription>
              {loading ? 'Loading...' : `${projects.length} project${projects.length !== 1 ? 's' : ''} found`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : projects.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No projects found</div>
            ) : (
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Title</th>
                        <th className="text-left p-2">Creator</th>
                        <th className="text-left p-2">Category</th>
                        <th className="text-left p-2">Status</th>
                        <th className="text-left p-2">Views</th>
                        <th className="text-left p-2">Visibility</th>
                        <th className="text-left p-2">Created</th>
                        <th className="text-right p-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projects.map((project) => (
                        <tr key={project._id} className="border-b">
                          <td className="p-2">
                            <div className="max-w-xs truncate">{project.title}</div>
                          </td>
                          <td className="p-2">
                            {project.creator ? (
                              <div>
                                <div className="text-sm">{project.creator.name}</div>
                                <div className="text-xs text-muted-foreground">{project.creator.email}</div>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">Unknown</span>
                            )}
                          </td>
                          <td className="p-2">
                            <Badge variant="outline">{project.category}</Badge>
                          </td>
                          <td className="p-2">
                            <Badge
                              variant={
                                project.status === 'completed' ? 'default' :
                                project.status === 'in-progress' ? 'secondary' : 'outline'
                              }
                            >
                              {project.status}
                            </Badge>
                          </td>
                          <td className="p-2">{project.views}</td>
                          <td className="p-2">
                            {project.isPublic ? (
                              <Badge variant="outline">Public</Badge>
                            ) : (
                              <Badge variant="secondary">Private</Badge>
                            )}
                          </td>
                          <td className="p-2 text-sm text-muted-foreground">
                            {new Date(project.createdAt).toLocaleDateString()}
                          </td>
                          <td className="p-2">
                            <div className="flex items-center justify-end gap-2">
                              <Link href={`/projects/${project._id}`}>
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Link href={`/projects/${project._id}/edit`}>
                                <Button variant="ghost" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedProject(project)
                                  setDeleteDialogOpen(true)
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      disabled={page === 1}
                      onClick={() => setPage(page - 1)}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {page} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      disabled={page === totalPages}
                      onClick={() => setPage(page + 1)}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delete Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Project</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{selectedProject?.title}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (selectedProject) {
                    handleDelete(selectedProject)
                  }
                }}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

