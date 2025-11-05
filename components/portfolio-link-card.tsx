'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Copy, ExternalLink, Check } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

interface PortfolioLinkCardProps {
  userId: string
  portfolioUrl: string
}

export function PortfolioLinkCard({ userId, portfolioUrl }: PortfolioLinkCardProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(portfolioUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="border-primary/50">
      <CardHeader>
        <CardTitle>Your Portfolio Link</CardTitle>
        <CardDescription>
          Share this link with recruiters and on your resume
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            readOnly
            value={portfolioUrl}
            className="flex-1 px-3 py-2 bg-muted rounded-md text-sm"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </>
            )}
          </Button>
          <Link href={`/profile/${userId}`} target="_blank">
            <Button variant="outline" size="sm">
              <ExternalLink className="h-4 w-4 mr-2" />
              View
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
