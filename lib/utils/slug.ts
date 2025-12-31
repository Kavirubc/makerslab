// Slug validation utilities for custom profile URLs

// Reserved words that cannot be used as slugs
const RESERVED_SLUGS = [
  'edit',
  'settings',
  'admin',
  'api',
  'new',
  'create',
  'delete',
  'login',
  'logout',
  'signup',
  'register',
  'profile',
  'dashboard',
  'projects',
  'contributors'
]

// Slug format: 3-10 chars, lowercase alphanumeric + hyphens, no start/end hyphen
const SLUG_REGEX = /^[a-z0-9][a-z0-9-]{1,8}[a-z0-9]$|^[a-z0-9]{3}$/

// MongoDB ObjectId pattern (24 hex characters)
const OBJECTID_REGEX = /^[0-9a-f]{24}$/i

export interface SlugValidationResult {
  valid: boolean
  error?: string
}

// Validate slug format and rules
export function validateSlug(slug: string): SlugValidationResult {
  const normalizedSlug = slug.toLowerCase().trim()

  // Check length
  if (normalizedSlug.length < 3) {
    return { valid: false, error: 'Slug must be at least 3 characters' }
  }
  if (normalizedSlug.length > 10) {
    return { valid: false, error: 'Slug must be at most 10 characters' }
  }

  // Check format (lowercase alphanumeric and hyphens)
  if (!SLUG_REGEX.test(normalizedSlug)) {
    return { valid: false, error: 'Only lowercase letters, numbers, and hyphens allowed' }
  }

  // Check for consecutive hyphens
  if (normalizedSlug.includes('--')) {
    return { valid: false, error: 'Cannot contain consecutive hyphens' }
  }

  // Check reserved words
  if (RESERVED_SLUGS.includes(normalizedSlug)) {
    return { valid: false, error: 'This slug is reserved' }
  }

  // Prevent ObjectId-like slugs
  if (OBJECTID_REGEX.test(normalizedSlug)) {
    return { valid: false, error: 'Slug cannot look like an ID' }
  }

  return { valid: true }
}

// Check if 6-month cooldown has passed
export function canChangeSlug(slugChangedAt: Date | null | undefined): boolean {
  if (!slugChangedAt) return true
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
  return new Date(slugChangedAt) < sixMonthsAgo
}

// Get days remaining until slug can be changed
export function getDaysUntilSlugChange(slugChangedAt: Date | null | undefined): number {
  if (!slugChangedAt) return 0
  const changeDate = new Date(slugChangedAt)
  const sixMonthsFromChange = new Date(changeDate)
  sixMonthsFromChange.setMonth(sixMonthsFromChange.getMonth() + 6)
  const now = new Date()
  const diffTime = sixMonthsFromChange.getTime() - now.getTime()
  return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))
}

// Check if identifier is an ObjectId (vs a slug)
export function isObjectId(identifier: string): boolean {
  return OBJECTID_REGEX.test(identifier)
}

// Normalize slug for storage/comparison
export function normalizeSlug(slug: string): string {
  return slug.toLowerCase().trim()
}
