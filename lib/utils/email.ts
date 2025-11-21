/**
 * Client-safe email utility functions
 * These functions are pure and don't require server-side dependencies
 */

/**
 * Basic email format validation (client-side only)
 * This only checks if the email has a valid format (has @, valid domain structure)
 * Full validation (checking if domain exists in database) must be done server-side
 */
export function isValidAcademicEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.toLowerCase())
}

/**
 * Extracts email domain from email address
 * e.g., "2022is031@ucsc.cmb.ac.lk" -> "ucsc.cmb.ac.lk"
 */
export function extractEmailDomain(email: string): string {
  const parts = email.split('@')
  return parts.length === 2 ? parts[1].toLowerCase() : ''
}

