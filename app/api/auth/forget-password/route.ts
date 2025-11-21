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
    const usersCollection = db.collection<User>('users')

    // Check if user exists
    const user = await usersCollection.findOne({
      email: email.toLowerCase()
    })

    // For security, we don't reveal if the email exists or not
    // Always return success message
    if (user) {
      // In a real implementation, you would send an email here
      // For now, we just return success - the user will need to know their indexNumber
      return NextResponse.json(
        {
          message: 'If an account with this email exists, you can use your index number to reset your password.'
        },
        { status: 200 }
      )
    }

    // Return same message even if user doesn't exist (security best practice)
    return NextResponse.json(
      {
        message: 'If an account with this email exists, you can use your index number to reset your password.'
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Forget password error:', error)
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    )
  }
}

