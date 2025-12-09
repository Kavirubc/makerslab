import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getDatabase } from '@/lib/mongodb'
import { CourseRequest } from '@/lib/models/CourseRequest'
import { Course } from '@/lib/models/Course'
import { User } from '@/lib/models/User'
import { ObjectId } from 'mongodb'

// GET /api/admin/courses/requests - Get all course requests
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
    const status = searchParams.get('status')
    const universityId = searchParams.get('universityId')

    const query: Record<string, unknown> = {}

    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      query.status = status
    }

    if (universityId && ObjectId.isValid(universityId)) {
      query.universityId = new ObjectId(universityId)
    }

    // Get requests with user and university info
    const requests = await db
      .collection<CourseRequest>('courseRequests')
      .aggregate([
        { $match: query },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'user',
          },
        },
        { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'universities',
            localField: 'universityId',
            foreignField: '_id',
            as: 'university',
          },
        },
        { $unwind: { path: '$university', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'projects',
            localField: 'projectId',
            foreignField: '_id',
            as: 'project',
          },
        },
        { $unwind: { path: '$project', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 1,
            code: 1,
            name: 1,
            year: 1,
            department: 1,
            status: 1,
            adminNote: 1,
            createdAt: 1,
            updatedAt: 1,
            reviewedAt: 1,
            'user._id': 1,
            'user.name': 1,
            'user.email': 1,
            'university._id': 1,
            'university.name': 1,
            'project._id': 1,
            'project.title': 1,
          },
        },
        { $sort: { createdAt: -1 } },
      ])
      .toArray()

    // Get counts by status
    const counts = await db
      .collection<CourseRequest>('courseRequests')
      .aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ])
      .toArray()

    const statusCounts = {
      pending: 0,
      approved: 0,
      rejected: 0,
    }

    for (const c of counts) {
      if (c._id in statusCounts) {
        statusCounts[c._id as keyof typeof statusCounts] = c.count
      }
    }

    return NextResponse.json({ requests, counts: statusCounts })
  } catch (error) {
    console.error('Error fetching course requests:', error)
    return NextResponse.json(
      { error: 'Failed to fetch course requests' },
      { status: 500 }
    )
  }
}
