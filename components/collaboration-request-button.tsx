'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
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
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { UserPlus, X, Loader2, CheckCircle, XCircle, Clock } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface CollaborationRequestButtonProps {
  projectId: string
  projectTitle: string
  projectOwnerId: string
  projectStatus: 'completed' | 'in-progress' | 'archived'
}

interface CollaborationRequestStatus {
  hasRequest: boolean
  request?: {
    _id: string
    status: 'pending' | 'accepted' | 'rejected'
    message: string
    skills: string[]
    reviewerNote?: string
    reviewedAt?: string
    createdAt: string
  }
}

export function CollaborationRequestButton({
  projectId,
  projectTitle,
  projectOwnerId,
  projectStatus,
}: CollaborationRequestButtonProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [skillInput, setSkillInput] = useState('')
  const [skills, setSkills] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const [requestStatus, setRequestStatus] = useState<CollaborationRequestStatus | null>(null)
  const [isLoadingStatus, setIsLoadingStatus] = useState(false)

  const shouldShow =
    projectStatus === 'in-progress' &&
    session?.user &&
    session.user.id !== projectOwnerId

  const fetchRequestStatus = useCallback(async () => {
    setIsLoadingStatus(true)
    try {
      const response = await fetch(`/api/projects/${projectId}/collaborate/status`)
      if (response.ok) {
        const data = await response.json()
        setRequestStatus(data)
      }
    } catch (error) {
      console.error('Error fetching request status:', error)
    } finally {
      setIsLoadingStatus(false)
    }
  }, [projectId])

  useEffect(() => {
    if (shouldShow) {
      fetchRequestStatus()
    }
  }, [shouldShow, fetchRequestStatus])

  const handleAddSkill = () => {
    const trimmedSkill = skillInput.trim()
    if (trimmedSkill && !skills.includes(trimmedSkill)) {
      setSkills([...skills, trimmedSkill])
      setSkillInput('')
    }
  }

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddSkill()
    }
  }

  const handleSubmit = async () => {
    if (message.trim().length < 20) {
      toast.error('Please provide a message of at least 20 characters')
      return
    }

    if (skills.length === 0) {
      toast.error('Please add at least one skill')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/projects/${projectId}/collaborate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message.trim(),
          skills,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Collaboration request sent successfully!')
        setDialogOpen(false)
        setMessage('')
        setSkills([])
        setSkillInput('')
        await fetchRequestStatus()
        router.refresh()
      } else {
        toast.error(data.error || 'Failed to send request')
      }
    } catch (error) {
      console.error('Error sending request:', error)
      toast.error('Failed to send request')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancelRequest = async () => {
    if (!requestStatus?.request?._id || isCancelling) return

    setIsCancelling(true)
    try {
      const response = await fetch(
        `/api/projects/${projectId}/collaborate/${requestStatus.request._id}`,
        {
          method: 'DELETE',
        }
      )

      const data = await response.json()

      if (response.ok) {
        toast.success('Request cancelled')
        await fetchRequestStatus()
        router.refresh()
      } else {
        toast.error(data.error || 'Failed to cancel request')
      }
    } catch (error) {
      console.error('Error cancelling request:', error)
      toast.error('Failed to cancel request')
    } finally {
      setIsCancelling(false)
    }
  }

  if (!shouldShow) {
    return null
  }

  if (isLoadingStatus) {
    return (
      <Button variant="outline" className="w-full" disabled>
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        Loading...
      </Button>
    )
  }

  // Show status if user has already sent a request
  if (requestStatus?.hasRequest && requestStatus.request) {
    const { status, reviewerNote } = requestStatus.request

    if (status === 'pending') {
      return (
        <div className="border rounded-lg p-4 bg-yellow-50 dark:bg-yellow-950/20">
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-sm mb-1">Request Pending</h3>
              <p className="text-xs text-muted-foreground mb-3">
                Your request is awaiting review by the project owner.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancelRequest}
                disabled={isCancelling}
                className="text-xs"
              >
                {isCancelling ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  'Cancel Request'
                )}
              </Button>
            </div>
          </div>
        </div>
      )
    }

    if (status === 'accepted') {
      return (
        <div className="border rounded-lg p-4 bg-green-50 dark:bg-green-950/20">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-sm mb-1">Request Accepted!</h3>
              <p className="text-xs text-muted-foreground mb-1">
                You are now a collaborator on this project.
              </p>
              {reviewerNote && (
                <p className="text-xs text-muted-foreground italic mt-2">
                  &quot;{reviewerNote}&quot;
                </p>
              )}
            </div>
          </div>
        </div>
      )
    }

    if (status === 'rejected') {
      return (
        <div className="border rounded-lg p-4 bg-red-50 dark:bg-red-950/20">
          <div className="flex items-start gap-3">
            <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-sm mb-1">Request Declined</h3>
              <p className="text-xs text-muted-foreground mb-1">
                Your request was not accepted at this time.
              </p>
              {reviewerNote && (
                <p className="text-xs text-muted-foreground italic mt-2">
                  &quot;{reviewerNote}&quot;
                </p>
              )}
            </div>
          </div>
        </div>
      )
    }
  }

  return (
    <>
      <Button
        variant="default"
        className="w-full"
        onClick={() => setDialogOpen(true)}
        disabled={isSubmitting}
      >
        <UserPlus className="h-4 w-4 mr-2" />
        Join Team
      </Button>
      <Dialog open={dialogOpen} onOpenChange={(open) => !isSubmitting && setDialogOpen(open)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Request to Join Team</DialogTitle>
            <DialogDescription>
              Send a request to join <strong>{projectTitle}</strong>. 
              Explain why you&apos;d like to contribute and what skills you bring.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="message">
                Message <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="message"
                placeholder="Explain why you want to join this project and how you can contribute... (minimum 20 characters)"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                {message.trim().length}/20 characters minimum
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="skills">
                Your Skills <span className="text-destructive">*</span>
              </Label>
              <div className="flex gap-2">
                <Input
                  id="skills"
                  placeholder="e.g., React, Node.js, UI/UX Design"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <Button type="button" onClick={handleAddSkill} variant="outline">
                  Add
                </Button>
              </div>
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="pl-3 pr-1">
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        aria-label={`Remove ${skill}`}
                        className="ml-2 hover:bg-muted rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Press Enter or click Add to add a skill. At least one skill required.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={
                isSubmitting ||
                message.trim().length < 20 ||
                skills.length === 0
              }
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Send Request
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
