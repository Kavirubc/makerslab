/**
 * Client-safe email utility functions
 * These functions are pure and don't require server-side dependencies
 */

/**
 * Validates if email ends with ac.lk domain
 */
export function isValidAcademicEmail(email: string): boolean {
  return email.toLowerCase().endsWith('.ac.lk')
}

/**
 * Extracts email domain from email address
 * e.g., "2022is031@ucsc.cmb.ac.lk" -> "ucsc.cmb.ac.lk"
 */
export function extractEmailDomain(email: string): string {
  const parts = email.split('@')
  return parts.length === 2 ? parts[1].toLowerCase() : ''
}

