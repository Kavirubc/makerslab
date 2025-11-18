'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Eye, Flag } from 'lucide-react'
import Link from 'next/link'
import { getReportStatusBadge, getStatusLabel, getReasonLabel } from '@/lib/utils/reports-client'
import { REPORT_REASONS } from '@/lib/constants/reports'
import { Label } from '@/components/ui/label'

interface ReportData {
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
    ownerId: string
  } | null
  reporter?: {
    _id: string
    name: string
    email: string
  } | null
  reviewer?: {
    _id: string
    name: string
    email: string
  } | null
}

export default function AdminReportsPage() {
  const router = useRouter()
  const [reports, setReports] = useState<ReportData[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [statusFilter, setStatusFilter] = useState('unresolved')
  const [reasonFilter, setReasonFilter] = useState('all')
  const [showResolved, setShowResolved] = useState(false)

  useEffect(() => {
    fetchReports()
  }, [page, statusFilter, reasonFilter, showResolved])

  const fetchReports = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50', // Increase limit to handle resolved reports
      })

      // Handle unresolved filter (pending + reviewed)
      if (statusFilter === 'unresolved') {
        params.append('status', 'unresolved')
      } else if (statusFilter && statusFilter !== 'all') {
        params.append('status', statusFilter)
      }

      if (reasonFilter && reasonFilter !== 'all') params.append('reason', reasonFilter)

      const response = await fetch(`/api/admin/reports?${params}`)
      if (response.status === 401 || response.status === 403) {
        router.push('/dashboard')
        return
      }

      if (!response.ok) {
        console.error('Failed to fetch reports:', response.statusText)
        setReports([])
        setTotalPages(1)
        return
      }

      const data = await response.json()

      if (data.error) {
        console.error('Error from API:', data.error)
        setReports([])
        setTotalPages(1)
        return
      }

      let filteredReports = data.reports || []

      // If showing unresolved and user wants to see resolved too, fetch them
      if (statusFilter === 'unresolved' && showResolved) {
        // Fetch resolved and dismissed reports separately
        const resolvedParams = new URLSearchParams({
          page: '1',
          limit: '50',
        })
        if (reasonFilter && reasonFilter !== 'all') resolvedParams.append('reason', reasonFilter)

        // Fetch resolved and dismissed
        const [resolvedRes, dismissedRes] = await Promise.all([
          fetch(`/api/admin/reports?status=resolved&${resolvedParams}`),
          fetch(`/api/admin/reports?status=dismissed&${resolvedParams}`)
        ])

        if (resolvedRes.ok) {
          const resolvedData = await resolvedRes.json()
          filteredReports = [...filteredReports, ...(resolvedData.reports || [])]
        }
        if (dismissedRes.ok) {
          const dismissedData = await dismissedRes.json()
          filteredReports = [...filteredReports, ...(dismissedData.reports || [])]
        }

        // Sort by created date (newest first)
        filteredReports.sort((a: ReportData, b: ReportData) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      }

      setReports(filteredReports)
      setTotalPages(data.pagination?.totalPages || 1)
    } catch (error) {
      console.error('Error fetching reports:', error)
      setReports([])
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Project Reports</h1>
        <p className="text-muted-foreground">Review and manage project reports submitted by users</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value)
                  setPage(1)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unresolved">Unresolved (Pending + Reviewed)</SelectItem>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="reviewed">Reviewed</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="dismissed">Dismissed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Reason</label>
              <Select
                value={reasonFilter}
                onValueChange={(value) => {
                  setReasonFilter(value)
                  setPage(1)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All reasons" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All reasons</SelectItem>
                  {REPORT_REASONS.map((reason) => (
                    <SelectItem key={reason.value} value={reason.value}>
                      {reason.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Show Resolved Toggle */}
          {statusFilter === 'unresolved' && (
            <div className="mt-4 flex items-center space-x-2">
              <input
                type="checkbox"
                id="showResolved"
                checked={showResolved}
                onChange={(e) => {
                  setShowResolved(e.target.checked)
                  setPage(1)
                }}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="showResolved" className="text-sm font-medium cursor-pointer">
                Show resolved and dismissed reports
              </Label>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle>Reports</CardTitle>
          <CardDescription>
            {loading
              ? 'Loading...'
              : `${reports.length} report${reports.length !== 1 ? 's' : ''} found`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : reports.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No reports found</div>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Project</th>
                      <th className="text-left p-2">Reporter</th>
                      <th className="text-left p-2">Reason</th>
                      <th className="text-left p-2">Status</th>
                      <th className="text-left p-2">Evidence</th>
                      <th className="text-left p-2">Created</th>
                      <th className="text-right p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((report) => (
                      <tr key={report._id} className="border-b">
                        <td className="p-2">
                          {report.project ? (
                            <div>
                              <div className="font-medium max-w-xs truncate">
                                {report.project.title}
                              </div>
                              <Link
                                href={`/projects/${report.project._id}`}
                                className="text-xs text-primary hover:underline"
                              >
                                View Project
                              </Link>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Project not found</span>
                          )}
                        </td>
                        <td className="p-2">
                          {report.reporter ? (
                            <div>
                              <div className="text-sm">{report.reporter.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {report.reporter.email}
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Unknown</span>
                          )}
                        </td>
                        <td className="p-2">
                          <Badge variant="outline">{getReasonLabel(report.reason)}</Badge>
                        </td>
                        <td className="p-2">
                          <Badge variant={getReportStatusBadge(report.status)}>
                            {getStatusLabel(report.status)}
                          </Badge>
                        </td>
                        <td className="p-2">
                          {report.evidenceUrls && report.evidenceUrls.length > 0 ? (
                            <Badge variant="secondary">
                              {report.evidenceUrls.length} image{report.evidenceUrls.length !== 1 ? 's' : ''}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">None</span>
                          )}
                        </td>
                        <td className="p-2 text-sm text-muted-foreground">
                          {new Date(report.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-2">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/admin/reports/${report._id}`}>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
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
    </div>
  )
}

