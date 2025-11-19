'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ContributorBadge } from '@/components/contributor-badge'
import { Award, ExternalLink } from 'lucide-react'
import Link from 'next/link'

interface Contributor {
  _id: string
  name: string
  email: string
  profilePicture?: string | null
  bio?: string | null
  contributorType: 'contributor' | 'core-contributor'
  contributedAt?: Date | null
  university?: {
    name: string
    district: string
    province: string
  } | null
  linkedin?: string | null
  github?: string | null
}

interface ContributorsData {
  contributors: {
    core: Contributor[]
    regular: Contributor[]
  }
  total: number
}

export default function ContributorsPage() {
  const [data, setData] = useState<ContributorsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchContributors()
  }, [])

  const fetchContributors = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/contributors')
      if (!response.ok) {
        throw new Error('Failed to fetch contributors')
      }
      const contributorsData = await response.json()
      setData(contributorsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-background">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading contributors...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-background">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <p className="text-destructive">Error: {error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!data || data.total === 0) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-background">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Contributors</h1>
            <p className="text-muted-foreground">
              People who have contributed to this platform
            </p>
          </div>
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-muted-foreground">
                No contributors yet. Check back soon!
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const { core, regular } = data.contributors

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Contributors</h1>
          <p className="text-muted-foreground">
            People who have contributed to this platform ({data.total} total)
          </p>
        </div>

        <div className="space-y-12">
          {/* Core Contributors Section */}
          {core.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Award className="h-6 w-6" />
                Core Contributors
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {core.map((contributor) => (
                  <ContributorCard key={contributor._id} contributor={contributor} />
                ))}
              </div>
            </div>
          )}

          {/* Regular Contributors Section */}
          {regular.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Award className="h-6 w-6" />
                Contributors
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {regular.map((contributor) => (
                  <ContributorCard key={contributor._id} contributor={contributor} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Contributor card component - shows avatar, name, type, and view profile
function ContributorCard({ contributor }: { contributor: Contributor }) {
  return (
    <Card className="flex flex-col hover:shadow-lg transition-shadow">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center text-center space-y-4">
          {/* Avatar */}
          <Avatar className="w-24 h-24">
            <AvatarImage src={contributor.profilePicture || undefined} alt={contributor.name} />
            <AvatarFallback className="text-2xl">
              {contributor.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)}
            </AvatarFallback>
          </Avatar>

          {/* Name and Badge */}
          <div className="space-y-3 w-full">
            <h3 className="text-xl font-bold">{contributor.name}</h3>
            <div className="flex justify-center">
              <ContributorBadge contributorType={contributor.contributorType} />
            </div>
          </div>

          {/* View Profile Button */}
          <Link href={`/profile/${contributor._id}`} className="w-full mt-2">
            <Button variant="outline" className="w-full">
              View Profile
              <ExternalLink className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

