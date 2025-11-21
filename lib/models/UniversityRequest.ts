import { ObjectId } from 'mongodb'

export interface UniversityRequest {
  _id?: ObjectId
  userId?: ObjectId | null // User who requested the university (null for public requests)
  name: string // University name
  facultyName?: string | null // Faculty name (optional, for cases where different faculties have different email domains)
  district: string
  province: string
  emailDomain: string // Email domain (e.g., "ucsc.cmb.ac.lk" or "uom.lk")
  status: 'pending' | 'approved' | 'rejected'
  reason?: string | null // Reason for request (optional)
  adminNotes?: string | null // Admin notes when approving/rejecting
  reviewedBy?: ObjectId | null // Admin who reviewed the request
  reviewedAt?: Date | null
  createdAt: Date
  updatedAt: Date
}

