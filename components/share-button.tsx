'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Share2, Check } from 'lucide-react'
import { useNotification } from '@/lib/hooks/use-notification'

interface ShareButtonProps {
  projectId: string
  projectTitle: string
  iconOnly?: boolean
}

export function ShareButton({ projectId, projectTitle, iconOnly = false }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)
  const { success, error: showError } = useNotification()

  const getProjectUrl = () => {
    // Get base URL from environment or window location
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      (typeof window !== 'undefined' ? window.location.origin : '')
    return `${baseUrl}/projects/${projectId}`
  }

  const handleShare = async () => {
    const url = getProjectUrl()

    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      success('Link copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
      // Fallback: try using the Share API if available
      if (navigator.share) {
        try {
          await navigator.share({
            title: projectTitle,
            text: `Check out this project: ${projectTitle}`,
            url: url,
          })
          success('Shared successfully!')
        } catch (shareError) {
          console.error('Failed to share:', shareError)
          showError('Failed to share. Please try again.')
        }
      } else {
        showError('Failed to copy link. Please try again.')
      }
    }
  }

  if (iconOnly) {
    return (
      <Button
        variant="outline"
        size="icon"
        onClick={handleShare}
        className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20"
        title="Share project"
      >
        {copied ? (
          <Check className="h-5 w-5 text-yellow-400" />
        ) : (
          <Share2 className="h-5 w-5 text-yellow-400" />
        )}
      </Button>
    )
  }

  return (
    <Button
      variant="outline"
      className="w-full"
      onClick={handleShare}
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 mr-2" />
          Copied!
        </>
      ) : (
        <>
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </>
      )}
    </Button>
  )
}

