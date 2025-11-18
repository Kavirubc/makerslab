import { ObjectId } from 'mongodb'

export interface ProjectReport {
  _id?: ObjectId
  projectId: ObjectId // Reference to Project being reported
  reporterId: ObjectId // Reference to User who reported
  reason: string // Predefined reason: 'ip-violation', 'false-information', 'inappropriate-content', 'spam', 'other'
  description: string // Custom description/details from reporter
  evidenceUrls: string[] // Firebase Storage URLs for uploaded evidence images
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed' // Report status
  adminNotes?: string | null // Admin notes when reviewing/resolving
  reviewedBy?: ObjectId | null // Admin who reviewed the report
  reviewedAt?: Date | null // When the report was reviewed
  createdAt: Date
  updatedAt: Date
}

