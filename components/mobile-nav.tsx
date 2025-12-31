"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Menu,
  User,
  LogOut,
  Home,
  FolderOpen,
  Compass,
  Shield,
  Award,
} from "lucide-react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { MobileLink } from "./mobile-nav-link";

interface MobileNavProps {
  session: {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: "user" | "admin";
    };
  } | null;
}

export function MobileNav({ session }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    setOpen(false);
    router.push("/");
    router.refresh();
  };

  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild className="md:hidden">
        <Button variant="ghost" size="icon">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="top"
        className="w-[calc(100vw-2rem)] sm:w-[400px] max-h-[85vh]! mx-auto top-6 p-4 rounded-2xl overflow-y-scroll"
      >
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-4 ">
          {session ? (
            <>
              <div className="px-2 py-4 border-b flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarImage
                    src={session.user?.image || undefined}
                    alt={session.user?.name || "User"}
                  />
                  <AvatarFallback>
                    {getInitials(session.user?.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <p className="text-sm font-medium">{session.user?.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {session.user?.email}
                  </p>
                </div>
              </div>
              <MobileLink href="/dashboard" onClick={() => setOpen(false)}>
                <Home className="h-5 w-5" />
                Dashboard
              </MobileLink>
              <MobileLink href="/projects" onClick={() => setOpen(false)}>
                <FolderOpen className="h-5 w-5" />
                Projects
              </MobileLink>
              <MobileLink href="/explore" onClick={() => setOpen(false)}>
                <Compass className="h-5 w-5" />
                Explore
              </MobileLink>
              <MobileLink href="/contributors" onClick={() => setOpen(false)}>
                <Award className="h-5 w-5" />
                Contributors
              </MobileLink>
              {session.user?.role === "admin" && (
                <MobileLink href="/admin" onClick={() => setOpen(false)}>
                  <Shield className="h-5 w-5" />
                  Admin
                </MobileLink>
              )}
              <MobileLink href="/settings" onClick={() => setOpen(false)}>
                <User className="h-5 w-5" />
                Settings
              </MobileLink>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 px-2 py-3 text-sm font-medium hover:bg-accent rounded-md transition-colors text-left w-full mt-4 border-t pt-6"
              >
                <LogOut className="h-5 w-5" />
                Log out
              </button>
            </>
          ) : (
            <>
              <MobileLink href="/explore" onClick={() => setOpen(false)}>
                <Compass className="h-5 w-5" />
                Explore
              </MobileLink>
              <MobileLink href="/contributors" onClick={() => setOpen(false)}>
                <Award className="h-5 w-5" />
                Contributors
              </MobileLink>
              <Link href="/login" onClick={() => setOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">
                  Sign In
                </Button>
              </Link>
              <Link href="/register" onClick={() => setOpen(false)}>
                <Button className="w-full">Sign Up</Button>
              </Link>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
