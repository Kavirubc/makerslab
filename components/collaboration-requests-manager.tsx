'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  UserPlus,
  Users,
  CheckCircle,
  XCircle,
  Loader2,
  Github,
  Linkedin,
  Mail,
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

interface CollaborationRequest {
  _id: string
  projectId: string
  requesterId: string
  message: string
  skills: string[]
  status: 'pending' | 'accepted' | 'rejected'
  reviewedBy?: string
  reviewerNote?: string
  reviewedAt?: string
  createdAt: string
  updatedAt: string
  requester: {
    _id: string
    name: string
    email: string
    profilePicture?: string
    bio?: string
    github?: string
    linkedin?: string
  }
}

interface CollaborationRequestsManagerProps {
  projectId: string
  projectTitle: string
}

export function CollaborationRequestsManager({
  projectId,
  projectTitle,
}: CollaborationRequestsManagerProps) {
  const router = useRouter()
  const [requests, setRequests] = useState<CollaborationRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<CollaborationRequest | null>(null)
  const [reviewAction, setReviewAction] = useState<'accept' | 'reject'>('accept')
  const [reviewerNote, setReviewerNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchRequests()
  }, [projectId])

  const fetchRequests = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/projects/${projectId}/collaborate`)
      if (response.ok) {
        const data = await response.json()
        setRequests(data.requests || [])
      }
    } catch (error) {
      console.error('Error fetching requests:', error)
      toast.error('Failed to load requests')
    } finally {
      setIsLoading(false)
    }
  }

  const openReviewDialog = (request: CollaborationRequest, action: 'accept' | 'reject') => {
    setSelectedRequest(request)
    setReviewAction(action)
    setReviewerNote('')
    setReviewDialogOpen(true)
  }

  const handleReviewRequest = async () => {
    if (!selectedRequest) return

    setIsSubmitting(true)
    try {
      const response = await fetch(
        `/api/projects/${projectId}/collaborate/${selectedRequest._id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: reviewAction,
            note: reviewerNote.trim() || undefined,
          }),
        }
      )

      const data = await response.json()

      if (response.ok) {
        toast.success(
          reviewAction === 'accept'
            ? 'Request accepted! User added to team.'
            : 'Request declined'
        )
        setReviewDialogOpen(false)
        await fetchRequests()
        router.refresh()
      } else {
        toast.error(data.error || 'Failed to review request')
      }
    } catch (error) {
      console.error('Error reviewing request:', error)
      toast.error('Failed to review request')
    } finally {
      setIsSubmitting(false)
    }
  }

  const pendingRequests = requests.filter((r) => r.status === 'pending')
  const reviewedRequests = requests.filter((r) => r.status !== 'pending')

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Collaboration Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (requests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Collaboration Requests
          </CardTitle>
          <CardDescription>
            Users can request to join your in-progress project
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No requests yet</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Collaboration Requests
            {pendingRequests.length > 0 && (
              <Badge variant="default" className="ml-2">
                {pendingRequests.length} pending
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Review and manage requests to join your project
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {pendingRequests.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Pending Requests</h3>
              {pendingRequests.map((request) => (
                <RequestCard
                  key={request._id}
                  request={request}
                  onAccept={() => openReviewDialog(request, 'accept')}
                  onReject={() => openReviewDialog(request, 'reject')}
                />
              ))}
            </div>
          )}

          {reviewedRequests.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground">
                Previous Requests
              </h3>
              {reviewedRequests.map((request) => (
                <RequestCard key={request._id} request={request} readOnly />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reviewAction === 'accept' ? 'Accept' : 'Decline'} Request
            </DialogTitle>
            <DialogDescription>
              {reviewAction === 'accept'
                ? `${selectedRequest?.requester.name} will be added to your team as a collaborator.`
                : `${selectedRequest?.requester.name} will be notified that their request was declined.`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reviewerNote">
                Note to requester (optional)
              </Label>
              <Textarea
                id="reviewerNote"
                placeholder={
                  reviewAction === 'accept'
                    ? 'Welcome to the team!'
                    : 'Thank you for your interest.'
                }
                value={reviewerNote}
                onChange={(e) => setReviewerNote(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setReviewDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleReviewRequest}
              disabled={isSubmitting}
              variant={reviewAction === 'accept' ? 'default' : 'destructive'}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : reviewAction === 'accept' ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Accept
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  Decline
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

interface RequestCardProps {
  request: CollaborationRequest
  onAccept?: () => void
  onReject?: () => void
  readOnly?: boolean
}

function RequestCard({ request, onAccept, onReject, readOnly }: RequestCardProps) {
  const statusConfig = {
    pending: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', label: 'Pending' },
    accepted: { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', label: 'Accepted' },
    rejected: { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', label: 'Rejected' },
  }

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <Avatar className="h-10 w-10">
            {request.requester.profilePicture ? (
              <img
                src={request.requester.profilePicture}
                alt={request.requester.name}
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                {request.requester.name.charAt(0).toUpperCase()}
              </div>
            )}
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                href={`/profile/${request.requester._id}`}
                className="font-semibold hover:underline"
              >
                {request.requester.name}
              </Link>
              <Badge className={statusConfig[request.status].color}>
                {statusConfig[request.status].label}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {new Date(request.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-sm text-muted-foreground mb-1">Message:</p>
          <p className="text-sm">{request.message}</p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground mb-2">Skills:</p>
          <div className="flex flex-wrap gap-1.5">
            {request.skills.map((skill, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
          </div>
        </div>

        {request.requester.bio && (
          <div>
            <p className="text-sm text-muted-foreground mb-1">About:</p>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {request.requester.bio}
            </p>
          </div>
        )}

        <div className="flex gap-2">
          {request.requester.github && (
            <a
              href={request.requester.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground"
            >
              <Github className="h-4 w-4" />
            </a>
          )}
          {request.requester.linkedin && (
            <a
              href={request.requester.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground"
            >
              <Linkedin className="h-4 w-4" />
            </a>
          )}
          <a
            href={`mailto:${request.requester.email}`}
            className="text-muted-foreground hover:text-foreground"
          >
            <Mail className="h-4 w-4" />
          </a>
        </div>

        {request.reviewerNote && (
          <div className="border-t pt-3">
            <p className="text-sm text-muted-foreground mb-1">Your note:</p>
            <p className="text-sm italic">&quot;{request.reviewerNote}&quot;</p>
          </div>
        )}
      </div>

      {!readOnly && request.status === 'pending' && (
        <div className="flex gap-2 pt-2">
          <Button onClick={onAccept} className="flex-1" size="sm">
            <CheckCircle className="h-4 w-4 mr-2" />
            Accept
          </Button>
          <Button
            onClick={onReject}
            variant="outline"
            className="flex-1"
            size="sm"
          >
            <XCircle className="h-4 w-4 mr-2" />
            Decline
          </Button>
        </div>
      )}
    </div>
  )
}
