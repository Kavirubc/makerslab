import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, isAdmin } from '@/lib/utils/admin'
import { auth } from '@/auth'
import { getDatabase } from '@/lib/mongodb'
import { ProjectReport } from '@/lib/models/ProjectReport'
import { Project } from '@/lib/models/Project'
import { User } from '@/lib/models/User'
import { ObjectId } from 'mongodb'

// GET /api/admin/reports/[id] - Get a single report with full details
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
      return NextResponse.json({ error: 'Invalid report ID' }, { status: 400 })
    }

    const db = await getDatabase()

    const report = await db.collection<ProjectReport>('projectReports').findOne({
      _id: new ObjectId(id)
    })

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    // Populate project, reporter, and reviewer information
    const project = await db.collection<Project>('projects').findOne({
      _id: report.projectId
    })

    const reporter = await db.collection<User>('users').findOne(
      { _id: report.reporterId },
      { projection: { password: 0 } }
    )

    const reviewer = report.reviewedBy
      ? await db.collection<User>('users').findOne(
          { _id: report.reviewedBy },
          { projection: { _id: 1, name: 1, email: 1 } }
        )
      : null

    const projectOwner = project
      ? await db.collection<User>('users').findOne(
          { _id: project.userId },
          { projection: { _id: 1, name: 1, email: 1 } }
        )
      : null

    return NextResponse.json({
      report: {
        ...report,
        project: project
          ? {
              ...project,
              owner: projectOwner
            }
          : null,
        reporter: reporter
          ? {
              _id: reporter._id?.toString(),
              name: reporter.name,
              email: reporter.email,
              indexNumber: reporter.indexNumber
            }
          : null,
        reviewer: reviewer
          ? {
              _id: reviewer._id?.toString(),
              name: reviewer.name,
              email: reviewer.email
            }
          : null
      }
    })
  } catch (error) {
    console.error('Error fetching report:', error)
    return NextResponse.json(
      { error: 'Failed to fetch report' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/reports/[id] - Update report status (review, resolve, dismiss)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminCheck = await requireAdmin()
    if (adminCheck) {
      return adminCheck
    }

    const session = await auth()
    if (!session?.user || !isAdmin(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid report ID' }, { status: 400 })
    }

    const body = await request.json()
    const { status, adminNotes } = body

    // Validate status
    const validStatuses = ['pending', 'reviewed', 'resolved', 'dismissed']
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be one of: pending, reviewed, resolved, dismissed' },
        { status: 400 }
      )
    }

    const db = await getDatabase()

    const report = await db.collection<ProjectReport>('projectReports').findOne({
      _id: new ObjectId(id)
    })

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    // Update report
    const updateData: any = {
      status,
      updatedAt: new Date()
    }

    // If status is not pending, set reviewed info
    if (status !== 'pending') {
      updateData.reviewedBy = new ObjectId(session.user.id)
      updateData.reviewedAt = new Date()
    }

    // Add admin notes if provided
    if (adminNotes !== undefined) {
      updateData.adminNotes = adminNotes || null
    }

    await db.collection<ProjectReport>('projectReports').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    )

    return NextResponse.json({
      message: `Report ${status} successfully`
    })
  } catch (error) {
    console.error('Error updating report:', error)
    return NextResponse.json(
      { error: 'Failed to update report' },
      { status: 500 }
    )
  }
}

