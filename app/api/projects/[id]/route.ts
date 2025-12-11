import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getDatabase } from '@/lib/mongodb'
import { Project } from '@/lib/models/Project'
import { ObjectId } from 'mongodb'
import { checkPopularProjectBadge, checkFirstProjectBadge, checkTeamPlayerBadge } from '@/lib/utils/badges'
import { BadgeType } from '@/lib/models/UserBadge'

// GET /api/projects/[id] - Get a specific project
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 })
    }

    const db = await getDatabase()
    const project = await db.collection<Project>('projects').findOne({
      _id: new ObjectId(id)
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Increment view count
    const newViews = (project.views || 0) + 1
    await db.collection<Project>('projects').updateOne(
      { _id: new ObjectId(id) },
      { $inc: { views: 1 } }
    )

    // Check for popular project badge at 100+ views milestone
    let ownerBadge: BadgeType | null = null
    if (newViews >= 100) {
      const badgeResult = await checkPopularProjectBadge(db, project.userId, id, newViews)
      if (badgeResult.awarded) {
        ownerBadge = badgeResult.badgeType || null
      }
    }

    return NextResponse.json({
      project,
      ownerBadge, // Badge earned by project owner (for notification)
      ownerId: project.userId.toString()
    })
  } catch (error) {
    console.error('Error fetching project:', error)
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    )
  }
}

// PUT /api/projects/[id] - Update a project
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
      return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 })
    }

    const db = await getDatabase()
    const project = await db.collection<Project>('projects').findOne({
      _id: new ObjectId(id)
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Check ownership
    if (project.userId.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const updateData = {
      ...body,
      userId: project.userId, // Keep original userId
      views: project.views, // Keep view count
      likes: project.likes, // Keep like count
      createdAt: project.createdAt, // Keep creation date
      updatedAt: new Date()
    }

    if (body.startDate) updateData.startDate = new Date(body.startDate)
    if (body.endDate) updateData.endDate = new Date(body.endDate)

    await db.collection<Project>('projects').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    )

    // Check for badges when publishing (transitioning from draft to published)
    const newBadges: BadgeType[] = []
    const isPublishing = project.isDraft === true && body.isDraft === false

    if (isPublishing) {
      // Check first project badge for the owner
      const firstProjectResult = await checkFirstProjectBadge(
        db,
        new ObjectId(session.user.id),
        id
      )
      if (firstProjectResult.awarded && firstProjectResult.badgeType) {
        newBadges.push(firstProjectResult.badgeType)
      }

      // Check team player badge for team members who are registered users
      const teamMembers = body.teamMembers || project.teamMembers || []
      await Promise.all(
        teamMembers
          .filter(member => member.userId && ObjectId.isValid(member.userId))
          .map(member =>
            checkTeamPlayerBadge(db, new ObjectId(member.userId))
          )
      )
    }

    return NextResponse.json({
      message: 'Project updated successfully',
      newBadges: newBadges.length > 0 ? newBadges : null
    })
  } catch (error) {
    console.error('Error updating project:', error)
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    )
  }
}

// PATCH /api/projects/[id] - Auto-save partial update for drafts
export async function PATCH(
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
    const project = await db.collection<Project>('projects').findOne({
      _id: new ObjectId(id)
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // check ownership
    if (project.userId.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const now = new Date()

    // build update object with only provided fields
    const updateFields: Record<string, unknown> = {
      updatedAt: now,
      lastAutoSavedAt: now,
    }

    // allowed fields for auto-save
    const allowedFields = [
      'title', 'description', 'category', 'tags',
      'thumbnailUrl', 'slidesDeckUrl', 'pitchVideoUrl', 'demoUrl', 'githubUrl',
      'teamMembers', 'status', 'isDraft',
      'courseCode', 'academicPeriod', 'teamSize', 'academicType'
    ]

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateFields[field] = body[field]
      }
    }

    // handle date fields
    if (body.startDate) updateFields.startDate = new Date(body.startDate)
    if (body.endDate) updateFields.endDate = new Date(body.endDate)

    await db.collection<Project>('projects').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    )

    return NextResponse.json({
      message: 'Draft saved',
      projectId: id,
      lastAutoSavedAt: now.toISOString()
    })
  } catch (error) {
    console.error('Error auto-saving project:', error)
    return NextResponse.json(
      { error: 'Failed to save draft' },
      { status: 500 }
    )
  }
}

// DELETE /api/projects/[id] - Delete a project
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
      return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 })
    }

    const db = await getDatabase()
    const project = await db.collection<Project>('projects').findOne({
      _id: new ObjectId(id)
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Check ownership
    if (project.userId.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await db.collection<Project>('projects').deleteOne({
      _id: new ObjectId(id)
    })

    return NextResponse.json({ message: 'Project deleted successfully' })
  } catch (error) {
    console.error('Error deleting project:', error)
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    )
  }
}
