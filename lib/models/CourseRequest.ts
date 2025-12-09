import { ObjectId } from 'mongodb'

export interface CourseRequest {
  _id?: ObjectId
  userId: ObjectId // User who requested
  universityId: ObjectId // University the course is for
  projectId?: ObjectId // Project where this was requested (optional)

  // Submitted course details
  code: string // e.g., "SCS2201"
  name: string // e.g., "Database Management Systems"
  year?: number // Academic year level (1, 2, 3, 4)
  department?: string // e.g., "Computer Science"

  // Request status
  status: 'pending' | 'approved' | 'rejected'

  // Admin response
  adminId?: ObjectId // Admin who reviewed
  adminNote?: string // Note from admin (reason for rejection, etc.)

  // If approved, the created course ID
  approvedCourseId?: ObjectId

  createdAt: Date
  updatedAt: Date
  reviewedAt?: Date
}
