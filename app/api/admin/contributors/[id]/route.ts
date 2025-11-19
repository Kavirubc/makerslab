import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/utils/admin'
import { getDatabase } from '@/lib/mongodb'
import { User } from '@/lib/models/User'
import { ObjectId } from 'mongodb'

// DELETE /api/admin/contributors/[id] - Remove contributor status (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminCheck = await requireAdmin()
    if (adminCheck) {
      return adminCheck
    }

    const { id } = await params

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 })
    }

    const db = await getDatabase()

    // Check if user exists
    const user = await db.collection<User>('users').findOne({
      _id: new ObjectId(id)
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Remove contributor status
    await db.collection<User>('users').updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          contributorType: null,
          contributedAt: null,
          updatedAt: new Date()
        }
      }
    )

    return NextResponse.json({
      message: 'Contributor status removed successfully'
    })
  } catch (error) {
    console.error('Error removing contributor status:', error)
    return NextResponse.json(
      { error: 'Failed to remove contributor status' },
      { status: 500 }
    )
  }
}

