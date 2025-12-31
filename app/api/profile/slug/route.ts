import { auth } from '@/auth'
import { getDatabase } from '@/lib/mongodb'
import { User } from '@/lib/models/User'
import { ObjectId } from 'mongodb'
import { NextRequest, NextResponse } from 'next/server'
import {
  validateSlug,
  canChangeSlug,
  getDaysUntilSlugChange,
  normalizeSlug
} from '@/lib/utils/slug'

// GET: Check slug availability
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')

    if (!slug) {
      return NextResponse.json({ error: 'Slug parameter required' }, { status: 400 })
    }

    const normalizedSlug = normalizeSlug(slug)

    // Validate format first
    const validation = validateSlug(normalizedSlug)
    if (!validation.valid) {
      return NextResponse.json({ available: false, error: validation.error })
    }

    // Check uniqueness in database
    const db = await getDatabase()
    const existingUser = await db.collection<User>('users').findOne({
      profileSlug: normalizedSlug
    })

    if (existingUser) {
      return NextResponse.json({ available: false, error: 'This slug is already taken' })
    }

    return NextResponse.json({ available: true })
  } catch (error) {
    console.error('Slug check error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT: Set or update profile slug
export async function PUT(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!ObjectId.isValid(session.user.id)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 })
    }

    const body = await request.json()
    const { slug } = body

    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 })
    }

    const normalizedSlug = normalizeSlug(slug)
    const db = await getDatabase()

    // Get current user to check eligibility and cooldown
    const currentUser = await db.collection<User>('users').findOne({
      _id: new ObjectId(session.user.id)
    })

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user is a contributor
    if (!currentUser.contributorType) {
      return NextResponse.json(
        { error: 'Only contributors can set a custom profile URL' },
        { status: 403 }
      )
    }

    // Check 6-month cooldown (skip if setting for first time)
    if (currentUser.profileSlug && !canChangeSlug(currentUser.slugChangedAt)) {
      const daysRemaining = getDaysUntilSlugChange(currentUser.slugChangedAt)
      return NextResponse.json(
        { error: `You can change your slug again in ${daysRemaining} days` },
        { status: 429 }
      )
    }

    // Validate slug format
    const validation = validateSlug(normalizedSlug)
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    // Check if slug is same as current (no change needed)
    if (currentUser.profileSlug === normalizedSlug) {
      return NextResponse.json({ success: true, slug: normalizedSlug, message: 'Slug unchanged' })
    }

    // Check uniqueness
    const existingUser = await db.collection<User>('users').findOne({
      profileSlug: normalizedSlug,
      _id: { $ne: new ObjectId(session.user.id) }
    })

    if (existingUser) {
      return NextResponse.json({ error: 'This slug is already taken' }, { status: 409 })
    }

    // Update user with new slug
    const result = await db.collection<User>('users').updateOne(
      { _id: new ObjectId(session.user.id) },
      {
        $set: {
          profileSlug: normalizedSlug,
          slugChangedAt: new Date(),
          updatedAt: new Date()
        }
      }
    )

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: 'Failed to update slug' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      slug: normalizedSlug,
      message: 'Profile URL updated successfully'
    })
  } catch (error) {
    console.error('Slug update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
