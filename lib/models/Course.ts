import { ObjectId } from 'mongodb'

export interface Course {
  _id?: ObjectId
  universityId: ObjectId // Reference to University
  code: string // e.g., "SCS2201", "CS101"
  name: string // e.g., "Database Management Systems"
  year?: number // Academic year level (1, 2, 3, 4)
  department?: string // e.g., "Computer Science", "Information Systems"
  isActive: boolean // Whether course is active/offered
  createdAt: Date
  updatedAt: Date
}
