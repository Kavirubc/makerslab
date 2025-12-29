import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getDatabase } from '@/lib/mongodb'
import { ProjectCollaborationRequest } from '@/lib/models/ProjectCollaborationRequest'
import { ObjectId } from 'mongodb'

// GET /api/projects/[id]/collaborate/status - Check user's request status
export async function GET(
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
      return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 })
    }

    const db = await getDatabase()

    const collaborationRequest = await db
      .collection<ProjectCollaborationRequest>('projectCollaborationRequests')
      .findOne({
        projectId: new ObjectId(id),
        requesterId: new ObjectId(session.user.id)
      })

    if (!collaborationRequest) {
      return NextResponse.json(
        { hasRequest: false, request: null },
        { status: 200 }
      )
    }

    return NextResponse.json(
      {
        hasRequest: true,
        request: {
          _id: collaborationRequest._id,
          status: collaborationRequest.status,
          message: collaborationRequest.message,
          skills: collaborationRequest.skills,
          reviewerNote: collaborationRequest.reviewerNote,
          reviewedAt: collaborationRequest.reviewedAt,
          createdAt: collaborationRequest.createdAt
        }
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error checking request status:', error)
    return NextResponse.json(
      { error: 'Failed to check request status' },
      { status: 500 }
    )
  }
}
