'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import { ArrowLeft, Check, X, ExternalLink, Flag, User, Calendar } from 'lucide-react'
import Link from 'next/link'
import { getReportStatusBadge, getStatusLabel, getReasonLabel } from '@/lib/utils/reports-client'
import { REPORT_REASONS } from '@/lib/constants/reports'

interface ReportDetailData {
  _id: string
  projectId: string
  reporterId: string
  reason: string
  description: string
  evidenceUrls: string[]
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed'
  adminNotes?: string | null
  reviewedBy?: string | null
  reviewedAt?: Date | null
  createdAt: Date
  updatedAt: Date
  project?: {
    _id: string
    title: string
    description: string
    category: string
    owner?: {
      _id: string
      name: string
      email: string
    }
  } | null
  reporter?: {
    _id: string
    name: string
    email: string
    indexNumber?: string
  } | null
  reviewer?: {
    _id: string
    name: string
    email: string
  } | null
}

export default function AdminReportDetailPage() {
  const router = useRouter()
  const params = useParams()
  const reportId = params.id as string

  const [report, setReport] = useState<ReportDetailData | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionDialogOpen, setActionDialogOpen] = useState(false)
  const [actionType, setActionType] = useState<'resolved' | 'dismissed' | null>(null)
  const [adminNotes, setAdminNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (reportId) {
      fetchReport()
    }
  }, [reportId])

  const fetchReport = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/reports/${reportId}`)
      if (response.status === 401 || response.status === 403) {
        router.push('/dashboard')
        return
      }

      if (!response.ok) {
        console.error('Failed to fetch report:', response.statusText)
        return
      }

      const data = await response.json()
      setReport(data.report)
    } catch (error) {
      console.error('Error fetching report:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = (type: 'resolved' | 'dismissed') => {
    setActionType(type)
    setAdminNotes('')
    setActionDialogOpen(true)
  }

  const submitAction = async () => {
    if (!actionType || !report) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/admin/reports/${reportId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: actionType,
          adminNotes: adminNotes.trim() || null
        })
      })

      if (response.ok) {
        setActionDialogOpen(false)
        setActionType(null)
        setAdminNotes('')
        fetchReport()
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to update report')
      }
    } catch (error) {
      console.error('Error updating report:', error)
      alert('Failed to update report')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="text-center py-8">Loading...</div>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="space-y-8">
        <div className="text-center py-8 text-muted-foreground">Report not found</div>
      </div>
    )
  }

  const reasonInfo = REPORT_REASONS.find(r => r.value === report.reason)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/reports">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Reports
            </Button>
          </Link>
          <h1 className="text-3xl font-bold mb-2">Report Details</h1>
          <p className="text-muted-foreground">Review and manage this project report</p>
        </div>
        <div className="flex gap-2">
          {report.status === 'pending' && (
            <>
              <Button
                variant="outline"
                onClick={() => handleAction('resolved')}
              >
                <Check className="h-4 w-4 mr-2" />
                Resolve
              </Button>
              <Button
                variant="outline"
                onClick={() => handleAction('dismissed')}
              >
                <X className="h-4 w-4 mr-2" />
                Dismiss
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Report Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flag className="h-5 w-5" />
                Report Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Reason</Label>
                <div className="mt-1">
                  <Badge variant="outline" className="mb-2">
                    {getReasonLabel(report.reason)}
                  </Badge>
                  {reasonInfo && (
                    <p className="text-sm text-muted-foreground">{reasonInfo.description}</p>
                  )}
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">Description</Label>
                <p className="mt-1 text-sm whitespace-pre-wrap">{report.description}</p>
              </div>

              <div>
                <Label className="text-muted-foreground">Status</Label>
                <div className="mt-1">
                  <Badge variant={getReportStatusBadge(report.status)}>
                    {getStatusLabel(report.status)}
                  </Badge>
                </div>
              </div>

              {report.adminNotes && (
                <div>
                  <Label className="text-muted-foreground">Admin Notes</Label>
                  <p className="mt-1 text-sm whitespace-pre-wrap">{report.adminNotes}</p>
                </div>
              )}

              {report.reviewedAt && report.reviewer && (
                <div>
                  <Label className="text-muted-foreground">Reviewed By</Label>
                  <div className="mt-1">
                    <p className="text-sm">{report.reviewer.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(report.reviewedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Evidence Images */}
          {report.evidenceUrls && report.evidenceUrls.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Evidence Images</CardTitle>
                <CardDescription>
                  {report.evidenceUrls.length} image{report.evidenceUrls.length !== 1 ? 's' : ''} provided
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {report.evidenceUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Evidence ${index + 1}`}
                        className="w-full h-48 object-cover rounded-md border"
                      />
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-md"
                      >
                        <ExternalLink className="h-6 w-6 text-white" />
                      </a>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Project Information */}
          <Card>
            <CardHeader>
              <CardTitle>Reported Project</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {report.project ? (
                <>
                  <div>
                    <Label className="text-muted-foreground">Title</Label>
                    <p className="mt-1 font-medium">{report.project.title}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Category</Label>
                    <div className="mt-1">
                      <Badge variant="outline">{report.project.category}</Badge>
                    </div>
                  </div>
                  {report.project.owner && (
                    <div>
                      <Label className="text-muted-foreground">Project Owner</Label>
                      <div className="mt-1">
                        <p className="text-sm">{report.project.owner.name}</p>
                        <p className="text-xs text-muted-foreground">{report.project.owner.email}</p>
                      </div>
                    </div>
                  )}
                  <Link href={`/projects/${report.project._id}`}>
                    <Button variant="outline" className="w-full">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Project
                    </Button>
                  </Link>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Project not found</p>
              )}
            </CardContent>
          </Card>

          {/* Reporter Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Reporter
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {report.reporter ? (
                <>
                  <div>
                    <Label className="text-muted-foreground">Name</Label>
                    <p className="mt-1 text-sm">{report.reporter.name}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Email</Label>
                    <p className="mt-1 text-sm">{report.reporter.email}</p>
                  </div>
                  {report.reporter.indexNumber && (
                    <div>
                      <Label className="text-muted-foreground">Index Number</Label>
                      <p className="mt-1 text-sm">{report.reporter.indexNumber}</p>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Reporter information not available</p>
              )}
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Metadata
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <Label className="text-muted-foreground">Reported</Label>
                <p className="mt-1 text-sm">
                  {new Date(report.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Last Updated</Label>
                <p className="mt-1 text-sm">
                  {new Date(report.updatedAt).toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Action Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'resolved' ? 'Resolve Report' : 'Dismiss Report'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'resolved'
                ? 'Mark this report as resolved. You can add notes about the resolution.'
                : 'Dismiss this report. You can add notes explaining why it was dismissed.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="adminNotes">Admin Notes (Optional)</Label>
              <Textarea
                id="adminNotes"
                placeholder="Add notes about this action..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setActionDialogOpen(false)
                setActionType(null)
                setAdminNotes('')
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={submitAction}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processing...' : actionType === 'resolved' ? 'Resolve' : 'Dismiss'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

