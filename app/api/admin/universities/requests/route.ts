import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, isAdmin } from '@/lib/utils/admin'
import { auth } from '@/auth'
import { getDatabase } from '@/lib/mongodb'
import { UniversityRequest } from '@/lib/models/UniversityRequest'
import { University } from '@/lib/models/University'
import { ObjectId } from 'mongodb'

// GET /api/admin/universities/requests - Get all university requests
export async function GET(request: NextRequest) {
  try {
    const adminCheck = await requireAdmin()
    if (adminCheck) {
      return adminCheck
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || ''

    const db = await getDatabase()
    const query: any = {}

    if (status) {
      query.status = status
    } else {
      // Default to pending if no status specified
      query.status = 'pending'
    }

    const requests = await db
      .collection<UniversityRequest>('universityRequests')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json({ requests })
  } catch (error) {
    console.error('Error fetching university requests:', error)
    return NextResponse.json(
      { error: 'Failed to fetch university requests' },
      { status: 500 }
    )
  }
}

// POST /api/admin/universities/requests - Create university request (for users)
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, district, province, emailDomain, reason } = body

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

    // Check if there's already a pending request for this email domain
    const existingRequest = await db.collection<UniversityRequest>('universityRequests').findOne({
      emailDomain: emailDomain.toLowerCase(),
      status: 'pending'
    })

    if (existingRequest) {
      return NextResponse.json(
        { error: 'A pending request for this email domain already exists' },
        { status: 400 }
      )
    }

    const newRequest: Omit<UniversityRequest, '_id'> = {
      userId: new ObjectId(session.user.id),
      name,
      district,
      province,
      emailDomain: emailDomain.toLowerCase(),
      status: 'pending',
      reason: reason || null,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await db.collection<UniversityRequest>('universityRequests').insertOne(newRequest as UniversityRequest)

    return NextResponse.json(
      {
        message: 'University request created successfully',
        requestId: result.insertedId.toString()
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating university request:', error)
    return NextResponse.json(
      { error: 'Failed to create university request' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/universities/requests - Approve/Reject university request
export async function PUT(request: NextRequest) {
  try {
    const adminCheck = await requireAdmin()
    if (adminCheck) {
      return adminCheck
    }

    const session = await auth()
    if (!session?.user || !isAdmin(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: { requestId: string; action: string; adminNotes?: string } = await request.json()
    const { requestId, action, adminNotes } = body

    if (!requestId || !action) {
      return NextResponse.json(
        { error: 'requestId and action are required' },
        { status: 400 }
      )
    }

    if (action !== 'approve' && action !== 'reject') {
      return NextResponse.json(
        { error: 'Action must be "approve" or "reject"' },
        { status: 400 }
      )
    }

    if (!ObjectId.isValid(requestId)) {
      return NextResponse.json({ error: 'Invalid request ID' }, { status: 400 })
    }

    const db = await getDatabase()
    const universityRequest = await db.collection<UniversityRequest>('universityRequests').findOne({
      _id: new ObjectId(requestId)
    })

    if (!universityRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    if (universityRequest.status !== 'pending') {
      return NextResponse.json(
        { error: 'Request has already been processed' },
        { status: 400 }
      )
    }

    const updateData: any = {
      status: action === 'approve' ? 'approved' : 'rejected',
      reviewedBy: new ObjectId(session.user.id),
      reviewedAt: new Date(),
      adminNotes: adminNotes || null,
      updatedAt: new Date()
    }

    await db.collection<UniversityRequest>('universityRequests').updateOne(
      { _id: new ObjectId(requestId) },
      { $set: updateData }
    )

    // If approved, create the university
    if (action === 'approve') {
      const newUniversity: Omit<University, '_id'> = {
        name: universityRequest.name,
        district: universityRequest.district,
        province: universityRequest.province,
        emailDomain: universityRequest.emailDomain,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      await db.collection<University>('universities').insertOne(newUniversity as University)
    }

    return NextResponse.json({
      message: `University request ${action === 'approve' ? 'approved' : 'rejected'} successfully`
    })
  } catch (error) {
    console.error('Error processing university request:', error)
    return NextResponse.json(
      { error: 'Failed to process university request' },
      { status: 500 }
    )
  }
}

