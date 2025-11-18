'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Heart } from 'lucide-react'
import { useNotification } from '@/lib/hooks/use-notification'

interface LikeButtonProps {
  projectId: string
  initialLikesCount: number
  initialIsLiked?: boolean
  iconOnly?: boolean
}

export function LikeButton({
  projectId,
  initialLikesCount,
  initialIsLiked = false,
  iconOnly = false,
}: LikeButtonProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [isLiked, setIsLiked] = useState(initialIsLiked)
  const [likesCount, setLikesCount] = useState(initialLikesCount)
  const [isLoading, setIsLoading] = useState(false)
  const { success, error: showError } = useNotification()

  // Fetch initial like status if not provided (fallback for client-side navigation)
  useEffect(() => {
    if (session?.user) {
      // Only fetch if initialIsLiked was not explicitly provided (undefined, not false)
      // Since we pass it from server, this is mainly for client-side navigation
      const fetchLikeStatus = async () => {
        try {
          const response = await fetch(`/api/projects/${projectId}/like`)
          if (response.ok) {
            const data = await response.json()
            setIsLiked(data.isLiked)
            setLikesCount(data.likesCount)
          }
        } catch (error) {
          console.error('Error fetching like status:', error)
        }
      }
      
      // Only fetch if we don't have initial state (for client-side navigation)
      if (initialIsLiked === undefined) {
        fetchLikeStatus()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user, projectId])

  const handleToggleLike = async () => {
    if (!session?.user) {
      return
    }

    setIsLoading(true)
    const previousLiked = isLiked
    const previousCount = likesCount

    // Optimistic update
    setIsLiked(!previousLiked)
    setLikesCount(previousLiked ? previousCount - 1 : previousCount + 1)

    try {
      const method = previousLiked ? 'DELETE' : 'POST'
      const response = await fetch(`/api/projects/${projectId}/like`, {
        method,
      })

      if (!response.ok) {
        // Revert on error
        setIsLiked(previousLiked)
        setLikesCount(previousCount)
        throw new Error('Failed to toggle like')
      }

      const data = await response.json()
      setIsLiked(data.liked)
      setLikesCount(data.likesCount)
      // Show success toast
      success(data.liked ? 'Project liked!' : 'Like removed')
      router.refresh()
    } catch (error) {
      console.error('Error toggling like:', error)
      // Revert on error
      setIsLiked(previousLiked)
      setLikesCount(previousCount)
      showError('Failed to update like. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Only show for authenticated users
  if (!session?.user) {
    if (iconOnly) {
      return (
        <div className="flex items-center gap-1">
          <Heart className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{likesCount}</span>
        </div>
      )
    }
    return (
      <div className="flex items-center gap-2">
        <Heart className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">{likesCount}</span>
      </div>
    )
  }

  if (iconOnly) {
    return (
      <Button
        variant="outline"
        size="icon"
        onClick={handleToggleLike}
        disabled={isLoading}
        className="relative bg-white/10 backdrop-blur-md border-white/20 hover:bg-rose-500/20 hover:border-rose-400/30 group"
        title={isLiked ? 'Unlike' : 'Like'}
      >
        {isLiked ? (
          <Heart className="h-5 w-5 fill-rose-500 text-rose-500" />
        ) : (
          <Heart className="h-5 w-5 text-white group-hover:text-rose-300" />
        )}
        {likesCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
            {likesCount}
          </span>
        )}
      </Button>
    )
  }

  return (
    <Button
      variant="outline"
      className="w-full"
      onClick={handleToggleLike}
      disabled={isLoading}
    >
      {isLiked ? (
        <Heart className="h-4 w-4 mr-2 fill-red-500 text-red-500" />
      ) : (
        <Heart className="h-4 w-4 mr-2" />
      )}
      {isLiked ? 'Liked' : 'Like'} ({likesCount})
    </Button>
  )
}

