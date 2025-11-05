import { auth } from '@/auth'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function Home() {
  const session = await auth()

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="max-w-2xl mx-auto text-center space-y-8">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          UCSC Project Share
        </h1>
        <p className="text-lg text-muted-foreground">
          A platform for university students to share and collaborate on projects.
          {!session && ' Sign in with your university email to get started.'}
        </p>
        <div className="flex gap-4 justify-center">
          {session ? (
            <>
              <p className="text-base">
                Welcome back, {session.user.name}!
              </p>
              <Link href="/dashboard">
                <Button size="lg">Go to Dashboard</Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button size="lg">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button size="lg" variant="outline">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>
        {!session && (
          <p className="text-sm text-muted-foreground">
            Only .ac.lk university email addresses are accepted
          </p>
        )}
      </div>
    </div>
  )
}
