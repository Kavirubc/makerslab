import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getDatabase } from '@/lib/mongodb'
import { CourseRequest } from '@/lib/models/CourseRequest'
import { Course } from '@/lib/models/Course'
import { User } from '@/lib/models/User'
import { Project } from '@/lib/models/Project'
import { ObjectId } from 'mongodb'

// PUT /api/admin/courses/requests/[id] - Approve or reject a course request
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
      return NextResponse.json({ error: 'Invalid request ID' }, { status: 400 })
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
    const { action, code, name, year, department, adminNote } = body

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "approve" or "reject"' },
        { status: 400 }
      )
    }

    // Get the request
    const courseRequest = await db.collection<CourseRequest>('courseRequests').findOne({
      _id: new ObjectId(id),
    })

    if (!courseRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    if (courseRequest.status !== 'pending') {
      return NextResponse.json(
        { error: 'This request has already been processed' },
        { status: 400 }
      )
    }

    const now = new Date()

    if (action === 'approve') {
      // Use admin-edited values or fall back to original
      const finalCode = (code || courseRequest.code).toUpperCase().trim()
      const finalName = (name || courseRequest.name).trim()
      const finalYear = year !== undefined ? (year ? parseInt(year) : undefined) : courseRequest.year
      const finalDepartment = department !== undefined ? (department?.trim() || undefined) : courseRequest.department

      // Check if course code already exists for this university
      const existingCourse = await db.collection<Course>('courses').findOne({
        universityId: courseRequest.universityId,
        code: finalCode,
      })

      if (existingCourse) {
        return NextResponse.json(
          { error: 'Course code already exists for this university' },
          { status: 400 }
        )
      }

      // Create the course
      const newCourse: Omit<Course, '_id'> = {
        universityId: courseRequest.universityId,
        code: finalCode,
        name: finalName,
        year: finalYear,
        department: finalDepartment,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      }

      const courseResult = await db.collection<Course>('courses').insertOne(newCourse as Course)

      // Update the request
      await db.collection<CourseRequest>('courseRequests').updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            status: 'approved',
            adminId: new ObjectId(session.user.id),
            adminNote: adminNote || undefined,
            approvedCourseId: courseResult.insertedId,
            reviewedAt: now,
            updatedAt: now,
            // Store the final approved values
            code: finalCode,
            name: finalName,
            year: finalYear,
            department: finalDepartment,
          },
        }
      )

      // If there's an associated project, update its courseCode
      if (courseRequest.projectId) {
        await db.collection<Project>('projects').updateOne(
          { _id: courseRequest.projectId },
          {
            $set: {
              courseCode: finalCode,
              updatedAt: now,
            },
          }
        )
      }

      return NextResponse.json({
        message: 'Course request approved',
        courseId: courseResult.insertedId,
        code: finalCode,
      })
    } else {
      // Reject the request
      if (!adminNote) {
        return NextResponse.json(
          { error: 'Please provide a reason for rejection' },
          { status: 400 }
        )
      }

      await db.collection<CourseRequest>('courseRequests').updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            status: 'rejected',
            adminId: new ObjectId(session.user.id),
            adminNote,
            reviewedAt: now,
            updatedAt: now,
          },
        }
      )

      return NextResponse.json({ message: 'Course request rejected' })
    }
  } catch (error) {
    console.error('Error processing course request:', error)
    return NextResponse.json(
      { error: 'Failed to process course request' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/courses/requests/[id] - Delete a course request
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
      return NextResponse.json({ error: 'Invalid request ID' }, { status: 400 })
    }

    const db = await getDatabase()

    // Check if user is admin
    const user = await db.collection<User>('users').findOne({
      _id: new ObjectId(session.user.id),
    })

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const result = await db.collection<CourseRequest>('courseRequests').deleteOne({
      _id: new ObjectId(id),
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Course request deleted' })
  } catch (error) {
    console.error('Error deleting course request:', error)
    return NextResponse.json(
      { error: 'Failed to delete course request' },
      { status: 500 }
    )
  }
}
