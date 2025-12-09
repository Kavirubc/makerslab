'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { BookOpen, Plus, Edit, Trash2, Search, Check, X, Clock, User, ExternalLink } from 'lucide-react'
import { useNotification } from '@/lib/hooks/use-notification'
import Link from 'next/link'

interface UniversityData {
  _id: string
  name: string
}

interface CourseData {
  _id: string
  universityId: string
  code: string
  name: string
  year?: number
  department?: string
  isActive: boolean
  createdAt: Date
  university?: UniversityData
}

interface CourseRequestData {
  _id: string
  code: string
  name: string
  year?: number
  department?: string
  status: 'pending' | 'approved' | 'rejected'
  adminNote?: string
  createdAt: string
  user?: {
    _id: string
    name: string
    email: string
  }
  university?: {
    _id: string
    name: string
  }
  project?: {
    _id: string
    title: string
  }
}

export default function AdminCoursesPage() {
  const router = useRouter()
  const [courses, setCourses] = useState<CourseData[]>([])
  const [universities, setUniversities] = useState<UniversityData[]>([])
  const [loading, setLoading] = useState(true)
  const [filterUniversity, setFilterUniversity] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')

  // Requests state
  const [requests, setRequests] = useState<CourseRequestData[]>([])
  const [requestCounts, setRequestCounts] = useState({ pending: 0, approved: 0, rejected: 0 })
  const [requestsLoading, setRequestsLoading] = useState(true)
  const [requestFilter, setRequestFilter] = useState<string>('pending')

  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<CourseData | null>(null)

  // Request review dialog
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<CourseRequestData | null>(null)
  const [reviewFormData, setReviewFormData] = useState({
    code: '',
    name: '',
    year: '',
    department: '',
    adminNote: '',
  })

  // Form state
  const [formData, setFormData] = useState({
    universityId: '',
    code: '',
    name: '',
    year: '',
    department: '',
  })

  const { success, error: showError } = useNotification()

  useEffect(() => {
    fetchUniversities()
    fetchRequests()
  }, [])

  useEffect(() => {
    fetchCourses()
  }, [filterUniversity])

  useEffect(() => {
    fetchRequests()
  }, [requestFilter])

  const fetchUniversities = async () => {
    try {
      const response = await fetch('/api/admin/universities')
      if (response.status === 401 || response.status === 403) {
        router.push('/dashboard')
        return
      }
      const data = await response.json()
      setUniversities(data.universities || [])
    } catch (error) {
      console.error('Error fetching universities:', error)
    }
  }

  const fetchCourses = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterUniversity) {
        params.append('universityId', filterUniversity)
      }

      const response = await fetch(`/api/admin/courses?${params}`)
      if (response.status === 401 || response.status === 403) {
        router.push('/dashboard')
        return
      }
      const data = await response.json()
      setCourses(data.courses || [])
    } catch (error) {
      console.error('Error fetching courses:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRequests = async () => {
    setRequestsLoading(true)
    try {
      const params = new URLSearchParams()
      if (requestFilter && requestFilter !== 'all') {
        params.append('status', requestFilter)
      }

      const response = await fetch(`/api/admin/courses/requests?${params}`)
      if (response.ok) {
        const data = await response.json()
        setRequests(data.requests || [])
        setRequestCounts(data.counts || { pending: 0, approved: 0, rejected: 0 })
      }
    } catch (error) {
      console.error('Error fetching requests:', error)
    } finally {
      setRequestsLoading(false)
    }
  }

  const handleAdd = async () => {
    try {
      const response = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        success('Course added successfully')
        fetchCourses()
        setAddDialogOpen(false)
        resetForm()
      } else {
        const data = await response.json()
        throw new Error(data.error || 'Failed to add course')
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to add course'
      showError(message)
    }
  }

  const handleUpdate = async () => {
    if (!selectedCourse) return

    try {
      const response = await fetch(`/api/admin/courses/${selectedCourse._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        success('Course updated successfully')
        fetchCourses()
        setEditDialogOpen(false)
        setSelectedCourse(null)
        resetForm()
      } else {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update course')
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to update course'
      showError(message)
    }
  }

  const handleDelete = async () => {
    if (!selectedCourse) return

    try {
      const response = await fetch(`/api/admin/courses/${selectedCourse._id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        success('Course deleted successfully')
        fetchCourses()
        setDeleteDialogOpen(false)
        setSelectedCourse(null)
      } else {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete course')
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to delete course'
      showError(message)
    }
  }

  const handleApproveRequest = async () => {
    if (!selectedRequest) return

    try {
      const response = await fetch(`/api/admin/courses/requests/${selectedRequest._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'approve',
          code: reviewFormData.code,
          name: reviewFormData.name,
          year: reviewFormData.year,
          department: reviewFormData.department,
          adminNote: reviewFormData.adminNote,
        }),
      })

      if (response.ok) {
        success('Course request approved and course added to catalog')
        fetchRequests()
        fetchCourses()
        setReviewDialogOpen(false)
        setSelectedRequest(null)
      } else {
        const data = await response.json()
        throw new Error(data.error || 'Failed to approve request')
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to approve request'
      showError(message)
    }
  }

  const handleRejectRequest = async () => {
    if (!selectedRequest) return

    if (!reviewFormData.adminNote.trim()) {
      showError('Please provide a reason for rejection')
      return
    }

    try {
      const response = await fetch(`/api/admin/courses/requests/${selectedRequest._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reject',
          adminNote: reviewFormData.adminNote,
        }),
      })

      if (response.ok) {
        success('Course request rejected')
        fetchRequests()
        setReviewDialogOpen(false)
        setSelectedRequest(null)
      } else {
        const data = await response.json()
        throw new Error(data.error || 'Failed to reject request')
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to reject request'
      showError(message)
    }
  }

  const resetForm = () => {
    setFormData({
      universityId: '',
      code: '',
      name: '',
      year: '',
      department: '',
    })
  }

  const openEditDialog = (course: CourseData) => {
    setSelectedCourse(course)
    setFormData({
      universityId: course.universityId,
      code: course.code,
      name: course.name,
      year: course.year?.toString() || '',
      department: course.department || '',
    })
    setEditDialogOpen(true)
  }

  const openReviewDialog = (request: CourseRequestData) => {
    setSelectedRequest(request)
    setReviewFormData({
      code: request.code,
      name: request.name,
      year: request.year?.toString() || '',
      department: request.department || '',
      adminNote: '',
    })
    setReviewDialogOpen(true)
  }

  // Filter courses by search query
  const filteredCourses = courses.filter(
    (course) =>
      course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.department?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Group courses by university
  const coursesByUniversity = filteredCourses.reduce((acc, course) => {
    const uniName = course.university?.name || 'Unknown University'
    if (!acc[uniName]) {
      acc[uniName] = []
    }
    acc[uniName].push(course)
    return acc
  }, {} as Record<string, CourseData[]>)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Course Management</h1>
          <p className="text-muted-foreground">
            Manage course codes and review user requests
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm()
            setAddDialogOpen(true)
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Course
        </Button>
      </div>

      <Tabs defaultValue="courses" className="space-y-6">
        <TabsList>
          <TabsTrigger value="courses" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Courses
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Requests
            {requestCounts.pending > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 min-w-5 px-1.5 text-xs">
                {requestCounts.pending}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Courses Tab */}
        <TabsContent value="courses" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search courses..."
                      className="pl-9"
                    />
                  </div>
                </div>
                <Select value={filterUniversity || 'all'} onValueChange={(v) => setFilterUniversity(v === 'all' ? '' : v)}>
                  <SelectTrigger className="w-full sm:w-[250px]">
                    <SelectValue placeholder="All Universities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Universities</SelectItem>
                    {universities.map((uni) => (
                      <SelectItem key={uni._id} value={uni._id}>
                        {uni.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Courses List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Courses
              </CardTitle>
              <CardDescription>
                {loading
                  ? 'Loading...'
                  : `${filteredCourses.length} course${filteredCourses.length !== 1 ? 's' : ''}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : filteredCourses.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No courses found. Add courses for universities to get started.
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(coursesByUniversity).map(([uniName, uniCourses]) => (
                    <div key={uniName}>
                      <h3 className="font-semibold text-lg mb-3 text-muted-foreground">
                        {uniName}
                      </h3>
                      <div className="space-y-2">
                        {uniCourses.map((course) => (
                          <div
                            key={course._id}
                            className="flex items-center justify-between p-4 border rounded-lg"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-mono font-semibold">
                                  {course.code}
                                </span>
                                <span className="text-muted-foreground">-</span>
                                <span>{course.name}</span>
                                {!course.isActive && (
                                  <Badge variant="secondary">Inactive</Badge>
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground flex gap-4">
                                {course.year && <span>Year {course.year}</span>}
                                {course.department && (
                                  <span>{course.department}</span>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditDialog(course)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedCourse(course)
                                  setDeleteDialogOpen(true)
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Requests Tab */}
        <TabsContent value="requests" className="space-y-6">
          {/* Request Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={requestFilter === 'pending' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setRequestFilter('pending')}
                >
                  <Clock className="h-4 w-4 mr-1" />
                  Pending ({requestCounts.pending})
                </Button>
                <Button
                  variant={requestFilter === 'approved' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setRequestFilter('approved')}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Approved ({requestCounts.approved})
                </Button>
                <Button
                  variant={requestFilter === 'rejected' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setRequestFilter('rejected')}
                >
                  <X className="h-4 w-4 mr-1" />
                  Rejected ({requestCounts.rejected})
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Requests List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Course Requests
              </CardTitle>
              <CardDescription>
                {requestsLoading
                  ? 'Loading...'
                  : `${requests.length} request${requests.length !== 1 ? 's' : ''}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {requestsLoading ? (
                <div className="text-center py-8">Loading...</div>
              ) : requests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No {requestFilter !== 'all' ? requestFilter : ''} requests found.
                </div>
              ) : (
                <div className="space-y-4">
                  {requests.map((request) => (
                    <div
                      key={request._id}
                      className="p-4 border rounded-lg space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono font-semibold text-lg">
                              {request.code}
                            </span>
                            {request.name && (
                              <>
                                <span className="text-muted-foreground">-</span>
                                <span>{request.name}</span>
                              </>
                            )}
                            <Badge
                              variant={
                                request.status === 'pending'
                                  ? 'secondary'
                                  : request.status === 'approved'
                                  ? 'default'
                                  : 'destructive'
                              }
                            >
                              {request.status}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground flex flex-wrap gap-4">
                            {request.year && <span>Year {request.year}</span>}
                            {request.department && <span>{request.department}</span>}
                            {request.university && (
                              <span className="flex items-center gap-1">
                                <BookOpen className="h-3 w-3" />
                                {request.university.name}
                              </span>
                            )}
                          </div>
                        </div>
                        {request.status === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => openReviewDialog(request)}
                          >
                            Review
                          </Button>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm">
                        {request.user && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <User className="h-3 w-3" />
                            {request.user.name} ({request.user.email})
                          </div>
                        )}
                        {request.project && (
                          <Link
                            href={`/projects/${request.project._id}`}
                            className="flex items-center gap-1 text-primary hover:underline"
                          >
                            <ExternalLink className="h-3 w-3" />
                            {request.project.title}
                          </Link>
                        )}
                        <span className="text-muted-foreground">
                          {new Date(request.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      {request.adminNote && (
                        <div className="text-sm bg-muted p-2 rounded">
                          <span className="font-medium">Admin note:</span> {request.adminNote}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Course</DialogTitle>
            <DialogDescription>
              Add a new course code for a university
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>University *</Label>
              <Select
                value={formData.universityId}
                onValueChange={(v) =>
                  setFormData({ ...formData, universityId: v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select university" />
                </SelectTrigger>
                <SelectContent>
                  {universities.map((uni) => (
                    <SelectItem key={uni._id} value={uni._id}>
                      {uni.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Course Code *</Label>
                <Input
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                  placeholder="SCS2201"
                />
              </div>
              <div className="space-y-2">
                <Label>Year Level</Label>
                <Select
                  value={formData.year || 'none'}
                  onValueChange={(v) => setFormData({ ...formData, year: v === 'none' ? '' : v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Not specified</SelectItem>
                    <SelectItem value="1">Year 1</SelectItem>
                    <SelectItem value="2">Year 2</SelectItem>
                    <SelectItem value="3">Year 3</SelectItem>
                    <SelectItem value="4">Year 4</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Course Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Database Management Systems"
              />
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Input
                value={formData.department}
                onChange={(e) =>
                  setFormData({ ...formData, department: e.target.value })
                }
                placeholder="Computer Science"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAdd}
              disabled={!formData.universityId || !formData.code || !formData.name}
            >
              Add Course
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Course</DialogTitle>
            <DialogDescription>Update course information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Course Code *</Label>
                <Input
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Year Level</Label>
                <Select
                  value={formData.year || 'none'}
                  onValueChange={(v) => setFormData({ ...formData, year: v === 'none' ? '' : v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Not specified</SelectItem>
                    <SelectItem value="1">Year 1</SelectItem>
                    <SelectItem value="2">Year 2</SelectItem>
                    <SelectItem value="3">Year 3</SelectItem>
                    <SelectItem value="4">Year 4</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Course Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Input
                value={formData.department}
                onChange={(e) =>
                  setFormData({ ...formData, department: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={!formData.code || !formData.name}
            >
              Update Course
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Course</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{selectedCourse?.code} -{' '}
              {selectedCourse?.name}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Request Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Review Course Request</DialogTitle>
            <DialogDescription>
              Review and approve or reject this course request. You can edit the details before approving.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedRequest?.user && (
              <div className="text-sm text-muted-foreground">
                Requested by: <span className="font-medium text-foreground">{selectedRequest.user.name}</span>
                {selectedRequest.university && (
                  <> from <span className="font-medium text-foreground">{selectedRequest.university.name}</span></>
                )}
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Course Code *</Label>
                <Input
                  value={reviewFormData.code}
                  onChange={(e) =>
                    setReviewFormData({ ...reviewFormData, code: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Year Level</Label>
                <Select
                  value={reviewFormData.year || 'none'}
                  onValueChange={(v) => setReviewFormData({ ...reviewFormData, year: v === 'none' ? '' : v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Not specified</SelectItem>
                    <SelectItem value="1">Year 1</SelectItem>
                    <SelectItem value="2">Year 2</SelectItem>
                    <SelectItem value="3">Year 3</SelectItem>
                    <SelectItem value="4">Year 4</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Course Name *</Label>
              <Input
                value={reviewFormData.name}
                onChange={(e) =>
                  setReviewFormData({ ...reviewFormData, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Input
                value={reviewFormData.department}
                onChange={(e) =>
                  setReviewFormData({ ...reviewFormData, department: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Admin Note (required for rejection)</Label>
              <Textarea
                value={reviewFormData.adminNote}
                onChange={(e) =>
                  setReviewFormData({ ...reviewFormData, adminNote: e.target.value })
                }
                placeholder="Add a note about your decision..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRejectRequest}>
              <X className="h-4 w-4 mr-1" />
              Reject
            </Button>
            <Button onClick={handleApproveRequest} disabled={!reviewFormData.code || !reviewFormData.name}>
              <Check className="h-4 w-4 mr-1" />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
