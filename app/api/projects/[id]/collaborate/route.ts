import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getDatabase } from '@/lib/mongodb'
import { ProjectCollaborationRequest } from '@/lib/models/ProjectCollaborationRequest'
import { Project } from '@/lib/models/Project'
import { ObjectId } from 'mongodb'

// POST /api/projects/[id]/collaborate - Create a collaboration request
export async function POST(
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

    const body = await request.json()
    const { message, skills } = body

    // Validate required fields
    if (!message || !skills || !Array.isArray(skills) || skills.length === 0) {
      return NextResponse.json(
        { error: 'Message and at least one skill are required' },
        { status: 400 }
      )
    }

    if (message.trim().length < 20) {
      return NextResponse.json(
        { error: 'Message must be at least 20 characters' },
        { status: 400 }
      )
    }

    if (message.trim().length > 1000) {
      return NextResponse.json(
        { error: 'Message must be at most 1000 characters' },
        { status: 400 }
      )
    }
    const db = await getDatabase()

    // Check if project exists
    const project = await db.collection<Project>('projects').findOne({
      _id: new ObjectId(id)
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Check if project is in-progress
    if (project.status !== 'in-progress') {
      return NextResponse.json(
        { error: 'Can only request to join in-progress projects' },
        { status: 400 }
      )
    }

    // Check if user is the project owner
    if (project.userId.toString() === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot request to join your own project' },
        { status: 400 }
      )
    }

    // Check if user is already a team member
    const isTeamMember = project.teamMembers.some(
      member => member.userId === session.user.id
    )

    if (isTeamMember) {
      return NextResponse.json(
        { error: 'You are already a team member of this project' },
        { status: 400 }
      )
    }

    // Check if user already has a pending request
    const existingRequest = await db
      .collection<ProjectCollaborationRequest>('projectCollaborationRequests')
      .findOne({
        projectId: new ObjectId(id),
        requesterId: new ObjectId(session.user.id),
        status: 'pending'
      })

    if (existingRequest) {
      return NextResponse.json(
        { error: 'You already have a pending request for this project' },
        { status: 400 }
      )
    }

    // Normalize and validate skills
    const MAX_SKILL_LENGTH = 100
    const MAX_SKILLS = 20

    const normalizedSkills: string[] = Array.isArray(skills)
      ? skills
          .map((s: unknown) =>
            typeof s === 'string' ? s.trim() : ''
          )
          .filter((s: string) => s.length > 0)
      : []

    if (normalizedSkills.length > MAX_SKILLS) {
      return NextResponse.json(
        { error: `You can specify at most ${MAX_SKILLS} skills` },
        { status: 400 }
      )
    }

    const tooLongSkill = normalizedSkills.find(
      (s: string) => s.length > MAX_SKILL_LENGTH
    )

    if (tooLongSkill) {
      return NextResponse.json(
        {
          error: `Each skill must be at most ${MAX_SKILL_LENGTH} characters long`
        },
        { status: 400 }
      )
    }

    // Create collaboration request
    const newRequest: Omit<ProjectCollaborationRequest, '_id'> = {
      projectId: new ObjectId(id),
      requesterId: new ObjectId(session.user.id),
      message: message.trim(),
      skills: normalizedSkills,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    try {
      const result = await db
        .collection<ProjectCollaborationRequest>('projectCollaborationRequests')
        .insertOne(newRequest as ProjectCollaborationRequest)

      return NextResponse.json(
        {
          message: 'Collaboration request sent successfully',
          requestId: result.insertedId
        },
        { status: 201 }
      )
    } catch (error: any) {
      // Handle potential duplicate key error if user submitted twice simultaneously
      if (error.code === 11000) {
        return NextResponse.json(
          { error: 'You already have a pending request for this project' },
          { status: 400 }
        )
      }
      throw error
    }
  } catch (error) {
    console.error('Error creating collaboration request:', error)
    return NextResponse.json(
      { error: 'Failed to create collaboration request' },
      { status: 500 }
    )
  }
}

// GET /api/projects/[id]/collaborate - Get collaboration requests for a project (owner only)
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

    // Check if project exists and user is the owner
    const project = await db.collection<Project>('projects').findOne({
      _id: new ObjectId(id)
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    if (project.userId.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'Only project owner can view collaboration requests' },
        { status: 403 }
      )
    }

    // Get all collaboration requests with requester info
    const requests = await db
      .collection<ProjectCollaborationRequest>('projectCollaborationRequests')
      .aggregate([
        {
          $match: {
            projectId: new ObjectId(id)
          }
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
            requesterId: 1,
            message: 1,
            skills: 1,
            status: 1,
            reviewedBy: 1,
            reviewerNote: 1,
            reviewedAt: 1,
            createdAt: 1,
            updatedAt: 1,
            'requester._id': 1,
            'requester.name': 1,
            'requester.email': 1,
            'requester.profilePicture': 1,
            'requester.bio': 1,
            'requester.github': 1,
            'requester.linkedin': 1
          }
        },
        {
          $sort: { createdAt: -1 }
        }
      ])
      .toArray()

    return NextResponse.json({ requests }, { status: 200 })
  } catch (error) {
    console.error('Error fetching collaboration requests:', error)
    return NextResponse.json(
      { error: 'Failed to fetch collaboration requests' },
      { status: 500 }
    )
  }
}
