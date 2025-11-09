import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import { Session } from 'next-auth'

/**
 * Check if the current session user is an admin
 */
export function isAdmin(session: Session | null): boolean {
  if (!session?.user) {
    return false
  }
  return (session.user as any).role === 'admin'
}

/**
 * Get admin user from session
 * Returns null if user is not an admin
 */
export function getAdminUser(session: Session | null) {
  if (!session || !isAdmin(session)) {
    return null
  }
  return session.user
}

/**
 * Middleware function to require admin access for API routes
 * Returns NextResponse with 403 if user is not admin
 * Returns null if user is admin (proceed with request)
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  const session = await auth()
  
  if (!session?.user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  if (!isAdmin(session)) {
    return NextResponse.json(
      { error: 'Forbidden: Admin access required' },
      { status: 403 }
    )
  }

  return null
}

