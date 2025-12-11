import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { getUserBadges, checkAllBadges } from '@/lib/utils/badges'
import { getBadgeDefinition } from '@/lib/constants/badges'
import { UserBadge } from '@/lib/models/UserBadge'

// GET /api/badges - Get badges for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId || !ObjectId.isValid(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 })
    }

    const db = await getDatabase()
    const badges = await getUserBadges(db, new ObjectId(userId))

    // Merge badge data with definitions
    const badgesWithDefinitions = badges.map((badge: UserBadge) => ({
      _id: badge._id?.toString(),
      badgeType: badge.badgeType,
      awardedAt: badge.awardedAt,
      metadata: badge.metadata,
      definition: getBadgeDefinition(badge.badgeType)
    }))

    return NextResponse.json({ badges: badgesWithDefinitions })
  } catch (error) {
    console.error('Error fetching badges:', error)
    return NextResponse.json(
      { error: 'Failed to fetch badges' },
      { status: 500 }
    )
  }
}

// POST /api/badges - Check and award all eligible badges for current user
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const db = await getDatabase()
    const userId = new ObjectId(session.user.id)

    // Check and award all eligible badges
    const newBadges = await checkAllBadges(db, userId)

    return NextResponse.json({
      newBadges,
      message: newBadges.length > 0
        ? `Awarded ${newBadges.length} new badge(s)`
        : 'No new badges earned'
    })
  } catch (error) {
    console.error('Error checking badges:', error)
    return NextResponse.json(
      { error: 'Failed to check badges' },
      { status: 500 }
    )
  }
}
