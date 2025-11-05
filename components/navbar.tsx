import { auth } from '@/auth'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { UserMenu } from './user-menu'
import { MobileNav } from './mobile-nav'

export async function Navbar() {
  const session = await auth()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-base sm:text-xl">UCSC Project Share</span>
          </Link>
          {session && (
            <nav className="hidden md:flex items-center gap-6 text-sm">
              <Link
                href="/dashboard"
                className="transition-colors hover:text-foreground/80 text-foreground/60"
              >
                Dashboard
              </Link>
              <Link
                href="/projects"
                className="transition-colors hover:text-foreground/80 text-foreground/60"
              >
                Projects
              </Link>
              <Link
                href="/explore"
                className="transition-colors hover:text-foreground/80 text-foreground/60"
              >
                Explore
              </Link>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-2">
          {session ? (
            <>
              <UserMenu user={session.user} />
              <MobileNav session={session} />
            </>
          ) : (
            <>
              <div className="hidden sm:flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link href="/register">
                  <Button>Sign Up</Button>
                </Link>
              </div>
              <div className="flex sm:hidden">
                <MobileNav session={null} />
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
