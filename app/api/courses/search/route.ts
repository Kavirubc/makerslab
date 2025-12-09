import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { Project } from '@/lib/models/Project'

// GET /api/courses/search?q=xxx - Get distinct course codes from existing projects
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query || query.length < 2) {
      return NextResponse.json({ codes: [] })
    }

    const db = await getDatabase()

    // Get distinct course codes matching the query from public, non-draft projects
    const codes = await db
      .collection<Project>('projects')
      .distinct('courseCode', {
        isPublic: true,
        isDraft: { $ne: true },
        courseCode: { $regex: query, $options: 'i' },
      })

    // Filter out null/undefined and limit results
    const filteredCodes = codes
      .filter((code): code is string => typeof code === 'string' && code.length > 0)
      .slice(0, 10)

    return NextResponse.json({ codes: filteredCodes })
  } catch (error) {
    console.error('Error searching course codes:', error)
    return NextResponse.json(
      { error: 'Failed to search courses' },
      { status: 500 }
    )
  }
}
