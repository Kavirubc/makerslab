import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { User } from '@/lib/models/User'
import bcrypt from 'bcryptjs'
import { getUniversityByEmailDomain } from '@/lib/utils/university'

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

    // Get university by email domain - this validates that the domain is registered
    const university = await getUniversityByEmailDomain(email)
    if (!university) {
      return NextResponse.json(
        { error: 'Your university email domain is not registered. Please contact support or request to add your university.' },
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
      role: 'user', // Default role for new users
      emailVerified: null,
      image: null,
      isBanned: false, // Default to not banned
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
