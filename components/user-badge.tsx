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

// Color scheme classes for glassy styling
const colorSchemeClasses: Record<BadgeColorScheme, string> = {
  gold: 'bg-yellow-500/20 dark:bg-yellow-500/15 backdrop-blur-md border-yellow-500/60 dark:border-yellow-400/50 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-500/30 dark:hover:bg-yellow-500/25 hover:border-yellow-500/80 dark:hover:border-yellow-400/70 hover:shadow-lg hover:shadow-yellow-500/30 dark:hover:shadow-yellow-400/20',
  blue: 'bg-blue-500/20 dark:bg-blue-500/15 backdrop-blur-md border-blue-500/60 dark:border-blue-400/50 text-blue-700 dark:text-blue-300 hover:bg-blue-500/30 dark:hover:bg-blue-500/25 hover:border-blue-500/80 dark:hover:border-blue-400/70 hover:shadow-lg hover:shadow-blue-500/30 dark:hover:shadow-blue-400/20',
  rose: 'bg-rose-500/20 dark:bg-rose-500/15 backdrop-blur-md border-rose-500/60 dark:border-rose-400/50 text-rose-700 dark:text-rose-300 hover:bg-rose-500/30 dark:hover:bg-rose-500/25 hover:border-rose-500/80 dark:hover:border-rose-400/70 hover:shadow-lg hover:shadow-rose-500/30 dark:hover:shadow-rose-400/20',
  green: 'bg-emerald-500/20 dark:bg-emerald-500/15 backdrop-blur-md border-emerald-500/60 dark:border-emerald-400/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/30 dark:hover:bg-emerald-500/25 hover:border-emerald-500/80 dark:hover:border-emerald-400/70 hover:shadow-lg hover:shadow-emerald-500/30 dark:hover:shadow-emerald-400/20',
  purple: 'bg-purple-500/20 dark:bg-purple-500/15 backdrop-blur-md border-purple-500/60 dark:border-purple-400/50 text-purple-700 dark:text-purple-300 hover:bg-purple-500/30 dark:hover:bg-purple-500/25 hover:border-purple-500/80 dark:hover:border-purple-400/70 hover:shadow-lg hover:shadow-purple-500/30 dark:hover:shadow-purple-400/20'
}

// Size classes
const sizeClasses = {
  sm: 'px-2 py-0.5 text-[10px] gap-1',
  md: 'px-3 py-1 text-xs gap-1.5',
  lg: 'px-4 py-1.5 text-sm gap-2'
}

const iconSizeClasses = {
  sm: 'h-2.5 w-2.5',
  md: 'h-3 w-3',
  lg: 'h-4 w-4'
}

interface UserBadgeProps {
  badgeType: BadgeType
  awardedAt?: Date | string
  size?: 'sm' | 'md' | 'lg'
  showTooltip?: boolean
  className?: string
}

/**
 * User badge component with glassy styling
 * Displays achievement badges with hover tooltip
 */
export function UserBadge({
  badgeType,
  awardedAt,
  size = 'md',
  showTooltip = true,
  className
}: UserBadgeProps) {
  const definition = getBadgeDefinition(badgeType)
  const Icon = iconMap[definition.icon] || Star

  // Format award date for tooltip
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
      <div
        className={cn(
          'inline-flex items-center justify-center rounded-full border font-medium w-fit whitespace-nowrap shrink-0 cursor-default transition-all duration-200',
          colorSchemeClasses[definition.colorScheme],
          sizeClasses[size],
          className
        )}
      >
        <Icon className={iconSizeClasses[size]} />
        <span>{definition.name}</span>
      </div>

      {/* Tooltip - appears on hover */}
      {showTooltip && (
        <div
          className={cn(
            'absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-4 py-3 rounded-lg text-xs',
            'bg-popover/95 dark:bg-popover/95 backdrop-blur-sm',
            'border border-border shadow-xl',
            'pointer-events-none opacity-0 invisible',
            'group-hover:opacity-100 group-hover:visible',
            'transition-all duration-200 z-50',
            'whitespace-normal w-[220px] text-center',
            'before:content-[""] before:absolute before:top-full before:left-1/2 before:-translate-x-1/2',
            'before:border-4 before:border-transparent before:border-t-popover/95',
            'before:dark:border-t-popover/95'
          )}
        >
          <div className="font-semibold mb-1">{definition.name}</div>
          <div className="text-muted-foreground text-[10px] leading-relaxed mb-1">
            {definition.description}
          </div>
          {awardedAt && (
            <div className="text-muted-foreground text-[10px] mt-2 pt-2 border-t border-border">
              Earned on {formatDate(awardedAt)}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
