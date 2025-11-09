import { ObjectId } from 'mongodb'

export interface UniversityRequest {
  _id?: ObjectId
  userId: ObjectId // User who requested the university
  name: string // University name
  district: string
  province: string
  emailDomain: string // Email domain (e.g., "ucsc.cmb.ac.lk")
  status: 'pending' | 'approved' | 'rejected'
  reason?: string | null // Reason for request (optional)
  adminNotes?: string | null // Admin notes when approving/rejecting
  reviewedBy?: ObjectId | null // Admin who reviewed the request
  reviewedAt?: Date | null
  createdAt: Date
  updatedAt: Date
}

