'use client'

import { cn } from '@/lib/utils'
import { BadgeType } from '@/lib/models/UserBadge'
import { getBadgeDefinition, BadgeColorScheme } from '@/lib/constants/badges'
import {
  Rocket,
  TrendingUp,
  Heart,
  Users,
  Star,
  LucideIcon
} from 'lucide-react'

// Map icon names to Lucide components
const iconMap: Record<string, LucideIcon> = {
  Rocket,
  TrendingUp,
  Heart,
  Users,
  Star
}

// Color scheme classes for circular glassy badges
const colorSchemeClasses: Record<BadgeColorScheme, string> = {
  gold: 'bg-yellow-500/20 dark:bg-yellow-500/15 border-yellow-500/60 dark:border-yellow-400/50 text-yellow-600 dark:text-yellow-300 hover:bg-yellow-500/30 dark:hover:bg-yellow-500/25 hover:border-yellow-500/80 hover:shadow-lg hover:shadow-yellow-500/25',
  blue: 'bg-blue-500/20 dark:bg-blue-500/15 border-blue-500/60 dark:border-blue-400/50 text-blue-600 dark:text-blue-300 hover:bg-blue-500/30 dark:hover:bg-blue-500/25 hover:border-blue-500/80 hover:shadow-lg hover:shadow-blue-500/25',
  rose: 'bg-rose-500/20 dark:bg-rose-500/15 border-rose-500/60 dark:border-rose-400/50 text-rose-600 dark:text-rose-300 hover:bg-rose-500/30 dark:hover:bg-rose-500/25 hover:border-rose-500/80 hover:shadow-lg hover:shadow-rose-500/25',
  green: 'bg-emerald-500/20 dark:bg-emerald-500/15 border-emerald-500/60 dark:border-emerald-400/50 text-emerald-600 dark:text-emerald-300 hover:bg-emerald-500/30 dark:hover:bg-emerald-500/25 hover:border-emerald-500/80 hover:shadow-lg hover:shadow-emerald-500/25',
  purple: 'bg-purple-500/20 dark:bg-purple-500/15 border-purple-500/60 dark:border-purple-400/50 text-purple-600 dark:text-purple-300 hover:bg-purple-500/30 dark:hover:bg-purple-500/25 hover:border-purple-500/80 hover:shadow-lg hover:shadow-purple-500/25'
}

// Circle size classes
const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12'
}

const iconSizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6'
}

interface UserBadgeProps {
  badgeType: BadgeType
  awardedAt?: Date | string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

/**
 * Circular badge icon with hover/focus tooltip
 */
export function UserBadge({
  badgeType,
  awardedAt,
  size = 'md',
  className
}: UserBadgeProps) {
  const definition = getBadgeDefinition(badgeType)
  const Icon = iconMap[definition.icon] || Star
  const tooltipId = `badge-tooltip-${badgeType}`

  // Format award date
  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="relative group inline-block">
      {/* Circular badge icon - keyboard accessible */}
      <div
        className={cn(
          'flex items-center justify-center rounded-full border-2 backdrop-blur-md cursor-default transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          colorSchemeClasses[definition.colorScheme],
          sizeClasses[size],
          className
        )}
        tabIndex={0}
        role="img"
        aria-label={definition.name}
        aria-describedby={tooltipId}
      >
        <Icon className={iconSizeClasses[size]} aria-hidden="true" />
      </div>

      {/* Tooltip - appears on hover or focus */}
      <div
        id={tooltipId}
        role="tooltip"
        className={cn(
          'absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-lg',
          'bg-popover/95 dark:bg-popover/95 backdrop-blur-sm',
          'border border-border shadow-xl',
          'pointer-events-none opacity-0 invisible scale-95',
          'group-hover:opacity-100 group-hover:visible group-hover:scale-100',
          'group-focus-within:opacity-100 group-focus-within:visible group-focus-within:scale-100',
          'transition-all duration-200 z-50',
          'whitespace-nowrap text-center',
          // Arrow
          'before:content-[""] before:absolute before:top-full before:left-1/2 before:-translate-x-1/2',
          'before:border-4 before:border-transparent before:border-t-border',
          'after:content-[""] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:-mt-[1px]',
          'after:border-4 after:border-transparent after:border-t-popover/95'
        )}
      >
        <div className="font-semibold text-sm">{definition.name}</div>
        <div className="text-muted-foreground text-xs mt-0.5">
          {definition.description}
        </div>
        {awardedAt && (
          <div className="text-muted-foreground/70 text-[10px] mt-1.5 pt-1.5 border-t border-border">
            Earned {formatDate(awardedAt)}
          </div>
        )}
      </div>
    </div>
  )
}
