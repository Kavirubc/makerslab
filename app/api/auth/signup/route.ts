import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { User } from '@/lib/models/User'
import bcrypt from 'bcryptjs'
import { isValidAcademicEmail, getUniversityByEmailDomain } from '@/lib/utils/university'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, indexNumber, registrationNumber } = body

    // Validation
    if (!name || !email || !password || !indexNumber || !registrationNumber) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Validate email ends with ac.lk
    if (!isValidAcademicEmail(email)) {
      return NextResponse.json(
        { error: 'Only .ac.lk email addresses are allowed' },
        { status: 400 }
      )
    }

    // Get university by email domain
    const university = await getUniversityByEmailDomain(email)
    if (!university) {
      return NextResponse.json(
        { error: 'University not found for this email domain. Please contact support.' },
        { status: 400 }
      )
    }

    const db = await getDatabase()
    const usersCollection = db.collection<User>('users')

    // Check if user already exists
    const existingUser = await usersCollection.findOne({
      email: email.toLowerCase()
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Check if index number already exists
    const existingIndexNumber = await usersCollection.findOne({
      indexNumber: indexNumber.toUpperCase()
    })

    if (existingIndexNumber) {
      return NextResponse.json(
        { error: 'User with this index number already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const newUser: Omit<User, '_id'> = {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      indexNumber: indexNumber.toUpperCase(),
      registrationNumber,
      universityId: university._id!,
      emailVerified: null,
      image: null,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await usersCollection.insertOne(newUser as User)

    return NextResponse.json(
      {
        message: 'User created successfully',
        userId: result.insertedId.toString()
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'An error occurred during signup' },
      { status: 500 }
    )
  }
}
