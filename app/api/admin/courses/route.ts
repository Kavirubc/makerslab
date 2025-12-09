import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getDatabase } from '@/lib/mongodb'
import { Course } from '@/lib/models/Course'
import { User } from '@/lib/models/User'
import { ObjectId } from 'mongodb'

// GET /api/admin/courses - Get all courses (with optional university filter)
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const db = await getDatabase()

    // Check if user is admin
    const user = await db.collection<User>('users').findOne({
      _id: new ObjectId(session.user.id),
    })

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const universityId = searchParams.get('universityId')

    // Build query
    const query: Record<string, unknown> = {}
    if (universityId && ObjectId.isValid(universityId)) {
      query.universityId = new ObjectId(universityId)
    }

    // Get courses with university info
    const courses = await db
      .collection<Course>('courses')
      .aggregate([
        { $match: query },
        {
          $lookup: {
            from: 'universities',
            localField: 'universityId',
            foreignField: '_id',
            as: 'university',
          },
        },
        { $unwind: { path: '$university', preserveNullAndEmptyArrays: true } },
        { $sort: { 'university.name': 1, code: 1 } },
      ])
      .toArray()

    return NextResponse.json({ courses })
  } catch (error) {
    console.error('Error fetching courses:', error)
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    )
  }
}

// POST /api/admin/courses - Create a new course
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const db = await getDatabase()

    // Check if user is admin
    const user = await db.collection<User>('users').findOne({
      _id: new ObjectId(session.user.id),
    })

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { universityId, code, name, year, department } = body

    // Validation
    if (!universityId || !code || !name) {
      return NextResponse.json(
        { error: 'University, code, and name are required' },
        { status: 400 }
      )
    }

    if (!ObjectId.isValid(universityId)) {
      return NextResponse.json(
        { error: 'Invalid university ID' },
        { status: 400 }
      )
    }

    // Check for duplicate code within same university
    const existingCourse = await db.collection<Course>('courses').findOne({
      universityId: new ObjectId(universityId),
      code: code.toUpperCase(),
    })

    if (existingCourse) {
      return NextResponse.json(
        { error: 'Course code already exists for this university' },
        { status: 400 }
      )
    }

    const now = new Date()
    const newCourse: Omit<Course, '_id'> = {
      universityId: new ObjectId(universityId),
      code: code.toUpperCase(),
      name,
      year: year ? parseInt(year) : undefined,
      department: department || undefined,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    }

    const result = await db.collection<Course>('courses').insertOne(newCourse as Course)

    return NextResponse.json(
      { message: 'Course created successfully', courseId: result.insertedId },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating course:', error)
    return NextResponse.json(
      { error: 'Failed to create course' },
      { status: 500 }
    )
  }
}
