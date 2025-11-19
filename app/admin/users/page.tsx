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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { User, Search, Ban, UserCheck, Edit, Trash2, Eye, Award } from 'lucide-react'
import Link from 'next/link'
import { useNotification } from '@/lib/hooks/use-notification'
import { ContributorBadge } from '@/components/contributor-badge'

interface UserData {
  _id: string
  name: string
  email: string
  indexNumber: string
  registrationNumber: string
  role: 'user' | 'admin'
  isBanned: boolean
  bannedAt?: Date | null
  bannedReason?: string | null
  contributorType?: 'contributor' | 'core-contributor' | null
  createdAt: Date
}

export default function AdminUsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [bannedFilter, setBannedFilter] = useState('all')
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [banDialogOpen, setBanDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [contributorDialogOpen, setContributorDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
  const [banReason, setBanReason] = useState('')
  const { success, error: showError } = useNotification()

  useEffect(() => {
    fetchUsers()
  }, [page, search, roleFilter, bannedFilter])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      })
      if (search) params.append('search', search)
      if (roleFilter && roleFilter !== 'all') params.append('role', roleFilter)
      if (bannedFilter && bannedFilter !== 'all') params.append('isBanned', bannedFilter)

      const response = await fetch(`/api/admin/users?${params}`)
      if (response.status === 401 || response.status === 403) {
        router.push('/dashboard')
        return
      }

      if (!response.ok) {
        console.error('Failed to fetch users:', response.statusText)
        setUsers([])
        setTotalPages(1)
        return
      }

      const data = await response.json()

      if (data.error) {
        console.error('Error from API:', data.error)
        setUsers([])
        setTotalPages(1)
        return
      }

      setUsers(data.users || [])
      setTotalPages(data.pagination?.totalPages || 1)
    } catch (error) {
      console.error('Error fetching users:', error)
      setUsers([])
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }

  const handleBan = async (user: UserData, ban: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${user._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isBanned: ban,
          bannedReason: ban ? banReason : null,
        }),
      })

      if (response.ok) {
        success(`User ${ban ? 'banned' : 'unbanned'} successfully`)
        fetchUsers()
        setBanDialogOpen(false)
        setBanReason('')
        setSelectedUser(null)
      } else {
        const data = await response.json()
        throw new Error(data.error || `Failed to ${ban ? 'ban' : 'unban'} user`)
      }
    } catch (error: any) {
      console.error('Error banning user:', error)
      showError(error.message || `Failed to ${ban ? 'ban' : 'unban'} user`)
    }
  }

  const handleDelete = async (user: UserData) => {
    try {
      const response = await fetch(`/api/admin/users/${user._id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        success('User deleted successfully')
        fetchUsers()
        setDeleteDialogOpen(false)
        setSelectedUser(null)
      } else {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete user')
      }
    } catch (error: any) {
      console.error('Error deleting user:', error)
      showError(error.message || 'Failed to delete user')
    }
  }

  const handleUpdateRole = async (user: UserData, newRole: 'user' | 'admin') => {
    try {
      const response = await fetch(`/api/admin/users/${user._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      })

      if (response.ok) {
        success(`User role updated to ${newRole} successfully`)
        fetchUsers()
        setEditDialogOpen(false)
        setSelectedUser(null)
      } else {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update user role')
      }
    } catch (error: any) {
      console.error('Error updating user:', error)
      showError(error.message || 'Failed to update user role')
    }
  }

  const handleUpdateContributor = async (user: UserData, contributorType: 'contributor' | 'core-contributor' | null) => {
    try {
      const response = await fetch(`/api/admin/users/${user._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contributorType }),
      })

      if (response.ok) {
        const message = contributorType === null 
          ? 'Contributor status removed successfully'
          : contributorType === 'core-contributor'
          ? 'User added as core contributor successfully'
          : 'User added as contributor successfully'
        success(message)
        fetchUsers()
        setContributorDialogOpen(false)
        setSelectedUser(null)
      } else {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update contributor status')
      }
    } catch (error: any) {
      console.error('Error updating contributor:', error)
      showError(error.message || 'Failed to update contributor status')
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">User Management</h1>
        <p className="text-muted-foreground">Manage users, ban/unban accounts, and view user details</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or index..."
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
              <Label>Role</Label>
              <Select value={roleFilter} onValueChange={(value) => {
                setRoleFilter(value)
                setPage(1)
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="All roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All roles</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Ban Status</Label>
              <Select value={bannedFilter} onValueChange={(value) => {
                setBannedFilter(value)
                setPage(1)
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="All users" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All users</SelectItem>
                  <SelectItem value="false">Not banned</SelectItem>
                  <SelectItem value="true">Banned</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            {loading ? 'Loading...' : `${users.length} user${users.length !== 1 ? 's' : ''} found`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No users found</div>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Name</th>
                      <th className="text-left p-2">Email</th>
                      <th className="text-left p-2">Index Number</th>
                      <th className="text-left p-2">Role</th>
                      <th className="text-left p-2">Status</th>
                      <th className="text-left p-2">Contributor</th>
                      <th className="text-left p-2">Created</th>
                      <th className="text-right p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user._id} className="border-b">
                        <td className="p-2">{user.name}</td>
                        <td className="p-2">{user.email}</td>
                        <td className="p-2">{user.indexNumber}</td>
                        <td className="p-2">
                          <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                            {user.role}
                          </Badge>
                        </td>
                        <td className="p-2">
                          {user.isBanned ? (
                            <Badge variant="destructive">Banned</Badge>
                          ) : (
                            <Badge variant="outline">Active</Badge>
                          )}
                        </td>
                        <td className="p-2">
                          {user.contributorType ? (
                            <ContributorBadge
                              contributorType={user.contributorType}
                              className="text-[10px] px-2 py-0.5"
                            />
                          ) : (
                            <Badge variant="outline">-</Badge>
                          )}
                        </td>
                        <td className="p-2 text-sm text-muted-foreground">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-2">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/profile/${user._id}`}>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user)
                                setContributorDialogOpen(true)
                              }}
                              title="Manage Contributor Status"
                            >
                              <Award className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user)
                                setEditDialogOpen(true)
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {user.isBanned ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedUser(user)
                                  handleBan(user, false)
                                }}
                              >
                                <UserCheck className="h-4 w-4" />
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedUser(user)
                                  setBanDialogOpen(true)
                                }}
                              >
                                <Ban className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user)
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

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user role for {selectedUser?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={selectedUser?.role}
                onValueChange={(value) => {
                  if (selectedUser) {
                    handleUpdateRole(selectedUser, value as 'user' | 'admin')
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Ban Dialog */}
      <Dialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ban User</DialogTitle>
            <DialogDescription>
              Ban {selectedUser?.name} from the platform
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Reason (optional)</Label>
              <Textarea
                placeholder="Enter reason for ban..."
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBanDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (selectedUser) {
                  handleBan(selectedUser, true)
                }
              }}
            >
              Ban User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedUser?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (selectedUser) {
                  handleDelete(selectedUser)
                }
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Contributor Management Dialog */}
      <Dialog open={contributorDialogOpen} onOpenChange={setContributorDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Contributor Status</DialogTitle>
            <DialogDescription>
              Update contributor status for {selectedUser?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Contributor Type</Label>
              <Select
                value={selectedUser?.contributorType || 'none'}
                onValueChange={(value) => {
                  if (selectedUser) {
                    const contributorType = value === 'none' ? null : value as 'contributor' | 'core-contributor'
                    handleUpdateContributor(selectedUser, contributorType)
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Not a Contributor</SelectItem>
                  <SelectItem value="contributor">Contributor</SelectItem>
                  <SelectItem value="core-contributor">Core Contributor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {selectedUser?.contributorType && (
              <div className="text-sm text-muted-foreground">
                Current status: <Badge variant={selectedUser.contributorType === 'core-contributor' ? 'default' : 'secondary'}>
                  {selectedUser.contributorType === 'core-contributor' ? 'Core Contributor' : 'Contributor'}
                </Badge>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setContributorDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

