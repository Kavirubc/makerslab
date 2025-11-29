'use client'

import { Cloud, CloudOff, Check, Loader2 } from 'lucide-react'
import { AutoSaveStatus as StatusType } from '@/lib/hooks/use-auto-save'

interface AutoSaveStatusProps {
  status: StatusType
  lastSavedAt: Date | null
  error?: string | null
  onRetry?: () => void
}

// format relative time (e.g., "just now", "2 min ago")
function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)

  if (diffSec < 10) return 'just now'
  if (diffSec < 60) return `${diffSec}s ago`
  if (diffMin < 60) return `${diffMin} min ago`
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export function AutoSaveStatus({
  status,
  lastSavedAt,
  error,
  onRetry,
}: AutoSaveStatusProps) {
  if (status === 'idle' && !lastSavedAt) {
    return null
  }

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      {status === 'saving' && (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Saving...</span>
        </>
      )}

      {status === 'saved' && lastSavedAt && (
        <>
          <Check className="h-4 w-4 text-green-500" />
          <span>Saved {formatRelativeTime(lastSavedAt)}</span>
        </>
      )}

      {status === 'error' && (
        <>
          <CloudOff className="h-4 w-4 text-destructive" />
          <span className="text-destructive">
            {error || 'Save failed'}
            {onRetry && (
              <button
                onClick={onRetry}
                className="ml-2 underline hover:no-underline"
              >
                Retry
              </button>
            )}
          </span>
        </>
      )}

      {status === 'idle' && lastSavedAt && (
        <>
          <Cloud className="h-4 w-4" />
          <span>Saved {formatRelativeTime(lastSavedAt)}</span>
        </>
      )}
    </div>
  )
}
