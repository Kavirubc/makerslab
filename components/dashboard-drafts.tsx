'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Edit, FileText, Plus } from 'lucide-react'
import { Project } from '@/lib/models/Project'
import { DraftBadge } from './draft-badge'

// format relative time for last edited
function formatRelativeTime(date: Date | string): string {
  const now = new Date()
  const then = new Date(date)
  const diffMs = now.getTime() - then.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMin / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMin < 1) return 'just now'
  if (diffMin < 60) return `${diffMin} min ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return then.toLocaleDateString()
}

export function DashboardDrafts() {
  const [drafts, setDrafts] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDrafts()
  }, [])

  const fetchDrafts = async () => {
    try {
      const response = await fetch('/api/projects?draftsOnly=true')
      const data = await response.json()
      setDrafts(data.projects?.slice(0, 4) || [])
    } catch (error) {
      console.error('Error fetching drafts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                My Drafts
              </CardTitle>
              <CardDescription>Loading drafts...</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>
    )
  }

  // empty state
  if (drafts.length === 0) {
    return null // don't show section if no drafts
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center flex-col md:flex-row gap-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              My Drafts
              <Badge variant="secondary" className="ml-2">
                {drafts.length}
              </Badge>
            </CardTitle>
            <CardDescription>Projects you&apos;re still working on</CardDescription>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Link href="/projects/new" className="flex-1 md:flex-none">
              <Button variant="outline" size="sm" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                New Draft
              </Button>
            </Link>
            <Link href="/projects?filter=drafts" className="flex-1 md:flex-none">
              <Button variant="ghost" size="sm" className="w-full">
                View All
              </Button>
            </Link>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          {drafts.map((draft) => (
            <Link
              key={draft._id?.toString()}
              href={`/projects/${draft._id}/edit`}
              className="block"
            >
              <div className="flex items-start gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                {draft.thumbnailUrl ? (
                  <div className="w-16 h-16 rounded overflow-hidden shrink-0 bg-muted">
                    <img
                      src={draft.thumbnailUrl}
                      alt={draft.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded bg-muted flex items-center justify-center shrink-0">
                    <FileText className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <DraftBadge />
                    {draft.category && (
                      <Badge variant="outline" className="text-xs">
                        {draft.category}
                      </Badge>
                    )}
                  </div>
                  <h4 className="font-medium truncate">
                    {draft.title || 'Untitled Draft'}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Last edited {formatRelativeTime(draft.lastAutoSavedAt || draft.updatedAt)}
                  </p>
                </div>
                <Button variant="ghost" size="sm" className="shrink-0">
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
