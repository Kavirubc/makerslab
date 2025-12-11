'use client'

import { UserBadge } from './user-badge'
import { BadgeType } from '@/lib/models/UserBadge'

interface BadgeData {
  badgeType: BadgeType
  awardedAt: Date | string
  metadata?: {
    projectId?: string
    totalLikes?: number
    userNumber?: number
  }
}

interface UserBadgesDisplayProps {
  badges: BadgeData[]
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

/**
 * Horizontal row of circular badge icons for profile page
 */
export function UserBadgesDisplay({
  badges,
  size = 'md',
  className
}: UserBadgesDisplayProps) {
  // Don't render if no badges
  if (!badges || badges.length === 0) {
    return null
  }

  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        {badges.map((badge, index) => (
          <UserBadge
            key={`${badge.badgeType}-${index}`}
            badgeType={badge.badgeType}
            awardedAt={badge.awardedAt}
            size={size}
          />
        ))}
      </div>
    </div>
  )
}
