import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getDatabase } from '@/lib/mongodb'
import { Course } from '@/lib/models/Course'
import { User } from '@/lib/models/User'
import { Project } from '@/lib/models/Project'
import { ObjectId } from 'mongodb'

interface CourseResult {
  code: string
  name: string
  year?: number
  source: 'catalog' | 'projects'
}

// GET /api/courses/search?q=xxx - Search courses by user's university
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query || query.length < 2) {
      return NextResponse.json({ courses: [] })
    }

    const db = await getDatabase()

    // Get user's university
    const user = await db.collection<User>('users').findOne({
      _id: new ObjectId(session.user.id),
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const results: CourseResult[] = []

    // 1. Search courses from the Course catalog (filtered by user's university)
    const catalogCourses = await db
      .collection<Course>('courses')
      .find({
        universityId: user.universityId,
        isActive: true,
        $or: [
          { code: { $regex: query, $options: 'i' } },
          { name: { $regex: query, $options: 'i' } },
        ],
      })
      .limit(10)
      .toArray()

    // Add catalog courses to results
    for (const course of catalogCourses) {
      results.push({
        code: course.code,
        name: course.name,
        year: course.year,
        source: 'catalog',
      })
    }

    // 2. Also get distinct course codes from existing public projects
    // (in case there are custom codes not in the catalog)
    const projectCodes = await db
      .collection<Project>('projects')
      .distinct('courseCode', {
        isPublic: true,
        isDraft: { $ne: true },
        courseCode: { $regex: query, $options: 'i' },
      })

    // Add project codes that aren't already in results
    const existingCodes = new Set(results.map((r) => r.code.toUpperCase()))
    for (const code of projectCodes) {
      if (
        typeof code === 'string' &&
        code.length > 0 &&
        !existingCodes.has(code.toUpperCase())
      ) {
        results.push({
          code,
          name: '',
          source: 'projects',
        })
      }
    }

    // Limit total results
    const limitedResults = results.slice(0, 15)

    return NextResponse.json({ courses: limitedResults })
  } catch (error) {
    console.error('Error searching course codes:', error)
    return NextResponse.json(
      { error: 'Failed to search courses' },
      { status: 500 }
    )
  }
}
