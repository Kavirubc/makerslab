import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/utils/admin'
import { getDatabase } from '@/lib/mongodb'
import { Project } from '@/lib/models/Project'
import { User } from '@/lib/models/User'

// GET /api/admin/projects - Get all projects with pagination and filters
export async function GET(request: NextRequest) {
  try {
    const adminCheck = await requireAdmin()
    if (adminCheck) {
      return adminCheck
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const status = searchParams.get('status') || ''

    const db = await getDatabase()
    const skip = (page - 1) * limit

    // Build query
    const query: any = {}
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ]
    }

    if (category) {
      query.category = category
    }

    if (status) {
      query.status = status
    }

    const projects = await db
      .collection<Project>('projects')
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()

    // Get user information for each project
    const projectsWithUsers = await Promise.all(
      projects.map(async (project) => {
        const user = await db.collection<User>('users').findOne(
          { _id: project.userId },
          { projection: { _id: 1, name: 1, email: 1 } }
        )
        return {
          ...project,
          creator: user ? { name: user.name, email: user.email } : null
        }
      })
    )

    const total = await db.collection<Project>('projects').countDocuments(query)

    return NextResponse.json({
      projects: projectsWithUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/projects - Delete project (bulk delete not supported, use [id] route)
export async function DELETE(request: NextRequest) {
  return NextResponse.json(
    { error: 'Use /api/admin/projects/[id] to delete a specific project' },
    { status: 400 }
  )
}

