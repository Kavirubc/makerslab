import { auth } from '@/auth'
import { getDatabase } from '@/lib/mongodb'
import { User } from '@/lib/models/User'
import { ObjectId } from 'mongodb'
import { NextRequest, NextResponse } from 'next/server'
import { canChangeSlug, getDaysUntilSlugChange } from '@/lib/utils/slug'

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

    // Add computed slug fields for UI
    const response = {
      ...user,
      canChangeSlug: canChangeSlug(user.slugChangedAt),
      daysUntilSlugChange: getDaysUntilSlugChange(user.slugChangedAt)
    }

    return NextResponse.json(response)
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

    // Account information fields - always update if provided (frontend validates non-empty)
    if (name !== undefined && name !== null) {
      const trimmedName = String(name).trim()
      if (trimmedName.length > 0) {
        updateData.name = trimmedName
      }
    }
    if (indexNumber !== undefined && indexNumber !== null) {
      const trimmedIndex = String(indexNumber).trim()
      if (trimmedIndex.length > 0) {
        updateData.indexNumber = trimmedIndex
      }
    }
    if (registrationNumber !== undefined && registrationNumber !== null) {
      const trimmedReg = String(registrationNumber).trim()
      if (trimmedReg.length > 0) {
        updateData.registrationNumber = trimmedReg
      }
    }

    // Log for debugging (remove in production if needed)
    console.log('Profile update request:', {
      userId: session.user.id,
      updateData,
      receivedFields: { name, indexNumber, registrationNumber }
    })

    // Check if there's anything to update
    if (Object.keys(updateData).length === 1 && updateData.updatedAt) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    const result = await db.collection<User>('users').updateOne(
      { _id: new ObjectId(session.user.id) },
      { $set: updateData }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (result.modifiedCount === 0) {
      // User was found but no changes were made (values might be the same)
      return NextResponse.json({ 
        success: true, 
        message: 'No changes detected. Values may already be set to the provided values.',
        modified: false
      })
    }

    console.log('Profile update successful:', {
      userId: session.user.id,
      modifiedCount: result.modifiedCount,
      updatedFields: Object.keys(updateData).filter(k => k !== 'updatedAt')
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Profile updated successfully',
      modified: true,
      updatedFields: Object.keys(updateData).filter(k => k !== 'updatedAt')
    })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
