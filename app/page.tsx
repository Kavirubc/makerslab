import { auth } from '@/auth'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function Home() {
  const session = await auth()

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold tracking-tight sm:text-7xl">
            Your Academic Portfolio
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Showcase your projects. Build your portfolio. Get discovered by recruiters.
          </p>
        </div>

        {session ? (
          <div className="space-y-4">
            <p className="text-lg">
              Welcome back, <span className="font-semibold">{session.user.name}</span>!
            </p>
            <Link href="/dashboard">
              <Button size="lg" className="text-base px-8">
                Go to Dashboard
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/register">
                <Button size="lg" className="text-base px-8">
                  Get Started
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="text-base px-8">
                  Sign In
                </Button>
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">
              Exclusively for students with .ac.lk university email addresses
            </p>
          </div>
        )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 max-w-4xl mx-auto">
            <div className="p-6 rounded-lg border bg-card">
              <h3 className="font-semibold mb-2">Upload Projects</h3>
              <p className="text-sm text-muted-foreground">
                Share your slide decks, pitch videos, and project details
              </p>
            </div>
            <div className="p-6 rounded-lg border bg-card">
              <h3 className="font-semibold mb-2">Portfolio Link</h3>
              <p className="text-sm text-muted-foreground">
                Get a shareable link to show recruiters and interviewers
              </p>
            </div>
            <div className="p-6 rounded-lg border bg-card">
              <h3 className="font-semibold mb-2">Build Your Brand</h3>
              <p className="text-sm text-muted-foreground">
                Create your professional presence for career opportunities
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
