import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getDatabase } from '@/lib/mongodb'
import { CourseRequest } from '@/lib/models/CourseRequest'
import { Course } from '@/lib/models/Course'
import { User } from '@/lib/models/User'
import { ObjectId } from 'mongodb'

// POST /api/courses/request - Submit a new course request
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { code, name, year, department, projectId } = body

    // Validation
    if (!code || code.length < 2) {
      return NextResponse.json(
        { error: 'Course code is required (min 2 characters)' },
        { status: 400 }
      )
    }

    const db = await getDatabase()

    // Get user's university
    const user = await db.collection<User>('users').findOne({
      _id: new ObjectId(session.user.id),
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const normalizedCode = code.toUpperCase().trim()

    // Check if course already exists in catalog for this university
    const existingCourse = await db.collection<Course>('courses').findOne({
      universityId: user.universityId,
      code: normalizedCode,
    })

    if (existingCourse) {
      return NextResponse.json(
        { error: 'This course code already exists in the catalog', courseId: existingCourse._id },
        { status: 400 }
      )
    }

    // Check if there's already a pending request for this course code by this user
    const existingRequest = await db.collection<CourseRequest>('courseRequests').findOne({
      userId: new ObjectId(session.user.id),
      universityId: user.universityId,
      code: normalizedCode,
      status: 'pending',
    })

    if (existingRequest) {
      return NextResponse.json(
        { error: 'You already have a pending request for this course code', requestId: existingRequest._id },
        { status: 400 }
      )
    }

    const now = new Date()
    const newRequest: Omit<CourseRequest, '_id'> = {
      userId: new ObjectId(session.user.id),
      universityId: user.universityId,
      projectId: projectId ? new ObjectId(projectId) : undefined,
      code: normalizedCode,
      name: name?.trim() || '',
      year: year ? parseInt(year) : undefined,
      department: department?.trim() || undefined,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    }

    const result = await db.collection<CourseRequest>('courseRequests').insertOne(newRequest as CourseRequest)

    return NextResponse.json(
      {
        message: 'Course request submitted successfully',
        requestId: result.insertedId,
        status: 'pending',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error submitting course request:', error)
    return NextResponse.json(
      { error: 'Failed to submit course request' },
      { status: 500 }
    )
  }
}

// GET /api/courses/request - Get user's course requests
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const db = await getDatabase()

    const query: Record<string, unknown> = {
      userId: new ObjectId(session.user.id),
    }

    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      query.status = status
    }

    const requests = await db
      .collection<CourseRequest>('courseRequests')
      .find(query)
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray()

    return NextResponse.json({ requests })
  } catch (error) {
    console.error('Error fetching course requests:', error)
    return NextResponse.json(
      { error: 'Failed to fetch course requests' },
      { status: 500 }
    )
  }
}
