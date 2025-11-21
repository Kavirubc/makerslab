import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { UniversityRequest } from '@/lib/models/UniversityRequest'
import { University } from '@/lib/models/University'
import { isValidEmailFormat, extractEmailDomain } from '@/lib/utils/university'

// POST /api/universities/request - Create university request (public, no auth required)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, facultyName, district, province, emailDomain, reason, userEmail } = body

    // Validation - required fields
    if (!name || !district || !province || !emailDomain) {
      return NextResponse.json(
        { error: 'All required fields are missing. Please fill in University Name, District, Province, and Email Domain.' },
        { status: 400 }
      )
    }

    // Validate email domain format (basic structure check)
    if (!isValidEmailFormat(`test@${emailDomain}`)) {
      return NextResponse.json(
        { error: 'Please enter a valid email domain format (e.g., ucsc.cmb.ac.lk or uom.lk)' },
        { status: 400 }
      )
    }

    // Validate userEmail if provided (for tracking purposes)
    // If invalid, just ignore it since it's optional and only for tracking
    const validUserEmail = userEmail && isValidEmailFormat(userEmail) ? userEmail : null

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
        { error: 'A pending request for this email domain already exists. Please wait for admin approval.' },
        { status: 400 }
      )
    }

    // Create new request (userId is null for public requests)
    const newRequest: Omit<UniversityRequest, '_id'> = {
      userId: null, // Public request, no authenticated user
      name: name.trim(),
      facultyName: facultyName?.trim() || null,
      district: district.trim(),
      province: province.trim(),
      emailDomain: emailDomain.toLowerCase().trim(),
      status: 'pending',
      reason: reason?.trim() || null,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await db.collection<UniversityRequest>('universityRequests').insertOne(newRequest as UniversityRequest)

    return NextResponse.json(
      {
        message: 'University request submitted successfully. An admin will review your request shortly.',
        requestId: result.insertedId.toString()
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating university request:', error)
    return NextResponse.json(
      { error: 'Failed to create university request. Please try again.' },
      { status: 500 }
    )
  }
}

