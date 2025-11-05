'use client'

interface VideoEmbedProps {
  url: string
}

export function VideoEmbed({ url }: VideoEmbedProps) {
  // Extract video ID from YouTube/Vimeo URLs
  const getEmbedUrl = (videoUrl: string): string | null => {
    // YouTube patterns
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
    const youtubeMatch = videoUrl.match(youtubeRegex)
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}`
    }

    // Vimeo patterns
    const vimeoRegex = /vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|)(\d+)(?:|\/\?)/
    const vimeoMatch = videoUrl.match(vimeoRegex)
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[2]}`
    }

    // If it's already an embed URL, return as is
    if (videoUrl.includes('youtube.com/embed') || videoUrl.includes('player.vimeo.com')) {
      return videoUrl
    }

    return null
  }

  const embedUrl = getEmbedUrl(url)

  if (!embedUrl) {
    return (
      <div className="aspect-video w-full rounded-lg border bg-muted flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Video preview not available</p>
      </div>
    )
  }

  return (
    <div className="aspect-video w-full rounded-lg overflow-hidden border">
      <iframe
        src={embedUrl}
        className="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  )
}
