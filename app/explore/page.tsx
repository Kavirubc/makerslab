import { ExploreProjects } from '@/components/explore-projects'

export default function ExplorePage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Explore Projects</h1>
          <p className="text-muted-foreground">
            Discover projects from students across UCSC
          </p>
        </div>

        <ExploreProjects />
      </div>
    </div>
  )
}
