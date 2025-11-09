import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/utils/admin'
import { getDatabase } from '@/lib/mongodb'
import { University } from '@/lib/models/University'
import { User } from '@/lib/models/User'
import { ObjectId } from 'mongodb'

// GET /api/admin/universities/[id] - Get specific university
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminCheck = await requireAdmin()
    if (adminCheck) {
      return adminCheck
    }

    const { id } = await params

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid university ID' }, { status: 400 })
    }

    const db = await getDatabase()
    const university = await db.collection<University>('universities').findOne({
      _id: new ObjectId(id)
    })

    if (!university) {
      return NextResponse.json({ error: 'University not found' }, { status: 404 })
    }

    // Get count of users with this university
    const userCount = await db.collection<User>('users').countDocuments({
      universityId: new ObjectId(id)
    })

    return NextResponse.json({
      university,
      userCount
    })
  } catch (error) {
    console.error('Error fetching university:', error)
    return NextResponse.json(
      { error: 'Failed to fetch university' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/universities/[id] - Update specific university
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminCheck = await requireAdmin()
    if (adminCheck) {
      return adminCheck
    }

    const { id } = await params

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid university ID' }, { status: 400 })
    }

    const body = await request.json()
    const { name, district, province, emailDomain } = body

    const db = await getDatabase()
    const university = await db.collection<University>('universities').findOne({
      _id: new ObjectId(id)
    })

    if (!university) {
      return NextResponse.json({ error: 'University not found' }, { status: 404 })
    }

    // Check if email domain is being changed and if it conflicts with another university
    if (emailDomain && emailDomain.toLowerCase() !== university.emailDomain) {
      const existing = await db.collection<University>('universities').findOne({
        emailDomain: emailDomain.toLowerCase(),
        _id: { $ne: new ObjectId(id) }
      })

      if (existing) {
        return NextResponse.json(
          { error: 'University with this email domain already exists' },
          { status: 400 }
        )
      }
    }

    const updateData: any = {
      updatedAt: new Date()
    }

    if (name !== undefined) updateData.name = name
    if (district !== undefined) updateData.district = district
    if (province !== undefined) updateData.province = province
    if (emailDomain !== undefined) updateData.emailDomain = emailDomain.toLowerCase()

    await db.collection<University>('universities').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    )

    return NextResponse.json({ message: 'University updated successfully' })
  } catch (error) {
    console.error('Error updating university:', error)
    return NextResponse.json(
      { error: 'Failed to update university' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/universities/[id] - Delete university (with validation)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminCheck = await requireAdmin()
    if (adminCheck) {
      return adminCheck
    }

    const { id } = await params

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid university ID' }, { status: 400 })
    }

    const db = await getDatabase()
    const university = await db.collection<University>('universities').findOne({
      _id: new ObjectId(id)
    })

    if (!university) {
      return NextResponse.json({ error: 'University not found' }, { status: 404 })
    }

    // Check if users exist with this university
    const userCount = await db.collection<User>('users').countDocuments({
      universityId: new ObjectId(id)
    })

    if (userCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete university. ${userCount} user${userCount !== 1 ? 's' : ''} are associated with this university.` },
        { status: 400 }
      )
    }

    await db.collection<University>('universities').deleteOne({
      _id: new ObjectId(id)
    })

    return NextResponse.json({ message: 'University deleted successfully' })
  } catch (error) {
    console.error('Error deleting university:', error)
    return NextResponse.json(
      { error: 'Failed to delete university' },
      { status: 500 }
    )
  }
}

