'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Check, X, Loader2, Link as LinkIcon } from 'lucide-react'
import { useNotification } from '@/lib/hooks/use-notification'

interface ProfileSlugEditorProps {
  currentSlug: string | null
  canChange: boolean
  daysUntilChange: number
  userId: string
}

export function ProfileSlugEditor({
  currentSlug,
  canChange,
  daysUntilChange,
  userId
}: ProfileSlugEditorProps) {
  const [slug, setSlug] = useState(currentSlug || '')
  const [isChecking, setIsChecking] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [availability, setAvailability] = useState<{
    available: boolean
    error?: string
  } | null>(null)
  const { success, error: showError } = useNotification()

  // Base URL for preview
  const baseUrl = typeof window !== 'undefined'
    ? window.location.origin
    : 'https://www.makerslab.online'

  // Debounced availability check
  const checkAvailability = useCallback(async (value: string) => {
    if (!value || value.length < 3) {
      setAvailability(null)
      return
    }

    // Skip check if slug is same as current
    if (value.toLowerCase() === currentSlug?.toLowerCase()) {
      setAvailability({ available: true })
      return
    }

    setIsChecking(true)
    try {
      const response = await fetch(`/api/profile/slug?slug=${encodeURIComponent(value)}`)
      const data = await response.json()
      setAvailability(data)
    } catch {
      setAvailability({ available: false, error: 'Failed to check availability' })
    } finally {
      setIsChecking(false)
    }
  }, [currentSlug])

  // Debounce slug changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (slug) {
        checkAvailability(slug)
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [slug, checkAvailability])

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow lowercase letters, numbers, and hyphens
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')
    setSlug(value)
    setAvailability(null)
  }

  const handleSave = async () => {
    if (!slug || !availability?.available) return

    setIsSaving(true)
    try {
      const response = await fetch('/api/profile/slug', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update slug')
      }

      success('Profile URL updated successfully!')
      // Reload to reflect changes
      window.location.reload()
    } catch (err: any) {
      showError(err.message || 'Failed to update profile URL')
    } finally {
      setIsSaving(false)
    }
  }

  // Show cooldown message if user cannot change slug
  if (!canChange && currentSlug) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <LinkIcon className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Current URL:</span>
          <code className="px-2 py-1 bg-muted rounded text-sm">
            {baseUrl}/profile/{currentSlug}
          </code>
        </div>
        <p className="text-sm text-muted-foreground">
          You can change your profile URL again in <strong>{daysUntilChange} days</strong>.
        </p>
      </div>
    )
  }

  const hasChanges = slug.toLowerCase() !== (currentSlug?.toLowerCase() || '')
  const canSave = slug.length >= 3 && availability?.available && hasChanges && !isSaving

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="profileSlug">Custom URL</Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              id="profileSlug"
              value={slug}
              onChange={handleSlugChange}
              placeholder="your-name"
              maxLength={10}
              disabled={isSaving}
              className="pr-10"
            />
            {/* Status indicator */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {isChecking && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
              {!isChecking && availability?.available && (
                <Check className="h-4 w-4 text-green-500" />
              )}
              {!isChecking && availability && !availability.available && (
                <X className="h-4 w-4 text-red-500" />
              )}
            </div>
          </div>
          <Button
            onClick={handleSave}
            disabled={!canSave}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save'
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          3-10 characters. Lowercase letters, numbers, and hyphens only.
        </p>
      </div>

      {/* Availability error message */}
      {availability && !availability.available && availability.error && (
        <p className="text-sm text-red-500">{availability.error}</p>
      )}

      {/* URL Preview */}
      {slug.length >= 3 && (
        <div className="flex items-center gap-2 text-sm">
          <LinkIcon className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Preview:</span>
          <code className="px-2 py-1 bg-muted rounded text-sm">
            {baseUrl}/profile/{slug}
          </code>
        </div>
      )}

      {/* Cooldown notice for first-time setters */}
      {!currentSlug && (
        <p className="text-xs text-muted-foreground">
          Note: You can only change your profile URL once every 6 months.
        </p>
      )}
    </div>
  )
}
