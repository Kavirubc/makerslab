import { BadgeType } from '@/lib/models/UserBadge'

// Badge color schemes for glassy styling
export type BadgeColorScheme = 'gold' | 'blue' | 'rose' | 'green' | 'purple'

export interface BadgeDefinition {
  type: BadgeType
  name: string
  description: string
  icon: string // Lucide icon name
  colorScheme: BadgeColorScheme
  criteria: string // Human-readable criteria
}

export const BADGE_DEFINITIONS: Record<BadgeType, BadgeDefinition> = {
  'first-project': {
    type: 'first-project',
    name: 'Pioneer',
    description: 'Uploaded your first project',
    icon: 'Rocket',
    colorScheme: 'blue',
    criteria: 'Upload your first project to the platform'
  },
  'popular-project': {
    type: 'popular-project',
    name: 'Trending',
    description: 'One of your projects reached 100+ views',
    icon: 'TrendingUp',
    colorScheme: 'gold',
    criteria: 'Get 100+ views on any project'
  },
  'loved-creator': {
    type: 'loved-creator',
    name: 'Beloved',
    description: 'Received 10+ likes across all projects',
    icon: 'Heart',
    colorScheme: 'rose',
    criteria: 'Receive 10+ total likes on your projects'
  },
  'team-player': {
    type: 'team-player',
    name: 'Team Player',
    description: 'Contributed to 5 different projects',
    icon: 'Users',
    colorScheme: 'green',
    criteria: 'Be listed as a team member on 5 different projects'
  },
  'early-adopter': {
    type: 'early-adopter',
    name: 'Early Adopter',
    description: 'One of the first 100 users on the platform',
    icon: 'Star',
    colorScheme: 'purple',
    criteria: 'Be among the first 100 registered users'
  }
}

// Helper to get badge definition by type
export function getBadgeDefinition(type: BadgeType): BadgeDefinition {
  return BADGE_DEFINITIONS[type]
}

// Get all badge types as array
export function getAllBadgeTypes(): BadgeType[] {
  return Object.keys(BADGE_DEFINITIONS) as BadgeType[]
}
