import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getDatabase } from '@/lib/mongodb'
import { ProjectReport } from '@/lib/models/ProjectReport'
import { Project } from '@/lib/models/Project'
import { ObjectId } from 'mongodb'
import { canUserReport } from '@/lib/utils/reports'
import { REPORT_REASONS, MAX_EVIDENCE_IMAGES } from '@/lib/constants/reports'

// POST /api/projects/[id]/report - Create a report for a project
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
    const { reason, description, evidenceUrls } = body

    // Validate required fields
    if (!reason || !description) {
      return NextResponse.json(
        { error: 'Reason and description are required' },
        { status: 400 }
      )
    }

    // Validate reason is one of the predefined reasons
    const validReasons = REPORT_REASONS.map(r => r.value)
    if (!validReasons.includes(reason)) {
      return NextResponse.json(
        { error: 'Invalid report reason' },
        { status: 400 }
      )
    }

    // Validate description length
    if (description.trim().length < 10) {
      return NextResponse.json(
        { error: 'Description must be at least 10 characters' },
        { status: 400 }
      )
    }

    // Validate evidence URLs
    if (evidenceUrls && Array.isArray(evidenceUrls)) {
      if (evidenceUrls.length > MAX_EVIDENCE_IMAGES) {
        return NextResponse.json(
          { error: `Maximum ${MAX_EVIDENCE_IMAGES} evidence images allowed` },
          { status: 400 }
        )
      }
    }

    const db = await getDatabase()

    // Check if project exists
    const project = await db.collection<Project>('projects').findOne({
      _id: new ObjectId(id)
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Check if user can report this project
    const canReport = await canUserReport(session.user.id, id)
    if (!canReport.canReport) {
      return NextResponse.json(
        { error: canReport.reason || 'Cannot report this project' },
        { status: 400 }
      )
    }

    // Create report
    const newReport: Omit<ProjectReport, '_id'> = {
      projectId: new ObjectId(id),
      reporterId: new ObjectId(session.user.id),
      reason,
      description: description.trim(),
      evidenceUrls: evidenceUrls || [],
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await db
      .collection<ProjectReport>('projectReports')
      .insertOne(newReport as ProjectReport)

    return NextResponse.json(
      {
        message: 'Report submitted successfully',
        reportId: result.insertedId.toString()
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating report:', error)
    return NextResponse.json(
      { error: 'Failed to submit report' },
      { status: 500 }
    )
  }
}

