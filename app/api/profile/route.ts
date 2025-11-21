import { auth } from '@/auth'
import { getDatabase } from '@/lib/mongodb'
import { User } from '@/lib/models/User'
import { ObjectId } from 'mongodb'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const db = await getDatabase()
    const user = await db.collection<User>('users').findOne(
      { _id: new ObjectId(session.user.id) },
      { projection: { password: 0 } }
    )

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Validate ObjectId format
    if (!ObjectId.isValid(session.user.id)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 })
    }

    const body = await request.json()
    const { 
      bio, 
      linkedin, 
      github, 
      profilePicture, 
      cv, 
      cvUpdatedAt,
      name,
      indexNumber,
      registrationNumber
    } = body

    const db = await getDatabase()

    // Build update object
    const updateData: any = {
      updatedAt: new Date(),
    }

    // Profile fields
    if (bio !== undefined) updateData.bio = bio
    if (linkedin !== undefined) updateData.linkedin = linkedin
    if (github !== undefined) updateData.github = github
    if (profilePicture !== undefined) updateData.profilePicture = profilePicture
    if (cv !== undefined) {
      updateData.cv = cv
      updateData.cvUpdatedAt = cvUpdatedAt ? new Date(cvUpdatedAt) : new Date()
    }

    // Account information fields
    if (name !== undefined && name.trim()) {
      updateData.name = name.trim()
    }
    if (indexNumber !== undefined && indexNumber.trim()) {
      updateData.indexNumber = indexNumber.trim()
    }
    if (registrationNumber !== undefined && registrationNumber.trim()) {
      updateData.registrationNumber = registrationNumber.trim()
    }

    const result = await db.collection<User>('users').updateOne(
      { _id: new ObjectId(session.user.id) },
      { $set: updateData }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: 'Profile updated successfully' })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
