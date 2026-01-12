import { ObjectId } from 'mongodb'

export interface ProjectCollaborationRequest {
  _id?: ObjectId
  projectId: ObjectId // Reference to Project
  requesterId: ObjectId // Reference to User requesting to join
  message: string // Message from requester explaining why they want to join
  skills: string[] // Skills/expertise the requester can bring
  status: 'pending' | 'accepted' | 'rejected' // Request status
  reviewedBy?: ObjectId | null // Project owner who reviewed the request
  reviewerNote?: string | null // Optional note from project owner
  reviewedAt?: Date | null // When the request was reviewed
  createdAt: Date
  updatedAt: Date
}
