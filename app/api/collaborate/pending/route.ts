import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getDatabase } from '@/lib/mongodb'
import { ProjectCollaborationRequest } from '@/lib/models/ProjectCollaborationRequest'
import { Project } from '@/lib/models/Project'
import { ObjectId } from 'mongodb'

// GET /api/collaborate/pending - Get pending requests for user's projects
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const db = await getDatabase()

    // Get user's projects
    const userProjects = await db
      .collection<Project>('projects')
      .find({ userId: new ObjectId(session.user.id) })
      .project({ _id: 1 })
      .toArray()

    const projectIds = userProjects.map((p) => p._id)

    if (projectIds.length === 0) {
      return NextResponse.json({ count: 0, requests: [] }, { status: 200 })
    }

    // Get pending requests
    const pendingRequests = await db
      .collection<ProjectCollaborationRequest>('projectCollaborationRequests')
      .aggregate([
        {
          $match: {
            projectId: { $in: projectIds },
            status: 'pending'
          }
        },
        {
          $lookup: {
            from: 'projects',
            localField: 'projectId',
            foreignField: '_id',
            as: 'project'
          }
        },
        {
          $unwind: '$project'
        },
        {
          $lookup: {
            from: 'users',
            localField: 'requesterId',
            foreignField: '_id',
            as: 'requester'
          }
        },
        {
          $unwind: '$requester'
        },
        {
          $project: {
            _id: 1,
            projectId: 1,
            'project.title': 1,
            requesterId: 1,
            'requester.name': 1,
            'requester.profilePicture': 1,
            message: 1,
            skills: 1,
            createdAt: 1
          }
        },
        {
          $sort: { createdAt: -1 }
        }
      ])
      .toArray()

    return NextResponse.json(
      {
        count: pendingRequests.length,
        requests: pendingRequests
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching pending requests:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pending requests' },
      { status: 500 }
    )
  }
}
