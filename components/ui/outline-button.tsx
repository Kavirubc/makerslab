"use client";

import { cn } from "@/lib/utils";

type variants = "default" | "outline";

interface OutlineButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: variants;
}

export default function OutlineButton({
  variant = "default",
  ...props
}: OutlineButtonProps) {
  const containerClass = cn(
    " relative flex h-fit w-fit cursor-pointer overflow-clip px-8 lg:px-24 py-4 rounded-full transition-opacity duration-200 ",
    variant === "outline" && "border border-black",
    props.className
  );
  return (
    <button className={containerClass} data-slot="button">
      <span className="relative text-black">{props.children}</span>
    </button>
  );
}
