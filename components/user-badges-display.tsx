'use client'

import { UserBadge } from './user-badge'
import { BadgeType } from '@/lib/models/UserBadge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Award } from 'lucide-react'

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
  showTitle?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

/**
 * Display grid of user badges for profile page
 */
export function UserBadgesDisplay({
  badges,
  showTitle = true,
  size = 'md',
  className
}: UserBadgesDisplayProps) {
  // Don't render anything if no badges
  if (!badges || badges.length === 0) {
    return null
  }

  return (
    <Card className={className}>
      {showTitle && (
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Award className="h-5 w-5" />
            Achievements
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className={showTitle ? '' : 'pt-6'}>
        <div className="flex flex-wrap gap-2">
          {badges.map((badge, index) => (
            <UserBadge
              key={`${badge.badgeType}-${index}`}
              badgeType={badge.badgeType}
              awardedAt={badge.awardedAt}
              size={size}
              showTooltip
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
