"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function MobileLink({
  href,
  className,
  children,
  ...props
}: React.ComponentProps<typeof Link>) {
  const pathname = usePathname();
  const path = typeof href === "string" ? href : href.pathname || "";
  const isActive = pathname === path || pathname?.startsWith(path + "/");

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-2 py-3 text-sm font-medium rounded-md transition-colors",
        isActive ? "bg-accent text-accent-foreground" : "hover:bg-accent",
        className
      )}
      {...props}
    >
      {children}
    </Link>
  );
}
