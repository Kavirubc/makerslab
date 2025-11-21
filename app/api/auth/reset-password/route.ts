import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { User } from '@/lib/models/User'
import bcrypt from 'bcryptjs'
import { getUniversityByEmailDomain } from '@/lib/utils/university'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, indexNumber, newPassword } = body

    // Validation
    if (!email || !indexNumber || !newPassword) {
      return NextResponse.json(
        { error: 'Email, index number, and new password are required' },
        { status: 400 }
      )
    }

    // Validate email domain exists in universities database
    const university = await getUniversityByEmailDomain(email)
    if (!university) {
      return NextResponse.json(
        { error: 'Your university email domain is not registered. Please contact support.' },
        { status: 400 }
      )
    }

    // Validate password strength
    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    const db = await getDatabase()
    const usersCollection = db.collection<User>('users')

    // Find user by email and indexNumber (using indexNumber as OTP)
    const user = await usersCollection.findOne({
      email: email.toLowerCase(),
      indexNumber: indexNumber.toUpperCase()
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or index number' },
        { status: 400 }
      )
    }

    // Check if user is banned
    if (user.isBanned) {
      return NextResponse.json(
        { error: 'Your account has been banned. Please contact support.' },
        { status: 403 }
      )
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update password
    await usersCollection.updateOne(
      { _id: user._id },
      {
        $set: {
          password: hashedPassword,
          updatedAt: new Date()
        }
      }
    )

    return NextResponse.json(
      {
        message: 'Password reset successfully. You can now login with your new password.'
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    )
  }
}
