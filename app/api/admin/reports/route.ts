import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/utils/admin'
import { getDatabase } from '@/lib/mongodb'
import { ProjectReport } from '@/lib/models/ProjectReport'
import { Project } from '@/lib/models/Project'
import { User } from '@/lib/models/User'
import { ObjectId } from 'mongodb'

// GET /api/admin/reports - Get all reports with filters and pagination
export async function GET(request: NextRequest) {
  try {
    const adminCheck = await requireAdmin()
    if (adminCheck) {
      return adminCheck
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status') || ''
    const reason = searchParams.get('reason') || ''

    const db = await getDatabase()
    const skip = (page - 1) * limit

    // Build query
    const query: any = {}

    // Handle unresolved status (pending + reviewed)
    if (status === 'unresolved') {
      query.status = { $in: ['pending', 'reviewed'] }
    } else if (status) {
      query.status = status
    }

    if (reason) {
      query.reason = reason
    }

    // Get reports
    const reports = await db
      .collection<ProjectReport>('projectReports')
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()

    // Populate project and reporter information
    const reportsWithDetails = await Promise.all(
      reports.map(async (report) => {
        const project = await db.collection<Project>('projects').findOne(
          { _id: report.projectId },
          { projection: { _id: 1, title: 1, userId: 1 } }
        )

        const reporter = await db.collection<User>('users').findOne(
          { _id: report.reporterId },
          { projection: { _id: 1, name: 1, email: 1 } }
        )

        const reviewer = report.reviewedBy
          ? await db.collection<User>('users').findOne(
              { _id: report.reviewedBy },
              { projection: { _id: 1, name: 1, email: 1 } }
            )
          : null

        return {
          ...report,
          project: project
            ? {
                _id: project._id.toString(),
                title: project.title,
                ownerId: project.userId.toString()
              }
            : null,
          reporter: reporter
            ? {
                _id: reporter._id.toString(),
                name: reporter.name,
                email: reporter.email
              }
            : null,
          reviewer: reviewer
            ? {
                _id: reviewer._id.toString(),
                name: reviewer.name,
                email: reviewer.email
              }
            : null
        }
      })
    )

    const total = await db
      .collection<ProjectReport>('projectReports')
      .countDocuments(query)

    return NextResponse.json({
      reports: reportsWithDetails,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching reports:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
      { status: 500 }
    )
  }
}

