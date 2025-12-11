import { ObjectId, Db } from 'mongodb'
import { UserBadge, BadgeType } from '@/lib/models/UserBadge'
import { Project } from '@/lib/models/Project'
import { User } from '@/lib/models/User'

// Check if user already has a specific badge
export async function userHasBadge(
  db: Db,
  userId: ObjectId,
  badgeType: BadgeType
): Promise<boolean> {
  const existing = await db.collection<UserBadge>('userBadges').findOne({
    userId,
    badgeType
  })
  return !!existing
}

// Award a badge to user (with duplicate prevention)
export async function awardBadge(
  db: Db,
  userId: ObjectId,
  badgeType: BadgeType,
  metadata?: UserBadge['metadata']
): Promise<{ awarded: boolean; badge?: UserBadge }> {
  // Check if already has badge
  if (await userHasBadge(db, userId, badgeType)) {
    return { awarded: false }
  }

  const badge: Omit<UserBadge, '_id'> = {
    userId,
    badgeType,
    awardedAt: new Date(),
    metadata
  }

  try {
    const result = await db.collection<UserBadge>('userBadges').insertOne(badge as UserBadge)
    return {
      awarded: true,
      badge: { ...badge, _id: result.insertedId } as UserBadge
    }
  } catch (error) {
    // Handle duplicate key error (race condition)
    if ((error as { code?: number }).code === 11000) {
      return { awarded: false }
    }
    throw error
  }
}

// Check and award "First Project" badge
export async function checkFirstProjectBadge(
  db: Db,
  userId: ObjectId,
  projectId: string
): Promise<{ awarded: boolean; badgeType?: BadgeType }> {
  // Count user's published (non-draft) projects
  const projectCount = await db.collection<Project>('projects').countDocuments({
    userId,
    isDraft: { $ne: true }
  })

  // Award if this is their first published project
  if (projectCount === 1) {
    const result = await awardBadge(db, userId, 'first-project', { projectId })
    if (result.awarded) {
      return { awarded: true, badgeType: 'first-project' }
    }
  }
  return { awarded: false }
}

// Check and award "Popular Project" badge (100+ views)
export async function checkPopularProjectBadge(
  db: Db,
  userId: ObjectId,
  projectId: string,
  currentViews: number
): Promise<{ awarded: boolean; badgeType?: BadgeType }> {
  // Only award if views crossed 100 threshold
  if (currentViews >= 100) {
    const result = await awardBadge(db, userId, 'popular-project', { projectId })
    if (result.awarded) {
      return { awarded: true, badgeType: 'popular-project' }
    }
  }
  return { awarded: false }
}

// Check and award "Loved Creator" badge (10+ total likes)
export async function checkLovedCreatorBadge(
  db: Db,
  userId: ObjectId
): Promise<{ awarded: boolean; badgeType?: BadgeType }> {
  // Sum all likes across user's projects using aggregation
  const result = await db.collection<Project>('projects').aggregate<{ totalLikes: number }>([
    { $match: { userId } },
    { $group: { _id: null, totalLikes: { $sum: { $ifNull: ['$likes', 0] } } } }
  ]).toArray()

  const totalLikes = result[0]?.totalLikes || 0

  if (totalLikes >= 10) {
    const awardResult = await awardBadge(db, userId, 'loved-creator', { totalLikes })
    if (awardResult.awarded) {
      return { awarded: true, badgeType: 'loved-creator' }
    }
  }
  return { awarded: false }
}

// Check and award "Team Player" badge (5 contributions)
export async function checkTeamPlayerBadge(
  db: Db,
  userId: ObjectId
): Promise<{ awarded: boolean; badgeType?: BadgeType }> {
  const userIdStr = userId.toString()

  // Count projects where user is listed as team member (via userId field in teamMembers)
  const contributionCount = await db.collection<Project>('projects').countDocuments({
    'teamMembers.userId': userIdStr,
    isDraft: { $ne: true }
  })

  if (contributionCount >= 5) {
    const result = await awardBadge(db, userId, 'team-player', { contributionCount })
    if (result.awarded) {
      return { awarded: true, badgeType: 'team-player' }
    }
  }
  return { awarded: false }
}

// Check and award "Early Adopter" badge (first 100 users)
export async function checkEarlyAdopterBadge(
  db: Db,
  userId: ObjectId
): Promise<{ awarded: boolean; badgeType?: BadgeType }> {
  // Get user's creation date
  const user = await db.collection<User>('users').findOne({ _id: userId })
  if (!user) return { awarded: false }

  // Count total users created before or including this user
  const userNumber = await db.collection<User>('users').countDocuments({
    createdAt: { $lte: user.createdAt }
  })

  if (userNumber <= 100) {
    const result = await awardBadge(db, userId, 'early-adopter', { userNumber })
    if (result.awarded) {
      return { awarded: true, badgeType: 'early-adopter' }
    }
  }
  return { awarded: false }
}

// Get all badges for a user
export async function getUserBadges(
  db: Db,
  userId: ObjectId
): Promise<UserBadge[]> {
  return db.collection<UserBadge>('userBadges')
    .find({ userId })
    .sort({ awardedAt: -1 })
    .toArray()
}

// Check all eligible badges for a user (useful for manual/batch checks)
export async function checkAllBadges(
  db: Db,
  userId: ObjectId
): Promise<BadgeType[]> {
  const newBadges: BadgeType[] = []

  // Check early adopter
  const earlyResult = await checkEarlyAdopterBadge(db, userId)
  if (earlyResult.awarded && earlyResult.badgeType) {
    newBadges.push(earlyResult.badgeType)
  }

  // Check first project
  const projects = await db.collection<Project>('projects')
    .find({ userId, isDraft: { $ne: true } })
    .limit(1)
    .toArray()

  if (projects.length > 0) {
    const firstResult = await checkFirstProjectBadge(db, userId, projects[0]._id!.toString())
    if (firstResult.awarded && firstResult.badgeType) {
      newBadges.push(firstResult.badgeType)
    }
  }

  // Check loved creator
  const lovedResult = await checkLovedCreatorBadge(db, userId)
  if (lovedResult.awarded && lovedResult.badgeType) {
    newBadges.push(lovedResult.badgeType)
  }

  // Check team player
  const teamResult = await checkTeamPlayerBadge(db, userId)
  if (teamResult.awarded && teamResult.badgeType) {
    newBadges.push(teamResult.badgeType)
  }

  // Check popular project
  const popularProjects = await db.collection<Project>('projects')
    .find({ userId, views: { $gte: 100 } })
    .limit(1)
    .toArray()

  if (popularProjects.length > 0) {
    const popularResult = await checkPopularProjectBadge(
      db,
      userId,
      popularProjects[0]._id!.toString(),
      popularProjects[0].views || 0
    )
    if (popularResult.awarded && popularResult.badgeType) {
      newBadges.push(popularResult.badgeType)
    }
  }

  return newBadges
}
