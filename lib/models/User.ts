import { ObjectId } from 'mongodb'

export interface User {
  _id?: ObjectId
  name: string
  email: string
  password: string
  indexNumber: string // e.g., "2022IS031"
  registrationNumber: string // e.g., "2022/IS/031"
  universityId: ObjectId // Reference to University
  emailVerified?: Date | null
  image?: string | null
  profilePicture?: string | null // Firebase Storage URL
  bio?: string | null // User bio/about section
  cv?: string | null // Firebase Storage URL for CV/Resume
  cvUpdatedAt?: Date | null // Last CV update timestamp
  linkedin?: string | null // LinkedIn profile URL
  github?: string | null // GitHub profile URL
  createdAt: Date
  updatedAt: Date
}

export interface UserWithoutPassword extends Omit<User, 'password'> {
  _id?: ObjectId
  name: string
  email: string
  indexNumber: string
  registrationNumber: string
  universityId: ObjectId
  emailVerified?: Date | null
  image?: string | null
  profilePicture?: string | null
  bio?: string | null
  cv?: string | null
  cvUpdatedAt?: Date | null
  linkedin?: string | null
  github?: string | null
  createdAt: Date
  updatedAt: Date
}
