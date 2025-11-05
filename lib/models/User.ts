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
  createdAt: Date
  updatedAt: Date
}
