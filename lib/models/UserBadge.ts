import { ObjectId } from 'mongodb'

// Badge type enumeration
export type BadgeType =
  | 'first-project'    // First project upload
  | 'popular-project'  // 100+ views on any project
  | 'loved-creator'    // 10+ total likes received
  | 'team-player'      // Contributing to 5 projects
  | 'early-adopter'    // First 100 users

export interface UserBadge {
  _id?: ObjectId
  userId: ObjectId
  badgeType: BadgeType
  awardedAt: Date
  metadata?: {
    projectId?: string      // For first-project, popular-project
    totalLikes?: number     // For loved-creator (snapshot when awarded)
    contributionCount?: number // For team-player
    userNumber?: number     // For early-adopter (e.g., "User #47")
  }
}
