import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/utils/admin'
import { getDatabase } from '@/lib/mongodb'
import { User } from '@/lib/models/User'
import { ObjectId } from 'mongodb'

// GET /api/admin/users - Get all users with pagination and filters
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
    const role = searchParams.get('role') || ''
    const isBanned = searchParams.get('isBanned') || ''

    const db = await getDatabase()
    const skip = (page - 1) * limit

    // Build query
    const query: any = {}
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { indexNumber: { $regex: search, $options: 'i' } }
      ]
    }

    if (role) {
      query.role = role
    }

    if (isBanned === 'true') {
      query.isBanned = true
    } else if (isBanned === 'false') {
      query.isBanned = false
    }

    const users = await db
      .collection<User>('users')
      .find(query, { projection: { password: 0 } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()

    const total = await db.collection<User>('users').countDocuments(query)

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/users - Update user (bulk update not supported, use [id] route)
export async function PUT(request: NextRequest) {
  return NextResponse.json(
    { error: 'Use /api/admin/users/[id] to update a specific user' },
    { status: 400 }
  )
}

// DELETE /api/admin/users - Delete user (bulk delete not supported, use [id] route)
export async function DELETE(request: NextRequest) {
  return NextResponse.json(
    { error: 'Use /api/admin/users/[id] to delete a specific user' },
    { status: 400 }
  )
}

