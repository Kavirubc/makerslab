import { ObjectId } from 'mongodb'

export interface TeamMember {
  name: string
  email: string
  role: string
  indexNumber?: string
  userId?: string // ObjectId as string if they're a registered user
}

export interface Project {
  _id?: ObjectId
  userId: ObjectId // Reference to User who created the project
  title: string
  description: string
  category: string // e.g., "Web Development", "Mobile App", "AI/ML", "IoT", etc.
  tags: string[] // Technologies used: ["React", "Node.js", "MongoDB"]

  // Media
  thumbnailUrl?: string
  slidesDeckUrl?: string // URL to uploaded slides (PDF, PPTX, Google Slides link)
  pitchVideoUrl?: string // YouTube, Vimeo, or uploaded video URL
  demoUrl?: string // Live demo link
  githubUrl?: string

  // Team details
  teamMembers: TeamMember[]

  // Project details
  startDate?: Date
  endDate?: Date
  status: 'completed' | 'in-progress' | 'archived'

  // Visibility
  isPublic: boolean

  // Engagement
  views: number
  likes: number

  // Metadata
  createdAt: Date
  updatedAt: Date
}
