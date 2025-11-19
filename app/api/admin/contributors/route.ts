import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/utils/admin'
import { getDatabase } from '@/lib/mongodb'
import { User } from '@/lib/models/User'
import { ObjectId } from 'mongodb'

// GET /api/admin/contributors - Get all contributors (admin only)
export async function GET(request: NextRequest) {
  try {
    const adminCheck = await requireAdmin()
    if (adminCheck) {
      return adminCheck
    }

    const db = await getDatabase()

    // Fetch all contributors
    const contributors = await db
      .collection<User>('users')
      .find(
        {
          contributorType: { $in: ['contributor', 'core-contributor'] }
        },
        { projection: { password: 0 } }
      )
      .sort({ contributedAt: -1 })
      .toArray()

    return NextResponse.json({ contributors })
  } catch (error) {
    console.error('Error fetching contributors:', error)
    return NextResponse.json(
      { error: 'Failed to fetch contributors' },
      { status: 500 }
    )
  }
}

// POST /api/admin/contributors - Add a user as contributor (admin only)
export async function POST(request: NextRequest) {
  try {
    const adminCheck = await requireAdmin()
    if (adminCheck) {
      return adminCheck
    }

    const body = await request.json()
    const { userId, contributorType } = body

    // Validate input
    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    if (!ObjectId.isValid(userId)) {
      return NextResponse.json({ error: 'Invalid userId' }, { status: 400 })
    }

    if (contributorType !== 'contributor' && contributorType !== 'core-contributor') {
      return NextResponse.json(
        { error: 'contributorType must be "contributor" or "core-contributor"' },
        { status: 400 }
      )
    }

    const db = await getDatabase()

    // Check if user exists
    const user = await db.collection<User>('users').findOne({
      _id: new ObjectId(userId)
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Update user as contributor
    await db.collection<User>('users').updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          contributorType,
          contributedAt: new Date(),
          updatedAt: new Date()
        }
      }
    )

    return NextResponse.json({
      message: 'User added as contributor successfully'
    })
  } catch (error) {
    console.error('Error adding contributor:', error)
    return NextResponse.json(
      { error: 'Failed to add contributor' },
      { status: 500 }
    )
  }
}

