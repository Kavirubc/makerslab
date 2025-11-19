import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Github, Mail, Award, Star } from 'lucide-react'
import Link from 'next/link'
import contributorsData from '@/lib/data/contributors.json'

interface Contributor {
  name: string
  email?: string
  contributorType: 'core' | 'regular'
  contributions: string[]
  github?: string
  avatar?: string
}

export default function ContributorsPage() {
  const contributors = contributorsData.contributors as Contributor[]
  const coreContributors = contributors.filter(c => c.contributorType === 'core')
  const regularContributors = contributors.filter(c => c.contributorType === 'regular')

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Contributors</h1>
          <p className="text-muted-foreground">
            Meet the amazing people who have contributed to building Showcase.lk
          </p>
        </div>

        {/* Core Contributors Section */}
        {coreContributors.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
              <h2 className="text-2xl font-bold">Core Contributors</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {coreContributors.map((contributor, index) => (
                <ContributorCard key={index} contributor={contributor} />
              ))}
            </div>
          </div>
        )}

        {/* Regular Contributors Section */}
        {regularContributors.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Award className="h-6 w-6 text-blue-500" />
              <h2 className="text-2xl font-bold">Contributors</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularContributors.map((contributor, index) => (
                <ContributorCard key={index} contributor={contributor} />
              ))}
            </div>
          </div>
        )}

        {contributors.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No contributors yet. Be the first to contribute!
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

function ContributorCard({ contributor }: { contributor: Contributor }) {
  const initials = contributor.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start gap-4">
          <Avatar className="w-16 h-16">
            <AvatarImage src={contributor.avatar} alt={contributor.name} />
            <AvatarFallback className="text-lg">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-xl mb-2">{contributor.name}</CardTitle>
            <Badge variant={contributor.contributorType === 'core' ? 'default' : 'secondary'}>
              {contributor.contributorType === 'core' ? 'Core Contributor' : 'Contributor'}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Contact Links */}
          <div className="flex gap-2">
            {contributor.github && (
              <Link
                href={`https://github.com/${contributor.github}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Github className="h-4 w-4" />
                <span>GitHub</span>
              </Link>
            )}
            {contributor.email && (
              <Link
                href={`mailto:${contributor.email}`}
                className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Mail className="h-4 w-4" />
                <span>Email</span>
              </Link>
            )}
          </div>

          {/* Contributions */}
          {contributor.contributions && contributor.contributions.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-2">Contributions:</h4>
              <ul className="space-y-1">
                {contributor.contributions.map((contribution, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>{contribution}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
