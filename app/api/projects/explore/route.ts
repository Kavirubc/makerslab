import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { Project } from '@/lib/models/Project'

// GET /api/projects/explore - Get all public projects
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = parseInt(searchParams.get('skip') || '0')

    // Course/academic filters
    const courseCode = searchParams.get('courseCode')
    const academicPeriod = searchParams.get('academicPeriod')
    const teamSize = searchParams.get('teamSize')
    const academicType = searchParams.get('academicType')

    const db = await getDatabase()
    // exclude drafts from public explore
    const query: any = { isPublic: true, isDraft: { $ne: true } }

    if (category && category !== 'all') {
      query.category = category
    }

    // Course/academic filters
    if (courseCode) {
      query.courseCode = { $regex: courseCode, $options: 'i' }
    }

    if (academicPeriod) {
      query.academicPeriod = academicPeriod
    }

    if (teamSize) {
      query.teamSize = teamSize
    }

    if (academicType) {
      query.academicType = academicType
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
        { courseCode: { $regex: search, $options: 'i' } }
      ]
    }

    const projects = await db
      .collection<Project>('projects')
      .find(query)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()

    const total = await db.collection<Project>('projects').countDocuments(query)

    return NextResponse.json({
      projects,
      total,
      hasMore: skip + limit < total
    })
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    )
  }
}
