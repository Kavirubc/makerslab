import { getDatabase } from '@/lib/mongodb'
import { University } from '@/lib/models/University'
import { ObjectId } from 'mongodb'

/**
 * Validates if email domain exists in the universities database
 * This is the primary validation method - checks if the domain is registered
 */
export async function isValidAcademicEmailDomain(email: string): Promise<boolean> {
  const university = await getUniversityByEmailDomain(email)
  return university !== null
}

/**
 * Basic email format validation (checks if it's a valid email structure)
 * This is a simple format check, not a database lookup
 * Use isValidAcademicEmailDomain() for actual domain validation
 */
export function isValidEmailFormat(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.toLowerCase())
}

/**
 * @deprecated Use isValidAcademicEmailDomain() for database-based validation
 * Kept for backward compatibility, but will be removed in future versions
 */
export function isValidAcademicEmail(email: string): boolean {
  // Basic format check only - full validation requires database lookup
  return isValidEmailFormat(email)
}

/**
 * Extracts email domain from email address
 * e.g., "2022is031@ucsc.cmb.ac.lk" -> "ucsc.cmb.ac.lk"
 */
export function extractEmailDomain(email: string): string {
  const parts = email.split('@')
  return parts.length === 2 ? parts[1].toLowerCase() : ''
}

/**
 * Gets university by email domain
 */
export async function getUniversityByEmailDomain(email: string): Promise<University | null> {
  const domain = extractEmailDomain(email)

  if (!domain) {
    return null
  }

  const db = await getDatabase()
  const university = await db.collection<University>('universities').findOne({
    emailDomain: domain
  })

  return university
}

/**
 * Gets university by ID
 */
export async function getUniversityById(id: ObjectId | string): Promise<University | null> {
  const db = await getDatabase()
  const university = await db.collection<University>('universities').findOne({
    _id: typeof id === 'string' ? new ObjectId(id) : id
  })

  return university
}

/**
 * Seeds initial universities (call this once to populate database)
 */
export async function seedUniversities() {
  const db = await getDatabase()
  const collection = db.collection<University>('universities')

  const universities: Omit<University, '_id'>[] = [
    {
      name: 'University of Colombo School of Computing',
      district: 'Colombo',
      province: 'Western',
      emailDomain: 'ucsc.cmb.ac.lk',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'University of Colombo School of Computing - Student',
      district: 'Colombo',
      province: 'Western',
      emailDomain: 'stu.ucsc.cmb.ac.lk',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'University of Colombo',
      district: 'Colombo',
      province: 'Western',
      emailDomain: 'cmb.ac.lk',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'University of Moratuwa',
      district: 'Colombo',
      province: 'Western',
      emailDomain: 'uom.lk',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'University of Peradeniya',
      district: 'Kandy',
      province: 'Central',
      emailDomain: 'pdn.ac.lk',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]

  // Create index on emailDomain for faster lookups (before upserting)
  await collection.createIndex({ emailDomain: 1 }, { unique: true })

  // Upsert universities (insert if not exists, update if exists)
  for (const university of universities) {
    await collection.updateOne(
      { emailDomain: university.emailDomain },
      { $set: university },
      { upsert: true }
    )
  }

  console.log('Universities seeded successfully')
}
