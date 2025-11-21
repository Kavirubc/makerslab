"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavLinkProps extends React.ComponentProps<typeof Link> {
  activeClassName?: string;
}

export function NavLink({
  href,
  className,
  activeClassName = "text-foreground border-b-2 border-primary",
  children,
  ...props
}: NavLinkProps) {
  const pathname = usePathname();
  const path = typeof href === "string" ? href : href.pathname || "";
  const isActive =
    pathname === path || pathname?.startsWith(path + "/");

  return (
    <Link
      href={href}
      className={cn(
        "transition-all font-medium duration-200 hover:text-foreground/80 text-foreground/50",
        className,
        isActive && activeClassName
      )}
      {...props}
    >
      {children}
    </Link>
  );
}
