import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getDatabase } from '@/lib/mongodb'
import { ProjectCollaborationRequest } from '@/lib/models/ProjectCollaborationRequest'
import { Project } from '@/lib/models/Project'
import { User } from '@/lib/models/User'
import { ObjectId } from 'mongodb'

// PATCH /api/projects/[id]/collaborate/[requestId] - Accept or reject a request
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; requestId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, requestId } = await params

    if (!ObjectId.isValid(id) || !ObjectId.isValid(requestId)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
    }

    const body = await request.json()
    const { action, note } = body

    if (!action || !['accept', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "accept" or "reject"' },
        { status: 400 }
      )
    }

    const db = await getDatabase()

    // Check if project exists and user is the owner
    const project = await db.collection<Project>('projects').findOne({
      _id: new ObjectId(id)
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    if (project.userId.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'Only project owner can review requests' },
        { status: 403 }
      )
    }

    // Get the collaboration request
    const collaborationRequest = await db
      .collection<ProjectCollaborationRequest>('projectCollaborationRequests')
      .findOne({
        _id: new ObjectId(requestId),
        projectId: new ObjectId(id)
      })

    if (!collaborationRequest) {
      return NextResponse.json(
        { error: 'Collaboration request not found' },
        { status: 404 }
      )
    }

    if (collaborationRequest.status !== 'pending') {
      return NextResponse.json(
        { error: 'This request has already been reviewed' },
        { status: 400 }
      )
    }

    const now = new Date()
    const newStatus = action === 'accept' ? 'accepted' : 'rejected'

    // Use atomic update to prevent race conditions - only update if status is still pending
    const updateResult = await db
      .collection<ProjectCollaborationRequest>('projectCollaborationRequests')
      .updateOne(
        { 
          _id: new ObjectId(requestId),
          status: 'pending' // Only update if still pending
        },
        {
          $set: {
            status: newStatus,
            reviewedBy: new ObjectId(session.user.id),
            reviewerNote: note || null,
            reviewedAt: now,
            updatedAt: now
          }
        }
      )

    // Check if the update actually happened (prevents race condition)
    if (updateResult.matchedCount === 0) {
      return NextResponse.json(
        { error: 'This request has already been reviewed' },
        { status: 400 }
      )
    }

    // If accepted, add user to team
    if (action === 'accept') {
      try {
        const requester = await db.collection<User>('users').findOne({
          _id: collaborationRequest.requesterId
        })

        if (!requester) {
          // Roll back the request status update if user doesn't exist
          await db
            .collection<ProjectCollaborationRequest>('projectCollaborationRequests')
            .updateOne(
              { _id: new ObjectId(requestId) },
              {
                $set: {
                  status: 'pending',
                  reviewedBy: null,
                  reviewerNote: null,
                  reviewedAt: null,
                  updatedAt: collaborationRequest.updatedAt ?? collaborationRequest.createdAt
                }
              }
            )
          return NextResponse.json(
            { error: 'Requester user not found' },
            { status: 404 }
          )
        }

        // Check if user is already a team member (prevent race condition)
        const currentProject = await db.collection<Project>('projects').findOne({
          _id: new ObjectId(id)
        })

        if (currentProject) {
          const isAlreadyMember = currentProject.teamMembers.some(
            member => member.userId === requester._id?.toString()
          )

          if (isAlreadyMember) {
            // User is already a team member, don't add again but keep request as accepted
            return NextResponse.json(
              {
                message: 'Request accepted successfully (user already in team)',
                status: newStatus
              },
              { status: 200 }
            )
          }
        }

        await db.collection<Project>('projects').updateOne(
          { _id: new ObjectId(id) },
          {
            $push: {
              teamMembers: {
                name: requester.name,
                email: requester.email,
                role: 'Collaborator',
                indexNumber: requester.indexNumber,
                userId: requester._id?.toString()
              }
            },
            $set: {
              updatedAt: now
            }
          }
        )
      } catch (error) {
        // Roll back the request status update if adding the user to the team fails
        await db
          .collection<ProjectCollaborationRequest>('projectCollaborationRequests')
          .updateOne(
            { _id: new ObjectId(requestId) },
            {
              $set: {
                status: 'pending',
                reviewedBy: null,
                reviewerNote: null,
                reviewedAt: null,
                updatedAt: collaborationRequest.updatedAt ?? collaborationRequest.createdAt
              }
            }
          )
        throw error
      }
    }

    return NextResponse.json(
      {
        message: `Request ${newStatus} successfully`,
        status: newStatus
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error reviewing request:', error)
    return NextResponse.json(
      { error: 'Failed to review request' },
      { status: 500 }
    )
  }
}

// DELETE /api/projects/[id]/collaborate/[requestId] - Cancel a request (requester only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; requestId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, requestId } = await params

    if (!ObjectId.isValid(id) || !ObjectId.isValid(requestId)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
    }

    const db = await getDatabase()

    const collaborationRequest = await db
      .collection<ProjectCollaborationRequest>('projectCollaborationRequests')
      .findOne({
        _id: new ObjectId(requestId),
        projectId: new ObjectId(id)
      })

    if (!collaborationRequest) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      )
    }

    if (collaborationRequest.requesterId.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'Only the requester can cancel this request' },
        { status: 403 }
      )
    }

    if (collaborationRequest.status !== 'pending') {
      return NextResponse.json(
        { error: 'Can only cancel pending requests' },
        { status: 400 }
      )
    }

    await db
      .collection<ProjectCollaborationRequest>('projectCollaborationRequests')
      .deleteOne({ _id: new ObjectId(requestId) })

    return NextResponse.json(
      { message: 'Request cancelled successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error cancelling request:', error)
    return NextResponse.json(
      { error: 'Failed to cancel request' },
      { status: 500 }
    )
  }
}
