import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/utils/admin'
import { getDatabase } from '@/lib/mongodb'
import { User } from '@/lib/models/User'
import { ObjectId } from 'mongodb'

// GET /api/admin/users/[id] - Get specific user
export async function GET(
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
    const user = await db.collection<User>('users').findOne(
      { _id: new ObjectId(id) },
      { projection: { password: 0 } }
    )

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/users/[id] - Update user
export async function PUT(
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

    const body = await request.json()
    const { name, email, indexNumber, registrationNumber, role, bio, linkedin, github } = body

    const db = await getDatabase()
    const user = await db.collection<User>('users').findOne({
      _id: new ObjectId(id)
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Build update object
    const updateData: any = {
      updatedAt: new Date()
    }

    if (name !== undefined) updateData.name = name
    if (email !== undefined) updateData.email = email.toLowerCase()
    if (indexNumber !== undefined) updateData.indexNumber = indexNumber.toUpperCase()
    if (registrationNumber !== undefined) updateData.registrationNumber = registrationNumber
    if (role !== undefined && (role === 'user' || role === 'admin')) {
      updateData.role = role
    }
    if (bio !== undefined) updateData.bio = bio
    if (linkedin !== undefined) updateData.linkedin = linkedin
    if (github !== undefined) updateData.github = github

    await db.collection<User>('users').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    )

    return NextResponse.json({ message: 'User updated successfully' })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/users/[id] - Delete user
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
    const user = await db.collection<User>('users').findOne({
      _id: new ObjectId(id)
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Note: We can't easily get the current user ID here, so we'll allow deletion
    // but this should be handled in the UI with a confirmation

    await db.collection<User>('users').deleteOne({
      _id: new ObjectId(id)
    })

    return NextResponse.json({ message: 'User deleted successfully' })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}

// POST /api/admin/users/[id] - Ban/Unban user
export async function POST(
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

    const body = await request.json()
    const { isBanned, bannedReason } = body

    if (typeof isBanned !== 'boolean') {
      return NextResponse.json(
        { error: 'isBanned must be a boolean' },
        { status: 400 }
      )
    }

    const db = await getDatabase()
    const user = await db.collection<User>('users').findOne({
      _id: new ObjectId(id)
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const updateData: any = {
      isBanned,
      updatedAt: new Date()
    }

    if (isBanned) {
      updateData.bannedAt = new Date()
      updateData.bannedReason = bannedReason || null
    } else {
      updateData.bannedAt = null
      updateData.bannedReason = null
    }

    await db.collection<User>('users').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    )

    return NextResponse.json({
      message: isBanned ? 'User banned successfully' : 'User unbanned successfully'
    })
  } catch (error) {
    console.error('Error banning/unbanning user:', error)
    return NextResponse.json(
      { error: 'Failed to update user ban status' },
      { status: 500 }
    )
  }
}

