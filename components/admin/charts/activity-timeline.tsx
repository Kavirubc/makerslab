'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { User, FolderKanban } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface ActivityItem {
  type: 'user' | 'project'
  id: string
  title: string
  description: string
  timestamp: Date | string
}

interface ActivityTimelineProps {
  data: ActivityItem[]
}

export function ActivityTimeline({ data }: ActivityTimelineProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest user registrations and project creations</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No recent activity
            </p>
          ) : (
            data.map((item) => {
              const timestamp = typeof item.timestamp === 'string' 
                ? new Date(item.timestamp) 
                : item.timestamp
              
              return (
                <div
                  key={`${item.type}-${item.id}`}
                  className="flex items-start gap-4 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-shrink-0 mt-1">
                    {item.type === 'user' ? (
                      <User className="h-5 w-5 text-chart-1" />
                    ) : (
                      <FolderKanban className="h-5 w-5 text-chart-2" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium truncate">{item.title}</p>
                      <Badge variant="outline" className="text-xs">
                        {item.type}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">
                      {item.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(timestamp, { addSuffix: true })}
                    </p>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </CardContent>
    </Card>
  )
}

