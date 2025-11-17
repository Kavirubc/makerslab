import { getDatabase } from '@/lib/mongodb'
import { Project } from '@/lib/models/Project'
import { ObjectId } from 'mongodb'

export interface UserAnalyticsData {
  projectViews: { date: string; views: number }[]
  projectCreation: { date: string; count: number }[]
  categoryDistribution: { category: string; count: number }[]
  engagement: { date: string; views: number; likes: number }[]
  topProjects: Array<{
    id: string
    title: string
    views: number
    likes: number
    category: string
  }>
}

export async function getUserAnalyticsData(userId: string, days: number = 30): Promise<UserAnalyticsData> {
  const db = await getDatabase()
  const userObjectId = new ObjectId(userId)
  const now = new Date()
  const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)

  // Project views over time (aggregated daily)
  const projectViews = await db.collection<Project>('projects')
    .aggregate([
      {
        $match: {
          userId: userObjectId,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          views: { $sum: '$views' }
        }
      },
      {
        $sort: { _id: 1 }
      },
      {
        $project: {
          _id: 0,
          date: '$_id',
          views: 1
        }
      }
    ])
    .toArray()

  // Project creation timeline
  const projectCreation = await db.collection<Project>('projects')
    .aggregate([
      {
        $match: {
          userId: userObjectId,
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

  // Category distribution of user's projects
  const categoryDistribution = await db.collection<Project>('projects')
    .aggregate([
      {
        $match: {
          userId: userObjectId
        }
      },
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

  // Engagement metrics (views and likes over time)
  const engagement = await db.collection<Project>('projects')
    .aggregate([
      {
        $match: {
          userId: userObjectId,
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

  // Top projects by views
  const topProjects = await db.collection<Project>('projects')
    .find({ userId: userObjectId })
    .sort({ views: -1 })
    .limit(5)
    .toArray()

  return {
    projectViews: projectViews as { date: string; views: number }[],
    projectCreation: projectCreation as { date: string; count: number }[],
    categoryDistribution: categoryDistribution as { category: string; count: number }[],
    engagement: engagement as { date: string; views: number; likes: number }[],
    topProjects: topProjects.map(p => ({
      id: p._id!.toString(),
      title: p.title,
      views: p.views,
      likes: p.likes,
      category: p.category,
    })),
  }
}

