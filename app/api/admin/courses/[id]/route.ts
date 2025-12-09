import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getDatabase } from '@/lib/mongodb'
import { Course } from '@/lib/models/Course'
import { User } from '@/lib/models/User'
import { ObjectId } from 'mongodb'

// PUT /api/admin/courses/[id] - Update a course
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid course ID' }, { status: 400 })
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
    const { code, name, year, department, isActive } = body

    // Validation
    if (!code || !name) {
      return NextResponse.json(
        { error: 'Code and name are required' },
        { status: 400 }
      )
    }

    // Get existing course
    const existingCourse = await db.collection<Course>('courses').findOne({
      _id: new ObjectId(id),
    })

    if (!existingCourse) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    // Check for duplicate code within same university (if code changed)
    if (code.toUpperCase() !== existingCourse.code) {
      const duplicateCourse = await db.collection<Course>('courses').findOne({
        universityId: existingCourse.universityId,
        code: code.toUpperCase(),
        _id: { $ne: new ObjectId(id) },
      })

      if (duplicateCourse) {
        return NextResponse.json(
          { error: 'Course code already exists for this university' },
          { status: 400 }
        )
      }
    }

    await db.collection<Course>('courses').updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          code: code.toUpperCase(),
          name,
          year: year ? parseInt(year) : undefined,
          department: department || undefined,
          isActive: isActive !== false,
          updatedAt: new Date(),
        },
      }
    )

    return NextResponse.json({ message: 'Course updated successfully' })
  } catch (error) {
    console.error('Error updating course:', error)
    return NextResponse.json(
      { error: 'Failed to update course' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/courses/[id] - Delete a course
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid course ID' }, { status: 400 })
    }

    const db = await getDatabase()

    // Check if user is admin
    const user = await db.collection<User>('users').findOne({
      _id: new ObjectId(session.user.id),
    })

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const result = await db.collection<Course>('courses').deleteOne({
      _id: new ObjectId(id),
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Course deleted successfully' })
  } catch (error) {
    console.error('Error deleting course:', error)
    return NextResponse.json(
      { error: 'Failed to delete course' },
      { status: 500 }
    )
  }
}
