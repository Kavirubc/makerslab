'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Building2, Plus, Edit, Trash2, Check, X, AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface UniversityData {
  _id: string
  name: string
  district: string
  province: string
  emailDomain: string
  createdAt: Date
  userCount?: number
}

interface UniversityRequestData {
  _id: string
  userId: string
  name: string
  district: string
  province: string
  emailDomain: string
  status: 'pending' | 'approved' | 'rejected'
  reason?: string | null
  adminNotes?: string | null
  createdAt: Date
}

export default function AdminUniversitiesPage() {
  const router = useRouter()
  const [universities, setUniversities] = useState<UniversityData[]>([])
  const [requests, setRequests] = useState<UniversityRequestData[]>([])
  const [loading, setLoading] = useState(true)
  const [requestsLoading, setRequestsLoading] = useState(true)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [requestDialogOpen, setRequestDialogOpen] = useState(false)
  const [selectedUniversity, setSelectedUniversity] = useState<UniversityData | null>(null)
  const [selectedRequest, setSelectedRequest] = useState<UniversityRequestData | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    district: '',
    province: '',
    emailDomain: ''
  })
  const [adminNotes, setAdminNotes] = useState('')

  useEffect(() => {
    fetchUniversities()
    fetchRequests()
  }, [])

  const fetchUniversities = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/universities')
      if (response.status === 401 || response.status === 403) {
        router.push('/dashboard')
        return
      }
      const data = await response.json()
      setUniversities(data.universities)
    } catch (error) {
      console.error('Error fetching universities:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRequests = async () => {
    setRequestsLoading(true)
    try {
      const response = await fetch('/api/admin/universities/requests')
      if (response.status === 401 || response.status === 403) {
        return
      }
      const data = await response.json()
      setRequests(data.requests || [])
    } catch (error) {
      console.error('Error fetching requests:', error)
    } finally {
      setRequestsLoading(false)
    }
  }

  const handleAdd = async () => {
    try {
      const response = await fetch('/api/admin/universities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        fetchUniversities()
        setAddDialogOpen(false)
        setFormData({ name: '', district: '', province: '', emailDomain: '' })
      }
    } catch (error) {
      console.error('Error adding university:', error)
    }
  }

  const handleUpdate = async () => {
    if (!selectedUniversity) return

    try {
      const response = await fetch(`/api/admin/universities/${selectedUniversity._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        fetchUniversities()
        setEditDialogOpen(false)
        setSelectedUniversity(null)
        setFormData({ name: '', district: '', province: '', emailDomain: '' })
      }
    } catch (error) {
      console.error('Error updating university:', error)
    }
  }

  const handleDelete = async (university: UniversityData) => {
    try {
      const response = await fetch(`/api/admin/universities/${university._id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchUniversities()
        setDeleteDialogOpen(false)
        setSelectedUniversity(null)
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to delete university')
      }
    } catch (error) {
      console.error('Error deleting university:', error)
    }
  }

  const handleRequestAction = async (request: UniversityRequestData, action: 'approve' | 'reject') => {
    try {
      const response = await fetch('/api/admin/universities/requests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: request._id,
          action,
          adminNotes: adminNotes || null
        }),
      })

      if (response.ok) {
        fetchRequests()
        fetchUniversities()
        setRequestDialogOpen(false)
        setSelectedRequest(null)
        setAdminNotes('')
      }
    } catch (error) {
      console.error('Error processing request:', error)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-900">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">University Management</h1>
            <p className="text-muted-foreground">Add, edit, and manage universities and their email domains</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => {
              setFormData({ name: '', district: '', province: '', emailDomain: '' })
              setAddDialogOpen(true)
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Add University
            </Button>
            <Link href="/admin">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>
        </div>

        {/* Pending Requests */}
        {requests.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Pending University Requests
              </CardTitle>
              <CardDescription>Review and approve/reject university requests from users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {requests.map((request) => (
                  <div key={request._id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{request.name}</h3>
                        <Badge variant="secondary">Pending</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p><strong>Email Domain:</strong> {request.emailDomain}</p>
                        <p><strong>Location:</strong> {request.district}, {request.province}</p>
                        {request.reason && <p><strong>Reason:</strong> {request.reason}</p>}
                        <p><strong>Requested:</strong> {new Date(request.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedRequest(request)
                          setRequestDialogOpen(true)
                        }}
                      >
                        Review
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Universities List */}
        <Card>
          <CardHeader>
            <CardTitle>Universities</CardTitle>
            <CardDescription>
              {loading ? 'Loading...' : `${universities.length} universit${universities.length !== 1 ? 'ies' : 'y'}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : universities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No universities found</div>
            ) : (
              <div className="space-y-4">
                {universities.map((university) => (
                  <div key={university._id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{university.name}</h3>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p><strong>Email Domain:</strong> {university.emailDomain}</p>
                        <p><strong>Location:</strong> {university.district}, {university.province}</p>
                        <p><strong>Created:</strong> {new Date(university.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedUniversity(university)
                          setFormData({
                            name: university.name,
                            district: university.district,
                            province: university.province,
                            emailDomain: university.emailDomain
                          })
                          setEditDialogOpen(true)
                        }}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedUniversity(university)
                          setDeleteDialogOpen(true)
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Dialog */}
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add University</DialogTitle>
              <DialogDescription>Add a new university to the platform</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="University of Colombo School of Computing"
                />
              </div>
              <div className="space-y-2">
                <Label>Email Domain</Label>
                <Input
                  value={formData.emailDomain}
                  onChange={(e) => setFormData({ ...formData, emailDomain: e.target.value })}
                  placeholder="ucsc.cmb.ac.lk"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>District</Label>
                  <Input
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    placeholder="Colombo"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Province</Label>
                  <Input
                    value={formData.province}
                    onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                    placeholder="Western"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAdd}>Add University</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit University</DialogTitle>
              <DialogDescription>Update university information</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Email Domain</Label>
                <Input
                  value={formData.emailDomain}
                  onChange={(e) => setFormData({ ...formData, emailDomain: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>District</Label>
                  <Input
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Province</Label>
                  <Input
                    value={formData.province}
                    onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdate}>Update University</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete University</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{selectedUniversity?.name}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (selectedUniversity) {
                    handleDelete(selectedUniversity)
                  }
                }}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Request Review Dialog */}
        <Dialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Review University Request</DialogTitle>
              <DialogDescription>
                Review and approve or reject the university request
              </DialogDescription>
            </DialogHeader>
            {selectedRequest && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>University Name</Label>
                  <p className="text-sm">{selectedRequest.name}</p>
                </div>
                <div className="space-y-2">
                  <Label>Email Domain</Label>
                  <p className="text-sm">{selectedRequest.emailDomain}</p>
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <p className="text-sm">{selectedRequest.district}, {selectedRequest.province}</p>
                </div>
                {selectedRequest.reason && (
                  <div className="space-y-2">
                    <Label>Reason</Label>
                    <p className="text-sm">{selectedRequest.reason}</p>
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Admin Notes (optional)</Label>
                  <Textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add notes about this request..."
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setRequestDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (selectedRequest) {
                    handleRequestAction(selectedRequest, 'reject')
                  }
                }}
              >
                <X className="h-4 w-4 mr-2" />
                Reject
              </Button>
              <Button
                onClick={() => {
                  if (selectedRequest) {
                    handleRequestAction(selectedRequest, 'approve')
                  }
                }}
              >
                <Check className="h-4 w-4 mr-2" />
                Approve
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

