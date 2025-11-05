import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getDatabase } from '@/lib/mongodb'
import { User } from '@/lib/models/User'

// GET /api/users/search?email=xxx - Search for users by email
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json({ error: 'Email parameter required' }, { status: 400 })
    }

    const db = await getDatabase()

    // Search for users by email (case-insensitive, partial match)
    const users = await db
      .collection<User>('users')
      .find(
        { email: { $regex: email, $options: 'i' } },
        { projection: { password: 0 } } // Exclude password
      )
      .limit(10)
      .toArray()

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Error searching users:', error)
    return NextResponse.json(
      { error: 'Failed to search users' },
      { status: 500 }
    )
  }
}
