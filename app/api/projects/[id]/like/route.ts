import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getDatabase } from '@/lib/mongodb'
import { ProjectLike } from '@/lib/models/ProjectLike'
import { Project } from '@/lib/models/Project'
import { ObjectId } from 'mongodb'
import { checkLovedCreatorBadge } from '@/lib/utils/badges'

// GET /api/projects/[id]/like - Check if user has liked the project
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const { id } = await params

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 })
    }

    const db = await getDatabase()

    // Get project to get current like count
    const project = await db.collection<Project>('projects').findOne({
      _id: new ObjectId(id)
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Check if user has liked (if authenticated)
    let isLiked = false
    if (session?.user) {
      const like = await db.collection<ProjectLike>('projectLikes').findOne({
        userId: new ObjectId(session.user.id),
        projectId: new ObjectId(id)
      })
      isLiked = !!like
    }

    return NextResponse.json({
      isLiked,
      likesCount: project.likes || 0
    })
  } catch (error) {
    console.error('Error checking like status:', error)
    return NextResponse.json(
      { error: 'Failed to check like status' },
      { status: 500 }
    )
  }
}

// POST /api/projects/[id]/like - Like a project
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

    const db = await getDatabase()

    // Check if project exists
    const project = await db.collection<Project>('projects').findOne({
      _id: new ObjectId(id)
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const userId = new ObjectId(session.user.id)
    const projectId = new ObjectId(id)

    // Check if user already liked this project
    const existingLike = await db.collection<ProjectLike>('projectLikes').findOne({
      userId,
      projectId
    })

    if (existingLike) {
      // Already liked, return current state
      const likesCount = project.likes || 0
      return NextResponse.json({
        liked: true,
        likesCount
      })
    }

    // Create like and increment count atomically
    await Promise.all([
      db.collection<ProjectLike>('projectLikes').insertOne({
        userId,
        projectId,
        createdAt: new Date()
      } as ProjectLike),
      db.collection<Project>('projects').updateOne(
        { _id: projectId },
        { $inc: { likes: 1 } }
      )
    ])

    const updatedProject = await db.collection<Project>('projects').findOne({
      _id: projectId
    })

    // Check if project owner earned the "loved creator" badge
    const badgeResult = await checkLovedCreatorBadge(db, project.userId)

    return NextResponse.json({
      liked: true,
      likesCount: updatedProject?.likes || 0,
      ownerNewBadge: badgeResult.awarded ? badgeResult.badgeType : null,
      ownerId: project.userId.toString()
    })
  } catch (error) {
    console.error('Error liking project:', error)
    return NextResponse.json(
      { error: 'Failed to like project' },
      { status: 500 }
    )
  }
}

// DELETE /api/projects/[id]/like - Unlike a project
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

    // Check if project exists
    const project = await db.collection<Project>('projects').findOne({
      _id: new ObjectId(id)
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const userId = new ObjectId(session.user.id)
    const projectId = new ObjectId(id)

    // Check if user has liked this project
    const existingLike = await db.collection<ProjectLike>('projectLikes').findOne({
      userId,
      projectId
    })

    if (!existingLike) {
      // Not liked, return current state
      const likesCount = project.likes || 0
      return NextResponse.json({
        liked: false,
        likesCount
      })
    }

    // Remove like and decrement count atomically
    await Promise.all([
      db.collection<ProjectLike>('projectLikes').deleteOne({
        userId,
        projectId
      }),
      db.collection<Project>('projects').updateOne(
        { _id: projectId },
        { $inc: { likes: -1 } }
      )
    ])

    const updatedProject = await db.collection<Project>('projects').findOne({
      _id: projectId
    })

    return NextResponse.json({
      liked: false,
      likesCount: updatedProject?.likes || 0
    })
  } catch (error) {
    console.error('Error unliking project:', error)
    return NextResponse.json(
      { error: 'Failed to unlike project' },
      { status: 500 }
    )
  }
}

