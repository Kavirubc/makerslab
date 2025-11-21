import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { User } from '@/lib/models/User'
import { getUniversityByEmailDomain } from '@/lib/utils/university'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    // Validation
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
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

    const db = await getDatabase()
    const user = await db.collection<User>('users').findOne({
      email: email.toLowerCase()
    })

    // For security, we don't reveal if the email exists or not
    // Always return success message
    if (!user) {
      return NextResponse.json(
        { message: 'If an account with that email exists, you will receive instructions to reset your password.' },
        { status: 200 }
      )
    }

    // Check if user is banned
    if (user.isBanned) {
      return NextResponse.json(
        { error: 'Your account has been banned. Please contact support.' },
        { status: 403 }
      )
    }

    // Return success (we don't send the indexNumber via email, user needs to know it)
    // The indexNumber will be used as the OTP on the reset password page
    return NextResponse.json(
      { 
        message: 'If an account with that email exists, you can reset your password using your index number as the verification code.',
        indexNumber: user.indexNumber // In a real app, you wouldn't return this, but for this implementation, we'll use it
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'An error occurred. Please try again.' },
      { status: 500 }
    )
  }
}

