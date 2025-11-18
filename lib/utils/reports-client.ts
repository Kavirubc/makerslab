import { ProjectReport } from '@/lib/models/ProjectReport'
import { getReasonLabel as getReasonLabelFromConstants } from '@/lib/constants/reports'

/**
 * Get badge variant for report status
 * Client-safe utility function (no database access)
 */
export function getReportStatusBadge(status: ProjectReport['status']): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'pending':
      return 'default'
    case 'reviewed':
      return 'secondary'
    case 'resolved':
      return 'outline'
    case 'dismissed':
      return 'secondary'
    default:
      return 'outline'
  }
}

/**
 * Get status label for display
 * Client-safe utility function (no database access)
 */
export function getStatusLabel(status: ProjectReport['status']): string {
  switch (status) {
    case 'pending':
      return 'Pending Review'
    case 'reviewed':
      return 'Under Review'
    case 'resolved':
      return 'Resolved'
    case 'dismissed':
      return 'Dismissed'
    default:
      return status
  }
}

/**
 * Get reason label by value
 * Client-safe utility function (no database access)
 */
export function getReasonLabel(value: string): string {
  return getReasonLabelFromConstants(value)
}

