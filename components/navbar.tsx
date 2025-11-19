import { auth } from "@/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserMenu } from "./user-menu";
import { MobileNav } from "./mobile-nav";
import Image from "next/image";
import OutlineButton from "./ui/outline-button";
import BubbleUpButton from "./ui/bubble-up-button";
import { isAdmin } from '@/lib/utils/admin'

export async function Navbar() {
  const session = await auth()
  const userIsAdmin = isAdmin(session)

  return (
    <header className="sticky top-0 min-h-(--header-height) z-50 w-full _border-b _bg-background/95 supports-backdrop-filter:bg-background/60 backdrop-blur py-4 bg-transparent">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/showcase/ShowcaseLogo500x200.png"
              alt="Showcase.lk logo"
              width={120}
              height={40}
              priority
            />
          </Link>
          {/* {session && (
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
          )} */}
          {/* {!session && (
            <nav className="hidden md:flex items-center gap-6 text-sm">
              <Link
                href="/explore"
                className="transition-colors hover:text-foreground/80 text-foreground/60"
              >
                Explore
              </Link>
            </nav>
          )} */}
        </div>

        <div className="flex items-center gap-2">
          {session ? (
            <>
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
                <Link
                  href="/contributors"
                  className="transition-colors hover:text-foreground/80 text-foreground/60"
                >
                  Contributors
                </Link>
                {userIsAdmin && (
                  <Link
                    href="/admin"
                    className="transition-colors hover:text-foreground/80 text-foreground/60"
                  >
                    Admin
                  </Link>
                )}
              </nav>
              <UserMenu user={session.user} />
              <MobileNav session={session} />
            </>
          ) : (
            <>
              <nav className="hidden md:flex items-center gap-6">
                <Link
                  href="/explore"
                  className="transition-colors hover:text-foreground/80 text-foreground/60"
                >
                  Explore
                </Link>
                <Link
                  href="/contributors"
                  className="transition-colors hover:text-foreground/80 text-foreground/60"
                >
                  Contributors
                </Link>
              </nav>
              <div className="hidden sm:flex items-center gap-2">
                <Link href="/login">
                  <OutlineButton className="px-4! py-2">Sign In</OutlineButton>
                </Link>
                <Link href="/register">
                  <BubbleUpButton className="py-2 lg:px-12">
                    Sign Up
                  </BubbleUpButton>
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
  );
}
