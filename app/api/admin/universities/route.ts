import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/utils/admin'
import { getDatabase } from '@/lib/mongodb'
import { University } from '@/lib/models/University'
import { ObjectId } from 'mongodb'

// GET /api/admin/universities - Get all universities
export async function GET(request: NextRequest) {
  try {
    const adminCheck = await requireAdmin()
    if (adminCheck) {
      return adminCheck
    }

    const db = await getDatabase()
    const universities = await db
      .collection<University>('universities')
      .find({})
      .sort({ name: 1 })
      .toArray()

    return NextResponse.json({ universities })
  } catch (error) {
    console.error('Error fetching universities:', error)
    return NextResponse.json(
      { error: 'Failed to fetch universities' },
      { status: 500 }
    )
  }
}

// POST /api/admin/universities - Create new university
export async function POST(request: NextRequest) {
  try {
    const adminCheck = await requireAdmin()
    if (adminCheck) {
      return adminCheck
    }

    const body = await request.json()
    const { name, district, province, emailDomain } = body

    // Validation
    if (!name || !district || !province || !emailDomain) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    const db = await getDatabase()

    // Check if university with same email domain already exists
    const existing = await db.collection<University>('universities').findOne({
      emailDomain: emailDomain.toLowerCase()
    })

    if (existing) {
      return NextResponse.json(
        { error: 'University with this email domain already exists' },
        { status: 400 }
      )
    }

    const newUniversity: Omit<University, '_id'> = {
      name,
      district,
      province,
      emailDomain: emailDomain.toLowerCase(),
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await db.collection<University>('universities').insertOne(newUniversity as University)

    return NextResponse.json(
      {
        message: 'University created successfully',
        universityId: result.insertedId.toString()
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating university:', error)
    return NextResponse.json(
      { error: 'Failed to create university' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/universities - Update university (use [id] route)
export async function PUT(request: NextRequest) {
  return NextResponse.json(
    { error: 'Use /api/admin/universities/[id] to update a specific university' },
    { status: 400 }
  )
}

