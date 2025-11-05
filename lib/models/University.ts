import { ObjectId } from 'mongodb'

export interface University {
  _id?: ObjectId
  name: string // e.g., "University of Colombo School of Computing"
  district: string // e.g., "Colombo"
  province: string // e.g., "Western"
  emailDomain: string // e.g., "ucsc.cmb.ac.lk" or "cmb.ac.lk"
  createdAt: Date
  updatedAt: Date
}
