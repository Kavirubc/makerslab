import { getDatabase } from '@/lib/mongodb'
import { User } from '@/lib/models/User'
import { Project } from '@/lib/models/Project'

export interface AnalyticsData {
  userGrowth: { date: string; count: number }[]
  projectTrends: { date: string; count: number }[]
  categoryDistribution: { category: string; count: number }[]
  universityDistribution: { university: string; count: number }[]
  engagement: { date: string; views: number; likes: number }[]
  recentActivity: Array<{
    type: 'user' | 'project'
    id: string
    title: string
    description: string
    timestamp: Date
  }>
}

export async function getAnalyticsData(days: number = 30): Promise<AnalyticsData> {
  const db = await getDatabase()
  const now = new Date()
  const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)

  // User growth data (daily registration counts)
  const userGrowth = await db.collection<User>('users')
    .aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      },
      {
        $project: {
          _id: 0,
          date: '$_id',
          count: 1
        }
      }
    ])
    .toArray()

  // Project trends (daily project creation)
  const projectTrends = await db.collection<Project>('projects')
    .aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      },
      {
        $project: {
          _id: 0,
          date: '$_id',
          count: 1
        }
      }
    ])
    .toArray()

  // Category distribution
  const categoryDistribution = await db.collection<Project>('projects')
    .aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $project: {
          _id: 0,
          category: '$_id',
          count: 1
        }
      }
    ])
    .toArray()

  // University distribution (users per university)
  const universityDistribution = await db.collection<User>('users')
    .aggregate([
      {
        $lookup: {
          from: 'universities',
          localField: 'universityId',
          foreignField: '_id',
          as: 'university'
        }
      },
      {
        $unwind: {
          path: '$university',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $group: {
          _id: '$university.name',
          count: { $sum: 1 }
        }
      },
      {
        $match: {
          _id: { $ne: null }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      },
      {
        $project: {
          _id: 0,
          university: '$_id',
          count: 1
        }
      }
    ])
    .toArray()

  // Engagement metrics (views and likes over time)
  const engagement = await db.collection<Project>('projects')
    .aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          views: { $sum: '$views' },
          likes: { $sum: '$likes' }
        }
      },
      {
        $sort: { _id: 1 }
      },
      {
        $project: {
          _id: 0,
          date: '$_id',
          views: 1,
          likes: 1
        }
      }
    ])
    .toArray()

  // Recent activity (last 20 activities)
  const recentUsers = await db.collection<User>('users')
    .find({}, { projection: { password: 0 } })
    .sort({ createdAt: -1 })
    .limit(10)
    .toArray()

  const recentProjects = await db.collection<Project>('projects')
    .find({})
    .sort({ createdAt: -1 })
    .limit(10)
    .toArray()

  const recentActivity = [
    ...recentUsers.map(user => ({
      type: 'user' as const,
      id: user._id!.toString(),
      title: user.name,
      description: `New user registered: ${user.email}`,
      timestamp: user.createdAt,
    })),
    ...recentProjects.map(project => ({
      type: 'project' as const,
      id: project._id!.toString(),
      title: project.title,
      description: `New project created: ${project.category}`,
      timestamp: project.createdAt,
    }))
  ]
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 20)

  return {
    userGrowth: userGrowth as { date: string; count: number }[],
    projectTrends: projectTrends as { date: string; count: number }[],
    categoryDistribution: categoryDistribution as { category: string; count: number }[],
    universityDistribution: universityDistribution as { university: string; count: number }[],
    engagement: engagement as { date: string; views: number; likes: number }[],
    recentActivity: recentActivity as AnalyticsData['recentActivity'],
  }
}

