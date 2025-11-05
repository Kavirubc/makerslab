import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getDatabase } from '@/lib/mongodb'
import { Project } from '@/lib/models/Project'
import { ObjectId } from 'mongodb'

// GET /api/projects - Get user's own projects
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const db = await getDatabase()
    const projects = await db
      .collection<Project>('projects')
      .find({ userId: new ObjectId(session.user.id) })
      .sort({ updatedAt: -1 })
      .toArray()

    return NextResponse.json({ projects })
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    )
  }
}

// POST /api/projects - Create a new project
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      title,
      description,
      category,
      tags,
      thumbnailUrl,
      slidesDeckUrl,
      pitchVideoUrl,
      demoUrl,
      githubUrl,
      teamMembers,
      startDate,
      endDate,
      status,
      isPublic
    } = body

    // Validation
    if (!title || !description || !category) {
      return NextResponse.json(
        { error: 'Title, description, and category are required' },
        { status: 400 }
      )
    }

    const db = await getDatabase()
    const newProject: Omit<Project, '_id'> = {
      userId: new ObjectId(session.user.id),
      title,
      description,
      category,
      tags: tags || [],
      thumbnailUrl,
      slidesDeckUrl,
      pitchVideoUrl,
      demoUrl,
      githubUrl,
      teamMembers: teamMembers || [],
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      status: status || 'completed',
      isPublic: isPublic !== false, // Default to public
      views: 0,
      likes: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await db.collection<Project>('projects').insertOne(newProject as Project)

    return NextResponse.json(
      {
        message: 'Project created successfully',
        projectId: result.insertedId.toString()
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    )
  }
}
